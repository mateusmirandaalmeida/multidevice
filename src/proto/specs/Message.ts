import { SPEC_CONSTS } from './../Spec';
import { ContextInfoSpec, DisappearingModeSpec, MessageKeySpec } from './ContextInfo';

export const SenderKeyDistributionMessageSpec = {
    internalSpec: {
        groupId: [1, SPEC_CONSTS.TYPES.STRING],
        axolotlSenderKeyDistributionMessage: [2, SPEC_CONSTS.TYPES.BYTES],
    },
};

export const PointSpec = {
    internalSpec: {
        xDeprecated: [1, SPEC_CONSTS.TYPES.INT32],
        yDeprecated: [2, SPEC_CONSTS.TYPES.INT32],
        x: [3, SPEC_CONSTS.TYPES.DOUBLE],
        y: [4, SPEC_CONSTS.TYPES.DOUBLE],
    },
};

export const LocationSpec = {
    internalSpec: {
        degreesLatitude: [1, SPEC_CONSTS.TYPES.DOUBLE],
        degreesLongitude: [2, SPEC_CONSTS.TYPES.DOUBLE],
        name: [3, SPEC_CONSTS.TYPES.STRING],
    },
};

export const InteractiveAnnotationSpec = {
    internalSpec: {
        polygonVertices: [1, SPEC_CONSTS.FLAGS.REPEATED | SPEC_CONSTS.TYPES.MESSAGE, PointSpec],
        location: [2, SPEC_CONSTS.TYPES.MESSAGE, LocationSpec],
        __oneofs__: {
            action: ['location'],
        },
    },
};

export const ImageMessageSpec = {
    internalSpec: {
        url: [1, SPEC_CONSTS.TYPES.STRING],
        mimetype: [2, SPEC_CONSTS.TYPES.STRING],
        caption: [3, SPEC_CONSTS.TYPES.STRING],
        fileSha256: [4, SPEC_CONSTS.TYPES.BYTES],
        fileLength: [5, SPEC_CONSTS.TYPES.UINT64],
        height: [6, SPEC_CONSTS.TYPES.UINT32],
        width: [7, SPEC_CONSTS.TYPES.UINT32],
        mediaKey: [8, SPEC_CONSTS.TYPES.BYTES],
        fileEncSha256: [9, SPEC_CONSTS.TYPES.BYTES],
        interactiveAnnotations: [10, SPEC_CONSTS.FLAGS.REPEATED | SPEC_CONSTS.TYPES.MESSAGE, InteractiveAnnotationSpec],
        directPath: [11, SPEC_CONSTS.TYPES.STRING],
        mediaKeyTimestamp: [12, SPEC_CONSTS.TYPES.INT64],
        jpegThumbnail: [16, SPEC_CONSTS.TYPES.BYTES],
        contextInfo: [17, SPEC_CONSTS.TYPES.MESSAGE, ContextInfoSpec],
        firstScanSidecar: [18, SPEC_CONSTS.TYPES.BYTES],
        firstScanLength: [19, SPEC_CONSTS.TYPES.UINT32],
        experimentGroupId: [20, SPEC_CONSTS.TYPES.UINT32],
        scansSidecar: [21, SPEC_CONSTS.TYPES.BYTES],
        scanLengths: [22, SPEC_CONSTS.FLAGS.REPEATED | SPEC_CONSTS.TYPES.UINT32],
        midQualityFileSha256: [23, SPEC_CONSTS.TYPES.BYTES],
        midQualityFileEncSha256: [24, SPEC_CONSTS.TYPES.BYTES],
        viewOnce: [25, SPEC_CONSTS.TYPES.BOOL],
        thumbnailDirectPath: [26, SPEC_CONSTS.TYPES.STRING],
        thumbnailSha256: [27, SPEC_CONSTS.TYPES.BYTES],
        thumbnailEncSha256: [28, SPEC_CONSTS.TYPES.BYTES],
        staticUrl: [29, SPEC_CONSTS.TYPES.STRING],
    },
};

export const ContactMessageSpec = {
    internalSpec: {
        displayName: [1, SPEC_CONSTS.TYPES.STRING],
        vcard: [16, SPEC_CONSTS.TYPES.STRING],
        contextInfo: [17, SPEC_CONSTS.TYPES.MESSAGE, ContextInfoSpec],
    },
};

export const LocationMessageSpec = {
    internalSpec: {
        degreesLatitude: [1, SPEC_CONSTS.TYPES.DOUBLE],
        degreesLongitude: [2, SPEC_CONSTS.TYPES.DOUBLE],
        name: [3, SPEC_CONSTS.TYPES.STRING],
        address: [4, SPEC_CONSTS.TYPES.STRING],
        url: [5, SPEC_CONSTS.TYPES.STRING],
        isLive: [6, SPEC_CONSTS.TYPES.BOOL],
        accuracyInMeters: [7, SPEC_CONSTS.TYPES.UINT32],
        speedInMps: [8, SPEC_CONSTS.TYPES.FLOAT],
        degreesClockwiseFromMagneticNorth: [9, SPEC_CONSTS.TYPES.UINT32],
        comment: [11, SPEC_CONSTS.TYPES.STRING],
        jpegThumbnail: [16, SPEC_CONSTS.TYPES.BYTES],
        contextInfo: [17, SPEC_CONSTS.TYPES.MESSAGE, ContextInfoSpec],
    },
};

export const ExtendedTextMessageFontType = {
    SANS_SERIF: 0,
    SERIF: 1,
    NORICAN_REGULAR: 2,
    BRYNDAN_WRITE: 3,
    BEBASNEUE_REGULAR: 4,
    OSWALD_HEAVY: 5,
};

export const ExtendedTextMessagePreviewType = {
    NONE: 0,
    VIDEO: 1,
};

export const ExtendedTextMessageSpec = {
    internalSpec: {
        text: [1, SPEC_CONSTS.TYPES.STRING],
        matchedText: [2, SPEC_CONSTS.TYPES.STRING],
        canonicalUrl: [4, SPEC_CONSTS.TYPES.STRING],
        description: [5, SPEC_CONSTS.TYPES.STRING],
        title: [6, SPEC_CONSTS.TYPES.STRING],
        textArgb: [7, SPEC_CONSTS.TYPES.FIXED32],
        backgroundArgb: [8, SPEC_CONSTS.TYPES.FIXED32],
        font: [9, SPEC_CONSTS.TYPES.ENUM, ExtendedTextMessageFontType],
        previewType: [10, SPEC_CONSTS.TYPES.ENUM, ExtendedTextMessagePreviewType],
        jpegThumbnail: [16, SPEC_CONSTS.TYPES.BYTES],
        contextInfo: [17, SPEC_CONSTS.TYPES.MESSAGE, ContextInfoSpec],
        doNotPlayInline: [18, SPEC_CONSTS.TYPES.BOOL],
        thumbnailDirectPath: [19, SPEC_CONSTS.TYPES.STRING],
        thumbnailSha256: [20, SPEC_CONSTS.TYPES.BYTES],
        thumbnailEncSha256: [21, SPEC_CONSTS.TYPES.BYTES],
        mediaKey: [22, SPEC_CONSTS.TYPES.BYTES],
        mediaKeyTimestamp: [23, SPEC_CONSTS.TYPES.INT64],
        thumbnailHeight: [24, SPEC_CONSTS.TYPES.UINT32],
        thumbnailWidth: [25, SPEC_CONSTS.TYPES.UINT32],
    },
};

