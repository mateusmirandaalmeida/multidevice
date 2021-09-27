
import { WapNode } from '../../proto/WapNode';
import { Handler } from '../Handler';
import { S_WHATSAPP_NET } from '../../proto/WapJid';
import { encodeB64 } from '../../utils/Base64';
import * as QR from 'qrcode-terminal';

export class PairDeviceHandler extends Handler {
    public async handle(node: WapNode) {
        const refs = await this.parse(node);

        const iq = new WapNode('iq', {
            to: S_WHATSAPP_NET,
            type: 'result',
            id: node.attrs.id,
        });

        const nodeEnc = this.client.encodeStanza(iq);
        await this.socket.sendFrame(nodeEnc);

        const ref = refs.shift();

        const noiseKeyB64 = encodeB64(this.client.getNoiseKey().pubKey);
        const identityKeyB64 = encodeB64(this.client.getSignedIdentityKey().pubKey);
        const advB64 = this.client.getAdvSecretKey();
        const qrString = [ref, noiseKeyB64, identityKeyB64, advB64].join(',');

        QR.generate(qrString, { small: true });

        this.client.emit('qr', qrString);

        return true;
    }

    public async canHandle(stanza: WapNode) {
        return stanza.tag == 'iq' && stanza.content && Array.isArray(stanza.content) && stanza.content[0].tag == 'pair-device';
    }

    public async parse(stanza: WapNode): Promise<string[]> {
        return stanza.content[0].content.map((node: WapNode) => {
            return node.contentString();
        });
    }
}