## As Little As Possible About Functions, But No Less

In JavaScript, functions are values, but they are also much more than simple numbers, strings, or even complex data structures like trees or maps. Functions represent computations to be performed. Like numbers, strings, and arrays, they have a representation. Let's start with the very simplest possible function. In JavaScript, it looks like this:

    function () {}
    
This is a function that is applied to no values and produces no value. How do we represent "no value" in JavaScript? We'll find out in a minute. First, let's verify that our function is a value:

    (function () {})
      //=> [Function]
      
What!? Why didn't it type back `function () {}` for us? This *seems* to break our rule that if an expression is also a value, JavaScript will give the same value back to us. What's going on? The simplest and easiest answer is that although the JavaScript interpreter does indeed return that value, displaying it on the screen is a slightly different matter. `[Function]` is a choice made by the people who wrote Node.js, the JavaScript environment that hosts the JavaScript REPL. If you try the same thing in a browser, you'll see the code you typed.

{pagebreak}

A> I'd prefer something else, but I must accept that what gets typed back to us on the screen is arbitrary, and all that really counts is that it is somewhat useful for a human to read. But we must understand that whether we see `[Function]` or `function () {}`, internally JavaScript has a full and proper function.

### functions and identities

You recall that we have two types of values with respect to identity: Value types and reference types. Value types share the same identity if they have the same contents.Reference types do not.

Which kind are functions? Let's try it. For reasons of appeasing the JavaScript parser, we'll enclose our functions in parentheses:

    (function () {}) === (function () {})
      //=> false
      
Like arrays, every time you evaluate an expression to produce a function, you get a new function that is not identical to any other function, even if you use the same expression to generate it. "Function" is a reference type.

### applying functions

Let's put functions to work. The way we use functions is to *apply* them to zero or more values called *arguments*. Just as `2 + 2` produces a value (in this case `4`), applying a function to zero or more arguments produces a value as well.

Here's how we apply a function to some values in JavaScript: Let's say that *fn_expr* is an expression that when evaluated, produces a function. Let's call the arguments *args*. Here's how to apply a function to some arguments:

  *fn_expr*`(`*args*`)`
    
Right now, we only know about one such expression: `function () {}`, so let's use it. We'll put it in parentheses[^ambiguous] to keep the parser happy, like we did above: `(function () {})`. Since we aren't giving it any arguments, we'll simply write `()` after the expression. So we write:

    (function () {})()
      //=> undefined

What is this `undefined`?

[^ambiguous]: If you're used to other programming languages, you've probably internalized the idea that sometimes parentheses are used to group operations in an expression like math, and sometimes to apply a function to arguments. If not... Welcome to the [ALGOL] family of programming languages!

[ALGOL]: https://en.wikipedia.org/wiki/ALGOL

### `undefined`

In JavaScript, the absence of a value is written `undefined`, and it means there is no value. It will crop up again. `undefined` is its own type of value, and it acts like a value type:

    undefined
      //=> undefined

Like numbers, booleans and strings, JavaScript can print out the value `undefined`.

    undefined === undefined
      //=> true
    (function () {})() === (function () {})()
      //=> true
    (function () {})() === undefined
      //=> true
      
No matter how you evaluate `undefined`, you get an identical value back. `undefined` is a value that means "I don't have a value." But it's still a value :-)
      
A> You might think that `undefined` in JavaScript is equivalent to `NULL` in SQL. No. In SQL, two things that are `NULL` are not equal to nor share the same identity, because two unknowns can't be equal. In JavaScript, every `undefined` is identical to every other `undefined`.

### void

We've seen that JavaScript represents an undefined value by typing `undefined`, and we've generated undefined values in two ways:

1. By evaluating a function that doesn't return a value `(function () {})()`, and;
2. By writing `undefined` ourselves.

There's a third way, with JavaScript's `void` operator. Behold:

    void 0
      //=> undefined
    void 1
      //=> undefined
    void (2 + 2)
      //=> undefined
      
`void` is an operator that takes any value and evaluates to `undefined`, always. So, when we deliberately want an undefined value, should we use the first, second, or third form?[^fourth] The answer is, use `void`. By convention, use `void 0`.

