## Closures and Scope {#closures}

It's time to see how a function within a function works:

    (function (x) {
      return function (y) {
        return x
      }
    })(1)(2)
      //=> 1

First off, let's use what we learned above. Given `(`*some function*`)(`*some argument*`)`, we know that we apply the function to the argument, create an environment, bind the value of the argument to the name, and evaluate the function's expression. So we do that first with this code:

    (function (x) {
      return function (y) {
        return x
      }
    })(1)
      //=> [Function]
      
The environment belonging to the function with signature `function (x) ...` becomes `{x: 1, ...}`, and the result of applying the function is another function value. It makes sense that the result value is a function, because the expression for `function (x) ...`'s body is:

      function (y) {
        return x
      }

So now we have a value representing that function. Then we're going to take the value of that function and apply it to the argument `2`, something like this:

      (function (y) {
        return x
      })(2)

So we seem to get a new environment `{y: 2, ...}`. How is the expression `x` going to be evaluated in that function's environment? There is no `x` in its environment, it must come from somewhere else.

A> This, by the way, is one of the great defining characteristics of JavaScript and languages in the same family: Whether they allow things like functions to nest inside each other, and if so, how they handle variables from "outside" of a function that are referenced inside a function. For example, here's the equivalent code in Ruby:
A>
A> <<(code/k.rb)
A>
A> Now let's enjoy a relaxed Allongé before we continue!

### If functions without free variables are pure, are closures impure?

The function `function (y) { return x }` is interesting. It contains a *free variable*, `x`.[^nonlocal] A free variable is one that is not bound within the function. Up to now, we've only seen one way to "bind" a variable, namely by passing in an argument with the same name. Since the function `function (y) { return x }` doesn't have an argument named `x`, the variable `x` isn't bound in this function, which makes it "free."

[^nonlocal]: You may also hear the term "non-local variable." [Both are correct.](https://en.wikipedia.org/wiki/Free_variables_and_bound_variables) 

Now that we know that variables used in a function are either bound or free, we can bifurcate functions into those with free variables and those without:

  * Functions containing no free variables are called *pure functions*.
  * Functions containing one or more free variables are called *closures*.
  
Pure functions are easiest to understand. They always mean the same thing wherever you use them. Here are some pure functions we've already seen:

    function () {}
    
    function (x) {
      return x
    }
      
    function (x) {
      return function (y) {
        return x
      }
    }

The first function doesn't have any variables, therefore doesn't have any free variables. The second doesn't have any free variables, because its only variable is bound. The third one is actually two functions, one in side the other. `function (y) ...` has a free variable, but the entire expression refers to `function (x) ...`, and it doesn't have a free variable: The only variable anywhere in its body is `x`, which is certainly bound within `function (x) ...`.

From this, we learn something: A pure function can contain a closure.

X> If pure functions can contain closures, can a closure contain a pure function? Using only what we've learned so far, attempt to compose a closure that contains a pure function. If you can't, give your reasoning for why it's impossible.

Pure functions always mean the same thing because all of their "inputs" are fully defined by their arguments. Not so with a closure. If I present to you this pure function `function (x, y) { return x + y }`, we know exactly what it does with `(2, 2)`. But what about this closure: `function (y) { return x + y }`? We can't say what it will do with argument `(2)` without understanding the magic for evaluating the free variable `x`.

### it's always the environment

To understand how closures are evaluated, we need to revisit environments. As we've said before, all functions are associated with an environment. We also hand-waved something when describing our environment. Remember that we said the environment for `(function (x) { return (function (y) { return x }) })(1)` is `{x: 1, ...}` and that the environment for `(function (y) { return x })(2)` is `{y: 2, ...}`? Let's fill in the blanks!

The environment for `(function (y) { return x })(2)` is *actually* `{y: 2, '..': {x: 1, ...}}`. `'..'` means something like "parent" or "enclosure" or "super-environment." It's `function (x) ...`'s environment, because the function `function (y) { return x }` is within `function (x) ...`'s body. So whenever a function is applied to arguments, its environment always has a reference to its parent environment.

And now you can guess how we evaluate `(function (y) { return x })(2)` in the environment `{y: 2, '..': {x: 1, ...}}`. The variable `x` isn't in `function (y) ...`'s immediate environment, but it is in its parent's environment, so it evaluates to `1` and that's what `(function (y) { return x })(2)` returns even though it ended up ignoring its own argument.

A> `function (x) { return x }` is called the I Combinator or Identity Function. `function (x) { return (function (y) { return x }) }` is called the K Combinator or Kestrel. Some people get so excited by this that they write entire books about them, some are [great][mock], some--how shall I put this--are [interesting][interesting] if you use Ruby.

[mock]: http://www.amzn.com/0192801422?tag=raganwald001-20
[interesting]: https://leanpub.com/combinators "Kestrels, Quirky Birds, and Hopeless Egocentricity"

Functions can have grandparents too:

    function (x) {
      return function (y) {
        return function (z) {
          return x + y + z
        }
      }
    }

This function does much the same thing as:

    function (x, y, z) {
      return x + y + z
    }

Only you call it with `(1)(2)(3)` instead of `(1, 2, 3)`. The other big difference is that you can call it with `(1)` and get a function back that you can later call with `(2)(3)`.

{pagebreak}

A> The first function is the result of [currying] the second function. Calling a curried function with only some of its arguments is sometimes called [partial application]. Some programming languages automatically curry and partially evaluate functions without the need to manually nest them.

[currying]: https://en.wikipedia.org/wiki/Currying
[partial application]: https://en.wikipedia.org/wiki/Partial_application

### shadowy variables from a shadowy planet

An interesting thing happens when a variable has the same name as an ancestor environment's variable. Consider:

    function (x) {
      return function (x, y) {
        return x + y
      }
    }

The function `function (x, y) { return x + y }` is a pure function, because its `x` is defined within its own environment. Although its parent also defines an `x`, it is ignored when evaluating `x + y`. JavaScript always searches for a binding starting with the functions own environment and then each parent in turn until it finds one. The same is true of:

    function (x) {
      return function (x, y) {
        return function (w, z) {
          return function (w) {
            return x + y + z
          }
        }
      }
    }
          
When evaluating `x + y + z`, JavaScript will find `x` and `y` in the great-grandparent scope and `z` in the parent scope. The `x` in the great-great-grandparent scope is ignored, as are both `w`s. When a variable has the same name as an ancestor environment's binding, it is said to *shadow* the ancestor.

This is often a good thing.

### which came first, the chicken or the egg?

This behaviour of pure functions and closures has many, many consequences that can be exploited to write software. We are going to explore them in some detail as well as look at some of the other mechanisms JavaScript provides for working with variables and mutable state.

But before we do so, there's one final question: Where does the ancestry start? If there's no other code in a file, what is `function (x) { return x }`'s parent environment?

JavaScript always has the notion of at least one environment we do not control: A global environment in which many useful things are bound such as libraries full of standard functions. So when you invoke `(function (x) { return x })(1)` in the REPL, its full environment is going to look like this: `{x: 1, '..': `*global environment*`}`.

Sometimes, programmers wish to avoid this. If you don't want your code to operate directly within the global environment, what can you do? Create an environment for them, of course. Many programmers choose to write every JavaScript file like this:

    // top of the file
    (function () {
      
      // ... lots of JavaScript ...
      
    })();
    // bottom of the file

The effect is to insert a new, empty environment in between the global environment and your own functions: `{x: 1, '..': {'..': `*global environment*`}}`. As we'll see when we discuss mutable state, this helps to prevent programmers from accidentally changing the global state that is shared by code in every file when they use the [var keyword](#var) properly.
