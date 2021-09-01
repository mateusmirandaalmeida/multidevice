import { WapNode } from '../../proto/WapNode';
import { Handler } from '../Handler';

export class SuccessHandler extends Handler {
    public async handle(node: WapNode) {
        const serverHasPreKeys = await this.waSignal.getServerHasPreKeys();
        if (!serverHasPreKeys) {
            await this.client.uploadPreKeys();
        }

        await this.client.sendPassiveIq(false);

        const me = await this.storageService.get('me');
        this.client.emit('open', me);

        return true;
    }

    public async canHandle(stanza: WapNode) {
        return stanza.tag == 'success';
    }

    public async parse(node: WapNode) {
        return null;
    }
}
