## Naming Functions {#named-function-expressions}

Let's get right to it. This code does *not* name a function:

    var repeat = function (str) {
      return str + str
    };
    
It doesn't name the function "repeat" for the same reason that `var answer = 42` doesn't name the number `42`. That snippet of code binds an anonymous function to a name in an environment, but the function itself remains anonymous.

JavaScript *does* have a syntax for naming a function, it looks like this:

    var bindingName = function actualName () {
      //...
    };

In this expression, `bindingName` is the name in the environment, but `actualName` is the function's actual name. This is a *named function expression*. That may seem confusing, but think of the binding names as properties of the environment, not the function itself. And indeed the name *is* a property:

    bindingName.name
      //=> 'actualName'

In this book we are not examining JavaScript's tooling such as debuggers baked into browsers, but we will note that when you are navigating call stacks in all modern tools, the function's binding name is ignored but its actual name is displayed, so naming functions is very useful even if they don't get a formal binding, e.g.

    someBackboneView.on('click', function clickHandler () {
      //...
    });

Now, the function's actual name has no effect on the environment in which it is used. To whit:

    var bindingName = function actualName () {
      //...
    };
    
    bindingName
      //=> [Function: actualName]

    actualName
      //=> ReferenceError: actualName is not defined
      
So "actualName" isn't bound in the environment where we use the named function expression. Is it bound anywhere else? Yes it is:

    var fn = function even (n) {
      if (n === 0) {
        return true
      }
      else return !even(n - 1)
    }
    
    fn(5)
      //=> false
    
    fn(2)
      //=> true
      
`even` is bound within the function itself, but not outside it. This is useful for making recursive functions.
    
### function declarations

We've actually buried the lede.[^lede] Naming functions for the purpose of debugging is not as important as what we're about to discuss. There is another syntax for naming and/or defining a function. It's called a *function declaration*, and it looks like this:

    function someName () {
      // ...
    }
    
This behaves a *little* like:

    var someName = function someName () {
      // ...
    }
    
In that it binds a name in the environment to a named function. However, consider this piece of code:

    (function () {
      return someName;
      
      var someName = function someName () {
        // ...
      }
    })()
      //=> undefined  
      
This is what we expect given what we learned about [var](#var): Although `someName` is declared later in the function, JavaScript behaves as if you'd written:

    (function () {
      var someName;
      
      return someName;
      
      someName = function someName () {
        // ...
      }
    })()

What about a function declaration without `var`?

    (function () {
      return someName;
      
      function someName () {
        // ...
      }
    })()
      //=> [Function: someName]

Aha! It works differently, as if you'd written:

    (function () {
      var someName = function someName () {
        // ...
      }
      return someName;
    })()

That difference is intentional on the part of JavaScript's design to facilitate a certain style of programming where you put the main logic up front, and the "helper functions" at the bottom. It is not necessary to declare functions in this way in JavaScript, but understanding the syntax and its behaviour (especially the way it differs from `var`) is essential for working with production code.

### function declaration caveats[^caveats]

Function declarations are formally only supposed to be made at what we might call the "top level" of a function. Although some JavaScript environments may permit it, this example is technically illegal and definitely a bad idea:

    // function declarations should not happen inside of 
    // a block and/or be conditionally executed
    if (frobbishes.arePizzled()) {
      function complainToFactory () {
        // ...
      }
    }

The big trouble with expressions like this is that they may work just fine in your test environment but work a different way in production. Or it may work one way today and a different way when the JavaScript engine is updated, say with a new optimization.

Another caveat is that a function declaration cannot exist inside of *any* expression, otherwise it's a function expression. So this is a function declaration:

    function trueDat () { return true }

But this is not:

    (function trueDat () { return true })
    
The parentheses make this an expression.

[^lede]: A lead (or lede) paragraph in literature refers to the opening paragraph of an article, essay, news story or book chapter. In journalism, the failure to mention the most important, interesting or attention-grabbing elements of a story in the first paragraph is sometimes called "burying the lede."

[^caveats]: A number of the caveats discussed here were described in Jyrly Zaytsev's excellent article [Named function expressions demystified](http://kangax.github.com/nfe/).