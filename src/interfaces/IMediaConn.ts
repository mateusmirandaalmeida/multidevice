export interface IMediaConn {
    auth: string;
    TTL: number;
    authTTL: number;
    maxBuckets: number;
    hosts: string[];
    fetchDate?: Date;
}