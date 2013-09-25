## mapWith {#mapWith}

In recent versions of JavaScript, arrays have a `.map` method. Map takes a function as an argument, and applies it to each of the elements of the array, then returns the results in another array. For example:

    [1, 2, 3, 4, 5].map(function (n) { 
      return n*n 
    })
      //=> [1, 4, 9, 16, 25]
      
We say that `.map` *maps* its arguments over the receiver array's elements. Or if you prefer, that it defines a mapping between its receiver and its result. Libraries like [Underscore] provide a map *function*.[^why] It usually works like this:

    _.map([1, 2, 3, 4, 5], function (n) { 
      return n*n 
    })
      //=> [1, 4, 9, 16, 25]
      
[^why]: Why provide a map function? well, JavaScript is an evolving language, and when you're writing code that runs in a web browser, you may want to support browsers using older versions of JavaScript that didn't provide the `.map` function. One way to do that is to "shim" the map method into the Array class, the other way is to use a map function. Most library implementations of map will default to the `.map` method if its available.

This recipe isn't for `map`: It's for `mapWith`, a function that wraps around `map` and turns any other function into a mapping. In concept, `mapWith` is very simple:[^mapWith]

    function mapWith (fn) {
      return function (list) {
        return Array.prototype.map.call(list, function (something) {
          return fn.call(this, something);
        });
      };
    };

Here's the above code written using `mapWith`:

    var squareMap = mapWith(function (n) { 
      return n*n;
    });
    
    squareMap([1, 2, 3, 4, 5])
      //=> [1, 4, 9, 16, 25]
      
If we didn't use `mapWith`, we'd have written something like this:

    var squareMap = function (array) {
      return Array.prototype.map.call(array, function (n) { 
        return n*n;
      });
    };
    
And we'd do that every time we wanted to construct a method that maps an array to some result. `mapWith` is a very convenient abstraction for a very common pattern.

*`mapWith` was suggested by [ludicast](http://github.com/ludicast)*
    
[Underscore]: http://underscorejs.org

[^mapWith]: If we were always mapWithting arrays, we could write `list.map(fn)`. However, there are some objects that have a `.length` property and `[]` accessors that can be mapWithted but do not have a `.map` method. `mapWith` works with those objects. This points to a larger issue around the question of whether containers really ought to implement methods like `.map`. In a language like JavaScript, we are free to define objects that know about their own implementations, such as exactly how `[]` and `.length` works and then to define standalone functions that do the rest.