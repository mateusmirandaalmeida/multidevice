import {
    randomBytes,
    areBuffersEqual,
    HEADER,
    CERT_ISSUER,
    BIG_ENDIAN_CONTENT,
    KEY_BUNDLE_TYPE,
    xmppPreKey,
    xmppSignedPreKey,
    MESSAGE_TYPE,
    writeRandomPadMax16,
    unpadRandomMax16,
} from './utils/Utils';
import { Socket } from './socket/Socket';
import { FrameSocket } from './socket/FrameSocket';
import { NoiseHandshake } from './socket/NoiseHandshake';
import { toLowerCaseHex } from './utils/HexHelper';

import zlib from 'zlib';
import { generatePayloadRegister } from './payloads/RegisterPayload';
import { Binary } from './proto/Binary';
import { encodeStanza, generateId, decodeStanza, CUSTOM_STRING } from './proto/Stanza';
import { calculateSignature, generateIdentityKeyPair, generateRegistrationId, generateSignedPreKey, Key, KeyPair, sharedKey, SignedKeyPair, verifySignature } from './utils/Curve';
import { WapNode } from './proto/WapNode';
import * as QR from 'qrcode-terminal';
import { decodeB64, encodeB64 } from './utils/Base64';
import { S_WHATSAPP_NET, WapJid } from './proto/WapJid';
import { generatePayloadLogin } from './payloads/LoginPayload';
import { hmacSha256 } from './utils/HKDF';
import { proto as WAProto } from './proto/WAMessage';

import { StorageService } from './services/StorageService';
import { NoiseSocket } from './socket/NoiseSocket';
import { StorageSignal } from './signal/StorageSignal';
import { WaSignal } from './signal/Signal';
import { WapJidProps } from './proto/WapJidProps';

import * as Crypto from 'crypto';
import { e2eSessionParser, retryRequestParser } from './proto/retry-parser';
import { deviceParser } from './proto/ProtoParsers';


const crypto = Crypto.webcrypto as any;

const sessions = {};

interface Props {
    sessionName: string;
    /**
     * @description Callback stops when socket is closed
     */
    onSocketClose(err: Error): void;
}

export class WaClient {
    private KEEP_ALIVE_INTERVAL = 1e4 * Math.random() + 2e4;
    private keepAliveTimer: NodeJS.Timer;

    private waSignal: WaSignal;
    private storageSignal: StorageSignal;
    private sessionName: string;
    private socket: Socket;
    private storageService: StorageService;
    private frame: FrameSocket;
    private noise: NoiseHandshake;
    private me: WapJid;
    private socketConn: NoiseSocket;

    private registrationId: number;
    /** keys */
    private ephemeralKeyPair: KeyPair;
    private signedIdentityKey: KeyPair;
    private noiseKey: KeyPair;
    private signedPreKey: SignedKeyPair;
    private advSecretKey: string;
    private deviceIdentityBytes: any;
    private socketWaitIqs = {};
    private decryptRetryCount = {};

    /** events */
    private onSocketClose: Function;

    private devices: WapJidProps[];

    constructor({ sessionName, onSocketClose }: Props) {
        if (sessions[sessionName]) {
            throw new Error(`SessionName "${sessionName}" already exists`);
        }
        sessions[sessionName] = this;
        this.sessionName = sessionName;
        this.onSocketClose = onSocketClose;
        this.storageService = new StorageService('./sessions');
        this.initConfig();
    }

    private initConfig() {
        this.storageService.init(`${this.sessionName.replace(/ /g, '-')}.json`);
        this.storageSignal = new StorageSignal(this.storageService);
        this.waSignal = new WaSignal(this.storageService, this.storageSignal);
    }

    createConnection = () => {
        this.socket = new Socket();
        this.socket.open();
        this.ephemeralKeyPair = generateIdentityKeyPair();
        this.socket.onOpen = this.handleSocketOpen;
    };

    private handleSocketOpen = async () => {
        try {
            await this.configureConnection();
            this.createKeepAlive();
        } catch (e) {
            if (this.onSocketClose) {
                this.onSocketClose(e);
            }
        }
    };

