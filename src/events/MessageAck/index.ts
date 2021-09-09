import { WapNode } from '../../proto/WapNode';
import { Handler } from '../Handler';
import { encodeStanza } from '../../proto/Stanza';

export class MessageAckHandler extends Handler {
    public async handle(node: WapNode) {
        const data = await this.parse(node);

        const receipt = new WapNode(
            'ack',
            {
                class: 'receipt',
                id: data.id,
                to: data.from,
            },
            null,
        );

        this.socket.sendFrame(encodeStanza(receipt));

        return true;
    }

    public async canHandle(stanza: WapNode) {
        if (stanza.tag != 'ack') {
            return false;
        }

        return stanza.attrs.class == 'message';
    }

    public async parse(stanza: WapNode) {
        return {
            id: stanza.attrs.id,
            from: stanza.attrs.from,
        };
    }
}
