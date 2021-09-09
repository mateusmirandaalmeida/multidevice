import { WapNode } from '../../proto/WapNode';
import { Handler } from '../Handler';
import { Wid } from '../../proto/Wid';
import { JID } from '../../utils/Utils';
import { encodeStanza } from '../../proto/Stanza';

export class RetryReceiptHandler extends Handler {
    public async handle(node: WapNode) {
        const data = await this.parse(node);

        var { from, participant, recipient, retryCount, stanzaId } = data;
        const receipt = new WapNode(
            'ack',
            {
                id: stanzaId,
                to: JID(from),
                // participant: s ? DEVICE_JID(s) : { sentinel: 'DROP_ATTR' },
                class: 'receipt',
                type: 'retry',
            },
            null,
        );

        this.socket.sendFrame(encodeStanza(receipt));

        return true;
    }

    public async canHandle(stanza: WapNode) {
        if (stanza.tag != 'receipt') {
            return false;
        }

        return stanza.attrs.type == 'retry';
    }

    public async parse(node: WapNode) {
        const from = node.attrWid('from');
        const participant = node.hasAttr('participant') ? node.attrDeviceWid('participant') : null;
        const recipient = node.hasAttr('recipient') ? node.attrUserWid('recipient') : null;
        const retry = node.child('retry');
        const keys = node.maybeChild('keys');
        let keyBundle = null;

        if (keys) {
            const deviceIdentity = keys.maybeChild('device-identity');
            const skey = keys.child('skey');
            const key = keys.child('key');

            keyBundle = {
                identity: keys.child('identity').contentBytes(32),
                deviceIdentity: deviceIdentity ? deviceIdentity.contentBytes() : null,
                skey: {
                    id: skey.child('id').contentUint(3),
                    pubkey: skey.child('value').contentBytes(32),
                    signature: skey.child('signature').contentBytes(64),
                },
                key: {
                    id: key.child('id').contentUint(3),
                    pubkey: key.child('value').contentBytes(32),
                },
            };
        }

        return {
            stanzaId: node.attrString('id'),
            originalMsgId: retry.attrString('id'),
            ts: node.attrTime('t'),
            retryCount: retry.hasAttr('count') ? retry.attrInt('count') : 0,
            regId: node.child('registration').contentUint(4),
            offline: node.hasAttr('offline'),
            from: from,
            participant: participant,
            recipient: recipient,
            keyBundle: keyBundle,
        };
    }
}
