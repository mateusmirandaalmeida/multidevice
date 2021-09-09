import { WapNode } from '../../proto/WapNode';
import { Handler } from '../Handler';
import { Wid } from '../../proto/Wid';

export class GroupNotificationHandler extends Handler {
    public async handle(node: WapNode) {
        const data = await this.parse(node);
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
            removed,
            added,
            id: from,
        };
    }
}
