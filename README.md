Shiterate [![Build Status](https://travis-ci.org/nathanbuchar/shiterate.svg?branch=master)](https://travis-ci.org/nathanbuchar/shiterate)
=========

**One step at a time.**

"Shiteration" is a made-up term used to define the act of iterating over one or more asynchronous tasks synchronously, which is to say that one task must declare that it has finished before the next may run.


#### Why should I use it?

With traditional `for` loops, you cannot explicitly specify at which point you'd like to move on to the next item in the array. For example, if you need to perform some sort of asynchronous logic, all items in the array will execute this logic in parallel; An outcome that may sometimes be undesired.

Promises can get us one step closer. We still end up running tasks in parallel, but we can hook into the `.then()` handler when all tasks have finished.

Enter: **Shiterate**.

**Shiterate** allows you to loop through an array, perform some sort of asynchronous logic, and ensure that the next task in the array will not start until the current task finished. Below is a very basic vanilla JS implementation of this concept—a self-referencing `iterator` function and an early prototype of **Shiterate**.

```js
function iterate(arr, fn, done) {
  iterator(0);

  function iterator(i) {
    fn(arr[i++], function next() {
      return i < arr.length ? iterator(i) : done();
    });
  }
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



### Mapping

**Shiterate** can also be used to act as a `map` function. By simply passing in a argument to the `next()` function, you will update the value of the current item. When the iterator has completed, the updated array will be sent as the first parameter in your `done()` callback. It should be noted that the original array will not be altered.

In this example, we add `1` to each item in the array.

```js
shiterate([0, 1, 2], (i, item, next) => {
  setTimeout(() => {
    return next(item + 1);
  }, 1000);
}, items => {
  console.log(items);
  // => [1, 2, 3]
});
```


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

  4. Lastly, we perform some sort of asynchronous operation for each person then we move onto the next person in the array after setting the value of the previous person to `true`. If the person's name is `"Newman"`, we set the value to `false` and exit the iterator early using `next.abort()`. In this example, we never make it to `"Kramer"`.

      ```js
      let people = ['Jerry', 'Elaine', 'George', 'Newman', 'Kramer'];

      function doSomethingAsynchronous() {
        return new Promise((resolve, reject) => {
          // Async code and resolve...
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
[section_mapping]: #mapping
[section_examples]: #examples
[section_authors]: #authors
[section_license]: #license

[external_link_hapi]: http://hapijs.com

[Nathan Buchar]: mailto:hello@nathanbuchar.com