export const DocumentMessageSpec = {
    internalSpec: {
        url: [1, SPEC_CONSTS.TYPES.STRING],
        mimetype: [2, SPEC_CONSTS.TYPES.STRING],
        title: [3, SPEC_CONSTS.TYPES.STRING],
        fileSha256: [4, SPEC_CONSTS.TYPES.BYTES],
        fileLength: [5, SPEC_CONSTS.TYPES.UINT64],
        pageCount: [6, SPEC_CONSTS.TYPES.UINT32],
        mediaKey: [7, SPEC_CONSTS.TYPES.BYTES],
        fileName: [8, SPEC_CONSTS.TYPES.STRING],
        fileEncSha256: [9, SPEC_CONSTS.TYPES.BYTES],
        directPath: [10, SPEC_CONSTS.TYPES.STRING],
        mediaKeyTimestamp: [11, SPEC_CONSTS.TYPES.INT64],
        contactVcard: [12, SPEC_CONSTS.TYPES.BOOL],
        thumbnailDirectPath: [13, SPEC_CONSTS.TYPES.STRING],
        thumbnailSha256: [14, SPEC_CONSTS.TYPES.BYTES],
        thumbnailEncSha256: [15, SPEC_CONSTS.TYPES.BYTES],
        jpegThumbnail: [16, SPEC_CONSTS.TYPES.BYTES],
        contextInfo: [17, SPEC_CONSTS.TYPES.MESSAGE, ContextInfoSpec],
        thumbnailHeight: [18, SPEC_CONSTS.TYPES.UINT32],
        thumbnailWidth: [19, SPEC_CONSTS.TYPES.UINT32],
    },
};

export const AudioMessageSpec = {
    internalSpec: {
        url: [1, SPEC_CONSTS.TYPES.STRING],
        mimetype: [2, SPEC_CONSTS.TYPES.STRING],
        fileSha256: [3, SPEC_CONSTS.TYPES.BYTES],
        fileLength: [4, SPEC_CONSTS.TYPES.UINT64],
        seconds: [5, SPEC_CONSTS.TYPES.UINT32],
        ptt: [6, SPEC_CONSTS.TYPES.BOOL],
        mediaKey: [7, SPEC_CONSTS.TYPES.BYTES],
        fileEncSha256: [8, SPEC_CONSTS.TYPES.BYTES],
        directPath: [9, SPEC_CONSTS.TYPES.STRING],
        mediaKeyTimestamp: [10, SPEC_CONSTS.TYPES.INT64],
        contextInfo: [17, SPEC_CONSTS.TYPES.MESSAGE, ContextInfoSpec],
        streamingSidecar: [18, SPEC_CONSTS.TYPES.BYTES],
    },
};

export const VideoMessageAttribution = {
    NONE: 0,
    GIPHY: 1,
    TENOR: 2,
};

export const VideoMessageSpec = {
    internalSpec: {
        url: [1, SPEC_CONSTS.TYPES.STRING],
        mimetype: [2, SPEC_CONSTS.TYPES.STRING],
        fileSha256: [3, SPEC_CONSTS.TYPES.BYTES],
        fileLength: [4, SPEC_CONSTS.TYPES.UINT64],
        seconds: [5, SPEC_CONSTS.TYPES.UINT32],
        mediaKey: [6, SPEC_CONSTS.TYPES.BYTES],
        caption: [7, SPEC_CONSTS.TYPES.STRING],
        gifPlayback: [8, SPEC_CONSTS.TYPES.BOOL],
        height: [9, SPEC_CONSTS.TYPES.UINT32],
        width: [10, SPEC_CONSTS.TYPES.UINT32],
        fileEncSha256: [11, SPEC_CONSTS.TYPES.BYTES],
        interactiveAnnotations: [12, SPEC_CONSTS.FLAGS.REPEATED | SPEC_CONSTS.TYPES.MESSAGE, InteractiveAnnotationSpec],
        directPath: [13, SPEC_CONSTS.TYPES.STRING],
        mediaKeyTimestamp: [14, SPEC_CONSTS.TYPES.INT64],
        jpegThumbnail: [16, SPEC_CONSTS.TYPES.BYTES],
        contextInfo: [17, SPEC_CONSTS.TYPES.MESSAGE, ContextInfoSpec],
        streamingSidecar: [18, SPEC_CONSTS.TYPES.BYTES],
        gifAttribution: [19, SPEC_CONSTS.TYPES.ENUM, VideoMessageAttribution],
        viewOnce: [20, SPEC_CONSTS.TYPES.BOOL],
        thumbnailDirectPath: [21, SPEC_CONSTS.TYPES.STRING],
        thumbnailSha256: [22, SPEC_CONSTS.TYPES.BYTES],
        thumbnailEncSha256: [23, SPEC_CONSTS.TYPES.BYTES],
        staticUrl: [24, SPEC_CONSTS.TYPES.STRING],
    },
};

export const CallSpec = {
    internalSpec: {
        callKey: [1, SPEC_CONSTS.TYPES.BYTES],
        conversionSource: [2, SPEC_CONSTS.TYPES.STRING],
        conversionData: [3, SPEC_CONSTS.TYPES.BYTES],
        conversionDelaySeconds: [4, SPEC_CONSTS.TYPES.UINT32],
    },
};

export const ChatSpec = {
    internalSpec: {
        displayName: [1, SPEC_CONSTS.TYPES.STRING],
        id: [2, SPEC_CONSTS.TYPES.STRING],
    },
};

export const ProtocolMessageType = {
    REVOKE: 0,
    EPHEMERAL_SETTING: 3,
    EPHEMERAL_SYNC_RESPONSE: 4,
    HISTORY_SYNC_NOTIFICATION: 5,
    APP_STATE_SYNC_KEY_SHARE: 6,
    APP_STATE_SYNC_KEY_REQUEST: 7,
    MSG_FANOUT_BACKFILL_REQUEST: 8,
    INITIAL_SECURITY_NOTIFICATION_SETTING_SYNC: 9,
    APP_STATE_FATAL_EXCEPTION_NOTIFICATION: 10,
};

