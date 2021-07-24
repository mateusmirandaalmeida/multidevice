import { SPEC_CONSTS } from "./Spec";

export const ClientHelloSpec = {
  internalSpec: {
    ephemeral: [1, SPEC_CONSTS.TYPES.BYTES],
    static: [2, SPEC_CONSTS.TYPES.BYTES],
    payload: [3, SPEC_CONSTS.TYPES.BYTES],
  },
};

export const ServerHelloSpec = {
  internalSpec: {
    ephemeral: [1, SPEC_CONSTS.TYPES.BYTES],
    static: [2, SPEC_CONSTS.TYPES.BYTES],
    payload: [3, SPEC_CONSTS.TYPES.BYTES],
  },
};

export const ClientFinishSpec = {
  internalSpec: {
    static: [1, SPEC_CONSTS.TYPES.BYTES],
    payload: [2, SPEC_CONSTS.TYPES.BYTES],
  },
};

export const HandshakeMessageSpec = {
  internalSpec: {
    clientHello: [2, SPEC_CONSTS.TYPES.MESSAGE, ClientHelloSpec],
    serverHello: [3, SPEC_CONSTS.TYPES.MESSAGE, ServerHelloSpec],
    clientFinish: [4, SPEC_CONSTS.TYPES.MESSAGE, ClientFinishSpec],
  },
};

export const NoiseCertificateSpec = {
  internalSpec: {
    details: [1, SPEC_CONSTS.TYPES.BYTES],
    signature: [2, SPEC_CONSTS.TYPES.BYTES],
  },
};

export const DetailsSpec = {
  internalSpec: {
    serial: [1, SPEC_CONSTS.TYPES.UINT32],
    issuer: [2, SPEC_CONSTS.TYPES.STRING],
    expires: [3, SPEC_CONSTS.TYPES.UINT64],
    subject: [4, SPEC_CONSTS.TYPES.STRING],
    key: [5, SPEC_CONSTS.TYPES.BYTES],
  },
};

export const UserAgentPlatform = {};

export const ClientPayloadClientFeature = {};

export const AppVersionSpec = {
  internalSpec: {
    primary: [1, SPEC_CONSTS.TYPES.UINT32],
    secondary: [2, SPEC_CONSTS.TYPES.UINT32],
    tertiary: [3, SPEC_CONSTS.TYPES.UINT32],
    quaternary: [4, SPEC_CONSTS.TYPES.UINT32],
    quinary: [5, SPEC_CONSTS.TYPES.UINT32],
  },
};

export const UserAgentReleaseChannel = {};

export const UserAgentSpec = {
  internalSpec: {
    platform: [1, SPEC_CONSTS.TYPES.ENUM, UserAgentPlatform],
    appVersion: [2, SPEC_CONSTS.TYPES.MESSAGE, AppVersionSpec],
    mcc: [3, SPEC_CONSTS.TYPES.STRING],
    mnc: [4, SPEC_CONSTS.TYPES.STRING],
    osVersion: [5, SPEC_CONSTS.TYPES.STRING],
    manufacturer: [6, SPEC_CONSTS.TYPES.STRING],
    device: [7, SPEC_CONSTS.TYPES.STRING],
    osBuildNumber: [8, SPEC_CONSTS.TYPES.STRING],
    phoneId: [9, SPEC_CONSTS.TYPES.STRING],
    releaseChannel: [10, SPEC_CONSTS.TYPES.ENUM, UserAgentReleaseChannel],
    localeLanguageIso6391: [11, SPEC_CONSTS.TYPES.STRING],
    localeCountryIso31661Alpha2: [12, SPEC_CONSTS.TYPES.STRING],
    deviceBoard: [13, SPEC_CONSTS.TYPES.STRING],
  },
};

export const WebdPayloadSpec = {
  internalSpec: {
    usesParticipantInKey: [1, SPEC_CONSTS.TYPES.BOOL],
    supportsStarredMessages: [2, SPEC_CONSTS.TYPES.BOOL],
    supportsDocumentMessages: [3, SPEC_CONSTS.TYPES.BOOL],
    supportsUrlMessages: [4, SPEC_CONSTS.TYPES.BOOL],
    supportsMediaRetry: [5, SPEC_CONSTS.TYPES.BOOL],
    supportsE2EImage: [6, SPEC_CONSTS.TYPES.BOOL],
    supportsE2EVideo: [7, SPEC_CONSTS.TYPES.BOOL],
    supportsE2EAudio: [8, SPEC_CONSTS.TYPES.BOOL],
    supportsE2EDocument: [9, SPEC_CONSTS.TYPES.BOOL],
    documentTypes: [10, SPEC_CONSTS.TYPES.STRING],
    features: [11, SPEC_CONSTS.TYPES.BYTES],
  },
};

