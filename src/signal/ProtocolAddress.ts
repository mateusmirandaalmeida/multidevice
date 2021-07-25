
export class ProtocolAddress {
    constructor(public name: string, public deviceId: number) {}

    getName() {
        return this.name
    }

    getDeviceId() {
        return this.deviceId
    }

    toString() {
        return this.name + "." + this.deviceId
    }

    toJSON() {
        return this.toString();
    }

    equals(obj: any) {
        return obj instanceof ProtocolAddress && obj.name === this.name && obj.deviceId === this.deviceId
    }
}