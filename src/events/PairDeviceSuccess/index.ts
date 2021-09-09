import { WapNode } from '../../proto/WapNode';
import { Handler } from '../Handler';
import { S_WHATSAPP_NET } from '../../proto/WapJid';
import { encodeStanza } from '../../proto/Stanza';
import { decodeB64, encodeB64 } from '../../utils/Base64';
import { proto as WAProto } from '../../proto/WAMessage';
import { hmacSha256 } from '../../utils/HKDF';
import { generateDeviceSignature, verifyDeviceIdentityAccountSignature } from '../../utils/Utils';
import { Key } from '../../utils/Curve';

export class PairDeviceSuccessHandler extends Handler {
    public async handle(node: WapNode) {
        const data = await this.parse(node);

        const { details, hmac } = WAProto.ADVSignedDeviceIdentityHMAC.decode(data.deviceIdentity);

        if (!details || !hmac) {
            this.client.log('invalid device details or hmac');
            return;
        }

        const advSecret = decodeB64(await this.storageService.get('advSecretKey'));
        const advSign = await hmacSha256(advSecret, details);

        if (encodeB64(hmac) !== encodeB64(new Uint8Array(advSign))) {
            this.client.log('invalid hmac from pair-device success');

            this.client.sendNotAuthozired(data.id);
            // TODO MAKE CLEAR THE STORAGE KEYS
            return;
        }

        const account = WAProto.ADVSignedDeviceIdentity.decode(details);
        const { accountSignatureKey, accountSignature } = account;
        if (!accountSignatureKey || !accountSignature) {
            this.client.log('invalid accountSignature or accountSignatureKey');
            return;
        }

        const identityKeyPair = await this.storageService.get('signedIdentityKey');

        if (!verifyDeviceIdentityAccountSignature(account, identityKeyPair)) {
            this.client.log('invalid device signature');
            this.client.sendNotAuthozired(data.id);
            return;
        }

        account.deviceSignature = generateDeviceSignature(account, identityKeyPair);

        await this.waSignal.putIdentity(this.waSignal.createSignalAddress(data.wid.toString(), 0), new Key(this.waSignal.toSignalCurvePubKey(accountSignatureKey)));

        const keyIndex = WAProto.ADVDeviceIdentity.decode(account.details).keyIndex;

        const acc = account.toJSON();
        await this.storageService.save('account', { ...acc });

        acc.accountSignatureKey = undefined;

        const accountEnc = WAProto.ADVSignedDeviceIdentity.encode(acc).finish();

        const stanza = encodeStanza(
            new WapNode(
                'iq',
                {
                    to: S_WHATSAPP_NET,
                    type: 'result',
                    id: data.id,
                },
                [
                    new WapNode('pair-device-sign', null, [
                        new WapNode(
                            'device-identity',
                            {
                                'key-index': `${keyIndex}`,
                            },
                            accountEnc,
                        ),
                    ]),
                ],
            ),
        );

        this.socket.sendFrame(stanza);
        await this.storageService.save('me', data.wid);

        this.client.emit('authenticated', data.wid);

        return true;
    }

    public async canHandle(stanza: WapNode) {
        return stanza.tag == 'iq' && stanza.content && Array.isArray(stanza.content) && stanza.content[0].tag == 'pair-success';
    }

    public async parse(node: WapNode) {
        const pair: WapNode = node.content[0];

        const id = node.attrs.id;
        const deviceIdentity = pair.getContentByTag('device-identity')?.content;
        const businessName = pair.getContentByTag('biz')?.attrs?.name ?? null;
        const wid = pair.getContentByTag('device')?.attrs?.jid ?? null;

        return {
            id,
            deviceIdentity,
            businessName,
            wid,
        };
    }
}
