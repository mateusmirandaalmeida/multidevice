import { WapNode } from '../../proto/WapNode';
import { Handler } from '../Handler';

export class StreamErrorHandler extends Handler {
    public async handle(node: WapNode) {
        const data = await this.parse(node);
        if (!data.code) {
            this.client.log('invalid code in stream:error');
            return;
        }

        if (data.code == '515') {
            this.client.log('restarting socket');
            this.socket.restart();
        }

        if (data.code == '516') {
            // start logout
        }

        return true;
    }

    public async canHandle(stanza: WapNode) {
        return stanza.tag == 'stream:error';
    }

    public async parse(node: WapNode) {
        const code = node.attrs.code ?? null;

        return {
            code,
        };
    }
}