    private configureConnection = async () => {
        this.frame = new FrameSocket(this.socket, HEADER);
        this.noise = new NoiseHandshake(this.frame);
        await this.noise.start('Noise_XX_25519_AESGCM_SHA256\0\0\0\0', HEADER);
        await this.noise.authenticate(this.ephemeralKeyPair.pubKey);

        const data = {
            clientHello: {
                ephemeral: this.ephemeralKeyPair.pubKey,
            },
        };

        const serverHelloEnc = await this.noise.sendAndReceive(WAProto.HandshakeMessage.encode(data).finish());

        console.log('received server hello', toLowerCaseHex(serverHelloEnc));
        const { serverHello } = WAProto.HandshakeMessage.decode(serverHelloEnc);
        if (!serverHello) {
            throw new Error('ServerHello payload error');
        }
        const { ephemeral: serverEphemeral, static: serverStaticCiphertext, payload: certificateCiphertext } = serverHello;
        if (serverEphemeral == null || serverStaticCiphertext == null || certificateCiphertext == null) {
            throw new Error('Missing server Ephemeral');
        }

        await this.noise.authenticate(serverEphemeral);
        await this.noise.mixIntoKey(sharedKey(serverEphemeral, this.ephemeralKeyPair.privKey));
        const staticDecoded = await this.noise.decrypt(serverStaticCiphertext);
        await this.noise.mixIntoKey(sharedKey(new Uint8Array(staticDecoded), this.ephemeralKeyPair.privKey));
        const certDecoded = await this.noise.decrypt(certificateCiphertext);
        const { details: certDetails, signature: certSignature } = WAProto.NoiseCertificate.decode(new Uint8Array(certDecoded));
        if (!certDetails || !certSignature) {
            throw new Error('certProto wrong');
        }
        const { issuer: certIssuer, key: certKey } = WAProto.Details.decode(certDetails);
        if (certIssuer != CERT_ISSUER || !certKey) {
            throw new Error('invalid issuer');
        }
        if (!areBuffersEqual(certKey, staticDecoded)) {
            throw new Error('cert key does not match issuer');
        }
        this.noiseKey = await this.storageService.getOrSave('noiseKey', () => generateIdentityKeyPair());
        const keyEnc = await this.noise.encrypt(new Uint8Array(this.noiseKey.pubKey));
        await this.noise.mixIntoKey(sharedKey(new Uint8Array(serverEphemeral), new Uint8Array(this.noiseKey.privKey)));
        this.signedIdentityKey = await this.storageService.getOrSave<KeyPair>('signedIdentityKey', () => generateIdentityKeyPair());
        this.signedPreKey = await this.storageService.getOrSave<SignedKeyPair>('signedPreKey', () => generateSignedPreKey(this.signedIdentityKey, 1));
        this.registrationId = await this.storageService.getOrSave<number>('registrationId', () => generateRegistrationId());
        this.me = this.storageService.get<WapJid>('me');
        const payload = !this.me ? generatePayloadRegister(this.registrationId, this.signedIdentityKey, this.signedPreKey) : generatePayloadLogin(this.me);
        const payloadEnc = await this.noise.encrypt(payload);
        this.noise.send(
            WAProto.HandshakeMessage.encode({
                clientFinish: {
                    static: new Uint8Array(keyEnc),
                    payload: new Uint8Array(payloadEnc),
                },
            }).finish(),
        );
        this.socketConn = await this.noise.finish();
        this.advSecretKey = await this.storageService.getOrSave<string>('advSecretKey', () => encodeB64(new Uint8Array(randomBytes(32))));
        this.socketConn.onClose = this.onNoiseSocketClose;
        this.socketConn.setOnFrame(this.onNoiseNewFrame);
    };

    private onNoiseSocketClose = () => {
        this.destroyKeepAlive();
        if (this.onSocketClose) {
            this.onSocketClose();
        }
    };

    private sendMessageAndWait(stanza: WapNode) {
        return new Promise((resolve, reject) => {
            this.socketWaitIqs[stanza.attrs.id] = {
                resolve,
                reject,
            };
            const frame = encodeStanza(stanza);
            this.socketConn.sendFrame(frame);
        });
    }

