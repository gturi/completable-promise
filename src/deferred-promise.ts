export interface DeferredPromise<T> {
    resolve: (value: T | PromiseLike<T> ) => void;
    reject: (reason: unknown) => void;
}
