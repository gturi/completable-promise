# CompletablePromise

| branch | build | coverage |
| --- | --- | --- |
| main | [![lint-and-test](https://github.com/FlamingTuri/completable-promise/actions/workflows/lint-and-test.yml/badge.svg)](https://github.com/FlamingTuri/completable-promise/actions/workflows/lint-and-test.yml) | [![Coverage Status](https://coveralls.io/repos/github/FlamingTuri/completable-promise/badge.svg?branch=main)](https://coveralls.io/github/FlamingTuri/completable-promise?branch=main) |
| develop | [![lint-and-test](https://github.com/FlamingTuri/completable-promise/actions/workflows/lint-and-test.yml/badge.svg?branch=develop)](https://github.com/FlamingTuri/completable-promise/actions/workflows/lint-and-test.yml) | [![Coverage Status](https://coveralls.io/repos/github/FlamingTuri/completable-promise/badge.svg?branch=develop)](https://coveralls.io/github/FlamingTuri/completable-promise?branch=develop) |

<br/>

CompletablePromise allows to create a Promise instance that does not start its resolution upon its declaration.

## Table of Contents

- [Installing](#Installing)
- [Usage](#Usage)
    - [CompletablePromise states](#CompletablePromise-states)
    - [CompletablePromise antipattern solution](#CompletablePromise-antipattern-solution)
    - [Mixing CompletablePromise and Promise](#Mixing-CompletablePromise-and-Promise)
- [Examples](#Examples)
    - [Callback to promise](#Callback-to-promise)
    - [Asynchronous tail recursion](#Asynchronous-tail-recursion)
- [Contributing](#Contributing)
- [License](#License)

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

[Back to top](#CompletablePromise)

## Usage

A `CompletablePromise` can be initialized as follows:

```js
// old CommonJS syntax
const CompletablePromise = require('completable-promise').CompletablePromise;
// new ES6 syntax
import { CompletablePromise } from "completable-promise";
```

```js
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

[Back to top](#CompletablePromise)

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

[Back to top](#CompletablePromise)

### CompletablePromise antipattern solution

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

[Back to top](#CompletablePromise)

### Mixing CompletablePromise and Promise

Sometimes there are situations where the results of more promises need to be aggregated with [Promise.all](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all), [Promise.allSettled](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled), [Promise.any](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/any) and [Promise.race](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race) constructs.

For this purpose, the `get` method allows to retrieve the inner `Promise` instance of a `CompletablePromise`:

```js
const completablePromise = new CompletablePromise();

const promise = new Promise((resolve, reject) => {
    resolve('bar');
});

Promise.all([completablePromise.get(), promise]).then(values => {
    console.log(values) // ['foo', 'bar']
});

completablePromise.resolve('foo');
```

[Back to top](#CompletablePromise)

## Examples

### Callback to promise

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

[Back to top](#CompletablePromise)

### Asynchronous tail recursion

This library can also be used to achieve asynchronous tail recursion. This is useful in situations where an event will happen but it is not known with precision when. For example, you may need to run a command only after a service is ready and a push based approach is not available/possible:

```js
// server
import express from 'express';

const app = express();

app.get('/status', (req, res) => {
  res.send('ready')
});

// simulates an intialization setup which lasts between 10 to 30 seconds
const initializationDelay = Math.floor(Math.random * 20000) + 10000;
setTimeout(() => {
    const port = 3000;
    console.log(`app listening at http://localhost:${3000}`);
    app.listen(port);
}, initializationDelay);
```

```js
// client
import axios from 'axios';

import { CompletablePromise } from 'completable-promise';

const completablePromise = new CompletablePromise();

const waitDeployment = () => {
    console.trace();
    // api exposed by the server to determine whether it is ready
    axios.get('http://localhost:3000/status').then((response) => {
        completablePromise.resolve(response);
    }).catch(e => {
        console.log('service is not ready, checking once again its state after 2 seconds');
        setTimeout(() => waitDeployment(), 2000);
    });
}

waitDeployment();

completablePromise.then(result => {
    // run code after the service is ready
}).catch(reason => { 
    console.error(reason);
});
```

In the example above, the stack trace remains constant even though `waitDeployment` function is recursive. 

[Back to top](#CompletablePromise)

## Contributing

Contributions, issues and feature requests are welcome!

[Back to top](#CompletablePromise)

## License

This library is distributed under the [MIT license](LICENSE).

[Back to top](#CompletablePromise)
