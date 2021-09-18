import { WapNode } from '../../proto/WapNode';
import { Handler } from '../Handler';
import { Wid } from '../../proto/Wid';

export class AccountSyncDirtyHandler extends Handler {
    public async handle(node: WapNode) {
        const data = await this.parse(node);

        if (data.type == 'account_sync') {
            this.client.log('received account sync timestamp', data.timestamp);
            this.client.setLastSyncTimestamp(data.timestamp);
        }

        return true;
    }

    public async canHandle(stanza: WapNode) {
        if (stanza.tag != 'ib') {
            return false;
        }

        if (!stanza.content) {
            return false;
        }

        if (!Array.isArray(stanza.content)) {
            return false;
        }

        return !!stanza.maybeChild('dirty');
    }

    public async parse(stanza: WapNode) {
        const dirty = stanza.child('dirty');

        return {
            type: dirty.attrString('type'),
            timestamp: dirty.attrTime('timestamp'),
        };
    }
}
