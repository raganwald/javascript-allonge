## Memoize {#memoize}

Consider that age-old interview quiz, writing a recursive fibonacci function (there are other ways to derive a fibonacci number, of course). Here's an implementation that doesn't use a [named function expression](#named-function-expressions). The reason for that omission will be explained later:

      var fibonacci = function (n) {
        if (n < 2) {
          return n
        }
        else {
          return fibonacci(n-2) + fibonacci(n-1)
        }
      }

We'll time it:

    s = (new Date()).getTime()
    new Fibonacci(45).toInt()
    ( (new Date()).getTime() - s ) / 1000
      //=> 28.565
      
Why is it so slow? Well, it has a nasty habit of recalculating the same results over and over and over again. We could rearrange the computation to avoid this, but let's be lazy and trade space for time. What we want to do is use a lookup table. Whenever we want a result, we look it up. If we don't have it, we calculate it and write the result in the table to use in the future. If we do have it, we return the result without recalculating it.

Here's our recipe:

    function memoized (fn, keymaker) {
      var lookupTable = {}, 
          key, 
          value;
        
      keymaker || (keymaker = function (args) {
        return JSON.stringify(args) 
      });
        
      return function () {
        var key = keymaker.call(this, arguments);
      
        return lookupTable[key] || (
          lookupTable[key] = fn.apply(this, arguments)
        )
      }
    }

We can apply `memoized` to a function and we will get back a new function that "memoizes" its results so that it never has to recalculate the same value twice. It only works for functions that are "idempotent," meaning functions that always return the same result given the same argument(s). Like `fibonacci`:

Let's try it:

    var fastFibonacci = memoized( function (n) {
      if (n < 2) {
        return n
      }
      else {
        return fastFibonacci(n-2) + fastFibonacci(n-1)
      }
    });

    fastFibonacci(45)
      //=> 1134903170

We get the result back instantly. It works! You can use memoize with all sorts of "idempotent" pure functions. by default, it works with any function that takes arguments which can be transformed into JSON using JavaScript's standard library function for this purpose. If you have another strategy for turning the arguments into a string key, you can supply it as a second parameter.
      
### memoizing recursive functions

We deliberately picked a recursive function to memoize, because it demonstrates a pitfall when combining decorators with named functional expressions. Consider this implementation that uses a named functional expression:

    var fibonacci = function fibonacci (n) {
      if (n < 2) {
        return n
      }
      else {
        return fibonacci(n-2) + fibonacci(n-1)
      }
    }
    
If we try to memoize it, we don't get the expected speedup:

    var fibonacci = memoized( function fibonacci (n) {
      if (n < 2) {
        return n
      }
      else {
        return fibonacci(n-2) + fibonacci(n-1)
      }
    });

That's because the function bound to the name `fibonacci` in the outer environment has been memoized, but the named functional expression binds the name `fibonacci` inside the unmemoized function, so none of the recursive calls to fibonacci are *ever* memoized. Therefore we must write:

    var fibonacci = memoized( function (n) {
      if (n < 2) {
        return n
      }
      else {
        return fibonacci(n-2) + fibonacci(n-1)
      }
    });

If we need to prevent a rebinding from breaking the function, we'll need to use the [module](#modules) pattern.