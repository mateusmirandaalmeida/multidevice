import { existsSync, readFileSync, writeFileSync } from 'fs';
import { WapJid } from '../proto/WapJid';
import { Key, KeyPair, PreKey, SignedKeyPair } from '../utils/Curve';
import * as fs from 'fs';
import * as path from 'path';

export class StorageService {
    private storagePath: string;
    private storage: {
        [key: string]: any;
    } = {};
    private storageMemory: {
        [key: string]: any;
    } = {};

    constructor(public defaultFolter = './sessions', public initialStorageData: any = null, public writeFileStorage = true) {
        if (!fs.existsSync(defaultFolter) && writeFileStorage) {
            fs.mkdirSync(defaultFolter, { recursive: true });
        }

        if (initialStorageData) {
            this.storage = this.parseData(initialStorageData);;
        }
    }

    public init(fileName: string) {
        if (!this.writeFileStorage) {
            return;
        }
        
        this.storagePath = path.join(this.defaultFolter, fileName);
        this.loadStorage();
    }

    public getData() {
        return this.storage;
    }

    public clearAll() {
        this.storage = {};
        this.writeStorage();
    }

    public get<T = any>(key: string, onlyMemory = false): T {
        if (onlyMemory) {
            return this.storageMemory[key] ?? null;
        }
        return this.storage[key] ?? null;
    }

    public async getOrSave<T = any>(key: string, callback: Function, onlyMemory = false): Promise<T> {
        if (onlyMemory) {
            if (this.storageMemory[key]) {
                return this.storageMemory[key];
            }
            const data = await callback();
            this.storageMemory[key] = data;
            return data;
        }

        if (this.storage[key]) {
            return this.storage[key];
        }

        const data = await callback();

        this.storage[key] = data;

        this.writeStorage();

        return data;
    }

    public async save<T = any>(key: string, data: any, onlyMemory = false): Promise<T> {
        if (onlyMemory) {
            this.storageMemory[key] = data;
            return data;
        }
        this.storage[key] = data;
        this.writeStorage();
        return data;
    }

    private loadStorage() {
        if (!existsSync(this.storagePath)) {
            return;
        }

        const rawData = readFileSync(this.storagePath);
        if (!rawData) {
            return;
        }

        const data = JSON.parse(rawData.toString());

        this.storage = this.parseData(data);
    }

    private parseData = (data: any) => {
        if (!(Array.isArray(data) || typeof data === 'object')) {
            return data;
        }

        if (data?.type && typeof data?.type == 'string' && Array.isArray(data.data)) {
            return this.castElement(data);
        }

        const out: {
            [key: string]: any;
        } = {};

        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                let element = data[key];
                if (Array.isArray(element)) {
                    const temp = [];
                    for (const obj of element) {
                        temp.push(obj?.type ? this.castElement(obj) : obj);
                    }

                    out[key] = temp;
                    continue;
                }

                if (typeof element === 'object') {
                    const keys = Object.keys(element);
                    if (keys.length > 0) {
                        keys.forEach((key) => {
                            element[key] = this.parseData(element[key]);
                        });
                    }
                }

                if (element?.type) {
                    element = this.castElement(element);
                }

                out[key] = element;
            }
        }

        return out;
    };

    private castElement(element: any) {
        switch (element.type) {
            case 'Buffer':
                try {
                    return Buffer.from(element.data);
                } catch (e) {
                    var arr = [];
                    Object.keys(element.data).forEach((index) => {
                        arr.push(element.data[index]);
                    });
                    return Buffer.from(arr);
                }
            case 'key':
                return Key.parse(element);
            case 'keyPair':
                return KeyPair.parse(element);
            case 'signedKeyPair':
                return SignedKeyPair.parse(element);
            case 'preKey':
                return PreKey.parse(element);
            case 'wapJid':
                return WapJid.parse(element);

            default:
                throw new Error(`invalid cast element: ${element.type}`);
        }
    }

    private writeStorage() {
        if (!this.writeFileStorage) {
            return;
        }
        writeFileSync(this.storagePath, JSON.stringify(this.storage));
    }
}

// export const storageService = new StorageService();
