Shiterate [![Build Status](https://travis-ci.org/nathanbuchar/shiterate.svg?branch=master)](https://travis-ci.org/nathanbuchar/shiterate)
=========

**One step at a time.**

"Shiteration" is a made-up term used to define the act of iterating over one or more asynchronous tasks synchronously, which is to say that one task must finish before the next may run.

For example, a shiterative `for` loop is an iterator wherein we loop through each value in an array, but we wait to move on to the next value until we explicitly tell it to do so. In this case, by calling `next()` within the intermediate function body.

Oh, and did I mention there are no dependencies?



***



### Installation

```bash
$ npm install shiterate
```

**Note:** Requires Node 4.0 or above.


### Quick Start

In the following example, `"done!"` will be logged after three seconds have elapsed.

```js
const shiterate = require('shiterate');

shiterate(['foo', 'bar', 'baz'], (i, item, next) => {
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

**`shiterate(items, fn[, done]);`**


**Parameters**

* **`items`** `Array` (**required**) - The array of items you wish to iterate through.


* **`fn`** `Function` (**required**) - The intermediate function that each item in the array will pass through. It sends the following arguments:

  * `i` - A number that represents the index of the current item within the given array of items.

  * `item` - May be of any type and represents the current item.

  * `next` - The function to call when you're ready to move to the next item in the array.

    You can change the value of the current item by passing a new value into the `next` function.

    **`next([newVal])`**

    Calling `next.abort()` instead will immediately exit the iterator and call the `done` callback. Similar to `next()`, you can also pass an argument into `next.abort()` to update the value of the current item during the abort.

    **`next.abort([newVal])`**
    
    **Note:** Although not absolutely necessary, it's best practice to precede `next()` or `next.abort()` with a `return`. This indicates that this line of code should terminate the function body, and is also a programming fail-safe in the event that there is lingering code beyond the `next()`.

* **`done`** `Function` - The function to call when the iteration has completed. It sends the following arguments:

  * `items` - The updated array, if applicable.



***



### Problem and Solution


#### The Problem

When attempting to tackle this problem, I tried out a few different iterations (*pun!*).

With traditional `for` loops, you cannot specify at which point you'd like to move on to the next item in the array. For example, if you'd like to perform some sort of asynchronous logic, all items in the array will execute this logic in parallel; an effect that is sometimes undesired.

Take the following for example:

```js
console.log('start');

let items = ['foo', 'bar', 'baz'];

for (let i = 0; i < items.length; i++) {
  setTimeout(() => {
    console.log(items[i]);
  }, 1000);
}

console.log('done!');
```
```
> +0s "start"
> +0s "done!"
> +1s "foo"
> +0s "bar"
> +0s "baz"
```

You can see clearly that `"done!"` is logged before any of the item values. This is because the `setTimeout` does not stop the `for` loop from continuing to execute. :cry:

To remedy this, I initially thought about trying a promise-based approach using `Promise.all`:

```js
function iterate(arr, fn, done) {
  return Promise.all(
    arr.map((val, i) => {
      return new Promise((resolve, reject) => {
        fn(i, resolve);
      });
    }
  ));
}
```

`Promise.all` accepts an array of promises, so we map each item to a promise, call the intermediary function, then pass `resolve` as the `next` argument. When all promises have resolved, we can call `.then`. Let's try it:

```js
console.log('start');

let items = ['foo', 'bar', 'baz'];

iterate(items, (i, next) => {
  setTimeout(() => {
    console.log(items[i]);
    next();
  }, 1000);
}).then(() => {
  console.log('done!');
});
```
```
> +0s "start"
> +1s "foo"
> +0s "bar"
> +0s "baz"
> +0s "done!"
```

This still isn't quite right. With this example, each item in the array executes the intermediary function in parallel. In other words, we're not waiting for the preceding item to finish before moving on. However, `"done!"` is being logged when all have finished—so we're half way there.


#### The Solution

Below was the initial implementation of the `iterate` function as a proof-of-concept.

```js
function iterate(arr, fn, done) {
  iterator(0);

  function iterator(i) {
    fn(arr[i++], function next() {
      if (i < arr.length) {
        iterator(i);
      } else {
        done();
      }
    });
  }
}
```

And attempting the same logic as the previous to examples yields the following:

```js
console.log('start');

let items = ['foo', 'bar', 'baz'];

iterator(items, (i, next) => {
  setTimeout(() => {
    console.log(items[i]);
    next();
  }, 1000);
}, () => {
  console.log('done!');
});
```
```
> +0s "start"
> +1s "foo"
> +1s "bar"
> +1s "baz"
> +0s "done!"
```

You can see that `"foo"` is logged one second after `"start"`, and `"bar`" and `"baz"` are also logged one second apart, after which `"done!"` is logged. This means that each item in the array is waiting for the preceding item to finish before executing—perfect! :clap:

This is what **Shiterate** does at a very basic level. It starts the iterator off at index `0`, increments through each item in the array, calls some sort of user-defined intermediary function, then after the `next()` function is called it recursively calls the `iterate` function again  and passes in the index of the next item in the array. Obviously, with **Shiterate** you get quite a few more bells and whistles (`next.abort()`, value mapping, etc), but that's the gist of it.

**Shiterate** can also be used to act as a `map` function. By simply passing in a argument to the `next()` function, you will update the value of the current item. When the iterator has completed, the updated array will be sent as the first parameter in your `done()` callback. It should be noted that the original array will not be altered.

In this example, we add `1` to each item in the array.

```js
shiterate([0, 1, 2], (i, item, next) => {
  return next(item + 1);
}, items => {
  console.log(items);
});
```
```
> +0s [1, 2, 3]
```


#### Why "Shiterate"?

Obviously a vulgar fusion of *shit* and *iterate*, it appealed to me because:

  1. It wasn't taken on npm :tada:

  2. It's concise; "iterate" is already in the name.

  3. Although this concept does have a few practical applications, in many cases it's unnecessary and impedes the flow of the program. This might be considered "ugly" or "shitty" when done without purpose.



***



### Examples

  1. This is the simplest example; We aren't doing anything a `for` loop couldn't accomplish. However, unlike a `for` loop, we move on to the next item in the array at our own will, simply by calling `next()`. If we never call `next()`, we will never move on to the second item in the array.

      ```js
      shiterate(['foo', 'bar', 'baz'], (i, item, next) => {
        console.log('The item is ' + item);
        return next();
      });
      ```

  2. Now, consider the following. Here, we are performing an asynchronous operation within the intermediate function. By calling `next()` within the callback of the `setTimeout`, we can be sure that we will not move on to the next item in the array until one second has elapsed. This functionality is not at all possible within a `for` loop.

      ```js
      shiterate(['foo', 'bar', 'baz'], (i, item, next) => {
        setTimeout(() => {
          return next();
        }, 1000);
      }, items => {
        console.log(items);
        // => ["foo", "bar", "baz"]
      });
      ```

  3. In this example, we iterate to the next item after a certain number of seconds equal to the index of the current item. Then, we append an `"-qux"` to the item value. In this case, this example will take three seconds to execute.

      ```js
      shiterate(['foo', 'bar', 'baz'], (i, item, next) => {
        let delay = 1000 * i;
        let newVal = item + '-qux';

        setTimeout(() => {
          return next(newVal);
        }, delay);
      }, items => {
        console.log(items);
        // => ["foo-qux", "bar-qux", "baz-qux"]
      });
      ```

  4. In this example, for each person we perform some sort of asynchronous operation then we move onto the next person in the array after setting the value of the previous person to `true`. If the person's name is `"Newman"`, we set the value to `false` and exit the iterator early. In this example, we never make it to `"Kramer"`.

      ```js
      let people = ['Jerry', 'Elaine', 'George', 'Newman', 'Kramer'];

      function doSomethingAsynchronous() {
        return new Promise((resolve, reject) => {
          // Async code...

          return resolve();
        });
      }

      shiterate(people, (i, item, next) => {
        doSomethingAsynchronous().then(() => {
          if (item !== 'Newman') {
            return next(true);
          } else {
            return next.abort(false);
          }
        });
      }, items => {
        console.log(items);
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
[section_examples]: #examples
[section_authors]: #authors
[section_license]: #license

[external_link_hapi]: http://hapijs.com

[Nathan Buchar]: mailto:hello@nathanbuchar.com