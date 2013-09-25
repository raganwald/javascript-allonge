## Callbacks

Let's consider code that is written using the *callback* pattern.[^CPS] Consider this very simple code:

[^CPS]: This is also known as [Continuation-Passing-Style](https://en.wikipedia.org/wiki/Continuation-passing_style).

    function times2 (n) {
      return n * 2;
    }
    
    function plus1 (n) {
      return n + 1;
    }
    
    var four = times2(2);
    var five = plus1(four);
    console.log('->', five);
    //=> prints "-> 5" on the console
    
In this code, each function does exactly one thing: It returns the calculated value. The code that calls each function is in control of what to do with the value. The calling code says "give me the value: I'll take it from there." That makes a certain amount of sense, because it's the calling code that knows what it wants done with the value, so why doesn't the calling function simply do what it wants done?

There is another reasonable way to arrange things. If you were asking someone how much it would cost to buy a new tablet, you might want the tablet purchased as well. So you would tell them to figure out the price and then buy it. In other words, the person making the request also dictates what is to be done with the result.

Using this convention, our code above would look like this:

    function times2 (n, callback) {
      callback(n * 2);
    }
    
    function plus1 (n, callback) {
      callback(n + 1);
    }
    
    times2(2, function (four) {
      plus1(four, function (five) {
        console.log('->', five);
      })
    });
    //=> prints "-> 5" on the console

Now our code is telling `times2`, "Take the result and execute this function with it" rather than "Give me the result." And what it wants done is to pass the result to `plus1`, along with instructions for what `plus1` is supposed to do with its own result.

The "what to do with the result" is a function, and for legacy reason these functions are often called "callbacks." The business of arranging functions and callbacks to do what you want is composing them, just like we've already seen with `compose` and `pipeline`.

### chaining callbacks

Our goal is to write something like `pipelineWithCallbacks(a, b, ..., z)`. This would compose functions `a` through `z` into a single function that takes a value and a callback.

Here is a function that composes two functions taking a value and a callback:

    function compose2 (a, b) {
      return function (value, callback) {
        b(value, function (resultFromB) {
          a(resultFromB, callback);
        });
      };
    }
    
We can use this as the basis for pipelining any number of functions:

    var pipelineFunctionsWithCallbacks = variadic( function (fns) {
      return 
    });

And now we can write:

    var callback = {
      pipeline: function (fnA, fnB) {
        return function (value, callback) {
          fnA(value, function (resultFromA) {
            fnB(resultFromA, callback);
          });
        };
      }
    }

    sequence2(callback.pipeline, times2, plus1)(4, console.log)
      //=> prints "9"
      
We now have a much more complex set of semantics implemented. As you may know, callbacks are used in some environments to handle asynchronicity. So we could use the above code to write things like:

    sequence2(pipeline2withCallback, getUserRecord, updateUserRecord)(userId, displayResult);
    
And the calls to `getUserRecord`/`updateUserRecord` could invoke a remote request asynchronously.

### unifying our algorithms

Now in all fairness, this is a very interesting result but it is onerous to think we'd need one kind of `sequence` function for one kind of semantics and another for a different set of semantics, and *then* parameterize it with a `chain` or `pipeline` function. Too many moving parts!

Let's review: We have two `sequence` functions:

    var sequence = variadic( function (chain, fns) {
      return function sequence (seed) {
        return reduce(fns, chain, seed);
      };
    });
    
And:

    var sequence2 = variadic( function (chain, fns) {
      return variadic( function (args) {
        return reduce(fns.slice(1), chain, fns[0]).apply(this, args);
      });
    });
    
The difference between them is that the first version "reduces" the value provided as a seed, while the second one "reduces" the list of functions into a new function and then applies the arguments provided to that function.

We can unify (or "DRY") these two up. The first thing we'll need to do is make the overall algorithms have the same shape or structure. We'll do that by converting the first version to reduce the functions rather than reduce the seed value.

We are given a chain function such as:

    var andand = {
      chain: function (value, fn) {
        return value ? fn(value) : value;
      }
    };
    
Nw all we want to do is return a function that pipelines two other functions while incorporating the `chain` logic:

    var andand = {
      chain: function (value, fn) {
        return value ? fn(value) : value;
      },
      pipeline: function (fnA, fnB) {
        return function (value) {
          
        }
      }
    };