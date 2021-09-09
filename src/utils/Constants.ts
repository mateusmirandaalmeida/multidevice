import { URL } from 'url';
import { proto as WAProto } from './../proto/WAMessage';
import { Agent } from 'https';
import { MessageType } from './Utils';

export type WAMessage = WAProto.WebMessageInfo;
export type WAMessageContent = WAProto.IMessage;
export type WAContactMessage = WAProto.ContactMessage;
export type WAContactsArrayMessage = WAProto.ContactsArrayMessage;
export type WAGroupInviteMessage = WAProto.GroupInviteMessage;
export type WAListMessage = WAProto.IListMessage;
export type WAButtonsMessage = WAProto.IButtonsMessage;
export type WAMessageKey = WAProto.IMessageKey;
export type WATextMessage = WAProto.ExtendedTextMessage;
export type WAContextInfo = WAProto.IContextInfo;
export type WAGenericMediaMessage = WAProto.IVideoMessage | WAProto.IImageMessage | WAProto.IAudioMessage | WAProto.IDocumentMessage | WAProto.IStickerMessage;

export interface WALocationMessage {
    degreesLatitude: number;
    degreesLongitude: number;
    address?: string;
}

export type WAMediaUpload = Buffer | { url: URL | string };

export enum Mimetype {
    jpeg = 'image/jpeg',
    png = 'image/png',
    mp4 = 'video/mp4',
    gif = 'video/gif',
    pdf = 'application/pdf',
    ogg = 'audio/ogg; codecs=opus',
    mp4Audio = 'audio/mp4',
    /** for stickers */
    webp = 'image/webp',
}

export interface MessageOptions {
    /** the message you want to quote */
    quoted?: WAMessage;
    /** some random context info (can show a forwarded message with this too) */
    contextInfo?: WAContextInfo;
    /** optional, if you want to manually set the timestamp of the message */
    timestamp?: Date;
    /** (for media messages) the caption to send with the media (cannot be sent with stickers though) */
    caption?: string;
    /**
     * For location & media messages -- has to be a base 64 encoded JPEG if you want to send a custom thumb,
     * or set to null if you don't want to send a thumbnail.
     * Do not enter this field if you want to automatically generate a thumb
     * */
    thumbnail?: string;
    /** (for media messages) specify the type of media (optional for all media types except documents) */
    mimetype?: Mimetype | string;
    /** (for media messages) file name for the media */
    filename?: string;
    /** For audio messages, if set to true, will send as a `voice note` */
    ptt?: boolean;
    /** Optional agent for media uploads */
    uploadAgent?: Agent;
    /** If set to true (default), automatically detects if you're sending a link & attaches the preview*/
    detectLinks?: boolean;
    /** Optionally specify the duration of the media (audio/video) in seconds */
    duration?: number;
    /** Fetches new media options for every media file */
    forceNewMediaOptions?: boolean;
    /** Wait for the message to be sent to the server (default true) */
    waitForAck?: boolean;
    /** Should it send as a disappearing messages.
     * By default 'chat' -- which follows the setting of the chat */
    sendEphemeral?: 'chat' | boolean;
    /** Force message id */
    messageId?: string;
}

export type WAMessageType = string | WATextMessage | WALocationMessage | WAContactMessage | WAContactsArrayMessage | WAGroupInviteMessage | WAMediaUpload | WAListMessage | WAButtonsMessage;

export const MediaPathMap = {
    imageMessage: '/mms/image',
    videoMessage: '/mms/video',
    documentMessage: '/mms/document',
    audioMessage: '/mms/audio',
    stickerMessage: '/mms/image',
};

// gives WhatsApp info to process the media
export const MimetypeMap = {
    imageMessage: Mimetype.jpeg,
    videoMessage: Mimetype.mp4,
    documentMessage: Mimetype.pdf,
    audioMessage: Mimetype.ogg,
    stickerMessage: Mimetype.webp,
};

export const MessageTypeProto = {
    [MessageType.image]: WAProto.ImageMessage,
    [MessageType.video]: WAProto.VideoMessage,
    [MessageType.audio]: WAProto.AudioMessage,
    [MessageType.sticker]: WAProto.StickerMessage,
    [MessageType.document]: WAProto.DocumentMessage,
};