    private unpackStanza = async (e): Promise<Binary> => {
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

    private verifyDeviceIdentityAccountSignature = (account: any, identityKeyPair: KeyPair) => {
        const msg = Binary.build(new Uint8Array([6, 0]), account.details, identityKeyPair.pubKey).readByteArray();
        return verifySignature(new Uint8Array(account.accountSignatureKey), msg, new Uint8Array(account.accountSignature));
    };

    private generateDeviceSignature = (account: any, identityKeyPair: any) => {
        const msg = Binary.build(new Uint8Array([6, 1]), account.details, identityKeyPair.pubKey, account.accountSignatureKey).readByteArray().buffer;
        return calculateSignature(identityKeyPair.privKey, new Uint8Array(msg));
    };

    private uploadPreKeys = async () => {
        const registrationId = this.storageService.get<number>('registrationId');
        const identityKey = this.storageService.get<KeyPair>('signedIdentityKey');
        const signedPreKey = this.storageService.get<SignedKeyPair>('signedPreKey');
        if (!identityKey || !signedPreKey) {
            console.log('invalid identityKey or signedPreKey from uploadPreKeys');
            return;
        }
        const preKeys = await this.waSignal.getOrGenPreKeys(30);
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
            [
                new WapNode('registration', null, BIG_ENDIAN_CONTENT(registrationId)),
                new WapNode('type', null, KEY_BUNDLE_TYPE),
                new WapNode('identity', null, identityKey.pubKey),
                new WapNode('list', null, preKeys.map(xmppPreKey)),
                xmppSignedPreKey(signedPreKey),
            ],
        );
        const lastId = preKeys[preKeys.length - 1];
        this.socketConn.sendFrame(encodeStanza(stanza));
        await this.waSignal.markKeyAsUploaded(lastId.keyId);
        await this.waSignal.putServerHasPreKeys(true);
    };

    private sendPassiveIq = async (e: boolean) => {
        const stanza = new WapNode(
            'iq',
            {
                to: S_WHATSAPP_NET,
                xmlns: 'passive',
                type: 'set',
                id: generateId(),
            },
            [new WapNode(e ? 'passive' : 'active', null)],
        );
        this.socketConn.sendFrame(encodeStanza(stanza));
    };