export const HistorySyncNotificationHistorySyncType = {
    INITIAL_BOOTSTRAP: 0,
    INITIAL_STATUS_V3: 1,
    FULL: 2,
    RECENT: 3,
    PUSH_NAME: 4,
};

export const HistorySyncNotificationSpec = {
    internalSpec: {
        fileSha256: [1, SPEC_CONSTS.TYPES.BYTES],
        fileLength: [2, SPEC_CONSTS.TYPES.UINT64],
        mediaKey: [3, SPEC_CONSTS.TYPES.BYTES],
        fileEncSha256: [4, SPEC_CONSTS.TYPES.BYTES],
        directPath: [5, SPEC_CONSTS.TYPES.STRING],
        syncType: [6, SPEC_CONSTS.TYPES.ENUM, HistorySyncNotificationHistorySyncType],
        chunkOrder: [7, SPEC_CONSTS.TYPES.UINT32],
        originalMessageId: [8, SPEC_CONSTS.TYPES.STRING],
    },
};

export const AppStateSyncKeyIdSpec = {
    internalSpec: {
        keyId: [1, SPEC_CONSTS.TYPES.BYTES],
    },
};

export const AppStateSyncKeyFingerprintSpec = {
    internalSpec: {
        rawId: [1, SPEC_CONSTS.TYPES.UINT32],
        currentIndex: [2, SPEC_CONSTS.TYPES.UINT32],
        deviceIndexes: [3, SPEC_CONSTS.FLAGS.REPEATED | SPEC_CONSTS.FLAGS.PACKED | SPEC_CONSTS.TYPES.UINT32],
    },
};

export const AppStateSyncKeyDataSpec = {
    internalSpec: {
        keyData: [1, SPEC_CONSTS.TYPES.BYTES],
        fingerprint: [2, SPEC_CONSTS.TYPES.MESSAGE, AppStateSyncKeyFingerprintSpec],
        timestamp: [3, SPEC_CONSTS.TYPES.INT64],
    },
};

export const AppStateSyncKeySpec = {
    internalSpec: {
        keyId: [1, SPEC_CONSTS.TYPES.MESSAGE, AppStateSyncKeyIdSpec],
        keyData: [2, SPEC_CONSTS.TYPES.MESSAGE, AppStateSyncKeyDataSpec],
    },
};

export const AppStateSyncKeyShareSpec = {
    internalSpec: {
        keys: [1, SPEC_CONSTS.FLAGS.REPEATED | SPEC_CONSTS.TYPES.MESSAGE, AppStateSyncKeySpec],
    },
};

export const AppStateSyncKeyRequestSpec = {
    internalSpec: {
        keyIds: [1, SPEC_CONSTS.FLAGS.REPEATED | SPEC_CONSTS.TYPES.MESSAGE, AppStateSyncKeyIdSpec],
    },
};

export const InitialSecurityNotificationSettingSyncSpec = {
    internalSpec: {
        securityNotificationEnabled: [1, SPEC_CONSTS.TYPES.BOOL],
    },
};

export const AppStateFatalExceptionNotificationSpec = {
    internalSpec: {
        collectionNames: [1, SPEC_CONSTS.FLAGS.REPEATED | SPEC_CONSTS.TYPES.STRING],
        timestamp: [2, SPEC_CONSTS.TYPES.INT64],
    },
};

export const ProtocolMessageSpec = {
    internalSpec: {
        key: [1, SPEC_CONSTS.TYPES.MESSAGE, MessageKeySpec],
        type: [2, SPEC_CONSTS.TYPES.ENUM, ProtocolMessageType],
        ephemeralExpiration: [4, SPEC_CONSTS.TYPES.UINT32],
        ephemeralSettingTimestamp: [5, SPEC_CONSTS.TYPES.INT64],
        historySyncNotification: [6, SPEC_CONSTS.TYPES.MESSAGE, HistorySyncNotificationSpec],
        appStateSyncKeyShare: [7, SPEC_CONSTS.TYPES.MESSAGE, AppStateSyncKeyShareSpec],
        appStateSyncKeyRequest: [8, SPEC_CONSTS.TYPES.MESSAGE, AppStateSyncKeyRequestSpec],
        initialSecurityNotificationSettingSync: [9, SPEC_CONSTS.TYPES.MESSAGE, InitialSecurityNotificationSettingSyncSpec],
        appStateFatalExceptionNotification: [10, SPEC_CONSTS.TYPES.MESSAGE, AppStateFatalExceptionNotificationSpec],
        disappearingMode: [11, SPEC_CONSTS.TYPES.MESSAGE, DisappearingModeSpec],
    },
};

export const ContactsArrayMessageSpec = {
    internalSpec: {
        displayName: [1, SPEC_CONSTS.TYPES.STRING],
        contacts: [2, SPEC_CONSTS.FLAGS.REPEATED | SPEC_CONSTS.TYPES.MESSAGE, ContactMessageSpec],
        contextInfo: [17, SPEC_CONSTS.TYPES.MESSAGE, ContextInfoSpec],
    },
};

export const HSMCurrencySpec = {
    internalSpec: {
        currencyCode: [1, SPEC_CONSTS.TYPES.STRING],
        amount1000: [2, SPEC_CONSTS.TYPES.INT64],
    },
};

export const HSMDateTimeComponentDayOfWeekType = {
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
    SUNDAY: 7,
};

export const HSMDateTimeComponentCalendarType = {
    GREGORIAN: 1,
    SOLAR_HIJRI: 2,
};

export const HSMDateTimeComponentSpec = {
    internalSpec: {
        dayOfWeek: [1, SPEC_CONSTS.TYPES.ENUM, HSMDateTimeComponentDayOfWeekType],
        year: [2, SPEC_CONSTS.TYPES.UINT32],
        month: [3, SPEC_CONSTS.TYPES.UINT32],
        dayOfMonth: [4, SPEC_CONSTS.TYPES.UINT32],
        hour: [5, SPEC_CONSTS.TYPES.UINT32],
        minute: [6, SPEC_CONSTS.TYPES.UINT32],
        calendar: [7, SPEC_CONSTS.TYPES.ENUM, HSMDateTimeComponentCalendarType],
    },
};

export const HSMDateTimeUnixEpochSpec = {
    internalSpec: {
        timestamp: [1, SPEC_CONSTS.TYPES.INT64],
    },
};

