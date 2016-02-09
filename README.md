TinyIterator
============

Asynchronous `for` loops.

With traditional `for` loops, you cannot specify at which point you'd like to move on to the next item in the array. For example, if you'd like to perform some sort of asynchronous logic, with a normal `for` loop, all items in the array will execute this logic in parallel. But with **TinyIterator**, you can specify exactly when you'd like to iterate to the next item simply by calling `next()`, or if you'd like to exit early, call `next.abort()`.

Take the following `for` loop for example:

```js
let items = ['foo', 'bar', 'baz'];

for (let i = 0; i < items.length; i++) {
  let item = items[i];

  setTimeout(() => {
    console.log(item);
  }, 1000);
}

console.log('Done!');

// -------------------------------------
// +0s => "Done!"
// +1s => "foo"
// +1s => "bar"
// +1s => "baz"
```

You can see above that `"Done!"` is logged before any of the item values. With **TinyIterator**, we can overcome this by performing the following:

```js
const iterate = require('tiny-iterator');

iterate(['foo', 'bar', 'baz'], (i, item, next) => {
  setTimeout(() => {
    console.log(item);
    return next();
  }, 1000);
}, () => {
  console.log('Done!');
});

// -------------------------------------
// +0s => "foo"
// +1s => "bar"
// +2s => "baz"
// +2s => "Done!"
```

**TinyIterator** can also act as an asynchronous `map` function. By simply passing in a argument to the `next()` function, you will update the value of the current item. When the iterator has completed, the updated array will be sent as the first parameter in your `done()` callback,



***



Installation
------------

```bash
npm install tiny-iterator
```


Quick Start
-----------

In the following example, `"Done!"` will be logged after three seconds have elapsed.

```js
const iterate = require('tiny-iterator');

iterate(['foo', 'bar', 'baz'], (i, item, next) => {
  setTimeout(next, 1000);
}, () => {
  console.log('Done!');
});
```

Check out the rest of the [examples](#examples).


Usage
-----

**Definition**

**`iterate(items, fn[, done]);`**


**Parameters**

|    Name |    Type    | Description             | Required |
| ------: | :--------: | :---------------------- | :------: |
| `items` |  `Array`   | Array of items to iterate through. | ✓ |
|    `fn` | `Function` | Intermediate function that each item in the array will pass through. | ✓ |
|  `done` | `Function` | Function to call when the iteration has completed. | |


* **`items`** is the array of items you wish to iterate through.


* **`fn`** is the intermediate function that each item in the array will pass through and it sends the following arguments:

  * `i` - A number that represents the index of the current item within the given array of items.

  * `item` - May be of any type and represents the current item.

  * `next` - The function to call when you're ready to move to the next item in the array. If you pass an argument into this function, the item's value will be changed to the value of said argument. Calling `next.abort()` instead will immediately exit the iterator and call the `done` callback. Similar to `next()`, you can also pass an argument into `next.abort()` to update the value of the current item during the abort.

* **`done`** is the function to call when the iteration has completed and it sends the following arguments:

  * `items` - The updated array, if applicable.



***



Examples
--------

  1. In this case, we aren't doing anything a `for` loop couldn't accomplish. However, unlike a `for` loop, we move on to the next item in the array at our own will, simply by calling `next()`. If we never call `next()`, we will never move on to the second item in the array.

      ```js
      const iterate = require('tiny-iterator');

      iterate(['foo', 'bar', 'baz'], (i, item, next) => {
        console.log('The item is ' + item);
        return next();
      });
      ```

  2. Now, consider the following. Here, we are performing an asynchronous operation within the intermediate function. By calling `next()` within the callback of the `setTimeout`, we can be sure that we will not move on to the next item in the array until one second has elapsed. This functionality is not at all possible within a `for` loop.

      ```js
      const iterate = require('tiny-iterator');

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
      const iterate = require('tiny-iterator');

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

  4. In this example, for each person we perform some sort of asynchronous operation then we move onto the next person in the array after setting the value of the previous person to `true`. If the person's name is `"Numan"`, we set the value to `false` and exit the iterator early. In this example, we never make it to `"Kramer"`.

      ```js
      let people = ['Jerry', 'Elaine', 'George', 'Numan', 'Kramer'];

      function doSomethingAsynchronous() {
        return new Promise((resolve, reject) => {
          // Async code...

          return resolve();
        });
      }

      iterate(people, (i, item, next) => {
        doSomethingAsynchronous().then(() => {
          if (item !== 'Numan') {
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