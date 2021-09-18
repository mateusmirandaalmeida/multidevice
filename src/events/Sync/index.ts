import { proto as WAProto } from '../../../WAMessage/WAMessage';
import { ISyncCollection } from '../../interfaces/ISyncCollection';
import { WapNode } from '../../proto/WapNode';
import { encodeB64 } from '../../utils/Base64';
import { inflateBuffer, MessageType } from '../../utils/Utils';
import { Handler } from '../Handler';

export class SyncHandler extends Handler {
    public async handle(node: WapNode) {
        const data = await this.parse(node);

        console.log('received sync', data);
        const criticalBlock = data.find((collection) => collection.name == 'critical_block');
        const criticalUnblockLow = data.find((collection) => collection.name == 'critical_unblock_low');

        const criticalBlockBlob = WAProto.ExternalBlobReference.decode(criticalBlock.snapshot);
        console.log('criticalBlockBlob', criticalBlockBlob);

        const buffer = await this.client.downloadFromMediaConn(
            {
                directPath: criticalBlockBlob.directPath,
                encFilehash: encodeB64(criticalBlockBlob.fileEncSha256),
                filehash: encodeB64(criticalBlockBlob.fileSha256),
                mediaKey: criticalBlockBlob.mediaKey,
                type: 'md-app-state',
                messageType: MessageType.appState,
            },
            'buffer',
        );


        return true;
    }

    public async canHandle(stanza: WapNode) {
        if (stanza.tag != 'iq') {
            return false;
        }

        if (!stanza.content) {
            return false;
        }

        if (!Array.isArray(stanza.content)) {
            return false;
        }

        return !!stanza.maybeChild('sync');
    }

    public async parse(stanza: WapNode) {
        const sync = stanza.child('sync');

        return <ISyncCollection[]>sync.mapChildrenWithTag('collection', (collection: WapNode) => {
            let patches = collection.hasChild('patches')
                ? collection.child('patches')?.mapChildrenWithTag('patch', (patch: WapNode) => {
                      return patch.contentBytes();
                  }) ?? []
                : [];

            return {
                name: collection.attrString('name'),
                snapshot: collection.hasChild('snapshot') ? collection.child('snapshot').contentBytes() : null,
                patches,
            };
        });
    }
}
