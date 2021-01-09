/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DeferredPromise } from "./deferred-promise";

export class CompletablePromise<T = any> {

  protected completablePromise!: DeferredPromise<T>;
  private readonly promise: Promise<T>;

  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.completablePromise = { resolve: resolve, reject: reject };
    });
  }

  resolve(value: T): void {
    this.completablePromise.resolve(value);
  }

  reject(reason: any): void {
    this.completablePromise.reject(reason);
  }

  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null | undefined): Promise<TResult1 | TResult2> {
    return this.promise.then(onfulfilled);
  }

  catch(onrejected?: ((reason: any) => T | PromiseLike<T>) | undefined | null): Promise<T> {
    return this.promise.catch(onrejected);
  }

  get(): Promise<T> {
    return this.promise;
  }
}
