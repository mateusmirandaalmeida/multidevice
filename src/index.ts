import { DEFAULT_ORIGIN, WS_URL, randomBytes, areBuffersEqual, intToBytes, VERSION_ENCODED, HEADER, CERT_ISSUER, BIG_ENDIAN_CONTENT, KEY_BUNDLE_TYPE, xmppPreKey, xmppSignedPreKey } from './utils/Utils';
import { Socket } from './socket/Socket';
import { FrameSocket } from './socket/FrameSocket';
import { NoiseHandshake } from './socket/NoiseHandshake';
import { encodeProto } from './proto/EncodeProto';
import { decodeProto } from './proto/DecodeProto';
import { toLowerCaseHex } from './utils/HexHelper';
import { ADVDeviceIdentitySpec, ADVSignedDeviceIdentityHMACSpec, ADVSignedDeviceIdentitySpec, DetailsSpec, HandshakeMessageSpec, NoiseCertificateSpec } from './proto/ProtoSpec';

import zlib from 'zlib';
import { generatePayloadRegister } from './payloads/RegisterPayload';
import { Binary } from './proto/Binary';
import { encodeStanza, generateId, decodeStanza } from './proto/Stanza';
import { calculateSignature, generateIdentityKeyPair, generateRegistrationId, generateSignedPreKey, Key, KeyPair, sharedKey, SignedKeyPair, verifySignature } from './utils/Curve';
import { WapNode } from './proto/WapNode';
import * as QR from 'qrcode-terminal';
import { decodeB64, encodeB64 } from './utils/Base64';
import { S_WHATSAPP_NET, WapJid } from './proto/WapJid';
import { generatePayloadLogin } from './payloads/LoginPayload';
import { storageService } from './services/StorageService';
import { hmacSha256 } from './utils/HKDF';
import { createSignalAddress, getOrGenPreKeys, putIdentity, toSignalCurvePubKey, markKeyAsUploaded } from './signal/Signal';
(async () => {
    storageService.init('./storage.json');

    const socket = new Socket();
    socket.open();

    const ephemeralKeyPair = generateIdentityKeyPair();

    socket.onOpen = async () => {
        console.log('conn open');
        const frame = new FrameSocket(socket, HEADER);
        const noise = new NoiseHandshake(frame);
        noise.start('Noise_XX_25519_AESGCM_SHA256\0\0\0\0', HEADER);
        noise.authenticate(ephemeralKeyPair.pubKey);

        const data = {
            clientHello: {
                ephemeral: ephemeralKeyPair.pubKey,
            },
        };

        const serverHelloEnc = await noise.sendAndReceive(encodeProto(HandshakeMessageSpec, data).readByteArray());

        console.log('received server hello', toLowerCaseHex(serverHelloEnc));

        const { serverHello } = await decodeProto(HandshakeMessageSpec, serverHelloEnc);

        if (!serverHello) {
            console.log('ServerHello payload error');
            return;
        }

        const { ephemeral: serverEphemeral, static: serverStaticCiphertext, payload: certificateCiphertext } = serverHello;

        if (serverEphemeral == null || serverStaticCiphertext == null || certificateCiphertext == null) {
            throw new Error('Missing server Ephemeral');
        }

        noise.authenticate(serverEphemeral);
        noise.mixIntoKey(sharedKey(new Uint8Array(serverEphemeral), ephemeralKeyPair.privKey));

        const staticDecoded = await noise.decrypt(serverStaticCiphertext);

        noise.mixIntoKey(sharedKey(new Uint8Array(staticDecoded), ephemeralKeyPair.privKey));

        const certDecoded = await noise.decrypt(certificateCiphertext);

        const { details: certDetails, signature: certSignature } = await decodeProto(NoiseCertificateSpec, certDecoded);
        if (!certDetails || !certSignature) {
            console.log('certProto wrong');
            return;
        }

        const { issuer: certIssuer, key: certKey } = await decodeProto(DetailsSpec, certDetails);
        if (certIssuer != CERT_ISSUER || !certKey) {
            console.log('invalid issuer');
            return;
        }

        // TODO VERIFY EXP CERT

        if (!areBuffersEqual(certKey, staticDecoded)) {
            console.log('cert key does not match issuer');
            return;
        }

        // TODO VERIFY CERT

        const noiseKey = await storageService.getOrSave('noiseKey', () => generateIdentityKeyPair());

        const keyEnc = await noise.encrypt(new Uint8Array(noiseKey.pubKey));

        noise.mixIntoKey(sharedKey(new Uint8Array(serverEphemeral), new Uint8Array(noiseKey.privKey)));

        const signedIdentityKey = await storageService.getOrSave<KeyPair>('signedIdentityKey', () => generateIdentityKeyPair());
        const signedPreKey = await storageService.getOrSave<SignedKeyPair>('signedPreKey', () => generateSignedPreKey(signedIdentityKey, 1));
        const registrationId = await storageService.getOrSave<number>('registrationId', () => generateRegistrationId());

        const me = storageService.get<WapJid>('me');
        console.log('me', me);

        const payload = !me ? generatePayloadRegister(registrationId, signedIdentityKey, signedPreKey) : generatePayloadLogin(me);


        const payloadEnc = await noise.encrypt(payload);

        noise.send(
            encodeProto(HandshakeMessageSpec, {
                clientFinish: {
                    static: keyEnc,
                    payload: payloadEnc,
                },
            }).readByteArray(),
        );

        const socketConn = await noise.finish();

        const unpackStanza = async (e): Promise<Binary> => {
            let data = new Binary(e);
            if (2 & data.readUint8()) {
                return new Promise((res) => {
                    zlib.inflate(data.readByteArray(), (err, result) => {
                        if (err) {
                            console.error('err to decode stanza');
                            return;
                        }

                        res(new Binary(result));
                    });
                });
            }

            return data;
        };

        const advSecretKey = await storageService.getOrSave<string>('advSecretKey', () => encodeB64(new Uint8Array(randomBytes(32))));

        const verifyDeviceIdentityAccountSignature = (account: any, identityKeyPair: KeyPair) => {
            const msg = Binary.build(new Uint8Array([6, 0]), account.details, identityKeyPair.pubKey).readByteArray();
            return verifySignature(new Uint8Array(account.accountSignatureKey), msg, new Uint8Array(account.accountSignature));
        };

        const generateDeviceSignature = (account: any, identityKeyPair: any) => {
            const msg = Binary.build(new Uint8Array([6, 1]), account.details, identityKeyPair.pubKey, account.accountSignatureKey).readByteArray().buffer;
            return calculateSignature(identityKeyPair.privKey, new Uint8Array(msg));
        };

        const uploadPreKeys = async () => {
            const registrationId = storageService.get<number>('registrationId');
            const identityKey = storageService.get<KeyPair>('signedIdentityKey');
            const signedPreKey = storageService.get<SignedKeyPair>('signedPreKey');

            if (!identityKey || !signedPreKey) {
                console.log('invalid identityKey or signedPreKey from uploadPreKeys');
                return;
            }

            const preKeys = await getOrGenPreKeys(30);
            if (preKeys.length == 0) {
                console.log('No preKey is available');
                return;
            }

            const stanza = new WapNode(
                'iq',
                {
                    id: generateId(),
                    xmlns: 'encrypt',
                    type: 'set',
                    to: S_WHATSAPP_NET,
                },
                [new WapNode('registration', null, BIG_ENDIAN_CONTENT(registrationId)), new WapNode('type', null, KEY_BUNDLE_TYPE), new WapNode('identity', null, identityKey.pubKey), new WapNode('list', null, preKeys.map(xmppPreKey)), xmppSignedPreKey(signedPreKey)],
            );

            const lastId = preKeys[preKeys.length - 1];

            socketConn.sendFrame(encodeStanza(stanza));

            markKeyAsUploaded(lastId.keyId);
        };

        const sendPassiveIq = async (e: boolean) => {
            const stanza = new WapNode('iq', {
                to: S_WHATSAPP_NET,
                xmlns: 'passive',
                type: 'set',
                id: generateId(),
            }, [
              new WapNode(e ? 'passive' : 'active', null)
            ]);

            socketConn.sendFrame(encodeStanza(stanza));
        };

        const parsePairDevice = async (node: WapNode) => {
            //var e = 6 === _.length ? 6e4 : 2e4
            const refs = node.content[0].content.map((node: WapNode) => {
                return node.contentString();
            });

            console.log('sending ok to server id: ', node.attrs.id);
            // send ok
            const iq = new WapNode('iq', {
                to: S_WHATSAPP_NET,
                type: 'result',
                id: node.attrs.id,
            });

            const nodeEnc = encodeStanza(iq);
            socketConn.sendFrame(nodeEnc);

            console.log('refs', refs);

            const ref = refs.shift();

            const noiseKeyB64 = encodeB64(noiseKey.pubKey);
            const identityKeyB64 = encodeB64(signedIdentityKey.pubKey);
            const advB64 = advSecretKey;
            const qrString = [ref, noiseKeyB64, identityKeyB64, advB64].join(',');

            QR.generate(qrString, { small: true });
            console.log(qrString);
        };

        const parseStreamError = async (node: WapNode) => {
            const code = node.attrs.code ?? null;
            if (!code) {
                console.log('invalid code in stream:error');
                return;
            }

            if (code == '515') {
                // start login
                console.log('restarting socket');
                socketConn.restart();
            }

            if (code == '516') {
                // start logout
            }
        };

        const parseSuccess = async (node: WapNode) => {
            console.log('success');
            await uploadPreKeys();
            await sendPassiveIq(false);
        };

        const parsePairSuccess = async (node: WapNode) => {
            const pair: WapNode = node.content[0];

            const id = node.attrs.id;
            const deviceIdentityBytes = pair.getContentByTag('device-identity')?.content;
            const businessName = pair.getContentByTag('biz')?.attrs?.name ?? null;
            const wid = pair.getContentByTag('device')?.attrs?.jid ?? null;

            const { details, hmac } = decodeProto(ADVSignedDeviceIdentityHMACSpec, deviceIdentityBytes);

            if (!details || !hmac) {
                console.log('invalid device details or hmac');
                return;
            }

            const sendNotAuthozired = () =>
                socketConn.sendFrame(
                    encodeStanza(
                        new WapNode(
                            'iq',
                            {
                                to: S_WHATSAPP_NET,
                                type: 'error',
                                id,
                            },
                            [
                                new WapNode('error', {
                                    code: '401',
                                    text: 'not-authorized',
                                }),
                            ],
                        ),
                    ),
                );

            const advSecret = decodeB64(await storageService.get('advSecretKey'));
            const advSign = await hmacSha256(advSecret, details);

            if (encodeB64(hmac) !== encodeB64(advSign)) {
                console.log('invalid hmac from pair-device success');

                sendNotAuthozired();
                // TODO MAKE CLEAR THE STORAGE KEYS
                return;
            }

            const account = decodeProto(ADVSignedDeviceIdentitySpec, details);
            console.log(account);
            const { accountSignatureKey, accountSignature } = account;
            if (!accountSignatureKey || !accountSignature) {
                console.log('invalid accountSignature or accountSignatureKey');
                return;
            }

            const identityKeyPair = await storageService.get('signedIdentityKey');

            if (!verifyDeviceIdentityAccountSignature(account, identityKeyPair)) {
                console.log('invalid device signature');
                sendNotAuthozired();
                return;
            }

            account.deviceSignature = generateDeviceSignature(account, identityKeyPair);

            await putIdentity(createSignalAddress(wid.toString(), 0), new Key(toSignalCurvePubKey(accountSignatureKey)));

            const keyIndex = decodeProto(ADVDeviceIdentitySpec, account.details).keyIndex;

            account.accountSignatureKey = undefined;

            const accountEnc = encodeProto(ADVSignedDeviceIdentitySpec, account).readByteArray();

            const stanza = encodeStanza(
                new WapNode(
                    'iq',
                    {
                        to: S_WHATSAPP_NET,
                        type: 'result',
                        id,
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

            socketConn.sendFrame(stanza);

            await storageService.save('me', wid);
        };

        const handleStanza = async (stanza: WapNode) => {
            if (!(stanza instanceof WapNode)) {
                return null;
            }

            const tag = stanza.tag;
            console.log('received tag node', tag);
            if (tag == 'iq' && stanza.content) {
                switch (stanza.content[0].tag) {
                    case 'pair-device':
                        await parsePairDevice(stanza);
                        break;

                    case 'pair-success':
                        await parsePairSuccess(stanza);
                        break;

                    default:
                        console.log('received tag from iq: ', stanza?.content[0]?.tag);
                        break;
                }
            }

            if (tag == 'stream:error') {
                await parseStreamError(stanza);
            }

            if (tag == 'success') {
                await parseSuccess(stanza);
            }
        };

        const PING_INTERVAL = 1e4 * Math.random() + 2e4;
        console.log('SENDING PING EVERY', PING_INTERVAL);
        const timer = setInterval(() => {
            console.log('send ping to server');
            socketConn.sendFrame(
                encodeStanza(
                    new WapNode(
                        'iq',
                        {
                            id: generateId(),
                            to: S_WHATSAPP_NET,
                            type: 'get',
                            xmlns: 'w:p',
                        },
                        [new WapNode('ping')],
                    ),
                ),
            );
        }, PING_INTERVAL);

        socketConn.onClose = () => {
            if (timer) {
                clearInterval(timer);
            }
        };

        socketConn.setOnFrame(async (e) => {
            const data = await unpackStanza(e);
            const stanza = decodeStanza(data);

            await handleStanza(stanza);
            console.log(stanza);
        });
    };
})();
