 
import { WaClient } from '../client';
import { WapNode } from '../proto/WapNode';
import { PairDeviceHandler } from '../events/PairDevice';
import { Handler } from '../events/Handler';
import { NoiseSocket } from '../socket/NoiseSocket';
import { StorageService } from './StorageService';
import { WaSignal } from '../signal/Signal';
import { PairDeviceSuccessHandler } from '../events/PairDeviceSuccess';
import { StreamErrorHandler } from '../events/StreamError';
import { StreamFailureHandler } from '../events/StreamFailure';
import { DevicesNotificationHandler } from '../events/DevicesNotification';
import { MessageAckHandler } from '../events/MessageAck';
import { MessageHandler } from '../events/Message';
import { RetryReceiptHandler } from '../events/RetryReceipt';
import { SuccessHandler } from '../events/Success';
import { GroupNotificationHandler } from '../events/GroupNotification';
import { AccountSyncDirtyHandler } from '../events/AccountSyncDirty';
import { IbOfflineHandler } from './../events/IbOffline';
import { SyncHandler } from './../events/Sync';
import { ReceiptHandler } from '../events/ReceiptHandler';
import { StatusNotificationHandler } from '../events/StatusNotification';

export class EventHandlerService {
    protected socket: NoiseSocket;
    protected client: WaClient;
    protected storage: StorageService;
    protected waSignal: WaSignal;
    
    private handlers: Handler[] = [];

    constructor(socket: NoiseSocket, client: WaClient, storage: StorageService, signal: WaSignal) {
        this.socket = socket;
        this.client = client;
        this.storage = storage;
        this.waSignal = signal;

        this.initializeHandlers();
     }

     public initializeHandlers() {
        this.handlers.push(new PairDeviceHandler(this));
        this.handlers.push(new PairDeviceSuccessHandler(this));
        this.handlers.push(new StreamErrorHandler(this));
        this.handlers.push(new StreamFailureHandler(this));
        this.handlers.push(new DevicesNotificationHandler(this));
        this.handlers.push(new GroupNotificationHandler(this));
        this.handlers.push(new MessageAckHandler(this));
        this.handlers.push(new RetryReceiptHandler(this));
        this.handlers.push(new MessageHandler(this));
        this.handlers.push(new AccountSyncDirtyHandler(this));
        this.handlers.push(new IbOfflineHandler(this));
        this.handlers.push(new SyncHandler(this));
        this.handlers.push(new SuccessHandler(this));
        this.handlers.push(new ReceiptHandler(this));
        this.handlers.push(new StatusNotificationHandler(this));
     }

     public async handle(stanza: WapNode) {
         const handler = await this.findHandler(stanza);
         if (!handler) {
             this.client.log('invalid handler to', stanza.tag);
             return;
         }

         return handler.handle(stanza);
     }

     public async findHandler(stanza: WapNode) {
        for (const handler of this.handlers) {
            if (await handler.canHandle(stanza)) {
                return handler;
            }
        }
     }

     public getSocket() {
         return this.socket;
     }

     public getClient() {
         return this.client;
     }

     public getSignal() {
         return this.waSignal;
     }

     public getStorage() {
         return this.storage;
     }
 }