## Trampolining {#trampolining}

> A trampoline is a loop that iteratively invokes [thunk]-returning functions ([continuation-passing style][cps]). A single trampoline is sufficient to express all control transfers of a program; a program so expressed is trampolined, or in trampolined style; converting a program to trampolined style is trampolining. Trampolined functions can be used to implement [tail-recursive] function calls in stack-oriented programming languages.--[Wikipedia][trampolining]

[thunk]: https://en.wikipedia.org/wiki/Thunk_(functional_programming)
[cps]: https://en.wikipedia.org/wiki/Continuation-passing_style
[tail-recursive]: https://en.wikipedia.org/wiki/Tail-recursive_function
[trampolining]: https://en.wikipedia.org/wiki/Trampoline_(computing)

This description is exactly how one ought to answer the question "define trampolining" on an examination, because it demonstrates that you've learned the subject thoroughly. But if asked to *explain* trampolining, a more tutorial-focused approach is called for.

Let's begin with a use case.

### recursion, see recursion

Consider implementing `factorial` in recursive style:

~~~~~~~~
function factorial (n) {
  return n
  ? n * factorial(n - 1)
  : 1
}
~~~~~~~~

The immediate limitation of this implementation is that since it calls itself *n* times, to get a result you need a stack on *n* stack frames in a typical stack-based programming language implementation. And JavaScript is such an implementation.

This creates two problems: First, we need space O*n* for all those stack frames. It's as if we actually wrote out `1 x 1 x 2 x 3 x 4 x ...` before doing any calculations. Second, most languages have a limit on the size of the stack much smaller than the limit on the amount of memory you need for data.

For example:

~~~~~~~~
factorial(10)
  //=> 3628800
factorial(32768)
  //=> RangeError: Maximum call stack size exceeded
~~~~~~~~

We can easily rewrite this in iterative style, but there are other functions that aren't so amenable to rewriting and using a simple example allows us to concentrate on the mechanism rather than the "domain."

### tail-call elimination

Lisp programmers in days of yore would rewrite functions like this into "Tail Recursive Form," and that made it possible for their compilers to perform [Tail-Call Optimization][tco]. Meaning, that when a function returns the result of calling itself, the language doesn't actually perform another function call, it turns the whole thing into a loop for you.

[tco]: https://en.wikipedia.org/wiki/Tail-call_optimization

What we need to do is take the expression `n * factorial(n - 1)` and push it down into a function so we can just call it with parameters. When a function is called, a *stack frame* is created that contains all the information needed to resume execution with the result. Stack frames hold a kind of pointer to where to carry on evaluating, the function parameters, and other bookkeeping information.[^bookkeeping]

[^bookkeeping]: Did you know that "bookkeeping" is the only word in the English language containing three consecutive letter pairs? You're welcome.

If we use the symbol `_` to represent a kind of "hole" in an expression where we plan to put the result, every time `factorial` calls itself, it needs to remember `n * _` so that when it gets a result back, it can multiply it by `n` and return that. So the first time it calls itself, it remembers `10 * _`, the second time it calls itself, it remembers `9 * _`, and all these things stack up like this when we call `factorial(10)`:

~~~~~~~~
 1 * _
 2 * _
 3 * _
 4 * _
 5 * _
 6 * _
 7 * _
 8 * _
 9 * _
10 * _
~~~~~~~~

Finally, we call `factorial(0)` and it returns `1`. Then the top is popped off the stack, so we calculate `1 * 1`. It returns `1` again and we calculate `2 * 1`. That returns `2` and we calculate `3 * 2` and so on up the stack until we return `10 * 362880` and return `3628800`, which we print.

How can we get around this? Well, imagine if we don't have a hole in a computation to return. In that case, we wouldn't need to "remember" anything on the stack. To make this happen, we need to either return a value or return the result of calling another function without any further computation.

Such a call is said to be in "tail position" and to be a "tail call." The "elimination" of tail-call elimination means that we don't perform a full call including setting up a new stack frame. We perform the equivalent of a "jump." 

For example:

~~~~~~~~
function factorial (n) {
  var _factorial = function myself (acc, n) {
    return n
    ? myself(acc * n, n - 1)
    : acc
  };
  
  return _factorial(1, n);
}
~~~~~~~~

Now our function either returns a value or it returns the result of calling another function without doing anything with that result. This gives us the correct results, but we can see that current implementations of JavaScript don't perform this magic "tail-call elimination."

~~~~~~~~
factorial(10)
  //=> 3628800
factorial(32768)
  //=> RangeError: Maximum call stack size exceeded
~~~~~~~~

So we'll do it ourselves.

### trampolining