    private sendNotAuthozired(id: string) {
        this.socketConn.sendFrame(
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
    }

    private parsePairDevice = async (node: WapNode) => {
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
        this.socketConn.sendFrame(nodeEnc);

        console.log('refs', refs);

        const ref = refs.shift();

        const noiseKeyB64 = encodeB64(this.noiseKey.pubKey);
        const identityKeyB64 = encodeB64(this.signedIdentityKey.pubKey);
        const advB64 = this.advSecretKey;
        const qrString = [ref, noiseKeyB64, identityKeyB64, advB64].join(',');

        QR.generate(qrString, { small: true });
        console.log(qrString);
    };

    private parseStreamError = async (node: WapNode) => {
        const code = node.attrs.code ?? null;
        if (!code) {
            console.log('invalid code in stream:error');
            return;
        }
        if (code == '515') {
            console.log('restarting socket');
            this.socketConn.restart();
        }
        if (code == '516') {
            // start logout
        }
    };

    private parseStreamFailure = async (node: WapNode) => {
        const reason = node.attrs.reason ?? null;
        if (reason == '401') {
            // disconnected by cell phone
            console.log('restarting socket');
            this.storageService.clearAll();
            this.socketConn.restart();
        }
    };

    private parseSuccess = async (node: WapNode) => {
        console.log('success');
        const serverHasPreKeys = await this.waSignal.getServerHasPreKeys();
        if (!serverHasPreKeys) {
            await this.uploadPreKeys();
        }

        await this.sendPassiveIq(false);
    };

    private parsePairSuccess = async (node: WapNode) => {
        const pair: WapNode = node.content[0];

        const id = node.attrs.id;
        this.deviceIdentityBytes = pair.getContentByTag('device-identity')?.content;
        const businessName = pair.getContentByTag('biz')?.attrs?.name ?? null;
        const wid = pair.getContentByTag('device')?.attrs?.jid ?? null;

        const { details, hmac } = WAProto.ADVSignedDeviceIdentityHMAC.decode(this.deviceIdentityBytes);

        this.storageService.save('device-identity-bytes', Array.from(this.deviceIdentityBytes));

        if (!details || !hmac) {
            console.log('invalid device details or hmac');
            return;
        }

        const advSecret = decodeB64(await this.storageService.get('advSecretKey'));
        const advSign = await hmacSha256(advSecret, details);

        if (encodeB64(hmac) !== encodeB64(new Uint8Array(advSign))) {
            console.log('invalid hmac from pair-device success');

            this.sendNotAuthozired(id);
            // TODO MAKE CLEAR THE STORAGE KEYS
            return;
        }

        const account = WAProto.ADVSignedDeviceIdentity.decode(details);
        const { accountSignatureKey, accountSignature } = account;
        if (!accountSignatureKey || !accountSignature) {
            console.log('invalid accountSignature or accountSignatureKey');
            return;
        }

        const identityKeyPair = await this.storageService.get('signedIdentityKey');

        if (!this.verifyDeviceIdentityAccountSignature(account, identityKeyPair)) {
            console.log('invalid device signature');
            this.sendNotAuthozired(id);
            return;
        }

        account.deviceSignature = this.generateDeviceSignature(account, identityKeyPair);

        await this.waSignal.putIdentity(this.waSignal.createSignalAddress(wid.toString(), 0), new Key(this.waSignal.toSignalCurvePubKey(accountSignatureKey)));

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
        this.socketConn.sendFrame(stanza);
        await this.storageService.save('me', wid);
    };

    private parseMessage = async (node: WapNode) => {
        const encMap: any[] = node.mapChildrenWithTag('enc', (node: WapNode) => {
            return {
                e2eType: node.attrs.type,
                mediaType: node.attrs?.mediatype ?? null,
                ciphertext: node.contentBytes(),
                retryCount: node.attrs?.count ?? 0,
            };
        });

        const deviceIdentity = node.maybeChild('device-identity');
        const deviceIdentityBytes = deviceIdentity ? deviceIdentity.contentBytes() : null;

        const msgInfo = ((node: WapNode, encMap: any[]) => {
            let ephSettings: {
                [key: string]: string;
            } = {};
            let participants: WapJid[] = [];

            let info: any = {
                externalId: node.attrs.id,
                ts: node.attrs.t,
                edit: node.attrs?.edit ?? -1,
                isHsm: !!node.attrs?.hsm,
                count: node.attrs?.count ?? null,
                pushname: node.attrs?.notify ?? null,
                category: node.attrs?.category ?? null,
                offline: node.attrs?.offline ?? null,
            };

            const from: WapJid = node.attrs.from;
            const recipient: WapJid = node.attrs?.recipient ?? null;
            const participant: WapJid = node.attrs?.participant ?? null;
            const isDirect = encMap.every((enc) => enc.e2eType != 'skmsg');
            const isRetry = encMap.some((enc) => enc.retryCount > 0);

            console.log({
                from,
                recipient,
                participants,
                isDirect,
                isRetry,
            });

            const participantsNode = node.maybeChild('participants');
            if (participantsNode) {
                node.forEachChildWithTag('to', (node: WapNode) => {
                    const jid: WapJid = node.attrs?.jid;
                    const ephSetting = node.attrs?.eph_setting ?? null;

                    participants.push(node.attrs.jid);

                    if (ephSetting) {
                        ephSettings[jid.toString()] = ephSetting;
                    }
                });
            }

            const isPeer = (jid: WapJid) => {
                const me = this.storageService.get<WapJid>('me');
                console.log('me', me);
                return jid.equals(me);
            };

            if (from.isUser()) {
                if (recipient) {
                    if (!isPeer(from)) {
                        throw new Error('recipient on non peer chat message');
                    }

                    return {
                        ...info,
                        type: MESSAGE_TYPE.CHAT,
                        chat: recipient,
                        author: from,
                    };
                }

                return {
                    type: MESSAGE_TYPE.CHAT,
                    chat: from,
                    author: from,
                };
            }

            if (from.isGroup()) {
                if (!participant) {
                    throw new Error('group message with no participant');
                }

                return {
                    ...info,
                    type: MESSAGE_TYPE.GROUP,
                    chat: from,
                    author: participant,
                    isDirect,
                };
            }

            if (from.isBroadcast() && !from.isStatusV3()) {
                if (!participant) {
                    throw new Error('broadcast message with no participant');
                }

                if (isPeer(participant)) {
                    if (participants.length == 0) {
                        if (!isRetry) {
                            throw new Error('peer broadcast message with no participants node');
                        }

                        participants = [];
                    }

                    return {
                        ...info,
                        type: MESSAGE_TYPE.PEER_BROADCAST,
                        chat: from,
                        author: participant,
                        isDirect,
                        bclParticipants: participants,
                        bclHashValidated: false,
                        bclEphSettings: ephSettings,
                    };
                }

                return {
                    ...info,
                    type: MESSAGE_TYPE.OTHER_BROADCAST,
                    chat: from,
                    author: participant,
                    isDirect,
                    ephSetting: node.attrs?.eph_setting ?? null,
                };
            }

            if (from.isBroadcast() && from.isStatusV3()) {
                if (!participant) {
                    throw new Error('status message with no participant');
                }

                if (isPeer(participant) && isDirect) {
                    if (participants.length == 0) {
                        return {
                            ...info,
                            type: MESSAGE_TYPE.DIRECT_PEER_STATUS,
                            chat: from,
                            author: participant,
                            isDirect,
                        };
                    }

                    return {
                        ...info,
                        type: MESSAGE_TYPE.DIRECT_PEER_STATUS,
                        chat: from,
                        author: participant,
                        bclParticipants: participants,
                        bclHashValidated: false,
                    };
                }

                return {
                    ...info,
                    type: MESSAGE_TYPE.OTHER_STATUS,
                    chat: from,
                    author: participant,
                    isDirect,
                };
            }

            throw new Error('Unrecognized message type');
        })(node, encMap);

        const msgMeta = ((node: WapNode, encMap: any[]) => {
            const isUnavailable = node.hasChild('unavailable');
            if (!isUnavailable && encMap.length == 0) {
                throw new Error('incomingMsgParser: to have enc node children');
            }

            return {
                isUnavailable,
                type: node.attrs.type,
                rawTs: node.attrs.t,
                urlNumber: node.hasChild('url_number'),
                urlText: node.hasChild('url_text'),
            };
        })(node, encMap);

        const bizInfo = ((node: WapNode) => {
            const verifiedNameCert = node.hasChild('verified_name') ? node.child('verified_name').contentBytes() : null;
            const verifiedLevel = node.attrs?.verified_level ?? null;
            const verifiedNameSerial = node.attrs?.verified_name ?? -1;
            const biz = node.maybeChild('biz');
            let privacyMode = null;

            if (biz != null) {
                const actualActors = biz.attrs?.actual_actors ?? null;
                const hostStorage = biz.attrs?.host_storage ?? null;
                const privacyModeTs = biz.attrs?.privacy_mode_ts ?? null;

                if (actualActors && hostStorage && privacyModeTs) {
                    privacyMode = {
                        actualActors,
                        hostStorage,
                        privacyModeTs,
                    };
                }
            }

            return {
                verifiedNameCert,
                verifiedLevel: verifiedLevel,
                verifiedNameSerial,
                privacyMode,
            };
        })(node);

        const paymentInfo = null; // TODO PAYMENT INFO

        /*console.log({
            encs: encMap,
            msgInfo,
            msgMeta,
            bizInfo,
            paymentInfo,
            deviceIdentity: deviceIdentityBytes,
        });*/

        const getFrom = (msg: any) => (msg.type == MESSAGE_TYPE.CHAT ? msg.author : msg.chat);

        for (const enc of encMap) {
            switch (enc.e2eType) {
                case 'skmsg':
                    try {
                        console.log('skmsg');
                        const result = await this.waSignal.decryptGroupSignalProto(getFrom(msgInfo), msgInfo.author, Buffer.from(enc.ciphertext));

                        const messageProto = WAProto.Message.decode(unpadRandomMax16(result));

                        console.log('decryptGroupMessage', {
                            ...msgInfo,
                            ...messageProto,
                        });
                    } catch (e) {
                        this.sendRetryReceipt(node);
                    }
                    break;
                case 'pkmsg':
                case 'msg':
                    try {
                        const s = getFrom(msgInfo);
                        const n = s.isUser() ? s : msgInfo.author;

                        const result = await this.waSignal.decryptSignalProto(n, enc.e2eType, Buffer.from(enc.ciphertext));

                        const messageProto = WAProto.Message.decode(unpadRandomMax16(result));

                        if (messageProto.senderKeyDistributionMessage) {
                            await this.waSignal.processSenderKeyDistributionMessage(msgInfo.chat, msgInfo.author, messageProto.senderKeyDistributionMessage);
                        }

                        console.log('decryptMessage', {
                            ...msgInfo,
                            ...messageProto,
                        });
                    } catch (e) {
                        this.sendRetryReceipt(node);
                    }
                    break;

                default:
                    break;
            }
        }
    };

    private async sendRetryReceipt(node: WapNode) {
        const isGroup = !!node.attrs.participant;
        const registrationInfo = {
            registrationId: await this.storageSignal.getOurRegistrationId(),
            identityKeyPair: await this.storageSignal.getOurIdentity(),
        };

        const identityKey = this.signedIdentityKey;
        const signedPreKey = this.signedPreKey;
        const account = await this.storageService.get('account');
        const deviceIdentity = WAProto.ADVSignedDeviceIdentity.encode(account).finish();
        const key = await this.waSignal.getOrGenSinglePreKey();
        const count = this.decryptRetryCount[node.attrs.id] || 1;
        
        const receipt = new WapNode(
            'receipt',
            {
                id: node.attrs.id,
                type: 'retry',
                ...(node.attrs.recipient ? { recipient: node.attrs.recipient } : {}),
                ...(node.attrs.participant ? { participant: node.attrs.participant } : {}),
                to: isGroup ? node.attrs.from : WapJid.createAD(node.attrs.from._jid.user, 0, node.attrs.from._jid.device || 0, true),
            },
            [
                new WapNode(
                    'retry',
                    {
                        count: `${count}`,
                        id: node.attrs.id,
                        t: node.attrs.t,
                        v: '1',
                    },
                    null,
                ),
                new WapNode('registration', {}, BIG_ENDIAN_CONTENT(registrationInfo.registrationId)),
                ...(count > 1
                    ? [
                          new WapNode('keys', {}, [
                              new WapNode('type', {}, new Uint8Array([Buffer.from(this.waSignal.toSignalCurvePubKey(KEY_BUNDLE_TYPE))[0]])),
                              new WapNode('identity', {}, identityKey.pubKey),
                              xmppPreKey(key),
                              xmppSignedPreKey(signedPreKey),
                              new WapNode('device-identity', {}, new Uint8Array(deviceIdentity)),
                          ]),
                      ]
                    : []),
            ],
        );
        this.sendMessageAndWait(receipt);
    }

    private handleDevices = (node: WapNode) => {
        this.devices = [];
        node.content.forEach((content: WapNode) => {
            if (content.tag == 'device' && content.attrs && content.attrs.jid) {
                this.devices.push(new WapJidProps(content.attrs.jid.toString()));
            }
        });
    };

    private parseNotification = (stanza: WapNode) => {
        stanza.content &&
            stanza.content.forEach((node: WapNode) => {
                switch (node.tag) {
                    case 'devices':
                        this.handleDevices(node);
                        break;
                }
            });
    };

    private handleStanza = async (stanza: WapNode) => {
        if (!(stanza instanceof WapNode)) {
            return null;
        }

        const tag = stanza.tag;
        console.log('received tag node', tag);

        if (stanza.attrs && stanza.attrs.id && this.socketWaitIqs[stanza.attrs.id]) {
            this.socketWaitIqs[stanza.attrs.id].resolve(stanza);
            delete this.socketWaitIqs[stanza.attrs.id];
        }

        if (tag == 'iq' && stanza.content) {
            switch (stanza.content[0].tag) {
                case 'pair-device':
                    await this.parsePairDevice(stanza);
                    break;

                case 'pair-success':
                    await this.parsePairSuccess(stanza);
                    break;

                default:
                    console.log('received tag from iq: ', stanza?.content[0]?.tag);
                    break;
            }
        }

        if (tag == 'stream:error') {
            await this.parseStreamError(stanza);
        }

        if (tag == 'success') {
            await this.parseSuccess(stanza);
        }

        if (tag == 'failure') {
            await this.parseStreamFailure(stanza);
        }

        if (tag == 'message') {
            try {
                await this.parseMessage(stanza);
            } catch (_) {
                console.log('Erro ao fazer o parse da mensagem');
            }
        }

        if (tag == 'notification') {
            await this.parseNotification(stanza);
        }

        if (tag == 'ack') {
            // await this.parseNotification(stanza);
            if (stanza.attrs.class == 'message') {
                const receipt = new WapNode(
                    'ack',
                    {
                        class: 'receipt',
                        id: stanza.attrs.id,
                        to: stanza.attrs.from,
                    },
                    null,
                );
                this.socketConn.sendFrame(encodeStanza(receipt));
            }
        }

        if (tag == 'receipt') {
            if (stanza.attrs.type == 'retry') {
                const t = retryRequestParser(stanza);

                const JID = function (e) {
                    return (null != e.device && 0 !== e.device) || (null != e.agent && 0 !== e.agent) ? WapJid.createAD(e.user, e.agent, e.device) : WapJid.create(e.user, e.server);
                };

                const DEVICE_JID = function (e) {
                    return WapJid.createAD(e.user, e.agent, e.device);
                };

                var { from: a, participant: s, recipient: o, retryCount: l, stanzaId: d } = t;
                const receipt = new WapNode(
                    'ack',
                    {
                        id: d,
                        to: JID(a),
                        // participant: s ? DEVICE_JID(s) : { sentinel: 'DROP_ATTR' },
                        class: 'receipt',
                        type: 'retry',
                    },
                    null,
                );

                this.socketConn.sendFrame(encodeStanza(receipt));
            }
        }
    };

    private onNoiseNewFrame = async (frame) => {
        const data = await this.unpackStanza(frame);
        const stanza = decodeStanza(data);
        await this.handleStanza(stanza);
        console.log(stanza);
    };

    private async ensureIdentityUser(user: WapJid, forceNewSession = false) {
        const sessionStorage = await this.waSignal.hasSession(user);
        if (!forceNewSession && sessionStorage) {
            return;
        }

        const userIdentity = new WapNode(
            'user',
            {
                jid: user,
                reason: 'identity',
            },
            null,
        );

        const stanza = new WapNode(
            'iq',
            {
                id: generateId(),
                xmlns: 'encrypt',
                type: 'get',
                to: S_WHATSAPP_NET,
            },
            [new WapNode('key', {}, [userIdentity])],
        );

        const result = await this.sendMessageAndWait(stanza);
        const session = await e2eSessionParser(result, this.me);

        const device = {
            registrationId: session.regId,
            identityKey: Buffer.from(this.waSignal.toSignalCurvePubKey(session.identity)),
            signedPreKey: {
                keyId: session.skey.id,
                publicKey: Buffer.from(this.waSignal.toSignalCurvePubKey(session.skey.pubkey)),
                signature: session.skey.signature,
            },
            ...(session.key
                ? {
                      preKey: {
                          keyId: session.key.id,
                          publicKey: Buffer.from(this.waSignal.toSignalCurvePubKey(session.key.pubkey)),
                      },
                  }
                : {}),
        };

        await this.waSignal.createSignalSession(user, device);
    }

    private sendMessage = async (jid: WapJid, message_: WAProto.IMessage, count) => {
        // return
        // if (!this.devices || this.devices.length == 0) {
        //     return console.log('Precisa sincronizar os devices')
        // }

        const account = await this.storageService.get('account');
        const destinationPhone = 'NUMBER';
        const destinationJid = new WapJidProps(`${destinationPhone}@c.us`);
        const message: WAProto.IMessage = {
            conversation: `ola mundo ${count}`,
            /*buttonsMessage: {
                headerType: 1,
                contentText: 'oi',
                footerText: 'oi 2',
                buttons: [
                    {
                        buttonId: '1',
                        buttonText: {
                            displayText: 'Sim',
                        },
                        type: 1,
                    },
                    {
                        buttonId: '2',
                        buttonText: {
                            displayText: 'Não',
                        },
                        type: 1,
                    },
                ],
            },*/
        };

        // const message: WAProto.IMessage = { conversation: `Enviando mensagem pela ${count} vez`  };
        const deviceSentMessage = {
            deviceSentMessage: {
                destinationJid: destinationJid.toString({
                    legacy: !0,
                }),
                message,
            },
        };

        const createWapNodeParticipant = async (body, jidProps: WapJidProps, jidAd, forceNewSession = false) => {
            // const encoded = encodeAndPad(body);
            const encodedMessage = new Binary(WAProto.Message.encode(body).finish());
            writeRandomPadMax16(encodedMessage);
            const encoded = encodedMessage.readByteArray();
            await this.ensureIdentityUser(WapJid.createAD(jidProps.getUser(), jidProps.agent, jidProps.device, false), forceNewSession);
            const proto = await this.waSignal.encryptSignalProto(jidProps, encoded);
            return new WapNode(
                'to',
                {
                    jid: jidAd,
                },
                [
                    new WapNode(
                        'enc',
                        {
                            v: '2',
                            type: proto.type.toLowerCase(),
                        },
                        new Uint8Array(proto.ciphertext),
                    ),
                ],
            );
        };

        const participants: WapNode[] = [];

        participants.push(await createWapNodeParticipant(message, destinationJid, WapJid.createAD(destinationPhone, 0, 0, true)));

        participants.push(await createWapNodeParticipant(deviceSentMessage, new WapJidProps(`${this.me.getUser()}@c.us`), WapJid.createAD(this.me.getUser(), 0, 0, true), true));

        const devices: WapJid[] = await this.getUSyncDevices([WapJid.createAD(destinationPhone, 0, 0), WapJid.createAD(this.me.getUser(), 0, 0)]);

        for (let index = 0; index < devices.length; index++) {
            const device = devices[index];

            const isMe = device.getUser() == this.me.getUser();

            const participant = await createWapNodeParticipant(
                isMe ? deviceSentMessage : message,
                new WapJidProps(device.toString()),
                WapJid.createAD(device.getUser(), device.getAgent(), device.getDevice()),
            );
            if (participant) {
                participants.push(participant);
            }
        }

        function generateMessageID() {
            var r = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 65, 66, 67, 68, 69, 70];
            var e = new Uint8Array(8);
            crypto.getRandomValues(e);
            for (var t = new Array(16), a = 0, i = 0; a < e.length; a++, i += 2) {
                var n = e[a];
                (t[i] = r[n >> 4]), (t[i + 1] = r[15 & n]);
            }
            return '3EB0' + String.fromCharCode.apply(String, t);
        }

        const deviceIdentity = WAProto.ADVSignedDeviceIdentity.encode(account).finish();

        const stanza = new WapNode(
            'message',
            {
                id: generateMessageID(),
                type: 'text',
                to: WapJid.create(destinationPhone, 's.whatsapp.net'),
            },
            [new WapNode('participants', {}, participants), new WapNode('device-identity', {}, deviceIdentity)],
        );

        const frame = encodeStanza(stanza);
        this.socketConn.sendFrame(frame);
    };

