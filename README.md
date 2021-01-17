# CompletablePromise

| branch | build | coverage |
| --- | --- | --- |
| main | [![Build Status](https://travis-ci.com/FlamingTuri/completable-promise.svg?branch=main)](https://travis-ci.com/FlamingTuri/completable-promise) | [![Coverage Status](https://coveralls.io/repos/github/FlamingTuri/completable-promise/badge.svg?branch=main)](https://coveralls.io/github/FlamingTuri/completable-promise?branch=main) |
| develop | [![Build Status](https://travis-ci.com/FlamingTuri/completable-promise.svg?branch=develop)](https://travis-ci.com/FlamingTuri/completable-promise) | [![Coverage Status](https://coveralls.io/repos/github/FlamingTuri/completable-promise/badge.svg?branch=develop)](https://coveralls.io/github/FlamingTuri/completable-promise?branch=develop) |

<br/>

CompletablePromise allows to create a Promise instance that does not start its resolution upon its declaration.

## Installing

Using npm:
```
$ npm install completable-promise
```

Using bower:
```
$ bower install completable-promise
```

Using yarn:
```
$ yarn add completable-promise
```

## Usage

A `CompletablePromise` can be initialized as follows:

```js
import { CompletablePromise } from "completable-promise";

const completablePromise = new CompletablePromise();

completablePromise.then(value => {
    console.log(value);
}).catch(reason => { 
    console.error(reason);
});
```

This kind of promise will remain in `pending` state until one among `resolve` or `reject` methods is explicitly called:

- `resolve` will trigger the `then` transition
    ```js
    completablePromise.resolve('foo');
    ```

- `reject` will trigger the `catch` transition
    ```js
    completablePromise.reject('error');
    ```

After the first `resolve` or `reject` call, future ones will be ignored:

```js
const completablePromise = new CompletablePromise();

completablePromise.then(value => {
    console.log(value);    // foo
}).catch(reason => { 
    console.error(reason); // never printed out
});

completablePromise.resolve('foo');  // success
completablePromise.resolve('bar');  // ignored
completablePromise.reject('error'); // ignored
```

### CompletablePromise states

`CompletablePromise` states reflect the `Promise` states (more info can be found [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise#description)).

Upon initialization, a `CompletablePromise` will be in `pending` state. 

```js
const completablePromise = new CompletablePromise();

console.log(completablePromise.getState());    // pending
console.log(completablePromise.isPending());   // true
console.log(completablePromise.isSettled());   // false
```

Upon calling `resolve`, the state will irreversibly change to `fulfilled`:

```js
completablePromise.resolve('foo');

console.log(completablePromise.getState());    // fulfilled
console.log(completablePromise.isPending());   // false
console.log(completablePromise.isSettled());   // true

console.log(completablePromise.isFulfilled()); // true
console.log(completablePromise.isRejected());  // false

completablePromise.reject('error');

console.log(completablePromise.isFulfilled()); // true
console.log(completablePromise.isRejected());  // false
```

Upon calling `reject`, the state will irreversibly change to `rejected`:

```js
completablePromise.reject('error');

console.log(completablePromise.getState());    // rejected
console.log(completablePromise.isPending());   // false
console.log(completablePromise.isSettled());   // true

console.log(completablePromise.isFulfilled()); // false
console.log(completablePromise.isRejected());  // true

completablePromise.resolve('foo');

console.log(completablePromise.isFulfilled()); // false
console.log(completablePromise.isRejected());  // true
```

### CompletablePromise antipattern

When using a `CompletablePromise`, the following antipattern (where errors should be explicitly handled within a `try...catch`) can arise:

```js
const completablePromise = new CompletablePromise();

completablePromise.then(value => {
    console.log(value);    // never printed out
}).catch(reason => { 
    console.error(reason); // never printed out
});

const brokenJsonString = '{"foo":"bar"';
// try...catch antipattern
try {
    completablePromise.resolve(JSON.parse(brokenJsonString));
} catch (exception) {
    // fallback
}
```

Such thing does not happen with the classic `Promise` approach:

```js
const brokenJsonString = '{"foo":"bar"';
const promise = new Promise((resolve, reject) => {
    resolve(JSON.parse(brokenJsonString));
});

promise.then(value => {
    console.log(value);    // never printed out
}).catch(reason => { 
    console.error(reason); // prints the failure reason
});
```

A solution to this problem is using `tryResolve` method:

```js
const completablePromise = new CompletablePromise();

completablePromise.then(value => {
    console.log(value);    // never printed out
}).catch(reason => { 
    console.error(reason); // prints the failure reason
});

const brokenJsonString = '{"foo":"bar"';
completablePromise.tryResolve(() => {
    // put here all the code that might fail and should be eventually handled in the catch handler
    return JSON.parse(brokenJsonString);
});
```

## Example

A possible use case of this library is to promisify a function that is based on the callback approach, avoiding the callback hell/pyramid of doom problem.

The following example shows how to prompt multiple times the user for some input. Even if the `CompletablePromise` approach is a bit more elaborated, its result is surely clearer thanks to the chaining of the promises.

Common setup:
```js
import { createInterface } from "readline";

const readLine = createInterface({
    input: process.stdin,
    output: process.stdout
});
```

Callback approach:
```js
readLine.question('Step 1) Insert a value: ', value => {
    console.log(value);
    // perform other operations with the first input 
    readLine.question('Step 2) Insert another value: ', value => {
        console.log(value);
        // perform other operations with the second input
        readLine.question('Step 3) Insert once again a value: ', value => {
            readLine.close();
            console.log(value);
            // perform other operations with the third input
        });
    });
});
```

CompletablePromise approach:
```js
import { CompletablePromise } from "completable-promise";

function readUserInput(query) {
    const completablePromise = new CompletablePromise();
    readLine.question(query, value => {
        completablePromise.resolve(value);
    });
    return completablePromise;
}

readUserInput('Step 1) Insert a value: ').then(value => {
    console.log(value);
    // perform other operations with the first input 
    return readUserInput('Step 2) Insert another value: ');
}).then(value => {
    console.log(value);
    // perform other operations with the second input
    return readUserInput('Step 3) Insert once again a value: ');
}).then(value => {
    readLine.close();
    console.log(value);
    // perform other operations with the third input
}).catch(reason => console.error(reason));
```

## Contributing

Contributions, issues and feature requests are welcome!

## License

[MIT](LICENSE)
