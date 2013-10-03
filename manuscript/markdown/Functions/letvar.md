## Let's Talk Var {#let}

Up to now, all we've really seen are *anonymous functions*, functions that don't have a name. This feels very different from programming in most other languages, where the focus is on naming functions, methods, and procedures. Naming things is a critical part of programming, but all we've seen so far is how to name arguments.

There are other ways to name things in JavaScript, but before we learn some of those, let's see how to use what we already have to name things. Let's revisit a very simple example:

    function (diameter) {
      return diameter * 3.14159265
    }
      
What is this "3.14159265" number? [Pi], obviously. We'd like to name it so that we can write something like:

    function (diameter) {
      return diameter * Pi
    }
    
In order to bind `3.14159265` to the name `Pi`, we'll need a function with a parameter of `Pi` applied to an argument of `3.14159265`. If we put our function expression in parentheses, we can apply it to the argument of `3.14159265`:

    (function (Pi) {
      return ????
    })(3.14159265)
    
What do we put inside our new function that binds `3.14159265` to the name `Pi` when evaluated? Our circumference function, of course:

[Pi]: https://en.wikipedia.org/wiki/Pi

    (function (Pi) {
      return function (diameter) {
        return diameter * Pi
      }
    })(3.14159265)
    
This expression, when evaluated, returns a function that calculates circumferences. It differs from our original in that it names the constant `Pi`. Let's test it:

    (function (Pi) {
      return function (diameter) {
        return diameter * Pi
      }
    })(3.14159265)(2)
      //=> 6.2831853
      
That works! We can bind anything we want in an expression by wrapping it in a function that is immediately invoked with the value we want to bind.

### immediately invoked function expressions

JavaScript programmers regularly use the idea of writing an expression that denotes a function and then immediately applying it to arguments. Explaining the pattern, Ben Alman coined the term [Immediately Invoked Function Expression][iife] for it, often abbreviated "IIFE." As we'll see in a moment, an IIFE need not have parameters:

    (function () {
      // ... do something here...
    })();
    
When an IIFE binds values to names (as we did above with `Pi`), retro-grouch programmers often call it "let."[^let] And confusing the issue, upcoming versions of JavaScript have support for a `let` keyword that has a similar binding behaviour.

### var {#var}

Using an IIFE to bind names works very well, but only a masochist would write programs this way in JavaScript. Besides all the extra characters, it suffers from a fundamental semantic problem: there is a big visual distance between the name `Pi` and the value `3.14159265` we bind to it. They should be closer. Is there another way?

Yes.

Another way to write our "circumference" function would be to pass `Pi` along with the diameter argument, something like this:

    function (diameter, Pi) {
      return diameter * Pi
    }
    
And you could use it like this:

    (function (diameter, Pi) {
      return diameter * Pi
    })(2, 3.14159265)
      //=> 6.2831853
      
This differs from our example above in that there is only one environment, rather than two. We have one binding in the environment representing our regular argument, and another our "constant." That's more efficient, and it's *almost* what we wanted all along: A way to bind `3.14159265` to a readable name.

JavaScript gives us a way to do that, the `var` keyword. We'll learn a lot more about `var` in future chapters, but here's the most important thing you can do with `var`:

    function (diameter) {
      var Pi = 3.14159265;
      
      return diameter * Pi
    }

The `var` keyword introduces one or more bindings in the current function's environment. It works just as we want:

    (function (diameter) {
      var Pi = 3.14159265;
      
      return diameter * Pi
    })(2)
      //=> 6.2831853
      
You can bind any expression. Functions are expressions, so you can bind helper functions:

    function (d) {
      var calc = function (diameter) {
        var Pi = 3.14159265;
      
        return diameter * Pi
      };
      
      return "The diameter is " + calc(d)
    }
  
Notice `calc(d)`? This underscores what we've said: if you have an expression that evaluates to a function, you apply it with `()`. A name that's bound to a function is a valid expression evaluating to a function.[^namedfn]

[^namedfn]: We're into the second chapter and we've finally named a function. Sheesh.

A> Amazing how such an important idea--naming functions--can be explained *en passant* in just a few words. That emphasizes one of the things JavaScript gets really, really right: Functions as "first class entities." Functions are values that can be bound to names like any other value, passed as arguments, returned from other functions, and so forth.

You can bind more than one name-value pair by separating them with commas. For readability, most people put one binding per line:

    function (d) {
      var Pi   = 3.14159265,
          calc = function (diameter) {
            return diameter * Pi
          };
      
      return "The diameter is " + calc(d)
    }
    
These examples use the `var` keyword to bind names in the same environment as our function. We can also create a new scope using an IIFE if we wish to bind some names in part of a function:

    function foobar () {

      // do something without foo or bar
      
      (function () {
        var foo = 'foo',
            bar = 'bar';
          
        // ... do something with foo and bar ...
      
      })();

      // do something else without foo or bar
      
    }

[^let]: To be pedantic, both main branches of Lisp today define a special construct called "let." One, Scheme, [uses `define-syntax` to rewrite `let` into an immediately invoked function expression that binds arguments to values](https://en.wikipedia.org/wiki/Scheme_(programming_language)#Minimalism) as shown above. The other, Common Lisp, leaves it up to implementations to decide how to implement `let`.

[iife]: http://www.benalman.com/news/2010/11/immediately-invoked-function-expression/