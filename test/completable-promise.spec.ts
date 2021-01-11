import 'mocha';
import { expect } from 'chai';
import { CompletablePromise } from '../src/index';

describe('CompletablePromise', () => {

  const errorMessage = 'something went wrong';

  const throwUnreachableCodeException = (value = '') => {
    throw new Error(`code should not be reached ${value}`);
  }

  describe('#resolve', () => {
    it('should return the value to `then` handler', done => {
      const number = 5;
      const promise = new CompletablePromise();

      promise.then(value => {
        expect(value).to.equal(number);
        done();
      });

      promise.resolve(number);
    });

    it('should respect asynchronous behaviour', done => {
      const array = ['foo'];
      const promise = new CompletablePromise<string[]>();

      promise.then((value: string[]) => {
        expect(value).to.eql(['foo', 'bar', 'baz']);
        done();
      });

      promise.resolve(array);

      array.push('bar');
      expect(array).to.eql(['foo', 'bar']);
      array.push('baz');
      expect(array).to.eql(['foo', 'bar', 'baz']);
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

      promise.reject(errorMessage);
    });

    it('should return the value to `catch` handler of the chained promise', done => {
      const errorMessage = 'something went wrong';
      const promise = new CompletablePromise();

      promise.then(() => {
        throw new Error('code should not be reached');
      }).catch(reason => {
        expect(reason).to.equal(errorMessage);
        done();
      });

      promise.reject(errorMessage);
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
      }, () => {
        throwUnreachableCodeException('in first onrejected');
      }).then(value => {
        expect(value).to.equal('bar');
        done();
      }, () => {
        throwUnreachableCodeException('in second onrejected');
      });

      promise.resolve('foo');
    });

    it('should ignore onfulfilled callback when using #reject', done => {
      const promise = new CompletablePromise();

      promise.then(() => {
        throwUnreachableCodeException('in first onfulfilled');
      }, reason => {
        expect(reason).to.equal(errorMessage);
        done();
      }).then(() => {
        throwUnreachableCodeException('in second onfulfilled');
      }, () => {
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
