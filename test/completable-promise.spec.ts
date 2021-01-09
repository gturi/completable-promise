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
  });
});