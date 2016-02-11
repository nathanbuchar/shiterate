Shiterate [![Build Status](https://travis-ci.org/nathanbuchar/shiterate.svg?branch=master)](https://travis-ci.org/nathanbuchar/shiterate)
=========

**One step at a time.**

"Shiteration" is a made-up term used to define the act of iterating over one or more asynchronous tasks synchronously, which is to say that one task must declare that it has finished before the next may run.


#### Why should I use it?

With traditional `for` loops, you cannot explicitly specify at which point you'd like to move on to the next item in the array. For example, if you need to perform some sort of asynchronous logic, all items in the array will execute this logic in parallel; An outcome that may sometimes be undesired.

Chaining promises using `.then` is also not a viable solution, as we may have an unknown number of tasks to perform. `Promise.all` will get us one step closer, but we still end up running tasks in parallel.

Enter: **Shiterate**.

**Shiterate** allows you to loop through an array of any length, perform some sort of asynchronous logic, and ensure that the next task in the array will not start until the current task finished. Below is a very basic vanilla JS implementation of this concept—a self-referencing `iterator` function and an early prototype of **Shiterate**.

```js
function iterate(array, iteratee, done) {
  (function () {
    return function iterator(n) {
      iteratee(array[n], n++, function next() {
        return n < array.length ? iterator(n) : done();
      });
    }
  }())(0);
}
```

The final implementation obviously has quite a few more bells and whistles, but this is essentially what's at the core. Oh, and did I mention there are no dependencies? :clap:


#### Why "Shiterate"?

Obviously a vulgar fusion of *shit* and *iterate*, it appealed to me because:

  1. It's concise; "iterate" is already in the name.

  2. Although this concept does have a few practical applications, in many cases it's unnecessary and impedes the flow of the program. This might be considered "ugly" or "shitty" when done without purpose.

  3. It wasn't taken on npm :tada:



***



### Installation

```bash
$ npm install shiterate
```

**Note:** Requires Node 4.0 or above. Update your nodes!


### Quick Start

In the following example, `"done!"` will be logged after three seconds have elapsed.

```js
const shiterate = require('shiterate');

shiterate(['foo', 'bar', 'baz'], (value, n, next) => {
  setTimeout(next, 1000);
}, () => {
  console.log('done!');
});
```

If you're familiar with the Node JS server framework [Hapi][external_link_hapi], you'll realize this is similar to how the `register()` method works when defining a plugin.

Still curious? Check out the rest of the [examples][section_examples].



***



### Usage

**Definition**

**`shiterate(array, iteratee[, done]);`**


**Arguments**

* **`array`** *(Array)* - The array to query.

* **`iteratee`** *(Function)* - The function invoked per iteration. It passes the following parameters:

  * `value` *(\*)* - The value of the array at the current index `n` during iteration.

  * `n` *(number)* - The index of the item that we are currently iterating through.

  * `next` *(Function)* - The function invoked in order to iterate to the next item in `array`.

    You can change the value of the current item by passing the new value into the `next` function.

    **`next([newValue])`**

    Calling `next.abort()` instead will immediately exit the iteratee and invoke the `done` callback. Similar to `next()`, you can also pass an argument into `next.abort()` to change the value of the current item during the abort.

    **`next.abort([newValue])`**

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



### Examples

  1. This is the simplest example; We aren't doing anything a `for` loop couldn't accomplish. However, unlike a `for` loop, we iterate to the next item in given array at our own will, simply by invoking `next()`. If we never call `next()`, we will never iterate to the second item in the array.

      ```js
      shiterate(['foo', 'bar', 'baz'], (value, n, next) => {
        console.log('The item is ' + value);
        return next();
      });
      ```

  1. Now, consider the following. Here, we are performing an asynchronous operation within the iteratee. This is was **Shiterate** was meant for; By invoking `next()` within the body of `setTimeout`, we can be sure that we will not iterate to the next item in the array until one second has elapsed. Needless to say, this functionality is not at all possible within a `for` loop.

      ```js
      shiterate(['foo', 'bar', 'baz'], (value, n, next) => {
        setTimeout(() => {
          return next();
        }, 1000);
      }, values => {
        console.log(values);
        // => ["foo", "bar", "baz"]
      });
      ```

  3. In this example, we iterate to the next item after a certain number of seconds equal to the index of the current item. Then, we append an `"-qux"` to the item value. In this case, this example will take three seconds to execute.

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

  1. Lastly, we perform some sort of asynchronous operation for each person then we iterate the next person in the given array after changing the value of the previous person to `true`. If the person's name is `"Newman"`, we set the value to `false` and exit the iteratee early using `next.abort()`. In this example, we never make it to `"Kramer"`.

      ```js
      let people = ['Jerry', 'Elaine', 'George', 'Newman', 'Kramer'];

      function doSomethingAsynchronous() {
        return new Promise((resolve, reject) => {
          // Async code and resolve...
        });
      }

      shiterate(people, (value, n, next) => {
        doSomethingAsynchronous().then(() => {
          if (value !== 'Newman') {
            return next(true);
          } else {
            return next.abort(false);
          }
        });
      }, values => {
        console.log(values);
        // => [true, true, true, false, "Kramer"]
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

[external_link_hapi]: http://hapijs.com

[Nathan Buchar]: mailto:hello@nathanbuchar.com