One way to implement tail-call elimination is also handy for many other general things we might want to do with control flow, it's called *trampolining*. What we do is this:

When we call a function, it returns a *thunk* that we call to get a result. Of course, the thunk can return another thunk, so every time we get a result, we check to see if it's a thunk. If not, we have our final result.

A *thunk* is a function taking no arguments that delays evaluating an expression. For example, this is a thunk: `function () { return 'Hello World'; }`.

An extremely simple and useful implementation of trampolining can be found in the [Lemonad] library. It works provided that you want to trampoline a function that doesn't return a function. Here it is: 

[Lemonad]: http://fogus.github.com/lemonad/

~~~~~~~~
L.trampoline = function(fun /*, args */) {
  var result = fun.apply(fun, _.rest(arguments));

  while (_.isFunction(result)) {
    result = result();
  }

  return result;
};
~~~~~~~~

We'll rewrite it in combinatorial style for consistency and composeability:

~~~~~~~~

var trampoline = function (fn) {
  return variadic( function (args) {
    var result = fn.apply(this, args);

    while (result instanceof Function) {
      result = result();
    }

    return result;
  });
};
~~~~~~~~

Now here's our implementation of `factorial` that is wrapped around a trampolined tail recursive function:

~~~~~~~~
function factorial (n) {
  var _factorial = trampoline( function myself (acc, n) {
    return n
    ? function () { return myself(acc * n, n - 1); }
    : acc
  });
  
  return _factorial(1, n);
}

factorial(10);
  //=> 362800
factorial(32768);
  //=> Infinity
~~~~~~~~

Presto, it runs for `n = 32768`. Sadly, JavaScript's built-in support for integers cannot keep up, so we'd better fix the "infinity" problem with a "big integer" library:[^big]

[^big]: The use of a third-party big integer library is not essential to understand trampolining.

~~~~~~~~
npm install big-integer

var variadic = require('allong.es').variadic,
    bigInt = require("big-integer");

var trampoline = function (fn) {
  return variadic( function (args) {
    var result = fn.apply(this, args);

    while (result instanceof Function) {
      result = result();
    }

    return result;
    
  });
};

function factorial (n) {
  var _factorial = trampoline( function myself (acc, n) {
    return n.greater(0)
    ? function () { return myself(acc.times(n), n.minus(1)); }
    : acc
  });
  
  return _factorial(bigInt.one, bigInt(n));
}

factorial(10).toString()
  //=> '3628800'
factorial(32768)
  //=> GO FOR LUNCH
~~~~~~~~

Well, it now takes a very long time to run, but it is going to get us the proper result and we can print that as a string, so we'll leave it calculating in another process and carry on.

The limitation of the implementation shown here is that because it tests for the function returning a function, it will not work for functions that return functions. If you want to trampoline a function that returns a function, you will need a more sophisticated mechanism, but the basic principle will be the same: The function will return a thunk instead of a value, and the trampolining loop will test the returned thunk to see if it represents a value or another computation to be evaluated.

### trampolining co-recursive functions

If trampolining was only for recursive functions, it would have extremely limited value: All such functions can be re-written iteratively and will be much faster (although possibly less elegant). However, trampolining eliminates all calls in tail position, including calls to other functions.

Consider this delightfully simple example of two co-recursive functions:

~~~~~~~~
function even (n) {
  return n == 0
    ? true
    : odd(n - 1);
};

function odd (n) {
  return n == 0
    ? false
    : even(n - 1);
};
~~~~~~~~

Like our `factorial`, it consumes *n* stack space of alternating calls to `even` and `odd`:

~~~~~~~~
even(32768);
  //=> RangeError: Maximum call stack size exceeded
~~~~~~~~

Obviously we can solve this problem with modulo arithmetic, but consider that what this shows is a pair of functions that call other functions in tail position, not just themselves. As with factorial, we separate the public interface that is not trampolined from the trampolined implementation:

~~~~~~~~
var even = trampoline(_even),
    odd  = trampoline(_odd);

function _even (n) {
  return n == 0
    ? true
    : function () { return _odd(n - 1); };
};

function _odd (n) {
  return n == 0
    ? false
    : function () { return _even(n - 1); };
};
~~~~~~~~

And presto:

~~~~~~~~
even(32768);
  //=> true
~~~~~~~~

Trampolining works with co-recursive functions, or indeed any function that can be rewritten in tail-call form.

### summary

*Trampolining* is a technique for implementing tail-call elimination. Meaning, if you take a function (whether recursive, co-recursive, or any other form) and rewrite it in tail-call form, you can eliminate the need to create a stack frame for every 'invocation'.

Trampolining is very handy in a language like JavaScript, in that it allows you to use a recursive style for functions without worrying about limitations on stack sizes.