## Tap {#tap}

One of the most basic combinators is the "K Combinator," nicknamed the "kestrel:"

    function K (x) {
      return function (y) {
        return x
      }
    };

It has some surprising applications. One is when you want to do something with a value for side-effects, but keep the value around. Behold:

    function tap (value) {
      return function (fn) {
        if (typeof(fn) === 'function') {
          fn(value)
        }
        return value
      }
    }

`tap` is a traditional name borrowed from various Unix shell commands. It takes a value and returns a function that always returns the value, but if you pass it a function, it executes the function for side-effects. Let's see it in action as a poor-man's debugger:

    var drink = tap('espresso')(function (it) {
      console.log("Our drink is", it) 
    });
    
    // outputs "Our drink is 'espresso'" to the console

It's easy to turn off:

    var drink = tap('espresso')();
    
    // doesn't output anything to the console

Libraries like [Underscore] use a version of `tap` that is "uncurried:"

    var drink = _.tap('espresso', function () { 
      console.log("Our drink is", this) 
    });
    
Let's enhance our recipe so it works both ways:

    function tap (value, fn) {
      if (fn === void 0) {
        return curried
      }
      else return curried(fn);
      
      function curried (fn) {
        if (typeof(fn) === 'function') {
          fn(value)
        }
        return value
      }
    }

Now you can write:

    var drink = tap('espresso')(function (it) { 
      console.log("Our drink is", it) 
    });
    
Or:

    var drink = tap('espresso', function (it) { 
      console.log("Our drink is", it) 
    });
    
And if you wish it to do noting at all, You can write either:

    var drink = tap('espresso')();

Or:

    var drink = tap('espresso', null);

`tap` can do more than just act as a debugging aid. It's also useful for working with [object and instance methods](#tap-methods).

[Underscore]: http://underscorejs.org
