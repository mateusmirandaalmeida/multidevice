import { IWAGroupMetadata } from '../interfaces/IWAGroupMetadata';
import { WapNode } from './../proto/WapNode';

export const parseGroupMetadata = (group: WapNode) => {
    let description = null;
    let descriptionId = null;
    if (group.hasChild('description')) {
        const desc = group.child('description') ?? null;
        if (desc) {
            const body = desc.child('body') ?? null;
            description = body ? body.contentString() : null;
            descriptionId = desc.attrs?.id ?? null;
        }
    }

    return <IWAGroupMetadata>{
        name: group.attrs.subject,
        id: group.attrs.id,
        creation: group.attrs.creation,
        creator: group.attrs.creator.toString(),
        restrict: group.hasChild('locked'),
        announce: group.hasChild('announcement'),
        description,
        descriptionId,
        participants: group.content
            .filter((content: WapNode) => content.tag === 'participant')
            .map((content: WapNode) => {
                return {
                    jid: content.attrs.jid.toString(),
                    isAdmin: content.attrs?.type == 'admin' ? true : false,
                    isSuperAdmin: content.attrs?.type == 'superadmin' ? true : false,
                };
            }),
    };
};
