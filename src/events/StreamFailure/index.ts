import { WapNode } from '../../proto/WapNode';
import { Handler } from '../Handler';

export class StreamFailureHandler extends Handler {
    public async handle(node: WapNode) {
        const data = await this.parse(node);

        if (data.reason == '401') {
            // disconnected by cell phone
            this.client.log('restarting socket');

            this.storageService.clearAll();
            this.socket.restart();

            this.client.emit('logout');
        }

        return true;
    }

    public async canHandle(stanza: WapNode) {
        return stanza.tag == 'failure';
    }

    public async parse(node: WapNode) {
        const reason = node.attrs.reason ?? null;

        return {
            reason,
        };
    }
}
