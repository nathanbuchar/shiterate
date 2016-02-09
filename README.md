Synchronasty [![Build Status](https://travis-ci.org/nathanbuchar/synchronasty.svg?branch=master)](https://travis-ci.org/nathanbuchar/synchronasty)
============

**One step at a time.**

"Synchronasty" is a made-up term used to define the act of performing one or more asynchronous tasks synchronously, which is to say that one task must finish before the next may run. Did I mention there are no dependencies?

For example, a synchronasty `for` loop is an iterator wherein we loop through each value in an array, but we wait to move on to the next value until it is explicitly told to do so. In this case, by calling `next()` within the intermediate function body.



***



### Installation

```bash
$ npm install synchronasty
```


### Quick Start

In the following example, `"done!"` will be logged after three seconds have elapsed.

```js
const iterate = require('synchronasty').iterate;

iterate(['foo', 'bar', 'baz'], (i, item, next) => {
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

**`synchronasty.iterate(items, fn[, done]);`**


**Parameters**

* **`items`** (**required**) - The array of items you wish to iterate through.


* **`fn`** (**required**) - The intermediate function that each item in the array will pass through. It sends the following arguments:

  * `i` - A number that represents the index of the current item within the given array of items.

  * `item` - May be of any type and represents the current item.

  * `next` - The function to call when you're ready to move to the next item in the array.

     If you pass an argument into this function, the item's value will be changed to the value of said argument.

     Calling `next.abort()` instead will immediately exit the iterator and call the `done` callback. Similar to `next()`, you can also pass an argument into `next.abort()` to update the value of the current item during the abort.

* **`done`** is the function to call when the iteration has completed. It sends the following arguments:

  * `items` - The updated array, if applicable.



***


### Problem and Solution

**The Problem**

With traditional `for` loops, you cannot specify at which point you'd like to move on to the next item in the array. For example, if you'd like to perform some sort of asynchronous logic, all items in the array will execute this logic in parallel; an effect that is sometimes undesired.

But with **Synchronasty**, you can specify exactly when you'd like to iterate to the next item in the array simply by calling `next()` at whatever point you'd like. Additionally, if you need to exit early, just call `next.abort()`.

Take the following traditional `for` loop for example:

```js
let items = ['foo', 'bar', 'baz'];

console.log('start');

for (let i = 0; i < items.length; i++) {
  let item = items[i];

  setTimeout(() => {
    console.log(item);
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

**The Solve**

You can see above that `"done!"` is logged before any of the item values. This is because the `setTimeout` cannot stop the for loop from continuing; It simply executes all code within the body and moves on. With **Synchronasty**, this can be remedied by the following:

```js
const iterate = require('synchronasty').iterate;

console.log('start');

iterate(['foo', 'bar', 'baz'], (i, item, next) => {
  setTimeout(() => {
    console.log(item);
    return next();
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
> +0s "Done!"
```

You can see that `"foo"` is logged one second after `"start"`, and `"bar`" and `"baz"` are also logged one second apart, after which `"done!"` is logged. Perfect!

**Synchronasty** can also be used to act as a `map` function. By simply passing in a argument to the `next()` function, you will update the value of the current item. When the iterator has completed, the updated array will be sent as the first parameter in your `done()` callback,

In this example, we add `1` to each item in the array.

```js
const iterate = require('synchronasty').iterate;

iterate([0, 1, 2], (i, item, next) => {
  return next(item + 1);
}, items => {
  console.log(items);
});
```
```
> +0s [1, 2, 3]
```


***



### Examples

  1. In this case, we aren't doing anything a `for` loop couldn't accomplish. However, unlike a `for` loop, we move on to the next item in the array at our own will, simply by calling `next()`. If we never call `next()`, we will never move on to the second item in the array.

      ```js
      const iterate = require('synchronasty').iterate;

      iterate(['foo', 'bar', 'baz'], (i, item, next) => {
        console.log('The item is ' + item);
        return next();
      });
      ```

  2. Now, consider the following. Here, we are performing an asynchronous operation within the intermediate function. By calling `next()` within the callback of the `setTimeout`, we can be sure that we will not move on to the next item in the array until one second has elapsed. This functionality is not at all possible within a `for` loop.

      ```js
      const iterate = require('synchronasty').iterate;

      iterate(['foo', 'bar', 'baz'], (i, item, next) => {
        setTimeout(() => {
          return next();
        }, 1000);
      }, items => {
        console.log(items);
        // => ["foo", "bar", "baz"]
      });
      ```

  3. In this example, we iterate to the next item after a certain number of seconds equal to the index of the current item. Then, we append an `"-qux"` to the item value. In this case, this example will take six seconds to execute.

      ```js
      const iterate = require('synchronasty').iterate;

      iterate(['foo', 'bar', 'baz'], (i, item, next) => {
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
      const iterate = require('synchronasty').iterate;

      let people = ['Jerry', 'Elaine', 'George', 'Newman', 'Kramer'];

      function doSomethingAsynchronous() {
        return new Promise((resolve, reject) => {
          // Async code...

          return resolve();
        });
      }

      iterate(people, (i, item, next) => {
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
