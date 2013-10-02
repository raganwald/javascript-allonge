## How to Shoot Yourself in the Foot With Var

As we've seen, JavaScript's environments and bindings are quite powerful: You can bind and rebind names using function arguments or using variables declared with `var`. The takeaway is that when used properly, Javascript's `var` keyword is a great tool.

When used properly.

Let's look at a few ways to use it *improperly*.

### loose use

JavaScript's `var` keyword is scoped to the function enclosing it. This makes sense, because bindings are made in environments, and the environments are associated with function calls. So if you write:

    function foo (bar) {
      var baz = bar * 2;
      
      if (bar > 1) {
        var blitz = baz - 100;
        
        // ...
      }
    }
    
The name `blitz` is actually scoped to the function `foo`, not to the block of code in the consequent of an `if` statement. There are roughly two schools of thought. One line of reasoning goes like this: Since `bar` is scoped to the function `foo`, you should write the code like this:

    function foo (bar) {
      var baz = bar * 2,
          blitz;
      
      if (bar > 1) {
        blitz = baz - 100;
        
        // ...
      }
    }

We've separated the "declaration" from the "assignment," and we've made it clear that `blitz` is scoped to the entire function. The other school of thought is that programmers are responsible for understanding how the tools work, and even if you write it the first way, other programmers reading the code ought to know how it works.

So here's a question: Are both ways of writing the code equivalent? Let's set up a test case that would tell them apart. We'll try some aliasing:

    var questionable = 'outer';
    
    (function () {
      alert(questionable);
      
      if (true) {
        var questionable = 'inner';
        alert(questionable)
      }
    })()
    
What will this code do if we type it into a browser console? One theory is that it will alert `outer` and then `inner`, because when it evaluates the first alert, `questionable` hasn't been bound in the function's environment yet, so it will be looked up in the enclosing environment. Then an alias is bound, shadowing the outer binding, and it will alert `inner`.

This theory is wrong! It actually alerts `undefined` and then `inner`. Even though we wrote the `var` statement later in the code, JavaScript acts as if we'd declared it at the top of the function. This is true even if we never execute the `var` statement:

    var questionable = 'outer';
    
    (function () {
      return questionable;
      
      var questionable = 'inner'
    })()
    
      //=> undefined
      
So yes, both ways of writing the code work the same way, but only one represents the way it works directly and obviously. For this reason, we put the `var` declarations at the top of every function, always.

### for pete's sake

JavaScript provides a `for` loop for your iterating pleasure and convenience. It looks a lot like the `for` loop in C:

    var sum = 0;
    for (var i = 1; i <= 100; i++) {
      sum = sum + i
    }
    sum
      #=> 5050

Hopefully, you can think of a faster way to calculate this sum.[^gauss] And perhaps you have noticed that `var i = 1` is tucked away instead of being at the top as we prefer. But is this ever a problem?

[^gauss]: There is a well known story about Karl Friedrich Gauss when he was in elementary school. His teacher got mad at the class and told them to add the numbers 1 to 100 and give him the answer by the end of the class. About 30 seconds later Gauss gave him the answer. The other kids were adding the numbers like this: `1 + 2 + 3 + . . . . + 99 + 100 = ?` But Gauss rearranged the numbers to add them like this: `(1 + 100) + (2 + 99) + (3 + 98) + . . . . + (50 + 51) = ?` If you notice every pair of numbers adds up to 101. There are 50 pairs of numbers, so the answer is 50*101 = 5050. Of course Gauss came up with the answer about 20 times faster than the other kids.

Yes. Consider this variation:

    var introductions = [],
        names = ['Karl', 'Friedrich', 'Gauss'];
      
    for (var i = 0; i < 3; i++) {
      introductions[i] = "Hello, my name is " + names[i]
    }
    introductions
      //=> [ 'Hello, my name is Karl',
      //     'Hello, my name is Friedrich',
      //     'Hello, my name is Gauss' ]

So far, so good. Hey, remember that functions in JavaScript are values? Let's get fancy!

    var introductions = [],
        names = ['Karl', 'Friedrich', 'Gauss'];
      
    for (var i = 0; i < 3; i++) {
      introductions[i] = function (soAndSo) {
        return "Hello, " + soAndSo + ", my name is " + names[i]
      }
    }
    introductions
      //=> [ [Function],
      //     [Function],
      //     [Function] ]
    
So far, so good. Let's try one of our functions:

    introductions[1]('Raganwald')
      //=> 'Hello, Raganwald, my name is undefined'
    
What went wrong? Why didn't it give us 'Hello, Raganwald, my name is Friedrich'? The answer is that pesky `var i`. Remember that `i` is bound in the surrounding environment, so it's as if we wrote:

    var introductions = [],
        names = ['Karl', 'Friedrich', 'Gauss'],
        i;
      
    for (i = 0; i < 3; i++) {
      introductions[i] = function (soAndSo) {
        return "Hello, " + soAndSo + ", my name is " + names[i]
      }
    }
    introductions
  
Now, at the time we created each function, `i` had a sensible value, like `0`, `1`, or `2`. But at the time we *call* one of the functions, `i` has the value `3`, which is why the loop terminated. So when the function is called, JavaScript looks `i` up in its enclosing environment (its  closure, obviously), and gets the value `3`. That's not what we want at all. 

Here's how to fix it, once again with `let` as our guide:

    var introductions = [],
        names = ['Karl', 'Friedrich', 'Gauss'];
      
    for (var i = 0; i < 3; i++) {
      (function (i) {
        introductions[i] = function (soAndSo) {
          return "Hello, " + soAndSo + ", my name is " + names[i]
        }
      })(i)
    }
    introductions[1]('Raganwald')
      //=> 'Hello, Raganwald, my name is Friedrich'
    
That works. What did we do? Well, we created a new function and called it immediately, and we deliberately shadowed `i` by passing it as an argument to our function, which had an argument of exactly the same name. If you dislike shadowing, this alternative also works:

    var introductions = [],
        names = ['Karl', 'Friedrich', 'Gauss'];
      
    for (var i = 0; i < 3; i++) {
      (function () {
        var ii = i;
        introductions[ii] = function (soAndSo) {
          return "Hello, " + soAndSo + ", my name is " + names[ii]
        }
      })()
    }
    introductions[1]('Raganwald')
      //=> 'Hello, Raganwald, my name is Friedrich'
    
Now we're creating a new inner variable, `ii` and binding it  to the value of `i`. The shadowing code seems simpler and less error-prone to us, but both work.

### nope, nope, nope, nope, nope

The final caution about `var` concerns what happens if you omit to declare a variable with var, boldly writing something like:

    fizzBuzz = function () {
      // lots of interesting code elided
      // for the sake of hiring managers
    }
    
So where is the name `fizzBuzz` bound? The answer is that if there is no enclosing `var` declaration for `fizzBuzz`, the name is bound in the *global* environment. And by global, we mean global. It is visible to every separate compilation unit. All of your npm modules. Every JavaScript snippet in a web page. Every included file.

This is almost never what you want. And when you do want it, JavaScript provides alternatives such as binding to `window.fizzBuzz` in a browser, or `this.fizzBuzz` in node. In short, eschew undeclared variables. Force yourself to make a habit of using `var` all of the time, and explicitly binding variables to the `window` or `this` objects when you truly want global visibility.