export const HSMDateTimeSpec = {
    internalSpec: {
        component: [1, SPEC_CONSTS.TYPES.MESSAGE, HSMDateTimeComponentSpec],
        unixEpoch: [2, SPEC_CONSTS.TYPES.MESSAGE, HSMDateTimeUnixEpochSpec],
        __oneofs__: {
            datetimeOneof: ['component', 'unixEpoch'],
        },
    },
};

export const HSMLocalizableParameterSpec = {
    internalSpec: {
        default: [1, SPEC_CONSTS.TYPES.STRING],
        currency: [2, SPEC_CONSTS.TYPES.MESSAGE, HSMCurrencySpec],
        dateTime: [3, SPEC_CONSTS.TYPES.MESSAGE, HSMDateTimeSpec],
        __oneofs__: {
            paramOneof: ['currency', 'dateTime'],
        },
    },
};

export const HighlyStructuredMessageSpec = {
    internalSpec: {},
};

export const QuickReplyButtonSpec = {
    internalSpec: {
        displayText: [1, SPEC_CONSTS.TYPES.MESSAGE, HighlyStructuredMessageSpec],
        id: [2, SPEC_CONSTS.TYPES.STRING],
    },
};

export const URLButtonSpec = {
    internalSpec: {
        displayText: [1, SPEC_CONSTS.TYPES.MESSAGE, HighlyStructuredMessageSpec],
        url: [2, SPEC_CONSTS.TYPES.MESSAGE, HighlyStructuredMessageSpec],
    },
};

export const CallButtonSpec = {
    internalSpec: {
        displayText: [1, SPEC_CONSTS.TYPES.MESSAGE, HighlyStructuredMessageSpec],
        phoneNumber: [2, SPEC_CONSTS.TYPES.MESSAGE, HighlyStructuredMessageSpec],
    },
};

export const TemplateButtonSpec = {
    internalSpec: {
        quickReplyButton: [1, SPEC_CONSTS.TYPES.MESSAGE, QuickReplyButtonSpec],
        urlButton: [2, SPEC_CONSTS.TYPES.MESSAGE, URLButtonSpec],
        callButton: [3, SPEC_CONSTS.TYPES.MESSAGE, CallButtonSpec],
        index: [4, SPEC_CONSTS.TYPES.UINT32],
        __oneofs__: {
            button: ['quickReplyButton', 'urlButton', 'callButton'],
        },
    },
};

export const FourRowTemplateSpec = {
    internalSpec: {
        documentMessage: [1, SPEC_CONSTS.TYPES.MESSAGE, DocumentMessageSpec],
        highlyStructuredMessage: [2, SPEC_CONSTS.TYPES.MESSAGE, HighlyStructuredMessageSpec],
        imageMessage: [3, SPEC_CONSTS.TYPES.MESSAGE, ImageMessageSpec],
        videoMessage: [4, SPEC_CONSTS.TYPES.MESSAGE, VideoMessageSpec],
        locationMessage: [5, SPEC_CONSTS.TYPES.MESSAGE, LocationMessageSpec],
        content: [6, SPEC_CONSTS.TYPES.MESSAGE, HighlyStructuredMessageSpec],
        footer: [7, SPEC_CONSTS.TYPES.MESSAGE, HighlyStructuredMessageSpec],
        buttons: [8, SPEC_CONSTS.FLAGS.REPEATED | SPEC_CONSTS.TYPES.MESSAGE, TemplateButtonSpec],
        __oneofs__: {
            title: ['documentMessage', 'highlyStructuredMessage', 'imageMessage', 'videoMessage', 'locationMessage'],
        },
    },
};

export const HydratedQuickReplyButtonSpec = {
    internalSpec: {
        displayText: [1, SPEC_CONSTS.TYPES.STRING],
        id: [2, SPEC_CONSTS.TYPES.STRING],
    },
};

export const HydratedURLButtonSpec = {
    internalSpec: {
        displayText: [1, SPEC_CONSTS.TYPES.STRING],
        url: [2, SPEC_CONSTS.TYPES.STRING],
    },
};

export const HydratedCallButtonSpec = {
    internalSpec: {
        displayText: [1, SPEC_CONSTS.TYPES.STRING],
        phoneNumber: [2, SPEC_CONSTS.TYPES.STRING],
    },
};

export const HydratedTemplateButtonSpec = {
    internalSpec: {
        quickReplyButton: [1, SPEC_CONSTS.TYPES.MESSAGE, HydratedQuickReplyButtonSpec],
        urlButton: [2, SPEC_CONSTS.TYPES.MESSAGE, HydratedURLButtonSpec],
        callButton: [3, SPEC_CONSTS.TYPES.MESSAGE, HydratedCallButtonSpec],
        index: [4, SPEC_CONSTS.TYPES.UINT32],
        __oneofs__: {
            hydratedButton: ['quickReplyButton', 'urlButton', 'callButton'],
        },
    },
};

export const HydratedFourRowTemplateSpec = {
    internalSpec: {
        documentMessage: [1, SPEC_CONSTS.TYPES.MESSAGE, DocumentMessageSpec],
        hydratedTitleText: [2, SPEC_CONSTS.TYPES.STRING],
        imageMessage: [3, SPEC_CONSTS.TYPES.MESSAGE, ImageMessageSpec],
        videoMessage: [4, SPEC_CONSTS.TYPES.MESSAGE, VideoMessageSpec],
        locationMessage: [5, SPEC_CONSTS.TYPES.MESSAGE, LocationMessageSpec],
        hydratedContentText: [6, SPEC_CONSTS.TYPES.STRING],
        hydratedFooterText: [7, SPEC_CONSTS.TYPES.STRING],
        hydratedButtons: [8, SPEC_CONSTS.FLAGS.REPEATED | SPEC_CONSTS.TYPES.MESSAGE, HydratedTemplateButtonSpec],
        templateId: [9, SPEC_CONSTS.TYPES.STRING],
        __oneofs__: {
            title: ['documentMessage', 'hydratedTitleText', 'imageMessage', 'videoMessage', 'locationMessage'],
        },
    },
};

export const TemplateMessageSpec = {
    internalSpec: {
        fourRowTemplate: [1, SPEC_CONSTS.TYPES.MESSAGE, FourRowTemplateSpec],
        hydratedFourRowTemplate: [2, SPEC_CONSTS.TYPES.MESSAGE, HydratedFourRowTemplateSpec],
        contextInfo: [3, SPEC_CONSTS.TYPES.MESSAGE, ContextInfoSpec],
        hydratedTemplate: [4, SPEC_CONSTS.TYPES.MESSAGE, HydratedFourRowTemplateSpec],
        __oneofs__: {
            format: ['fourRowTemplate', 'hydratedFourRowTemplate'],
        },
    },
};

