/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DeferredPromise } from "./deferred-promise";

export class CompletablePromise<T = any> {

  protected deferredPromise!: DeferredPromise<T>;
  private readonly promise: Promise<T>;

  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.deferredPromise = { resolve: resolve, reject: reject };
    });
  }

  resolve(value: T | PromiseLike<T>): void {
    this.deferredPromise.resolve(value);
  }

  reject(reason: any): void {
    this.deferredPromise.reject(reason);
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null | undefined,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
  ): Promise<TResult1 | TResult2> {
    return this.promise.then(onfulfilled, onrejected);
  }

  catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null
  ): Promise<T | TResult> {
    return this.promise.catch(onrejected);
  }

  get(): Promise<T> {
    return this.promise;
  }
}
