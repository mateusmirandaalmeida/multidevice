import { existsSync, readFileSync, writeFileSync } from 'fs';
import { WapJid } from '../proto/WapJid';
import { Key, KeyPair, PreKey, SignedKeyPair } from '../utils/Curve';

class StorageService {
    private storagePath: string;
    private storage: {
        [key: string]: any;
    } = {};

    public init(path: string) {
        this.storagePath = path;

        this.loadStorage();
    }

    public clearAll() {
        this.storage = {};
        this.writeStorage();
    }

    public get<T = any>(key: string): T {
        return this.storage[key] ?? null;
    }

    public async getOrSave<T = any>(key: string, callback: Function): Promise<T> {
        if (this.storage[key]) {
            return this.storage[key];
        }

        const data = await callback();

        console.log('before save', data);

        this.storage[key] = data;

        this.writeStorage();

        return data;
    }

    public async save<T = any>(key: string, data: any): Promise<T> {
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
        const out: {
            [key: string]: any;
        } = {};

        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                let element = data[key];

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
        writeFileSync(this.storagePath, JSON.stringify(this.storage));
    }
}

export const storageService = new StorageService();
