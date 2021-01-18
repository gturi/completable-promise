/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DeferredPromise } from "./deferred-promise";
import { State } from "./state";

type DeferredOperation<T> = (deferredPromise: DeferredPromise<T>) => void;

/**
 * A Promise that can be explicitly resolved or rejected.
 * 
 * @type T The type of the {@link CompletablePromise}.
 */
export class CompletablePromise<T = any> {

  protected state: State = State.Pending;
  protected deferredPromise!: DeferredPromise<T>;
  private readonly promise: Promise<T>;

  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.deferredPromise = { resolve: resolve, reject: reject };
    });
  }

  /**
   * Calls the specified deferredOperation if the {@link CompletablePromise} state is
   * {@link State.Pending}. Then sets the {@link CompletablePromise} state to the
   * specified one.
   * 
   * @param newState The new state assigned to the {@link CompletablePromise}.
   * @param deferredOperation The method of the {@link DeferredPromise} that should be called.
   */
  private makeDeferredOperation(newState: State, deferredOperation: DeferredOperation<T>) {
    if (this.isPending()) {
      deferredOperation(this.deferredPromise);
      this.state = newState;
    }
  }

  /**
   * Resolves the Promise with a value or the result of another Promise.
   * This method call will succeed only if the Promise state was {@link State.Pending},
   * and it will irreversibly change the Promise state to {@link State.Fulfilled}.
   * 
   * @param value The value or the result of another Promise.
   */
  resolve(value: T | PromiseLike<T>): void {
    this.makeDeferredOperation(State.Fulfilled, deferredPromise => deferredPromise.resolve(value));
  }

  /**
   * Rejects the Promise with a provided reason or error.
   * This method call will succeed only if the Promise state was {@link State.Pending},
   * and it will irreversibly change the Promise state to {@link State.Rejected}.
   * 
   * @param reason The reason or error.
   */
  reject(reason: any): void {
    this.makeDeferredOperation(State.Rejected, deferredPromise => deferredPromise.reject(reason));
  }

  /**
   * Attempts to {@link resolve} the Promise with a value or the result of another Promise.
   * If retrieving {@param getValue} result fails, {@link reject} function will be called instead.
   * 
   * @param getValue A function that returns the value or the result of another Promise.
   */
  tryResolve(getValue: () => T | PromiseLike<T>): void {
    try {
      this.resolve(getValue());
    } catch (error) {
      this.reject(error);
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
   * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected).
   * The resolved value cannot be modified from the callback.
   *
   * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
   * @returns A Promise for the completion of the callback.
   */
  finally(onfinally?: (() => void) | undefined | null): Promise<T> {
    return this.promise.finally(onfinally);
  }

  /**
   * Returns the inner Promise instance.
   * 
   * @returns The inner Promise instance.
   */
  get(): Promise<T> {
    return this.promise;
  }

  /**
   * Returns the current Promise state.
   * 
   * @returns The current Promise state.
   */
  getState(): State {
    return this.state;
  }

  /**
   * Returns true if the Promise state it is {@link State.Pending}.
   * 
   * @returns Whether the Promise state it is {@link State.Pending}.
   */
  isPending(): boolean {
    return this.state === State.Pending;
  }

  /**
   * Returns true if the Promise state it is {@link State.Fulfilled}.
   * 
   * @returns Whether the Promise state it is {@link State.Fulfilled}.
   */
  isFulfilled(): boolean {
    return this.state === State.Fulfilled;
  }

  /**
   * Returns true if the Promise state it is {@link State.Rejected}.
   * 
   * @returns Whether the Promise state it is {@link State.Rejected}.
   */
  isRejected(): boolean {
    return this.state === State.Rejected;
  }

  /**
   * Returns true if the Promise state it is either {@link State.Fulfilled}
   * or {@link State.Rejected}.
   * 
   * @returns Whether the Promise state it is either {@link State.Fulfilled}
   *          or {@link State.Rejected}.
   */
  isSettled(): boolean {
    return !this.isPending();
  }
}
