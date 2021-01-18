import 'mocha';
import { expect } from 'chai';
import { CompletablePromise } from '../src/index';
import { State } from '../src/index';

describe('CompletablePromise', () => {

  const errorMessage = 'something went wrong';

  const throwUnreachableCodeException = (/* istanbul ignore next */ value = '') => {
    throw new Error(`code should not be reached ${value}`);
  }

  const expectTrue = (result: boolean) => expect(result).to.equal(true);

  const expectFalse = (result: boolean) => expect(result).to.equal(false);

  describe('#constructor', () => {
    it('should should correctly initialize the proimise state', () => {
      const promise = new CompletablePromise();

      expect(promise.getState()).to.equal(State.Pending);
      expectTrue(promise.isPending());
      expectFalse(promise.isFulfilled());
      expectFalse(promise.isRejected());
      expectFalse(promise.isSettled());
    });
  });

  describe('#resolve', () => {
    it('should return the value to `then` handler', done => {
      const number = 5;
      const promise = new CompletablePromise();

      promise.then(value => {
        expect(value).to.equal(number);
        done();
      });

      expectTrue(promise.isPending());
      promise.resolve(number);
      expectTrue(promise.isFulfilled());
      expectTrue(promise.isSettled());
    });

    it('should respect asynchronous behaviour', done => {
      const array = ['foo'];
      const promise = new CompletablePromise<string[]>();

      promise.then((value: string[]) => {
        expect(value).to.eql(['foo', 'bar', 'baz']);
        done();
      });

      expectTrue(promise.isPending());
      promise.resolve(array);
      expectTrue(promise.isFulfilled());
      expectTrue(promise.isSettled());

      array.push('bar');
      expect(array).to.eql(['foo', 'bar']);
      array.push('baz');
      expect(array).to.eql(['foo', 'bar', 'baz']);
    });

    it('should ignore future #resolve and #reject calls', done => {
      const number = 5;
      const promise = new CompletablePromise();

      expectTrue(promise.isPending());
      promise.resolve(number);
      promise.resolve(10);
      promise.reject('something went wrong');

      expectTrue(promise.isFulfilled());
      expectFalse(promise.isRejected());
      expectTrue(promise.isSettled());

      promise.then(value => {
        expect(value).to.equal(number);
      }).catch(/* istanbul ignore next */() => {
        throwUnreachableCodeException();
      }).finally(done);
    });
  });

  describe('#reject', () => {
    it('should return the error to `catch` handler', done => {
      const errorMessage = 'something went wrong';
      const promise = new CompletablePromise();

      promise.catch(reason => {
        expect(reason).to.equal(errorMessage);
        done();
      });

      expectTrue(promise.isPending());
      promise.reject(errorMessage);
      expectTrue(promise.isRejected());
      expectTrue(promise.isSettled());
    });

    it('should return the value to `catch` handler of the chained promise', done => {
      const errorMessage = 'something went wrong';
      const promise = new CompletablePromise();

      promise.then(/* istanbul ignore next */() => {
        throwUnreachableCodeException();
      }).catch(reason => {
        expect(reason).to.equal(errorMessage);
        done();
      });

      expectTrue(promise.isPending());
      promise.reject(errorMessage);
      expectTrue(promise.isRejected());
      expectTrue(promise.isSettled());
    });

    it('should ignore future #resolve and #reject calls', done => {
      const errorMessage = 'something went wrong';
      const promise = new CompletablePromise();

      expectTrue(promise.isPending());
      promise.reject('something went wrong');
      promise.resolve(errorMessage);
      promise.reject('another error');

      expectTrue(promise.isRejected());
      expectFalse(promise.isFulfilled());
      expectTrue(promise.isSettled());

      promise.then(/* istanbul ignore next */() => {
        throwUnreachableCodeException();
      }).catch(reason => {
        expect(reason).to.equal(errorMessage);
      }).finally(done);
    });
  });

  describe('#tryResolve', () => {
    it('should return the value to `then` handler when getValue succeeds', done => {
      const jsonString = '{"foo":"bar"}';
      const promise = new CompletablePromise();

      promise.then(value => {
        expect(value).to.eql({ 'foo': 'bar' });
        done();
      }).catch(/* istanbul ignore next */() => {
        throwUnreachableCodeException();
      });

      expectTrue(promise.isPending());
      promise.tryResolve(() => JSON.parse(jsonString));
      expectTrue(promise.isFulfilled());
      expectTrue(promise.isSettled());
    });

    it('should return the failure reason to `catch` handler when getValue fails', done => {
      const brokenJsonString = '{"foo":"bar"';
      const promise = new CompletablePromise();

      promise.then(/* istanbul ignore next */() => {
        throwUnreachableCodeException();
      }).catch(reason => {
        expect(reason.name).to.equal('SyntaxError');
        expect(reason.message).to.equal('Unexpected end of JSON input');
        done();
      });

      expectTrue(promise.isPending());
      promise.tryResolve(() => JSON.parse(brokenJsonString));
      expectTrue(promise.isRejected());
      expectTrue(promise.isSettled());
    });
  });

  describe('#then', () => {
    it('should ignore onrejected callback when using #resolve', done => {
      const promise = new CompletablePromise();

      promise.then(value => {
        expect(value).to.equal('foo');
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return new Promise((resolve, reject) => {
          resolve('bar');
        });
      },/* istanbul ignore next */() => {
        throwUnreachableCodeException('in first onrejected');
      }).then(value => {
        expect(value).to.equal('bar');
        done();
      },/* istanbul ignore next */() => {
        throwUnreachableCodeException('in second onrejected');
      });

      promise.resolve('foo');
    });

    it('should ignore onfulfilled callback when using #reject', done => {
      const promise = new CompletablePromise();

      promise.then(/* istanbul ignore next */() => {
        throwUnreachableCodeException('in first onfulfilled');
      }, reason => {
        expect(reason).to.equal(errorMessage);
        done();
      }).then(/* istanbul ignore next */() => {
        throwUnreachableCodeException('in second onfulfilled');
      },/* istanbul ignore next */() => {
        throwUnreachableCodeException('in second onrejected');
      });

      promise.reject(errorMessage);
    });
  });

  describe('#finally', () => {
    it('should work with when the promise is resolved', done => {
      const promise = new CompletablePromise();

      promise.finally(done);

      promise.resolve('success');
    });

    it('should work with when the promise is rejected', done => {
      const promise = new CompletablePromise();

      promise.finally(done);

      promise.reject(errorMessage);
    });
  });

  describe('#get', () => {
    it('should return the inner promise, allowing using Promise static methods', done => {
      const fooPromise = new CompletablePromise();
      const barPromise = new CompletablePromise();

      fooPromise.resolve('foo');
      barPromise.resolve('bar');

      Promise.all([fooPromise.get(), barPromise.get()]).then(values => {
        expect(values).to.eql(['foo', 'bar']);
        done();
      });
    });
  });

});
