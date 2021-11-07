import { WapNode } from '../../proto/WapNode';
import { Handler } from '../Handler';
import { Wid } from '../../proto/Wid';
import { encodeStanza } from '../../proto/Stanza';

export class StatusNotificationHandler extends Handler {
    public async handle(node: WapNode) {
        const data = await this.parse(node);
        const receipt = new WapNode(
            'ack',
            {
                class: 'notification',
                id: data.id,
                to: data.from,
                type: data.type
            },
            null,
        );

        this.socket.sendFrame(encodeStanza(receipt));
        return true;
    }

    public async canHandle(stanza: WapNode) {
        if (stanza.tag != 'notification') {
            return false;
        }
        return stanza.attrs.type == "status";
    }

    public async parse(stanza: WapNode) {
        return {
            id: stanza.attrs.id,
            from: stanza.attrs.from,
            type: stanza.attrs.type,
        };
    }
}
