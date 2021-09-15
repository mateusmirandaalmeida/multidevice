import { WapNode } from '../../proto/WapNode';
import { Handler } from '../Handler';
import { encodeStanza } from '../../proto/Stanza';

export class MessageAckHandler extends Handler {
    public async handle(node: WapNode) {
        const data = await this.parse(node);
        this.client.emit('message-status-updated', data);

        return true;
    }

    public async canHandle(stanza: WapNode) {
        if (stanza.tag != 'receipt') {
            return false;
        }

        return true;
    }

    public async parse(stanza: WapNode) {
        return {
            id: stanza.attrs.id,
            status: stanza.attrs.type ? stanza.attrs.type : 'deliveried'
        };
    }
}