HighlyStructuredMessageSpec.internalSpec = {
    namespace: [1, SPEC_CONSTS.TYPES.STRING],
    elementName: [2, SPEC_CONSTS.TYPES.STRING],
    params: [3, SPEC_CONSTS.FLAGS.REPEATED | SPEC_CONSTS.TYPES.STRING],
    fallbackLg: [4, SPEC_CONSTS.TYPES.STRING],
    fallbackLc: [5, SPEC_CONSTS.TYPES.STRING],
    localizableParams: [6, SPEC_CONSTS.FLAGS.REPEATED | SPEC_CONSTS.TYPES.MESSAGE, HSMLocalizableParameterSpec],
    deterministicLg: [7, SPEC_CONSTS.TYPES.STRING],
    deterministicLc: [8, SPEC_CONSTS.TYPES.STRING],
    hydratedHsm: [9, SPEC_CONSTS.TYPES.MESSAGE, TemplateMessageSpec],
};

export const MessageSpec = {
    internalSpec: {},
};

export const PaymentBackgroundSpec = {
    internalSpec: {
        id: [1, SPEC_CONSTS.TYPES.STRING],
        fileLength: [2, SPEC_CONSTS.TYPES.UINT64],
        width: [3, SPEC_CONSTS.TYPES.UINT32],
        height: [4, SPEC_CONSTS.TYPES.UINT32],
        mimetype: [5, SPEC_CONSTS.TYPES.STRING],
        placeholderArgb: [6, SPEC_CONSTS.TYPES.FIXED32],
        textArgb: [7, SPEC_CONSTS.TYPES.FIXED32],
        subtextArgb: [8, SPEC_CONSTS.TYPES.FIXED32],
    },
};

export const SendPaymentMessageSpec = {
    internalSpec: {
        noteMessage: [2, SPEC_CONSTS.TYPES.MESSAGE, MessageSpec],
        requestMessageKey: [3, SPEC_CONSTS.TYPES.MESSAGE, MessageKeySpec],
        background: [4, SPEC_CONSTS.TYPES.MESSAGE, PaymentBackgroundSpec],
    },
};

export const LiveLocationMessageSpec = {
    internalSpec: {
        degreesLatitude: [1, SPEC_CONSTS.TYPES.DOUBLE],
        degreesLongitude: [2, SPEC_CONSTS.TYPES.DOUBLE],
        accuracyInMeters: [3, SPEC_CONSTS.TYPES.UINT32],
        speedInMps: [4, SPEC_CONSTS.TYPES.FLOAT],
        degreesClockwiseFromMagneticNorth: [5, SPEC_CONSTS.TYPES.UINT32],
        caption: [6, SPEC_CONSTS.TYPES.STRING],
        sequenceNumber: [7, SPEC_CONSTS.TYPES.INT64],
        timeOffset: [8, SPEC_CONSTS.TYPES.UINT32],
        jpegThumbnail: [16, SPEC_CONSTS.TYPES.BYTES],
        contextInfo: [17, SPEC_CONSTS.TYPES.MESSAGE, ContextInfoSpec],
    },
};

export const MoneySpec = {
    internalSpec: {
        value: [1, SPEC_CONSTS.TYPES.INT64],
        offset: [2, SPEC_CONSTS.TYPES.UINT32],
        currencyCode: [3, SPEC_CONSTS.TYPES.STRING],
    },
};

export const RequestPaymentMessageSpec = {
    internalSpec: {
        noteMessage: [4, SPEC_CONSTS.TYPES.MESSAGE, MessageSpec],
        currencyCodeIso4217: [1, SPEC_CONSTS.TYPES.STRING],
        amount1000: [2, SPEC_CONSTS.TYPES.UINT64],
        requestFrom: [3, SPEC_CONSTS.TYPES.STRING],
        expiryTimestamp: [5, SPEC_CONSTS.TYPES.INT64],
        amount: [6, SPEC_CONSTS.TYPES.MESSAGE, MoneySpec],
        background: [7, SPEC_CONSTS.TYPES.MESSAGE, PaymentBackgroundSpec],
    },
};

export const DeclinePaymentRequestMessageSpec = {
    internalSpec: {
        key: [1, SPEC_CONSTS.TYPES.MESSAGE, MessageKeySpec],
    },
};

export const CancelPaymentRequestMessageSpec = {
    internalSpec: {
        key: [1, SPEC_CONSTS.TYPES.MESSAGE, MessageKeySpec],
    },
};

export const StickerMessageSpec = {
    internalSpec: {
        url: [1, SPEC_CONSTS.TYPES.STRING],
        fileSha256: [2, SPEC_CONSTS.TYPES.BYTES],
        fileEncSha256: [3, SPEC_CONSTS.TYPES.BYTES],
        mediaKey: [4, SPEC_CONSTS.TYPES.BYTES],
        mimetype: [5, SPEC_CONSTS.TYPES.STRING],
        height: [6, SPEC_CONSTS.TYPES.UINT32],
        width: [7, SPEC_CONSTS.TYPES.UINT32],
        directPath: [8, SPEC_CONSTS.TYPES.STRING],
        fileLength: [9, SPEC_CONSTS.TYPES.UINT64],
        mediaKeyTimestamp: [10, SPEC_CONSTS.TYPES.INT64],
        firstFrameLength: [11, SPEC_CONSTS.TYPES.UINT32],
        firstFrameSidecar: [12, SPEC_CONSTS.TYPES.BYTES],
        isAnimated: [13, SPEC_CONSTS.TYPES.BOOL],
        pngThumbnail: [16, SPEC_CONSTS.TYPES.BYTES],
        contextInfo: [17, SPEC_CONSTS.TYPES.MESSAGE, ContextInfoSpec],
    },
};

export const GroupInviteMessageSpec = {
    internalSpec: {
        groupJid: [1, SPEC_CONSTS.TYPES.STRING],
        inviteCode: [2, SPEC_CONSTS.TYPES.STRING],
        inviteExpiration: [3, SPEC_CONSTS.TYPES.INT64],
        groupName: [4, SPEC_CONSTS.TYPES.STRING],
        jpegThumbnail: [5, SPEC_CONSTS.TYPES.BYTES],
        caption: [6, SPEC_CONSTS.TYPES.STRING],
        contextInfo: [7, SPEC_CONSTS.TYPES.MESSAGE, ContextInfoSpec],
    },
};

