Shiterate [![Build Status](https://travis-ci.org/nathanbuchar/shiterate.svg?branch=master)](https://travis-ci.org/nathanbuchar/shiterate)
=========

Essentially `forEach()` loops that wait.


**When should I use it?**

When you have an array of items that you need to loop through, but for each item in the array you need to perform something asynchronous and you can't continue to the next item in the array until the preceding item has finished. That's when.

**Just use promises. Do you even ES6, bro?**

Promises will get us close! Except with `Promise.all`, all promises run in parallel, not one at a time—that's not what we want. But hey, if that's what you'd rather do, here's some starter code:

```js
Promise.all(myCoolArray.map((val, i) => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, 1000);
  });
})).then(() => {
  console.log('done');
});
```

**No, chain the promises with `.then()`!**

I suppose you could…

```js
doSomething(arr[0])
  .then(() => doSomething(arr[1]))
  .then(() => doSomething(arr[2]))
  .then(() => doSomething(arr[3]))
  ...
  .then(() => {
    console.log('done');
  });
```

**{{some awesome package}} already does this!**

Why can't you just be happy for me?



***



### Installation

```bash
$ npm install shiterate
```


### Quick Start

In the following example, `"done"` will be logged after three seconds have elapsed.

```js
const shiterate = require('shiterate');

shiterate(['foo', 'bar', 'baz'], (value, n, next) => {
  setTimeout(next, 1000);
}, () => {
  console.log('done');
});
```

Still confused? Check out a few more [examples][section_examples].



***



### Usage

**Definition**

**`shiterate(array, iteratee[, done]);`**


**Arguments**

* **`array`** *(Array)* - The array to query.

* **`iteratee`** *(Function)* - The function invoked per iteration. It passes the following parameters:

  * `value` *(&#42;)* - The value of the array at the current index `n` during iteration.

  * `n` *(number)* - The index of the item that we are currently iterating.

  * `next` *(Function)* - The function to call to continue to the next item in `array`.

    You can change the value of the current item by passing a new value into the `next` callback.

    `next([newValue])`

    Calling `next.abort()` instead will immediately exit the iteratee and invoke the `done` callback. Similar to `next()`, you can also pass an argument into `next.abort()` to change the value of the current item during the abort.

    `next.abort([newValue])`

* **`[done]`** *(Function)* - The function invoked when the iteration has finished. It passes the following parameters:

  * `values` *(Array)* - The updated slice of `array`.



***



### Mapping

**Shiterate** can also be used to act as a `map` function. By simply passing in a argument to the `next()` function, you will change the value of the current item. When the iteratee has completed, the updated array will be sent as the first parameter in your `done()` callback. It should be noted that `array` is not altered.

In this example, we add `1` to each item in the array.

```js
shiterate([0, 1, 2], (value, n, next) => {
  setTimeout(() => {
    return next(value + 1);
  }, 1000);
}, values => {
  console.log(values);
  // => [1, 2, 3]
});
```



***



### Why "Shiterate"?

Obviously a vulgar fusion of *shit* and *iterate*, it appealed to me because:

  1. It wasn't taken on npm :tada:

  2. It's concise; "iterate" is already in the name.

  3. Although this concept does have a few practical applications, in many cases it's unnecessary and impedes the flow of the program. This might be considered "ugly" or "shitty" when done without purpose.

  4. I don't give a shit



***



### Examples

  1. Continue to the next item in the array after the number of seconds elapsed is equal to the index of the current item. We also append `"-qux"` to the item value. This example will take three seconds to finish.

      ```js
      shiterate(['foo', 'bar', 'baz'], (value, n, next) => {
        setTimeout(() => {
          return next(value + '-qux');
        }, 1000 * n);
      }, values => {
        console.log(values);
        // => ["foo-qux", "bar-qux", "baz-qux"]
      });
      ```

  2. Square the value of the current item, but abort the iterator if the new value is greater than 25.

      ```js
      shiterate([4, 3, 5, 7, 6], (value, n, next) => {
        setTimeout(() => {
          if (value * value <= 25) {
            return next();
          } else {
            return next.abort();
          }
        }, 1000);
      });
      ```



***



Authors
-------
* [Nathan Buchar]


License
-------
MIT






[section_installation]: #installation
[section_quickStart]: #quick-start
[section_usage]: #usage
[section_mapping]: #mapping
[section_examples]: #examples
[section_authors]: #authors
[section_license]: #license

[Nathan Buchar]: mailto:hello@nathanbuchar.com
