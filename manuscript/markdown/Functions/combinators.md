## Combinators and Function Decorators {#combinators}

### higher-order functions

As we've seen, JavaScript functions take values as arguments and return values. JavaScript functions are values, so JavaScript functions can take functions as arguments, return functions, or both. Generally speaking, a function that either takes functions as arguments or returns a function (or both) is referred to as a "higher-order" function.

Here's very simple higher-order function that takes a function as an argument:

    function repeat (num, fn) {
      var i, value;
      
      for (i = 1; i <= num; ++i)
        value = fn(i);
      
      return value;
    }
    
    repeat(3, function () { 
      console.log('Hello') 
    })
      //=>
        'Hello'
        'Hello'
        'Hello'
        undefined
    
Higher-order functions dominate *JavaScript Allongé*. But before we go on, we'll talk about some specific types of higher-order functions.

### combinators

The word "combinator" has a precise technical meaning in mathematics:

> "A combinator is a higher-order function that uses only function application and earlier defined combinators to define a result from its arguments."--[Wikipedia][combinators]

[combinators]: https://en.wikipedia.org/wiki/Combinatory_logic "Combinatory Logic"

If we were learning Combinatorial Logic, we'd start with the most basic combinators like `S`, `K`, and `I`, and work up from there to practical combinators. We'd learn that the fundamental combinators are named after birds following the example of Raymond Smullyan's famous book [To Mock a Mockingbird][mock].

[mock]: http://www.amazon.com/gp/product/B00A1P096Y/ref=as_li_ss_tl?ie=UTF8&camp=1789&creative=390957&creativeASIN=B00A1P096Y&linkCode=as2&tag=raganwald001-20

In this book, we will be using a looser definition of "combinator:" Higher-order pure functions that take only functions as arguments and return a function. We won't be strict about using only previously defined combinators in their construction.

Let's start with a useful combinator: Most programmers call it *Compose*, although the logicians call it the B combinator or "Bluebird." Here is the typical[^bluebird] programming implementation:

    function compose (a, b) {
      return function (c) {
        return a(b(c))
      }
    }

Let's say we have:

    function addOne (number) {
      return number + 1
    }
    
    function double (number) {
      return number * 2
    }

With `compose`, anywhere you would write

    function doubleOfAddOne (number) {
      return double(addOne(number))
    }
    
You could also write:

    var doubleOfAddOne = compose(double, addOne);
    
This is, of course, just one example of many. You'll find lots more perusing the recipes in this book. While some programmers believe "There Should Only Be One Way To Do It," having combinators available as well as explicitly writing things out with lots of symbols and keywords has some advantages when used judiciously.

### a balanced statement about combinators

Code that uses a lot of combinators tends to name the verbs and adverbs (like `double`, `addOne`, and `compose`) while avoiding language keywords and the names of nouns (like `number`). So one perspective is that combinators are useful when you want to emphasize what you're doing and how it fits together, and more explicit code is useful when you want to emphasize what you're working with.

### function decorators {#decorators}

A *function decorator* is a higher-order function that takes one function as an argument, returns another function, and the returned function is a variation of the argument function. Here's a ridiculous example of a decorator:

    function not (fn) {
      return function (argument) {
        return !fn(argument)
      }
    }

So instead of writing `!someFunction(42)`, you can write `not(someFunction)(42)`. Hardly progress. But like `compose`, you could write either

    function something (x) {
      return x != null
    }

And elsewhere, he writes:

    function nothing (x) {
      return !something(x)
    }

Or:

    var nothing = not(something);

`not` is a function decorator because it modifies a function while remaining strongly related to the original function's semantics. You'll see other function decorators in the recipes, like [once](#once), [mapWith](#mapWith), and [maybe](#maybe). Function decorators aren't strict about being pure functions, so there's more latitude for making decorators than combinators.

[^bluebird]: As we'll discuss later, this implementation of the B Combinator is correct in languages like Scheme, but for truly general-purpose use in JavaScript it needs to correctly manage the [function context](#context).