export const TemplateButtonReplyMessageSpec = {
    internalSpec: {
        selectedId: [1, SPEC_CONSTS.TYPES.STRING],
        selectedDisplayText: [2, SPEC_CONSTS.TYPES.STRING],
        contextInfo: [3, SPEC_CONSTS.TYPES.MESSAGE, ContextInfoSpec],
        selectedIndex: [4, SPEC_CONSTS.TYPES.UINT32],
    },
};

export const ProductSnapshotSpec = {
    internalSpec: {
        productImage: [1, SPEC_CONSTS.TYPES.MESSAGE, ImageMessageSpec],
        productId: [2, SPEC_CONSTS.TYPES.STRING],
        title: [3, SPEC_CONSTS.TYPES.STRING],
        description: [4, SPEC_CONSTS.TYPES.STRING],
        currencyCode: [5, SPEC_CONSTS.TYPES.STRING],
        priceAmount1000: [6, SPEC_CONSTS.TYPES.INT64],
        retailerId: [7, SPEC_CONSTS.TYPES.STRING],
        url: [8, SPEC_CONSTS.TYPES.STRING],
        productImageCount: [9, SPEC_CONSTS.TYPES.UINT32],
        firstImageId: [11, SPEC_CONSTS.TYPES.STRING],
        salePriceAmount1000: [12, SPEC_CONSTS.TYPES.INT64],
    },
};

export const CatalogSnapshotSpec = {
    internalSpec: {
        catalogImage: [1, SPEC_CONSTS.TYPES.MESSAGE, ImageMessageSpec],
        title: [2, SPEC_CONSTS.TYPES.STRING],
        description: [3, SPEC_CONSTS.TYPES.STRING],
    },
};

export const ProductMessageSpec = {
    internalSpec: {
        product: [1, SPEC_CONSTS.TYPES.MESSAGE, ProductSnapshotSpec],
        businessOwnerJid: [2, SPEC_CONSTS.TYPES.STRING],
        catalog: [4, SPEC_CONSTS.TYPES.MESSAGE, CatalogSnapshotSpec],
        contextInfo: [17, SPEC_CONSTS.TYPES.MESSAGE, ContextInfoSpec],
    },
};

export const DeviceSentMessageSpec = {
    internalSpec: {
        destinationJid: [1, SPEC_CONSTS.TYPES.STRING],
        message: [2, SPEC_CONSTS.TYPES.MESSAGE, MessageSpec],
        phash: [3, SPEC_CONSTS.TYPES.STRING],
    },
};

export const DeviceListMetadataSpec = {
    internalSpec: {
        senderKeyHash: [1, SPEC_CONSTS.TYPES.BYTES],
        senderTimestamp: [2, SPEC_CONSTS.TYPES.UINT64],
        senderKeyIndexes: [3, SPEC_CONSTS.FLAGS.REPEATED | SPEC_CONSTS.FLAGS.PACKED | SPEC_CONSTS.TYPES.UINT32],
        recipientKeyHash: [8, SPEC_CONSTS.TYPES.BYTES],
        recipientTimestamp: [9, SPEC_CONSTS.TYPES.UINT64],
        recipientKeyIndexes: [10, SPEC_CONSTS.FLAGS.REPEATED | SPEC_CONSTS.FLAGS.PACKED | SPEC_CONSTS.TYPES.UINT32],
    },
};

export const MessageContextInfoSpec = {
    internalSpec: {
        deviceListMetadata: [1, SPEC_CONSTS.TYPES.MESSAGE, DeviceListMetadataSpec],
        deviceListMetadataVersion: [2, SPEC_CONSTS.TYPES.INT32],
    },
};

export const ListMessageListType = {
    UNKNOWN: 0,
    SINGLE_SELECT: 1,
    PRODUCT_LIST: 2,
};

export const RowSpec = {
    internalSpec: {
        title: [1, SPEC_CONSTS.TYPES.STRING],
        description: [2, SPEC_CONSTS.TYPES.STRING],
        rowId: [3, SPEC_CONSTS.TYPES.STRING],
    },
};

export const SectionSpec = {
    internalSpec: {
        title: [1, SPEC_CONSTS.TYPES.STRING],
        rows: [2, SPEC_CONSTS.FLAGS.REPEATED | SPEC_CONSTS.TYPES.MESSAGE, RowSpec],
    },
};

export const ProductSpec = {
    internalSpec: {
        productId: [1, SPEC_CONSTS.TYPES.STRING],
    },
};

export const ProductSectionSpec = {
    internalSpec: {
        title: [1, SPEC_CONSTS.TYPES.STRING],
        products: [2, SPEC_CONSTS.FLAGS.REPEATED | SPEC_CONSTS.TYPES.MESSAGE, ProductSpec],
    },
};

export const ProductListHeaderImageSpec = {
    internalSpec: {
        productId: [1, SPEC_CONSTS.TYPES.STRING],
        jpegThumbnail: [2, SPEC_CONSTS.TYPES.BYTES],
    },
};

export const ProductListInfoSpec = {
    internalSpec: {
        productSections: [1, SPEC_CONSTS.FLAGS.REPEATED | SPEC_CONSTS.TYPES.MESSAGE, ProductSectionSpec],
        headerImage: [2, SPEC_CONSTS.TYPES.MESSAGE, ProductListHeaderImageSpec],
        businessOwnerJid: [3, SPEC_CONSTS.TYPES.STRING],
    },
};

export const ListMessageSpec = {
    internalSpec: {
        title: [1, SPEC_CONSTS.TYPES.STRING],
        description: [2, SPEC_CONSTS.TYPES.STRING],
        buttonText: [3, SPEC_CONSTS.TYPES.STRING],
        listType: [4, SPEC_CONSTS.TYPES.ENUM, ListMessageListType],
        sections: [5, SPEC_CONSTS.FLAGS.REPEATED | SPEC_CONSTS.TYPES.MESSAGE, SectionSpec],
        productListInfo: [6, SPEC_CONSTS.TYPES.MESSAGE, ProductListInfoSpec],
        footerText: [7, SPEC_CONSTS.TYPES.STRING],
        contextInfo: [8, SPEC_CONSTS.TYPES.MESSAGE, ContextInfoSpec],
    },
};

export const FutureProofMessageSpec = {
    internalSpec: {
        message: [1, SPEC_CONSTS.TYPES.MESSAGE, MessageSpec],
    },
};

export const OrderMessageOrderStatus = {
    INQUIRY: 1,
};

export const OrderMessageOrderSurface = {
    CATALOG: 1,
};

