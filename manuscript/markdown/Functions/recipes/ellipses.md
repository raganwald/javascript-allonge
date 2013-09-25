## Ellipses and improved Partial Application {#ellipses}

The CoffeeScript programming language has a useful feature: If a parameter of a method is written with trailing ellipses, it collects a list of parameters into an array. It can be used in various ways, and the CoffeeScript transpiler does some pattern matching to sort things out, but 80% of the use is to collect a variable number of arguments without using the `arguments` pseudo-variable, and 19% of the uses are to collect a trailing list of arguments.

Here's what it looks like collecting a variable number of arguments and trailing arguments:

    callLeft = (fn, args...) ->
      (remainingArgs...) ->
        fn.apply(this, args.concat(remainingArgs))

These are very handy features. Here's our bogus, made-up attempt to write our own mapper function:

    mapper = (fn, elements...) ->
      elements.map(fn)

    mapper ((x) -> x*x), 1, 2, 3
      #=> [1, 4, 9]

    squarer = callLeft mapper, (x) -> x*x

    squarer 1, 2, 3
      #=> [1, 4, 9]

JavaScript doesn't support [ellipses](http://en.wikipedia.org/wiki/Ellipsis), those trailing periods CoffeeScript uses to collect arguments into an array. JavaScript is a *functional* language, so here is the recipe for a function that collects trailing arguments into an array for us:

    var __slice = Array.prototype.slice;

    function variadic (fn) {
      var fnLength = fn.length;

      if (fnLength < 1) {
        return fn;
      }
      else if (fnLength === 1)  {
        return function () {
          return fn.call(
            this, __slice.call(arguments, 0))
        }
      }
      else {
        return function () {
          var numberOfArgs = arguments.length,
              namedArgs = __slice.call(
                arguments, 0, fnLength - 1),
              numberOfMissingNamedArgs = Math.max(
                fnLength - numberOfArgs - 1, 0),
              argPadding = new Array(numberOfMissingNamedArgs),
              variadicArgs = __slice.call(
                arguments, fn.length - 1);

          return fn.apply(
            this, namedArgs
                  .concat(argPadding)
                  .concat([variadicArgs]));
        }
      }
    };

    function unary (first) {
      return first
    }

    unary('why', 'hello', 'there')
      //=> 'why'
  
    variadic(unary)('why', 'hello', 'there')
      //=> [ 'why', 'hello', 'there' ]
  
    function binary (first, rest) {
      return [first, rest]
    }

    binary('why', 'hello', 'there')
      //=> [ 'why', 'hello' ]

    variadic(binary)('why', 'hello', 'there')
      //=> [ 'why', [ 'hello', 'there' ] ]

Here's what we write to create our partial application functions gently:

    var callLeft = variadic( function (fn, args) {
      return variadic( function (remainingArgs) {
        return fn.apply(this, args.concat(remainingArgs))
      })
    })

    // Let's try it!

    var mapper = variadic( function (fn, elements) {
      return elements.map(fn)
    });

    mapper(function (x) { return x * x }, 1, 2, 3)
      //=> [1, 4, 9]

    var squarer = callLeft(mapper, function (x) { return x * x });

    squarer(1, 2, 3)
      //=> [1, 4, 9]

While we're at it, here's our implementation of `callRight` using the same technique:

    var callRight = variadic( function (fn, args) {
      return variadic( function (precedingArgs) {
        return fn.apply(this, precedingArgs.concat(args))
      })
    })

Fine print: Of course, `variadic` introduces an extra function call and may not be the best choice in a highly performance-critical piece of code. Then again, using `arguments` is considerably slower than directly accessing argument bindings, so if the performance is that critical, maybe you shouldn't be using a variable number of arguments in that section.