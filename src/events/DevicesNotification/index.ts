import { WapNode } from '../../proto/WapNode';
import { Handler } from '../Handler';
import { Wid } from '../../proto/Wid';

export class DevicesNotificationHandler extends Handler {
    public async handle(node: WapNode) {
        const data = await this.parse(node);

        this.client.setDevices(data.devices);

        await this.client.sendAck(data.id, 'account_sync', 'notification');

        return true;
    }

    public async canHandle(stanza: WapNode) {
        if (stanza.tag != 'notification') {
            return false;
        }

        if (!stanza.content) {
            return false;
        }

        if (!Array.isArray(stanza.content)) {
            return false;
        }

        return !!stanza.maybeChild('devices');
    }

    public async parse(stanza: WapNode) {
        const devices = [];

        const node = stanza.maybeChild('devices');
        if (!node || !Array.isArray(stanza.content)) {
            return null;
        }

        node.content.every((content: WapNode) => {
            if (content.tag == 'device' && content.attrs && content.attrs.jid) {
                devices.push(new Wid(content.attrs.jid.toString()));
            }
        });

        return {
            id: stanza.attrs.id,
            devices,
        };
    }
}