export const OrderMessageSpec = {
    internalSpec: {
        orderId: [1, SPEC_CONSTS.TYPES.STRING],
        thumbnail: [2, SPEC_CONSTS.TYPES.BYTES],
        itemCount: [3, SPEC_CONSTS.TYPES.INT32],
        status: [4, SPEC_CONSTS.TYPES.ENUM, OrderMessageOrderStatus],
        surface: [5, SPEC_CONSTS.TYPES.ENUM, OrderMessageOrderSurface],
        message: [6, SPEC_CONSTS.TYPES.STRING],
        orderTitle: [7, SPEC_CONSTS.TYPES.STRING],
        sellerJid: [8, SPEC_CONSTS.TYPES.STRING],
        token: [9, SPEC_CONSTS.TYPES.STRING],
        totalAmount1000: [10, SPEC_CONSTS.TYPES.INT64],
        totalCurrencyCode: [11, SPEC_CONSTS.TYPES.STRING],
        contextInfo: [17, SPEC_CONSTS.TYPES.MESSAGE, ContextInfoSpec],
    },
};

export const ListResponseMessageListType = {
    UNKNOWN: 0,
    SINGLE_SELECT: 1,
};

export const SingleSelectReplySpec = {
    internalSpec: {
        selectedRowId: [1, SPEC_CONSTS.TYPES.STRING],
    },
};

export const ListResponseMessageSpec = {
    internalSpec: {
        title: [1, SPEC_CONSTS.TYPES.STRING],
        listType: [2, SPEC_CONSTS.TYPES.ENUM, ListResponseMessageListType],
        singleSelectReply: [3, SPEC_CONSTS.TYPES.MESSAGE, SingleSelectReplySpec],
        contextInfo: [4, SPEC_CONSTS.TYPES.MESSAGE, ContextInfoSpec],
        description: [5, SPEC_CONSTS.TYPES.STRING],
    },
};

export const InvoiceMessageAttachmentType = {
    IMAGE: 0,
    PDF: 1,
};

export const InvoiceMessageSpec = {
    internalSpec: {
        note: [1, SPEC_CONSTS.TYPES.STRING],
        token: [2, SPEC_CONSTS.TYPES.STRING],
        attachmentType: [3, SPEC_CONSTS.TYPES.ENUM, InvoiceMessageAttachmentType],
        attachmentMimetype: [4, SPEC_CONSTS.TYPES.STRING],
        attachmentMediaKey: [5, SPEC_CONSTS.TYPES.BYTES],
        attachmentMediaKeyTimestamp: [6, SPEC_CONSTS.TYPES.INT64],
        attachmentFileSha256: [7, SPEC_CONSTS.TYPES.BYTES],
        attachmentFileEncSha256: [8, SPEC_CONSTS.TYPES.BYTES],
        attachmentDirectPath: [9, SPEC_CONSTS.TYPES.STRING],
        attachmentJpegThumbnail: [10, SPEC_CONSTS.TYPES.BYTES],
    },
};

export const ButtonTextSpec = {
    internalSpec: {
        displayText: [1, SPEC_CONSTS.TYPES.STRING],
    },
};

export const ButtonType = {
    UNKNOWN: 0,
    RESPONSE: 1,
    NATIVE_FLOW: 2,
};

export const NativeFlowInfoSpec = {
    internalSpec: {},
};

export const ButtonSpec = {
    internalSpec: {
        buttonId: [1, SPEC_CONSTS.TYPES.STRING],
        buttonText: [2, SPEC_CONSTS.TYPES.MESSAGE, ButtonTextSpec],
        type: [3, SPEC_CONSTS.TYPES.ENUM, ButtonType],
        nativeFlowInfo: [4, SPEC_CONSTS.TYPES.MESSAGE, NativeFlowInfoSpec],
    },
};

export const ButtonsMessageHeaderType = {
    UNKNOWN: 0,
    EMPTY: 1,
    TEXT: 2,
    DOCUMENT: 3,
    IMAGE: 4,
    VIDEO: 5,
    LOCATION: 6,
};

export const ButtonsMessageSpec = {
    internalSpec: {
        text: [1, SPEC_CONSTS.TYPES.STRING],
        documentMessage: [2, SPEC_CONSTS.TYPES.MESSAGE, DocumentMessageSpec],
        imageMessage: [3, SPEC_CONSTS.TYPES.MESSAGE, ImageMessageSpec],
        videoMessage: [4, SPEC_CONSTS.TYPES.MESSAGE, VideoMessageSpec],
        locationMessage: [5, SPEC_CONSTS.TYPES.MESSAGE, LocationMessageSpec],
        contentText: [6, SPEC_CONSTS.TYPES.STRING],
        footerText: [7, SPEC_CONSTS.TYPES.STRING],
        contextInfo: [8, SPEC_CONSTS.TYPES.MESSAGE, ContextInfoSpec],
        buttons: [9, SPEC_CONSTS.FLAGS.REPEATED | SPEC_CONSTS.TYPES.MESSAGE, ButtonSpec],
        headerType: [10, SPEC_CONSTS.TYPES.ENUM, ButtonsMessageHeaderType],
        __oneofs__: {
            header: ['text', 'documentMessage', 'imageMessage', 'videoMessage', 'locationMessage'],
        },
    },
};

export const ButtonsResponseMessageType = {
    UNKNOWN: 0,
    DISPLAY_TEXT: 1,
};

export const ButtonsResponseMessageSpec = {
    internalSpec: {
        selectedButtonId: [1, SPEC_CONSTS.TYPES.STRING],
        selectedDisplayText: [2, SPEC_CONSTS.TYPES.STRING],
        contextInfo: [3, SPEC_CONSTS.TYPES.MESSAGE, ContextInfoSpec],
        type: [4, SPEC_CONSTS.TYPES.ENUM, ButtonsResponseMessageType],
        __oneofs__: {
            response: ['selectedDisplayText'],
        },
    },
};

export const PaymentInviteMessageServiceType = {
    UNKNOWN: 0,
    FBPAY: 1,
    NOVI: 2,
    UPI: 3,
};

export const PaymentInviteMessageSpec = {
    internalSpec: {
        serviceType: [1, SPEC_CONSTS.TYPES.ENUM, PaymentInviteMessageServiceType],
        expiryTimestamp: [2, SPEC_CONSTS.TYPES.INT64],
    },
};

export const HeaderSpec = {
    internalSpec: {
        title: [1, SPEC_CONSTS.TYPES.STRING],
        subtitle: [2, SPEC_CONSTS.TYPES.STRING],
        documentMessage: [3, SPEC_CONSTS.TYPES.MESSAGE, DocumentMessageSpec],
        imageMessage: [4, SPEC_CONSTS.TYPES.MESSAGE, ImageMessageSpec],
        __oneofs__: {
            media: ['documentMessage', 'imageMessage'],
        },
    },
};

export const BodySpec = {
    internalSpec: {
        text: [1, SPEC_CONSTS.TYPES.STRING],
    },
};

