import 'mocha';
import { expect } from 'chai';
import { CompletablePromise } from '../src/index';

describe('CompletablePromise', () => {

  describe('#resolve', () => {
    it('should return the value to the chained promise', (done) => {
      const number = 5;
      const promise = new CompletablePromise();

      promise.then(value => {
        expect(value).to.equal(number);
        done();
      });

      promise.resolve(number);
    });

    it('should respect asynchronous behaviour', (done) => {
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
    it('should return the value to the chained promise', (done) => {
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
});