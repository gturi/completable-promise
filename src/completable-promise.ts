/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DeferredPromise } from "./deferred-promise";
import { State } from "./state";

type DeferredOperation<T> = (deferredPromise: DeferredPromise<T>) => void;

export class CompletablePromise<T = any> {

  protected state: State = State.Pending;
  protected deferredPromise!: DeferredPromise<T>;
  private readonly promise: Promise<T>;

  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.deferredPromise = { resolve: resolve, reject: reject };
    });
  }

  private makeDeferredOperation(newState: State, deferredOperation: DeferredOperation<T>) {
    if (this.isPending()) {
      deferredOperation(this.deferredPromise);
      this.state = newState;
    }
  }

  /**
   * Resolves the promise with a value or the result of another promise.
   * This method call will succeed only if the promise was in Pending state,
   * and it will irreversibly change the promise state to Fulfilled.
   * 
   * @param value The value or the result of another promise.
   */
  resolve(value: T | PromiseLike<T>): void {
    this.makeDeferredOperation(State.Fulfilled, deferredPromise => deferredPromise.resolve(value));
  }

  /**
   * Rejects the promise with a provided reason or error.
   * This method call will succeed only if the promise was in Pending state,
   * and it will irreversibly change the promise state to Rejected.
   * 
   * @param reason The reason or error.
   */
  reject(reason: any): void {
    this.makeDeferredOperation(State.Rejected, deferredPromise => deferredPromise.reject(reason));
  }

  /**
   * Attempts to {@link resolve} the promise with a value or the result of another promise.
   * If retrieving {@param getValue} result fails, {@link reject} function will be called instead.
   * 
   * @param getValue A function that returns the value or the result of another promise.
   */
  tryResolve(getValue: () => T | PromiseLike<T>): void {
    try {
      this.deferredPromise.resolve(getValue());
    } catch (error) {
      this.deferredPromise.reject(error);
    }
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

  /**
   * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
   * resolved value cannot be modified from the callback.
   *
   * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
   * @returns A Promise for the completion of the callback.
   */
  finally(onfinally?: (() => void) | undefined | null): Promise<T> {
    return this.promise.finally(onfinally);
  }

  /**
   * Returns the inner Promise.
   * 
   * @returns The inner Promise.
   */
  get(): Promise<T> {
    return this.promise;
  }

  /**
   * Returns the current promise state.
   * 
   * @returns The current promise state.
   */
  getState(): State {
    return this.state;
  }

  /**
   * Returns true if the promise state it is State.Pending.
   * 
   * @returns whether the promise state it is State.Pending.
   */
  isPending(): boolean {
    return this.state === State.Pending;
  }

  /**
   * Returns true if the promise state it is State.Fulfilled.
   * 
   * @returns whether the promise state it is State.Fulfilled.
   */
  isFulfilled(): boolean {
    return this.state === State.Fulfilled;
  }

  /**
   * Returns true if the promise state it is State.Rejected.
   * 
   * @returns whether the promise state it is State.Rejected.
   */
  isRejected(): boolean {
    return this.state === State.Rejected;
  }

  /**
   * Returns true if the promise state it is either State.Fulfilled or State.Rejected.
   * 
   * @returns whether the promise state it is either State.Fulfilled or State.Rejected.
   */
  isSettled(): boolean {
    return !this.isPending();
  }
}