export const FooterSpec = {
    internalSpec: {
        text: [1, SPEC_CONSTS.TYPES.STRING],
    },
};

export const ShopsMessageSurface = {
    UNKNOWN_SURFACE: 0,
    FB: 1,
    IG: 2,
    WA: 3,
};

export const ShopsMessageType = {
    UNKNOWN_TYPE: 0,
    PRODUCT: 1,
    STOREFRONT: 2,
    COLLECTION: 3,
};

export const ShopsMessageSpec = {
    internalSpec: {
        id: [1, SPEC_CONSTS.TYPES.STRING],
        surface: [2, SPEC_CONSTS.TYPES.ENUM, ShopsMessageSurface],
        type: [3, SPEC_CONSTS.TYPES.ENUM, ShopsMessageType],
        messageVersion: [4, SPEC_CONSTS.TYPES.INT32],
    },
    internalDefaults: {
        messageVersion: 1,
    },
};

export const CollectionMessageSpec = {
    internalSpec: {
        bizJid: [1, SPEC_CONSTS.TYPES.STRING],
        id: [2, SPEC_CONSTS.TYPES.STRING],
        messageVersion: [3, SPEC_CONSTS.TYPES.INT32],
    },
    internalDefaults: {
        messageVersion: 1,
    },
};

export const InteractiveMessageSpec = {
    internalSpec: {
        header: [1, SPEC_CONSTS.TYPES.MESSAGE, HeaderSpec],
        body: [2, SPEC_CONSTS.TYPES.MESSAGE, BodySpec],
        footer: [3, SPEC_CONSTS.TYPES.MESSAGE, FooterSpec],
        shopsMessage: [4, SPEC_CONSTS.TYPES.MESSAGE, ShopsMessageSpec],
        collectionMessage: [5, SPEC_CONSTS.TYPES.MESSAGE, CollectionMessageSpec],
        contextInfo: [15, SPEC_CONSTS.TYPES.MESSAGE, ContextInfoSpec],
        __oneofs__: {
            interactiveMessage: ['shopsMessage', 'collectionMessage'],
        },
    },
};

MessageSpec.internalSpec = {
    conversation: [1, SPEC_CONSTS.TYPES.STRING],
    senderKeyDistributionMessage: [2, SPEC_CONSTS.TYPES.MESSAGE, SenderKeyDistributionMessageSpec],
    imageMessage: [3, SPEC_CONSTS.TYPES.MESSAGE, ImageMessageSpec],
    contactMessage: [4, SPEC_CONSTS.TYPES.MESSAGE, ContactMessageSpec],
    locationMessage: [5, SPEC_CONSTS.TYPES.MESSAGE, LocationMessageSpec],
    extendedTextMessage: [6, SPEC_CONSTS.TYPES.MESSAGE, ExtendedTextMessageSpec],
    documentMessage: [7, SPEC_CONSTS.TYPES.MESSAGE, DocumentMessageSpec],
    audioMessage: [8, SPEC_CONSTS.TYPES.MESSAGE, AudioMessageSpec],
    videoMessage: [9, SPEC_CONSTS.TYPES.MESSAGE, VideoMessageSpec],
    call: [10, SPEC_CONSTS.TYPES.MESSAGE, CallSpec],
    chat: [11, SPEC_CONSTS.TYPES.MESSAGE, ChatSpec],
    protocolMessage: [12, SPEC_CONSTS.TYPES.MESSAGE, ProtocolMessageSpec],
    contactsArrayMessage: [13, SPEC_CONSTS.TYPES.MESSAGE, ContactsArrayMessageSpec],
    highlyStructuredMessage: [14, SPEC_CONSTS.TYPES.MESSAGE, HighlyStructuredMessageSpec],
    fastRatchetKeySenderKeyDistributionMessage: [15, SPEC_CONSTS.TYPES.MESSAGE, SenderKeyDistributionMessageSpec],
    sendPaymentMessage: [16, SPEC_CONSTS.TYPES.MESSAGE, SendPaymentMessageSpec],
    liveLocationMessage: [18, SPEC_CONSTS.TYPES.MESSAGE, LiveLocationMessageSpec],
    requestPaymentMessage: [22, SPEC_CONSTS.TYPES.MESSAGE, RequestPaymentMessageSpec],
    declinePaymentRequestMessage: [23, SPEC_CONSTS.TYPES.MESSAGE, DeclinePaymentRequestMessageSpec],
    cancelPaymentRequestMessage: [24, SPEC_CONSTS.TYPES.MESSAGE, CancelPaymentRequestMessageSpec],
    templateMessage: [25, SPEC_CONSTS.TYPES.MESSAGE, TemplateMessageSpec],
    stickerMessage: [26, SPEC_CONSTS.TYPES.MESSAGE, StickerMessageSpec],
    groupInviteMessage: [28, SPEC_CONSTS.TYPES.MESSAGE, GroupInviteMessageSpec],
    templateButtonReplyMessage: [29, SPEC_CONSTS.TYPES.MESSAGE, TemplateButtonReplyMessageSpec],
    productMessage: [30, SPEC_CONSTS.TYPES.MESSAGE, ProductMessageSpec],
    deviceSentMessage: [31, SPEC_CONSTS.TYPES.MESSAGE, DeviceSentMessageSpec],
    messageContextInfo: [35, SPEC_CONSTS.TYPES.MESSAGE, MessageContextInfoSpec],
    listMessage: [36, SPEC_CONSTS.TYPES.MESSAGE, ListMessageSpec],
    viewOnceMessage: [37, SPEC_CONSTS.TYPES.MESSAGE, FutureProofMessageSpec],
    orderMessage: [38, SPEC_CONSTS.TYPES.MESSAGE, OrderMessageSpec],
    listResponseMessage: [39, SPEC_CONSTS.TYPES.MESSAGE, ListResponseMessageSpec],
    ephemeralMessage: [40, SPEC_CONSTS.TYPES.MESSAGE, FutureProofMessageSpec],
    invoiceMessage: [41, SPEC_CONSTS.TYPES.MESSAGE, InvoiceMessageSpec],
    buttonsMessage: [42, SPEC_CONSTS.TYPES.MESSAGE, ButtonsMessageSpec],
    buttonsResponseMessage: [43, SPEC_CONSTS.TYPES.MESSAGE, ButtonsResponseMessageSpec],
    paymentInviteMessage: [44, SPEC_CONSTS.TYPES.MESSAGE, PaymentInviteMessageSpec],
    interactiveMessage: [45, SPEC_CONSTS.TYPES.MESSAGE, InteractiveMessageSpec],
};
