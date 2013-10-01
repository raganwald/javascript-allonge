## Building Blocks {#buildingblocks}

When you look at functions within functions in JavaScript, there's a bit of a "spaghetti code" look to it. The strength of JavaScript is that you can do anything. The weakness is that you will. There are ifs, fors, returns, everything thrown higgledy piggledy together. Although you needn't restrict yourself to a small number of simple patterns, it can be helpful to understand the patterns so that you can structure your code around some basic building blocks.

### composition

One of the most basic of these building blocks is *composition*:

    function cookAndEat (food) {
      return eat(cook(food))
    }
    
It's really that simple: Whenever you are chaining two or more functions together, you're composing them. You can compose them with explicit JavaScript code as we've just done. You can also generalize composition with the B Combinator or "compose" that we saw in [Combinators and Decorators](#combinators):

    function compose (a, b) {
      return function (c) {
        return a(b(c))
      }
    }

    var cookAndEat = compose(eat, cook);
    
If that was all there was to it, composition wouldn't matter much. But like many patterns, using it when it applies is only 20% of the benefit. The other 80% comes from organizing your code such that you can use it: Writing functions that can be composed in various ways.

In the recipes, we'll look at a decorator called  [once](#once): It ensures that a function can only be executed once. Thereafter, it does nothing. Once is useful for ensuring that certain side effects are not repeated. We'll also look at [maybe](#maybe): It ensures that a function does nothing if it is given nothing (like `null` or `undefined`) as an argument.

Of course, you needn't use combinators to implement either of these ideas, you can use if statements. But `once` and `maybe` compose, so you can chain them together as you see fit:

    function actuallyTransfer(from, to, amount) {
      // do something
    }
    
    var invokeTransfer = once(maybe(actuallyTransfer(...)));
    
### partial application

Another basic building block is *partial application*. When a function takes multiple arguments, we "apply" the function to the arguments by evaluating it with all of the arguments, producing a value. But what if we only supply some of the arguments? In that case, we can't get the final value, but we can get a function that represents *part* of our application.

Code is easier than words for this. The [Underscore] library provides a higher-order function called *map*.[^headache] It applies another function to each element of an array, like this:

    _.map([1, 2, 3], function (n) { return n * n })
      //=> [1, 4, 9]
      
This code implements a partial application of the map function by applying the function `function (n) { return n * n }` as its second argument:

    function squareAll (array) {
      return _.map(array, function (n) { return n * n })
    }

The resulting function--`squareAll`--is still the map function, it's just that we've applied one of its two arguments already. `squareAll` is nice, but why write one function every time we want to partially apply a function to a map? We can abstract this one level higher. `mapWith` takes any function as an argument and returns a partially applied map function.

    function mapWith (fn) {
      return function (array) {
        return _.map(array, fn)
      }
    }
    
    var squareAll = mapWith(function (n) { return n * n });
    
    squareAll([1, 2, 3])
      //=> [1, 4, 9]

We'll discuss mapWith again in [the recipes](#mapWith). The important thing to see is that partial application is orthogonal to composition, and that they both work together nicely:

    var safeSquareAll = mapWith(maybe(function (n) { return n * n }));
    
    safeSquareAll([1, null, 2, 3])
      //=> [1, null, 4, 9]

We generalized composition with the `compose` combinator. Partial application also has a combinator, which we'll see in the [partial](#partial) recipe.

[^bind]: Modern JavaScript provides a limited form of partial application through the `Function.prototype.bind` method. This will be discussed in greater length when we look at function contexts.

[^headache]: Modern JavaScript implementations provide a map method for arrays, but Underscore's implementation also works with older browsers if you are working with that headache.

[Underscore]: http://underscorejs.org
