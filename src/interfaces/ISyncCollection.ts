export interface ISyncCollection {
    name: string;
    snapshot?: Uint8Array;
    patches?: Uint8Array[];
}
