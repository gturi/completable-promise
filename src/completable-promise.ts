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

  then(onfulfilled?: ((value: T) => T | PromiseLike<T>) | null | undefined): Promise<T> {
    return this.promise.then(onfulfilled);
  }

  catch(onrejected?: ((reason: any) => T | PromiseLike<T>) | undefined | null): Promise<T> {
    return this.promise.catch(onrejected);
  }

  get(): Promise<T> {
    return this.promise;
  }
}
