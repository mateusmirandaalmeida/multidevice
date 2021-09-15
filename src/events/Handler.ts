import { NoiseSocket } from '../socket/NoiseSocket';
import { WaClient } from '../client';
import { WapNode } from '../proto/WapNode';
import { EventHandlerService } from '../services/EventHandlerService';
import { StorageService } from '../services/StorageService';
import { WaSignal } from '../signal/Signal';

export class Handler {
    protected socket: NoiseSocket;
    protected client: WaClient;
    protected eventHandler: EventHandlerService;
    protected storageService: StorageService;
    protected waSignal: WaSignal;

    constructor(eventHandler: EventHandlerService) {
        this.eventHandler = eventHandler;
        this.socket = eventHandler.getSocket();
        this.client = eventHandler.getClient();
        this.storageService = eventHandler.getStorage();
        this.waSignal = eventHandler.getSignal();
    }

    public async canHandle(stanza: WapNode) {
        return false;
    }

    public async parse(stanza: WapNode) {
        return null;
    }

    public async handle(stanza: WapNode) {
        return false;
    }
}
