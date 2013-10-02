## Unary

In [Ellipses](#ellipses), we saw a function decorator that takes a function with a fixed number of arguments and turns it into a *variadic* function, a function taking any number of arguments. "Unary" is a another function decorator, and it also modifies the number of arguments a function takes: Unary takes any function and turns it into a function taking exactly one argument.

The most common use case is to fix a common problem. JavaScript has a `.map` method for arrays, and many libraries offer a `map` function with the same semantics. Here it is in action:

    ['1', '2', '3'].map(parseFloat)
      //=> [1, 2, 3]
      
In that example, it looks exactly like the mapping function you'll find in most languages: You pass it a function, and it calls the function with one argument, the element of the array. However, that's not the whole story. JavaScript's `map` actually calls each function with *three* arguments: The element, the index of the element in the array, and the array itself.

Let's try it:

    [1, 2, 3].map(function (element, index, arr) {
      console.log({element: element, index: index, arr: arr})
    })
      //=> { element: 1, index: 0, arr: [ 1, 2, 3 ] }
      //   { element: 2, index: 1, arr: [ 1, 2, 3 ] }
      //   { element: 3, index: 2, arr: [ 1, 2, 3 ] }
      
If you pass in a function taking only one argument, it simply ignores the additional arguments. But some functions have optional second or even third arguments. For example:

    ['1', '2', '3'].map(parseInt)
      //=> [1, NaN, NaN]

This doesn't work because `parseInt` is defined as `parseInt(string[, radix])`. It takes an optional radix argument. And when you call `parseInt` with `map`, the index is interpreted as a radix. Not good! What we want is to convert `parseInt` into a function taking only one argument.

We could write `['1', '2', '3'].map(function (s) { return parseInt(s); })`, or we could come up with a decorator to do the job for us:

    function unary (fn) {
      if (fn.length == 1) {
        return fn
      }
      else return function (something) {
        return fn.call(this, something)
      }
    }

And now we can write:

    ['1', '2', '3'].map(unary(parseInt))
      //=> [1, 2, 3]
      
Presto!
