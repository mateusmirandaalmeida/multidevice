import { WapNode } from '../../proto/WapNode';
import { Handler } from '../Handler';
import { Wid } from '../../proto/Wid';

export class IbOfflineHandler extends Handler {
    public async handle(node: WapNode) {
        const data = await this.parse(node);

        this.client.log('Received offline count', data.offline);
        if (data.offline > 0) {
            this.client.log('Maybe missing send some ack or receipt, offline > 0');
        }

        await this.client.postLogin();

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

        return !!stanza.maybeChild('offline');
    }

    public async parse(stanza: WapNode) {
        const offline = stanza.child('offline');

        return {
            offline: offline.attrInt('count')
        }
    }
}
