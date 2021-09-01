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
    phashV2,
    generateMessageID,
    isGroupID,
} from './utils/Utils';
import { Socket } from './socket/Socket';
import { FrameSocket } from './socket/FrameSocket';
import { NoiseHandshake } from './socket/NoiseHandshake';
import { toLowerCaseHex, randomHex } from './utils/HexHelper';

import { generatePayloadRegister } from './payloads/RegisterPayload';
import { Binary } from './proto/Binary';
import { encodeStanza, generateId, decodeStanza, unpackStanza } from './proto/Stanza';
import { generateIdentityKeyPair, generateRegistrationId, generateSignedPreKey, KeyPair, sharedKey, SignedKeyPair } from './utils/Curve';
import { WapNode } from './proto/WapNode';
import { encodeB64 } from './utils/Base64';
import { G_US, S_WHATSAPP_NET, WapJid } from './proto/WapJid';
import { generatePayloadLogin } from './payloads/LoginPayload';
import { proto as WAProto } from './proto/WAMessage';

import { StorageService } from './services/StorageService';
import { NoiseSocket } from './socket/NoiseSocket';
import { StorageSignal } from './signal/StorageSignal';
import { WaSignal } from './signal/Signal';
import { Wid } from './proto/Wid';

import * as Crypto from 'crypto';
import { deviceParser, e2eSessionParser } from './proto/ProtoParsers';

import { EventEmitter } from 'stream';
import { EventHandlerService } from './services/EventHandlerService';

const crypto = Crypto.webcrypto as any;

const sessions = {};

interface Props {
    sessionName: string;
    log?: boolean;
    /**
     * @description Callback stops when socket is closed
     */
    onSocketClose(err: Error): void;
}

export class WaClient extends EventEmitter {
    private KEEP_ALIVE_INTERVAL = 1e4 * Math.random() + 2e4;
    private keepAliveTimer: NodeJS.Timer;

    private eventHandler: EventHandlerService;
    private waSignal: WaSignal;
    private storageSignal: StorageSignal;
    private sessionName: string;
    private socket: Socket;
    private storageService: StorageService;
    private frame: FrameSocket;
    private noise: NoiseHandshake;
    private me: WapJid;
    private socketConn: NoiseSocket;
    private enableLog: boolean;

    private registrationId: number;

    /** keys */
    private ephemeralKeyPair: KeyPair;
    private signedIdentityKey: KeyPair;
    private noiseKey: KeyPair;
    private signedPreKey: SignedKeyPair;
    private advSecretKey: string;
    private socketWaitIqs = {};
    private decryptRetryCount = {};

    /** events */
    private onSocketClose: Function;

    private devices: Wid[];

    constructor({ sessionName, onSocketClose, log }: Props) {
        super();

        if (sessions[sessionName]) {
            throw new Error(`SessionName "${sessionName}" already exists`);
        }

        sessions[sessionName] = this;
        this.sessionName = sessionName;
        this.onSocketClose = onSocketClose;
        this.enableLog = log ?? false;
        this.storageService = new StorageService('./sessions');

        this.initConfig();
    }

    public log(...data: any[]) {
        if (!this.enableLog) {
            return;
        }

        console.log(...data);
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

        return new Promise((resolve, reject) => {
            this.socket.onOpen = async () => {
                try {
                    await this.handleSocketOpen();
                    resolve(true);
                } catch (err) {
                    reject(false);
                }
            };
        });
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

        this.log('received server hello', toLowerCaseHex(serverHelloEnc));
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

        this.eventHandler = new EventHandlerService(this.socketConn, this, this.storageService, this.waSignal);

        this.socketConn.onClose = this.onNoiseSocketClose.bind(this);
        this.socketConn.setOnFrame(this.onNoiseNewFrame.bind(this));
    };

    private onNoiseSocketClose = () => {
        this.destroyKeepAlive();
        if (this.onSocketClose) {
            this.onSocketClose();
        }
    };

    private sendMessageAndWait(stanza: WapNode): Promise<WapNode> {
        return new Promise((resolve, reject) => {
            this.socketWaitIqs[stanza.attrs.id] = {
                resolve,
                reject,
            };
            const frame = encodeStanza(stanza);
            this.socketConn.sendFrame(frame);
        });
    }

    onlySendFrame(stanza: WapNode) {
        const frame = encodeStanza(stanza);
        if (!this.socketConn) {
            throw 'No Socket Handler';
        }
        this.socketConn.sendFrame(frame);
    }

