
export class Resolvable {
    public promise: Promise<any>;
    private isResolved = false;
    private resolver: Function;

    constructor() {
        let resolver: any;
        this.promise = new Promise<any>((res) => {
            resolver = res;
        })

        this.resolve = resolver;
    }

    public resolve(e) {
        this.isResolved = false;
        this.resolver(e);
    }

    public reject(e) {
        this.resolve(Promise.reject(e));
    }

    public resolveWasCalled() {
        return this.isResolved;
    }
}