The first form works but it's cumbersome. The second form works most of the time, but it is possible to break it by reassigning `undefined` to a different value, something we'll discuss in [Reassignment and Mutation](#reassignment). The third form is guaranteed to always work, so that's what we will use.[^void]

[^fourth]: Experienced JavaScript programmers are aware that there's a fourth way, using a function argument. This was actually the preferred mechanism until `void` became commonplace.

[^void]: As an exercise for the reader, we suggest you ask your friendly neighbourhood programming language designer or human factors subject-matter expert to explain why a keyword called `void` is used to generate an `undefined` value, instead of calling them both `void` or both `undefined`. We have no idea.

### functions with no arguments and their bodies

Back to our function. We evaluated this:

    (function () {})()
      //=> undefined

Let's recall that we were applying the function `function () {}` to no arguments (because there was nothing inside of `()`). So how do we know to expect `undefined`? That's easy:

When we define a function[^todonamed], we write the word `function`. We then put a (possibly empty) list of arguments, then we give the function a *body* that is enclosed in braces `{...}`. Function bodies are (possibly empty) lists of JavaScript *statements* separated by semicolons.

Something like: { statement^1^; statement^2^; statement^3^; ... ; statement^n^ }

We haven't discussed these *statements*. What's a statement?

[^todonamed]: TODO: Named functions, probably discussed in a whole new section when we discuss `var` hoisting.

There are many kinds of JavaScript statements, but the first kind is one we've already met. An expression is a JavaScript statement. Although they aren't very practical, the following are all valid JavaScript functions, and they all evaluate to undefined when applied:

    (function () { 2 + 2 })
    
    (function () { 1 + 1; 2 + 2 })
    
You can also separate statements with line breaks.[^asi] The convention is to use some form of consistent indenting:

    (function () {
      1 + 1; 
      2 + 2 
    })
    
    (function () { 
      (function () { 
        (function () { 
          (function () {
          }) 
        }) 
      }); 
      (function () {
      }) 
    })
    
That last one's a doozy, but since a function body can contain a statement, and a statement can be an expression, and a function is an expression.... You get the idea.

[^asi]: Readers who follow internet flame-fests may be aware of something called [automatic semi-colon insertion](http://lucumr.pocoo.org/2011/2/6/automatic-semicolon-insertion/). Basically, there's a step where JavaScript looks at your code and follows some rules to guess where you meant to put semicolons in should you leave them out. This feature was originally created as a kind of helpful error-correction. Some programmers argue that since it's part of the language's definition, it's fair game to write code that exploits it, so they deliberately omit any semicolon that JavaScript will insert for them.

So how do we get a function to return a value when applied? With the `return` keyword and any expression:

    (function () { return 0 })()
      //=> 0
      
    (function () { return 1 })()
      //=> 1
      
    (function () { return 'Hello ' + 'World' })()
      // 'Hello World'
      
The `return` keyword creates a return statement that immediately terminates the function application and returns the result of evaluating its expression.

### functions that evaluate to functions

If an expression that evaluates to a function is, well, an expression, and if a return statement can have any expression on its right side... *Can we put an expression that evaluates to a function on the right side of a function expression?*

Yes:

    function () {
      return (function () {}) 
    }
    
That's a function! It's a function that when applied, evaluates to a function that when applied, evaluates to `undefined`.[^mouthful] Let's use a simpler terminology. Instead of saying "that when applied, evaluates to \_\_\_\_\_," we will say "gives \_\_\_\_\_." And instead of saying "gives undefined," we'll say "doesn't give anything."

So we have *a function, that gives a function, that doesn't give anything*. Likewise:

    function () { 
      return (function () { 
        return true 
      }) 
    }
    
That's a function, that gives a function, that gives `true`:

    (function () { 
      return (function () { 
        return true 
      }) 
    })()()
      //=> true
      
Well. We've been very clever, but so far this all seems very abstract. Diffraction of a crystal is beautiful and interesting in its own right, but you can't blame us for wanting to be shown a practical use for it, like being able to determine the composition of a star millions of light years away. So... In the next chapter, "[I'd Like to Have an Argument, Please](#fargs)," we'll see how to make functions practical.

[^mouthful]: What a mouthful! This is why other languages with a strong emphasis on functions come up with syntaxes like ` -> -> undefined`
