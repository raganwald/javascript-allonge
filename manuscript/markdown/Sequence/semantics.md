## Semantics and Patterns

In the previous section, we mentioned the word **semantics**: *The meaning, or an interpretation of the meaning, of a word, sign, sentence, etc.*

In JavaScript, statements separated by semicolons have well-defined semantics. We'll only be discussing a small subset of such statements, so we will have even more well-defined semantics.

We are going to spend the entire chapter discussing the semantics of code that looks like this:

    var temp1 = doSomething(seed);
    var temp2 = andDoSomethingElseWith(temp1);
    var temp3 = nowDoSomethingWith(temp2);
    var result = doTheLastThingWith(temp3);

This code as written looks exactly like the `pipeline` function we saw in the previous section. A `seed` is put into the first function, and the results are pipelined through the functions until we get a result form the last function.

This is what we might call the "default" semantics for composing or pipelining functions. What other semantics might we want to have when putting some functions together in a row?

### && and short-circuit semantics

In JavaScript, the `&&` infix operator denotes the logical and. So if we write `foo() && bar()`, we're going to get something truthy if and only if ("iff") `foo()` and `bar()` both evaluate to truthy. Similarly, if we write `foo() && bar() && bash()`, we're going to get something truthy iff the results of `foo()`, `bar()`, and `bash()` are all truthy.

But there is more subtlety involved. Like most other contemporary languages, `&&` has *sort-circuit semantics*. Meaning, when we write `foo() && bar()`, JavaScript evaluates `foo()` first:

1. If foo() is truthy, `foo() && bar()` returns the value of `bar()`.
2. If foo() is falsy, `foo() && bar()` returns the value of `foo()`.

In other words, it's something like:

    var foo_value = foo();
    
    if (foo_value) {
      return bar();
    }
    else return foo_value;
    
Note that `bar()` is only evaluated if `foo()` evaluates truthy. If `foo()` evaluates falsy, *the function `bar` is never called*. If you have a long chain, like this:

    foo() && bar() && bash() && fizz() && buzz() && fib() && nachos()
    
If `foo()` evaluates to falsy, none of teh remaining functions will be called. If `foo()` is truthy, `bar()` is then called. If `bar()` is then truthy, `bash()` is then called. If `bash()` is falsy, the remaining functions are not called.

One very handy use for these semantics are when you have a series of "guards" for an action. So let's say we're about to save changes to some kind of record:

    checkUserIsLoggedIn() && userHasPrivileges() && recordIsValid() && saveRecord()
    
If `checkUserIsLoggedIn`, `userHasPrivileges`, or `recordIsValid` return falsy, the record will not be saved.

### ||

The `||` operator also has short-circuit semantics. Given `foo() || bar()`, if `foo()` returns something truthy, `bar` will *not* be called. It's somewhat equivalent to:

    var foo_value = foo();
    
    if (foo_value) {
      return foo_value;
    }
    else return bar();

Once again we can chain several functions together, and the chain is aborted if any of the functions return truthy. This has several uses, one of which will be well-known to C programmers.

Some functions return an *error value* if something goes wrong, and `0` if the function executes properly. In JavaScript, the number `0` is falsy, so if you have a series of functions that return old-school error values, you can chain them together with `||`.

Ignoring for a moment the possibility of asynchronous behaviour, it might look like this:

    openFile() || readFile() || closeFile() || writeCopy() || closeCopy()
    
Assuming these functions pass error codes back, if any of them returns a non-zero error code, the remaining functions will not be evaluated.

### what do && and || tell us?

`&&` and `||` are just two examples of a very general pattern:

1. You have a sequence of functions to be evaluated;
2. You have some special logic about the way they are to be chained or wired together;
3. That special logic is applied uniformly across the sequence of functions.

This pattern is very simple if we stop and think about it. There's nothing advanced or mysterious. As we saw above, it's easy to write it out by hand in JavaScript. Nevertheless, when we see the same pattern reoccur regularly, it's always sensible to stop and ask if it is possible to formalize the pattern.

Formalizing a pattern names it, and ensures that we do similar things in a similar way every time. It also gives us a framework for exploring new possibilities. The act of sorting out how to describe it, and how to encapsulate it in code forces us to think it through more thoroughly.

So how can we formalize this pattern?

### the pattern

Let's start with something we know, `pipeline`. The implementation we gave was: `pipeline = flip(compose)`. True, but not very helpful. Let's write it out the long way:

    var pipeline = variadic( function (fns) {
      return function pipeline (seed) {
        return reduce(fns, function chain (lastResult, fn) { return fn(lastResult); }, seed);
      };
    });

The interesting thing here is the function within the `reduce` method: `function chain (value, fn) { return fn(value); }`. Notice we're naming it "chain" because that's what it does, it chains the functions together by taking the result of one and putting it into the next.

Chain is the function responsible for invoking each of the functions being pipelined. Since that's what we're interested in, let's extract it as a parameter. Now that we're modifying `pipeline`, we'll also give it a new name:

    var sequence = variadic( function (chain, fns) {
      return function sequence (seed) {
        return reduce(fns, chain, seed);
      };
    });

Notice that if we wanted to, we could implement `pipeline` as `sequence(function chain (lastResult, fn) { return fn(lastResult); }, ... )`. This shows that our new function is a generalized implementation, with `pipeline` being a specific instance.

### andand and oror

We're not allowed to name variables `&&` or `||`, so we'll use words:

    var andand = {
      chain: function (value, fn) {
        return value ? fn(value) : value;
      }
    };

    var oror = {
      chain: function (value, fn) {
        return value ? value : fn(value);
      }
    };

Now we can implement the semantics we discussed above. Instead of:

    checkUserIsLoggedIn() && userHasPrivileges() && recordIsValid() && saveRecord()
    
We write:

    sequence(andand.chain, checkUserIsLoggedIn, userHasPrivileges, recordIsValid, saveRecord)()

And instead of:

    openFile() || readFile() || closeFile() || writeCopy() || closeCopy()
    
We write:

    sequence(oror.chain, openFile, openFile, closeFile, writeCopy, closeCopy)
    
Being able to plug our chain function in lets us implement `&&` and `||` semantics in `sequence`. This raises two questions:

1. Is this *really* superior to writing things like `openFile() || readFile() || closeFile() ...`?
2. `&&` and `||` are pretty simple. Does this scale to anything nontrivial?

Answering the second question answers the first. `&&` and `||` semantics are very simple, so they are useful for understanding how passing in a `chain` parameter works.

In the next section, we'll look at a more substantial example of chaining functions with new semantics. We'll chain functions that take *callbacks* together.