    protected getUSyncDevices = async (jids: WapJid[]): Promise<any> => {
        const users = jids.map((jid) => {
            return new WapNode(
                'user',
                {
                    jid,
                },
                null,
            );
        });

        const iq = new WapNode(
            'iq',
            {
                id: generateId(),
                to: S_WHATSAPP_NET,
                type: 'get',
                xmlns: 'usync',
            },
            [
                new WapNode(
                    'usync',
                    {
                        sid: generateId(),
                        mode: 'query',
                        last: 'true',
                        index: '0',
                        context: 'message',
                    },
                    [new WapNode('query', {}, [new WapNode('devices', { version: '2' }, null)]), new WapNode('list', {}, users)],
                ),
            ],
        );
        const resultFrame: any = await this.sendMessageAndWait(iq);
        const devicesToReturn = [];
        for (let index = 0; index < resultFrame.content.length; index++) {
            const result: WapNode = resultFrame.content[index];
            const list = result.content.find((node) => node.tag == 'list');
            if (list) {
                for (let index = 0; index < (list.content || []).length; index++) {
                    const user: WapNode = list.content[index];
                    const userJid: WapJid = user.attrs.jid;
                    for (let index = 0; index < user.content.length; index++) {
                        const devices = deviceParser(user.content[index], this.me);
                        if (devices && devices.deviceList && devices.deviceList.length > 0) {
                            for (let index = 0; index < devices.deviceList.length; index++) {
                                const device = devices.deviceList[index];
                                const jid = WapJid.createAD(userJid.getUser(), 0, device.id);
                                if (jid.getDevice() != 0 && this.me.getDevice() != jid.getDevice()) {
                                    devicesToReturn.push(jid);
                                }
                            }
                        }
                    }
                }
            }
        }
        return devicesToReturn;
    };

    private createKeepAlive = () => {
        let count = 0;
        /*setInterval(() => {
            try {
                console.log(`Enviando mensagem`);
                count++;
                this.sendMessage(null, null, count);
            } catch (_) {
                console.log('tretou enviar mensagem');
            }
        }, 5000);*/

        this.keepAliveTimer = setInterval(() => {
            console.log('send ping to server');
            this.socketConn.sendFrame(
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
        }, this.KEEP_ALIVE_INTERVAL);
    };

    private destroyKeepAlive = () => {
        if (this.keepAliveTimer) {
            clearInterval(this.keepAliveTimer);
        }
    };

    destroy() {
        this.socketConn.close();
        this.socket.close();
        delete sessions[this.sessionName];
    }
}
