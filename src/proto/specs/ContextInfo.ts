import { SPEC_CONSTS } from './../Spec';
import { MessageSpec } from './Message';

export const AdReplyInfoSpec = {
    internalSpec: {
        collectionNames: [1, SPEC_CONSTS.FLAGS.REPEATED | SPEC_CONSTS.TYPES.STRING],
        timestamp: [2, SPEC_CONSTS.TYPES.INT64],
    },
};

export const MessageKeySpec = {
    internalSpec: {
        remoteJid: [1, SPEC_CONSTS.TYPES.STRING],
        fromMe: [2, SPEC_CONSTS.TYPES.BOOL],
        id: [3, SPEC_CONSTS.TYPES.STRING],
        participant: [4, SPEC_CONSTS.TYPES.STRING],
    },
};

export const ExternalAdReplyInfoMediaType = {
    NONE: 0,
    IMAGE: 1,
    VIDEO: 2,
};

export const ExternalAdReplyInfoSpec = {
    internalSpec: {
        title: [1, SPEC_CONSTS.TYPES.STRING],
        body: [2, SPEC_CONSTS.TYPES.STRING],
        mediaType: [3, SPEC_CONSTS.TYPES.ENUM, ExternalAdReplyInfoMediaType],
        thumbnailUrl: [4, SPEC_CONSTS.TYPES.STRING],
        mediaUrl: [5, SPEC_CONSTS.TYPES.STRING],
        thumbnail: [6, SPEC_CONSTS.TYPES.BYTES],
        sourceType: [7, SPEC_CONSTS.TYPES.STRING],
        sourceId: [8, SPEC_CONSTS.TYPES.STRING],
        sourceUrl: [9, SPEC_CONSTS.TYPES.STRING],
    },
};

export const DisappearingModeInitiator = {
    CHANGED_IN_CHAT: 0,
    INITIATED_BY_ME: 1,
    INITIATED_BY_OTHER: 2,
};

export const DisappearingModeSpec = {
    internalSpec: {
        initiator: [1, SPEC_CONSTS.TYPES.ENUM, DisappearingModeInitiator],
    },
};

export const ActionLinkSpec = {
    internalSpec: {
        url: [1, SPEC_CONSTS.TYPES.STRING],
        buttonTitle: [2, SPEC_CONSTS.TYPES.STRING],
    },
};

export const ContextInfoSpec = {
    internalSpec: {
        stanzaId: [1, SPEC_CONSTS.TYPES.STRING],
        participant: [2, SPEC_CONSTS.TYPES.STRING],
        quotedMessage: [3, SPEC_CONSTS.TYPES.MESSAGE, MessageSpec],
        remoteJid: [4, SPEC_CONSTS.TYPES.STRING],
        mentionedJid: [15, SPEC_CONSTS.FLAGS.REPEATED | SPEC_CONSTS.TYPES.STRING],
        conversionSource: [18, SPEC_CONSTS.TYPES.STRING],
        conversionData: [19, SPEC_CONSTS.TYPES.BYTES],
        conversionDelaySeconds: [20, SPEC_CONSTS.TYPES.UINT32],
        forwardingScore: [21, SPEC_CONSTS.TYPES.UINT32],
        isForwarded: [22, SPEC_CONSTS.TYPES.BOOL],
        quotedAd: [23, SPEC_CONSTS.TYPES.MESSAGE, AdReplyInfoSpec],
        placeholderKey: [24, SPEC_CONSTS.TYPES.MESSAGE, MessageKeySpec],
        expiration: [25, SPEC_CONSTS.TYPES.UINT32],
        ephemeralSettingTimestamp: [26, SPEC_CONSTS.TYPES.INT64],
        ephemeralSharedSecret: [27, SPEC_CONSTS.TYPES.BYTES],
        externalAdReply: [28, SPEC_CONSTS.TYPES.MESSAGE, ExternalAdReplyInfoSpec],
        entryPointConversionSource: [29, SPEC_CONSTS.TYPES.STRING],
        entryPointConversionApp: [30, SPEC_CONSTS.TYPES.STRING],
        entryPointConversionDelaySeconds: [31, SPEC_CONSTS.TYPES.UINT32],
        disappearingMode: [32, SPEC_CONSTS.TYPES.MESSAGE, DisappearingModeSpec],
        actionLink: [33, SPEC_CONSTS.TYPES.MESSAGE, ActionLinkSpec],
    },
};