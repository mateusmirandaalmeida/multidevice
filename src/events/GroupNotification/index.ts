import { WapNode } from '../../proto/WapNode';
import { Handler } from '../Handler';
import { Wid } from '../../proto/Wid';

export class GroupNotificationHandler extends Handler {
    public async handle(node: WapNode) {
        const data = await this.parse(node);

        data != null && 
            this.client.emit('group-update', {data})

        data.added.length > 0 &&
            this.client.emit('group-participants-update', {
                action: 'add',
                jid: data.id.toString(),
                participants: data.added,
            });

        data.removed.length > 0 &&
            this.client.emit('group-participants-update', {
                action: 'remove',
                jid: data.id.toString(),
                participants: data.removed,
            });

        data.subject[0] != null && 
            this.client.emit('group-subject-update', {
                jid: data.subject[0]?.jid,
                participant: data.subject[0]?.participant,
                subject: data.subject[0]?.subject,
                s_t: data.subject[0]?.s_t,
            });
        
        data.description[0] != null &&
            this.client.emit('group-description-update', {
                jid: data.description[0]?.jid,
                dec: data.description[0]?.description,
                participant: data.description[0]?.participant,
                id: data.description[0]?.id,

            }) 

        data.lock[0] != null &&
            this.client.emit('group-lock-update', {
                jid: data.lock[0]?.jid,
                participant: data.lock[0]?.participant,
                locked: data.lock[0]?.locked,

            })
        
         data.announcement[0] != null &&
            this.client.emit('group-announcement-update', {
                jid: data.announcement[0]?.jid,
                participant: data.announcement[0]?.participant,
                admin_only: data.announcement[0]?.admin_only,

            })

        data.ephemeral[0] != null &&
            this.client.emit('group-ephemeral-update', {
                jid: data.ephemeral[0]?.jid,
                participant: data.ephemeral[0]?.participant,
                on: data.ephemeral[0]?.on,
                expiration: data.ephemeral[0]?.expiration,
            })
        

        return true;
    }

    public async canHandle(stanza: WapNode) {
        if (stanza.tag != 'notification') {
            return false;
        }

        if (!stanza.content) {
            return false;
        }

        if (!Array.isArray(stanza.content)) {
            return false;
        }

        return stanza.attrs.type == 'w:gp2';
    }

    public async parse(stanza: WapNode) {
        const from = stanza.attrGroupWid('from');
        const participant = stanza.attrMaybeUserWid('participant');
        const action = stanza.getContentType();
       //console.log(stanza.getContentByTag(action), "Type:- ", action);

        const removed: {
            participant: Wid;
            admin?: Wid;
            reason: string;
        }[] = [];

        const added: {
            participant: Wid;
            admin?: Wid;
            reason: string;
        }[] = [];

        const subject: {
            jid: string;
            participant: Wid;
            subject: string;
            s_t: string;

        }[] = [];
        
        const description: {
            jid: string;
            participant: Wid;
            description: string;
            id: string;

        }[] = [];

        const lock: {
            jid: string;
            participant: Wid;
            locked: boolean;

        }[] = [];
        
        const announcement: {
            jid: string;
            participant: Wid;
            admin_only: boolean;
        }[] = [];
        
        const ephemeral: {
            jid: string;
            participant: Wid;
            on: boolean;
            expiration?: string;
        }[] = [];
                

         stanza.mapChildrenWithTag('subject', (node: WapNode) => {
            subject.push({
                jid: from.toString(),
                participant: participant.toString(),
                subject: node.attrs.subject,
                s_t: node.attrs.s_t,
            })
        })

         stanza.mapChildrenWithTag('description', (node: WapNode) => {
            description.push({
                jid: from.toString(),
                participant: participant.toString(),
                description: String.fromCharCode.apply(null, node.content[0]?.content),
                id: node.attrs.id,
            })
        })

         if (action.includes("lock")){
             lock.push({
                jid: from.toString(),
                participant: participant.toString(),
                locked: stanza.getContentByTag(action).tag == 'locked',
            })
        }
        

        if (action.includes("announcement")){
            announcement.push({
                jid: from.toString(),
                participant: participant.toString(),
                admin_only: stanza.getContentByTag(action).tag == 'announcement',
            })
        }
        
        if (action.includes("ephemeral")){
            const node = stanza.getContentByTag(action)
            ephemeral.push({
                jid: from.toString(),
                participant: participant.toString(),
                on: node.tag == 'ephemeral',
                expiration: node.attrs.expiration, 
            })
        }


        stanza.forEachChildWithTag('remove', (node: WapNode) => {
            const removedParticipant = node.child('participant').attrUserWid('jid');

            const isSame = removedParticipant.getUser() == participant.getUser();

            //const reason = node.maybeAttrString('reason') == 'invite' ? 'invite' : 'left';
            const reason = isSame ? 'left' : 'admin';

            removed.push({
                participant: removedParticipant,
                reason,
                ...(!isSame ? { admin: participant } : {}),
            });
        });

        stanza.forEachChildWithTag('add', (node: WapNode) => {
            const addedParticipant = node.child('participant').attrUserWid('jid');

            const reason = node.maybeAttrString('reason') == 'invite' ? 'invite' : 'admin';

            added.push({
                participant: addedParticipant,
                reason,
                ...(reason == 'admin' ? { admin: participant } : {}),
            });
        });

        return {
            action,
            subject,
            description,
            lock,
            announcement,
            ephemeral,
            removed,
            added,
            id: from,
        };
    }
}
