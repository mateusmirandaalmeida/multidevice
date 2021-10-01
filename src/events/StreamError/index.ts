import { WapNode } from '../../proto/WapNode';
import { Handler } from '../Handler';

export class StreamErrorHandler extends Handler {
    public async handle(node: WapNode) {
        const data = await this.parse(node);
        if (!data.code) {
            // and sometime received without code, but its work when restart the socket
            this.client.log('invalid code in stream:error');
            this.client.log('restarting socket');
            this.socket.restart();
            return;
        }

        if (data.code == '515') {
            this.client.log('restarting socket');
            this.socket.restart();
        }

        if (data.code == '516') {
            // start logout
        }

        if (data.code == '503') {
            // Sometime received 503 code, maybe closed by server? and need reconnect
            this.client.log('restarting socket');
            this.socket.restart();
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
