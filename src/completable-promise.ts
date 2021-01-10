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

  /**
   * Resolves the promise with a value or the result of another promise.
   * 
   * @param value The value or the result of another promise.
   */
  resolve(value: T | PromiseLike<T>): void {
    this.deferredPromise.resolve(value);
  }

  /**
   * Rejects the promise with a provided reason or error.
   * 
   * @param reason The reason or error.
   */
  reject(reason: any): void {
    this.deferredPromise.reject(reason);
  }

  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   * 
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
  ): Promise<TResult1 | TResult2> {
    return this.promise.then(onfulfilled, onrejected);
  }

  /**
   * Attaches a callback for only the rejection of the Promise.
   * 
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of the callback.
   */
  catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null
  ): Promise<T | TResult> {
    return this.promise.catch(onrejected);
  }

  get(): Promise<T> {
    return this.promise;
  }
}