export const WebInfoWebSubPlatform = {};

export const WebInfoSpec = {
  internalSpec: {
    refToken: [1, SPEC_CONSTS.TYPES.STRING],
    version: [2, SPEC_CONSTS.TYPES.STRING],
    webdPayload: [3, SPEC_CONSTS.TYPES.MESSAGE, WebdPayloadSpec],
    webSubPlatform: [4, SPEC_CONSTS.TYPES.ENUM, WebInfoWebSubPlatform],
  },
};

export const ClientPayloadIOSAppExtension = {};

export const ClientPayloadConnectType = {};

export const ClientPayloadConnectReason = {};

export const DNSSourceDNSResolutionMethod = {};

export const DNSSourceSpec = {
  internalSpec: {
    dnsMethod: [15, SPEC_CONSTS.TYPES.ENUM, DNSSourceDNSResolutionMethod],
    appCached: [16, SPEC_CONSTS.TYPES.BOOL],
  },
};

export const CompanionRegDataSpec = {
  internalSpec: {
    eRegid: [1, SPEC_CONSTS.TYPES.BYTES],
    eKeytype: [2, SPEC_CONSTS.TYPES.BYTES],
    eIdent: [3, SPEC_CONSTS.TYPES.BYTES],
    eSkeyId: [4, SPEC_CONSTS.TYPES.BYTES],
    eSkeyVal: [5, SPEC_CONSTS.TYPES.BYTES],
    eSkeySig: [6, SPEC_CONSTS.TYPES.BYTES],
    buildHash: [7, SPEC_CONSTS.TYPES.BYTES],
    companionProps: [8, SPEC_CONSTS.TYPES.BYTES],
  },
};

export const ClientPayloadProduct = {};

export const ClientPayloadSpec = {
  internalSpec: {
    username: [1, SPEC_CONSTS.TYPES.UINT64],
    passive: [3, SPEC_CONSTS.TYPES.BOOL],
    clientFeatures: [
      4,
      SPEC_CONSTS.FLAGS.REPEATED | SPEC_CONSTS.TYPES.ENUM,
      ClientPayloadClientFeature,
    ],
    userAgent: [5, SPEC_CONSTS.TYPES.MESSAGE, UserAgentSpec],
    webInfo: [6, SPEC_CONSTS.TYPES.MESSAGE, WebInfoSpec],
    pushName: [7, SPEC_CONSTS.TYPES.STRING],
    sessionId: [9, SPEC_CONSTS.TYPES.SFIXED32],
    shortConnect: [10, SPEC_CONSTS.TYPES.BOOL],
    iosAppExtension: [30, SPEC_CONSTS.TYPES.ENUM, ClientPayloadIOSAppExtension],
    connectType: [12, SPEC_CONSTS.TYPES.ENUM, ClientPayloadConnectType],
    connectReason: [13, SPEC_CONSTS.TYPES.ENUM, ClientPayloadConnectReason],
    shards: [14, SPEC_CONSTS.FLAGS.REPEATED | SPEC_CONSTS.TYPES.INT32],
    dnsSource: [15, SPEC_CONSTS.TYPES.MESSAGE, DNSSourceSpec],
    connectAttemptCount: [16, SPEC_CONSTS.TYPES.UINT32],
    agent: [17, SPEC_CONSTS.TYPES.UINT32],
    device: [18, SPEC_CONSTS.TYPES.UINT32],
    regData: [19, SPEC_CONSTS.TYPES.MESSAGE, CompanionRegDataSpec],
    product: [20, SPEC_CONSTS.TYPES.ENUM, ClientPayloadProduct],
    fbCat: [21, SPEC_CONSTS.TYPES.BYTES],
    fbUserAgent: [22, SPEC_CONSTS.TYPES.BYTES],
    oc: [23, SPEC_CONSTS.TYPES.BOOL],
    lc: [24, SPEC_CONSTS.TYPES.UINT32],
  },
};

export const CompanionPropsPlatformType = {
  UNKNOWN: 0,
  CHROME: 1,
  FIREFOX: 2,
  IE: 3,
  OPERA: 4,
  SAFARI: 5,
  EDGE: 6,
  DESKTOP: 7,
  IPAD: 8,
  ANDROID_TABLET: 9,
  OHANA: 10,
  ALOHA: 11,
  CATALINA: 12,
};

export const CompanionPropsSpec = {
  internalSpec: {
    os: [1, SPEC_CONSTS.TYPES.STRING],
    version: [2, SPEC_CONSTS.TYPES.MESSAGE, AppVersionSpec],
    platformType: [3, SPEC_CONSTS.TYPES.ENUM, CompanionPropsPlatformType],
    requireFullSync: [4, SPEC_CONSTS.TYPES.BOOL],
  },
};
