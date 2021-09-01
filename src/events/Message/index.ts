import { WapNode } from '../../proto/WapNode';
import { Handler } from '../Handler';
import { Wid } from '../../proto/Wid';
import { WapJid } from './../../proto/WapJid';
import { MESSAGE_TYPE, unpadRandomMax16 } from './../../utils/Utils';
import { proto as WAProto } from './../../proto/WAMessage';

const getFrom = (msg: any) => (msg.type == MESSAGE_TYPE.CHAT ? msg.author : msg.chat);

export class MessageHandler extends Handler {
    public async handle(node: WapNode) {
        const { encs, msgInfo } = await this.parse(node);

        const decryptEnc = async (enc) => {
            switch (enc.e2eType) {
                case 'skmsg':
                    try {
                        const result = await this.waSignal.decryptGroupSignalProto(getFrom(msgInfo), msgInfo.author, Buffer.from(enc.ciphertext));

                        const messageProto = WAProto.Message.decode(unpadRandomMax16(result));

                        if (!msgInfo.offline) {
                            this.client.emit('message', {
                                ...msgInfo,
                                ...messageProto,
                            });
                        }
                    } catch (e) {
                        await this.client.sendRetryReceipt(node);
                    }
                    break;

                case 'pkmsg':
                case 'msg':
                    const s = getFrom(msgInfo);
                    const n = s.isUser() ? s : msgInfo.author;

                    try {
                        console.dir({
                            ...msgInfo,
                        }, { depth: null })

                        const result = await this.waSignal.decryptSignalProto(n, enc.e2eType, Buffer.from(enc.ciphertext));

                        const messageProto = WAProto.Message.decode(unpadRandomMax16(result));

                        if (messageProto.senderKeyDistributionMessage) {
                            await this.waSignal.processSenderKeyDistributionMessage(msgInfo.chat, msgInfo.author, messageProto.senderKeyDistributionMessage);
                        }
                
                        if (!msgInfo.offline) {
                            this.client.emit('message', {
                                ...msgInfo,
                                ...messageProto,
                            });
                        }
                        this.client.afterMessageDecrypt(node)
                    } catch (e) {
                        await this.client.sendRetryReceipt(node);
                    }
                    break;

                default:
                    break;
            }
        }

        for (const enc of encs) {
           await decryptEnc(enc);
        }

        return true;
    }

    public async canHandle(stanza: WapNode) {
        return stanza.tag == 'message';
    }

    public async parse(node: WapNode) {
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

            this.client.log({
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
                    ...info,
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

        return {
            encs: encMap,
            msgInfo,
            msgMeta,
            bizInfo,
            paymentInfo,
            deviceIdentity: deviceIdentityBytes,
        };
    }
}
