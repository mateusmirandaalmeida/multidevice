import { WapNode } from '../proto/WapNode';

export const parsePrivacy = (node: WapNode) => {
    const privacy = node.maybeChild('privacy');
    if (!privacy) {
        return null;
    }

    const result: { [key: string]: string } = {};
    privacy.forEachChildWithTag('category', (cat: WapNode) => {
        result[cat.attrString('name')] = cat.attrString('value');
    });

    return result;
};