    public uploadPreKeys = async () => {
        const registrationId = this.storageService.get<number>('registrationId');
        const identityKey = this.storageService.get<KeyPair>('signedIdentityKey');
        const signedPreKey = this.storageService.get<SignedKeyPair>('signedPreKey');
        if (!identityKey || !signedPreKey) {
            this.log('invalid identityKey or signedPreKey from uploadPreKeys');
            return;
        }
        const preKeys = await this.waSignal.getOrGenPreKeys(30);
        if (preKeys.length == 0) {
            this.log('No preKey is available');
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

    public sendPassiveIq = async (passive: boolean) => {
        const stanza = new WapNode(
            'iq',
            {
                to: S_WHATSAPP_NET,
                xmlns: 'passive',
                type: 'set',
                id: generateId(),
            },
            [new WapNode(passive ? 'passive' : 'active', null)],
        );

        this.socketConn.sendFrame(encodeStanza(stanza));
    };

    public sendNotAuthozired(id: string) {
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

    public getDevices() {
        return this.devices;
    }

    public setDevices(devices: Wid[]) {
        this.devices = devices;
    }

    public getNoiseKey() {
        return this.noiseKey;
    }

    public getRegistrationId() {
        return this.registrationId;
    }

    public getEphemeralKey() {
        return this.ephemeralKeyPair;
    }

    public getSignedIdentityKey() {
        return this.signedIdentityKey;
    }

    public getSignedPreKey() {
        return this.signedPreKey;
    }

    public getAdvSecretKey() {
        return this.advSecretKey;
    }

    public async afterMessageDecrypt(node: WapNode) {
        const isGroup = !!node.attrs.participant;
        const isMe = isGroup ? node.attrs.participant.getUser() == this.me.getUser() : node.attrs.from.getUser() == this.me.getUser();
        this.sendMessageAck(node);
        isMe ? this.sendMessageSender(node) : this.sendMessageInactive(node);
    }

    public async sendMessageSender(node: WapNode) {
        const isGroup = !!node.attrs.participant;
        const stanza = new WapNode(
            'receipt',
            {
                type: 'sender',
                id: node.attrs.id,
                ...(isGroup ? { participant: node.attrs.participant } : { recipient: node.attrs.recipient }),
                to: node.attrs.from,
            },
            null,
        );
        this.onlySendFrame(stanza);
    }

    public async sendMessageInactive(node: WapNode) {
        const isGroup = !!node.attrs.participant;
        const isStatus = node.attrs.from.isStatusV3();
        const stanza = new WapNode(
            'receipt',
            {
                type: 'inactive',
                id: node.attrs.id,
                to: isStatus ? WapJid.create('status', 'broadcast', null) : node.attrs.from,
                ...(isGroup || isStatus
                    ? {
                          participant: node.attrs.participant,
                      }
                    : {}),
            },
            null,
        );
        this.onlySendFrame(stanza);
    }

    public async sendMessageAck(node: WapNode) {
        const isGroup = !!node.attrs.participant;
        const stanza = new WapNode(
            'ack',
            {
                class: 'receipt',
                id: node.attrs.id,
                to: isGroup ? node.attrs.from : WapJid.create(this.me.getUser(), 'c.us', null),
                ...(isGroup
                    ? {
                          participant: WapJid.createAD(this.me.getUser(), 0, 0, true),
                      }
                    : {}),
            },
            null,
        );
        this.onlySendFrame(stanza);
    }

    public async sendRetryReceipt(node: WapNode) {
        this.decryptRetryCount[node.attrs.id] = (this.decryptRetryCount[node.attrs.id] || 0) + 1;
        if (this.decryptRetryCount[node.attrs.id] >= 50) {
            delete this.decryptRetryCount[node.attrs.id];
            return;
        }
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
        await this.sendMessageAndWait(receipt);
    }

    private handleStanza = async (stanza: WapNode) => {
        if (!(stanza instanceof WapNode)) {
            return null;
        }

        const tag = stanza.tag;
        this.log('received tag node', tag);

        if (tag == 'xmlstreamend') {
            this.socketConn.restart();
            return;
        }

        if (stanza.attrs && stanza.attrs.id && this.socketWaitIqs[stanza.attrs.id]) {
            this.socketWaitIqs[stanza.attrs.id].resolve(stanza);
            delete this.socketWaitIqs[stanza.attrs.id];
        }

        await this.eventHandler.handle(stanza);
    };

    private onNoiseNewFrame = async (frame) => {
        const data = await unpackStanza(frame);
        const stanza = decodeStanza(data);
        await this.handleStanza(stanza);
        this.log(stanza);
    };

    public async ensureIdentityUser(user: WapJid, forceNewSession = false) {
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

    public async sendMessageGroup(jid: string | WapJid, message: WAProto.IMessage) {
        const phone = typeof jid == 'string' ? jid : jid.getUser();

        const encodedMessage = new Binary(WAProto.Message.encode(message).finish());
        writeRandomPadMax16(encodedMessage);
        const encoded = encodedMessage.readByteArray();
        const destination = WapJid.create(phone, 'g.us');
        try {
            const { ciphertext, senderKeyDistributionMessage } = await this.waSignal.encryptSenderKeyMsgSignalProto(destination, this.me, encoded);
            const account = await this.storageService.get('account');
            const deviceIdentity = WAProto.ADVSignedDeviceIdentity.encode(account).finish();
            const participants: WapNode[] = [];
            const groupData = await this.getGroupInfo(phone);
            const devices: WapJid[] = await this.getUSyncDevices(groupData.participants, false);

            for (let index = 0; index < devices.length; index++) {
                const device = devices[index];
                const msg: WAProto.IMessage = {
                    senderKeyDistributionMessage: {
                        groupId: `${phone}@g.us`,
                        axolotlSenderKeyDistributionMessage: new Uint8Array(senderKeyDistributionMessage.serialize()),
                    },
                };
                const e = WapJid.createAD(device.getUser(), device.getAgent(), device.getDevice());
                const participant = await this.createWapNodeParticipant(msg, e);
                if (participant) {
                    participants.push(participant);
                }
            }

            const stanza = new WapNode(
                'message',
                {
                    to: destination,
                    id: generateMessageID(),
                    phash: await phashV2(groupData.participants),
                    type: 'text',
                },
                [
                    new WapNode('participants', {}, participants),
                    new WapNode(
                        'enc',
                        {
                            v: '2',
                            type: 'skmsg',
                        },
                        new Uint8Array(ciphertext),
                    ),
                    new WapNode('device-identity', {}, deviceIdentity),
                ],
            );
            this.sendMessageAndWait(stanza);
        } catch (e) {}
    }

    public async sendMessage(jid: string | WapJid, message: WAProto.IMessage) {
        if ((typeof jid == 'string' && isGroupID(jid)) || (jid instanceof WapJid && jid.isGroup())) {
            return this.sendMessageGroup(jid, message);
        }

        // return
        // if (!this.devices || this.devices.length == 0) {
        //     return this.log('Precisa sincronizar os devices')
        // }

        const account = await this.storageService.get('account');
        const destinationPhone = typeof jid == 'string' ? jid : jid.getUser();
        const destinationJid = new Wid(`${destinationPhone}@c.us`);

        const deviceSentMessage = {
            deviceSentMessage: {
                destinationJid: destinationJid.toString({
                    legacy: !0,
                }),
                message,
            },
        };

        const participants: WapNode[] = [];

        participants.push(await this.createWapNodeParticipant(message, WapJid.createAD(destinationPhone, 0, 0)));

        participants.push(await this.createWapNodeParticipant(deviceSentMessage, WapJid.createAD(this.me.getUser(), 0, 0)));

        const devices: WapJid[] = await this.getUSyncDevices([WapJid.createAD(destinationPhone, 0, 0), WapJid.createAD(this.me.getUser(), 0, 0)]);

        for (let index = 0; index < devices.length; index++) {
            const device = devices[index];

            const isMe = device.getUser() == this.me.getUser();

            const participant = await this.createWapNodeParticipant(isMe ? deviceSentMessage : message, WapJid.createAD(device.getUser(), device.getAgent(), device.getDevice()));
            if (participant) {
                participants.push(participant);
            }
        }

        console.dir(participants, { depth: null });

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
    }

    createWapNodeParticipant = async (body, jidAd) => {
        try {
            const encodedMessage = new Binary(WAProto.Message.encode(body).finish());
            writeRandomPadMax16(encodedMessage);
            const encoded = encodedMessage.readByteArray();
            const proto = await this.waSignal.encryptSignalProto(jidAd, encoded);
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
        } catch (e) {
            if (e && e.name == 'SessionError') {
                await this.ensureIdentityUser(jidAd, true);
                return this.createWapNodeParticipant(body, jidAd);
            }
            return null;
        }
    };

    protected getUSyncDevices = async (jids: WapJid[], ignoreZeroDevice = true): Promise<any> => {
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
                                if (ignoreZeroDevice) {
                                    if (jid.getDevice() != 0 && this.me.getDevice() != jid.getDevice()) {
                                        devicesToReturn.push(jid);
                                    }
                                } else {
                                    if (this.me.getDevice() != jid.getDevice()) {
                                        devicesToReturn.push(jid);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        return devicesToReturn;
    };

    public async createGroup(name: string, participants: string[]) {
        const participantsNode = participants.map((participant) => {
            return new WapNode('participant', {
                jid: WapJid.create(participant.replace('@c.us', '').replace('@s.whatsapp.net', ''), 's.whatsapp.net'),
            });
        });

        const stanza = new WapNode(
            'iq',
            {
                id: generateId(),
                type: 'set',
                xmlns: 'w:g2',
                to: G_US,
            },
            [
                new WapNode(
                    'create',
                    {
                        subject: name,
                        key: randomHex(8),
                    },
                    participantsNode,
                ),
            ],
        );

        const result = await this.sendMessageAndWait(stanza);

        return result;
    }

    public async getGroupInfo(groupPhone: string) {
        const stanza = new WapNode(
            'iq',
            {
                id: generateId(),
                type: 'get',
                xmlns: 'w:g2',
                to: WapJid.create(groupPhone, 'g.us'),
            },
            [new WapNode('query', { request: 'interactive' })],
        );

        const result = await this.sendMessageAndWait(stanza);
        const group: WapNode = result.content[0];
        const data = {
            name: group.attrs.subject,
            id: group.attrs.id,
            creation: group.attrs.creation,
            creator: group.attrs.creator,
            participants: group.content
                .filter((content: WapNode) => content.tag === 'participant')
                .map((content: WapNode) => {
                    return content.attrs.jid;
                }),
        };
        return data;
    }

    private createKeepAlive = () => {
        this.keepAliveTimer = setInterval(() => {
            this.log('send ping to server');
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
