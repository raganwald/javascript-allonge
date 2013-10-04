## When Rebinding Meets Recursion {#recursive}

We've talked about binding values in environments, and now we're talking about rebinding values and mutating values. Let's take a small digression. As we've seen, in JavaScript functions are values. So you can bind a function just like binding a string, number or array. Here's a function that tells us whether a (small and positive) number is even:

    var even = function (num) {
      return (num === 0) || !(even(num - 1))
    }
    
    even(0)
      //=> true
      
    even(1)
      //=> false
      
    even(42)
      //=> true
    
You can alias a function value:

    var divisibleByTwo = even;
    
    divisibleByTwo(0)
      //=> true
      
    divisibleByTwo(1)
      //=> false
      
    divisibleByTwo(42)
      //=> true
      
What happens when we redefine a recursive function like `even`? Does `dividibleByTwo` still work? Let's try aliasing it and reassigning it:

    even = void 0;
    
    divisibleByTwo(0)
      //=> true
    
    divisibleByTwo(1)
      //=> TypeError
      
What happened? Well, our new `divisibleByTwo` function wasn't really a self-contained value. When we looked at functions, we talked about "pure" functions that only access their arguments and we looked at "closures" that have free variables. Recursive functions defined like this are closures, not pure functions, because when they "call themselves," what they actually do is look themselves up by name in their enclosing environment. Thus, they depend upon a specific value (themselves) being bound in their enclosing environment. Reassign to that variable (or rebind the name, same thing), and you break their functionality.

### named function expressions

You recall that in [Naming Functions](#named-function-expressions), we saw that when you create a named function expression, you bind the name of the function within its body but not the environment of the function expression, meaning you can write:

    var even = function myself (num) {
      return (num === 0) || !(myself(num - 1))
    }

    var divisibleByTwo = even;
    even = void 0;
    
    divisibleByTwo(0)
      //=> true
      
    divisibleByTwo(1)
      //=> false
      
    divisibleByTwo(42)
      //=> true

This is different, because the function doesn't refer to a name bound in its enclosing environment, it refers to a name bound in its own body. It is now a pure function. In fact, you can even bind it to the exact same name in its enclosing environment and it will still work:

    var even = function even (num) {
      return (num === 0) || !(even(num - 1))
    }

    var divisibleByTwo = even;
    even = void 0;
    
    divisibleByTwo(0)
      //=> true
      
    divisibleByTwo(1)
      //=> false
      
    divisibleByTwo(42)
      //=> true
      
The `even` inside the function refers to the name bound within the function by the named function expression. It may have the same name as the `even` bound in the enclosing environment, but they are two different bindings in two different environments. Thus, rebinding the name in the enclosing environment does not break the function.

You may ask, what if we rebind `even`  inside of itself. Now will it break?

    var even = function even (num) {
      even = void 0;
      return (num === 0) || !(even(num - 1))
    }

    var divisibleByTwo = even;
    even = void 0;
    
    divisibleByTwo(0)
      //=> true
      
    divisibleByTwo(1)
      //=> false
      
    divisibleByTwo(42)
      //=> true

Strangely, *no it doesn't*. The name bound by a named function expression is read-only. Why do we say strangely? Because other quasi-declarations like function declarations do *not* behave like this.

So, when we want to make a recursive function, the safest practice is to use a named function expression.

### limits

Named function expressions have limits. Here's one such limit: You can do simple recursion, but not mutual recursion. For example:

    var even = function (num) even { return (num === 0) || odd( num - 1) };
    var odd  = function (num) odd  { return (num  >  0) && even(num - 1) };
    
    odd = 'unusual';

    even(0)
      //=> true
    
    even(1)
      //=> TypeError

Using named function expressions doesn't help us, because `even` and `odd` need to be bound in an environment accessible to each other, not just to themselves. You either have to avoid rebinding the names of these functions, or use a closure to build a [module](#modules):

    var operations = (function () {})(
          var even = function (num) { return (num === 0) || odd( num - 1) };
          var odd  = function (num) { return (num  >  0) && even(num - 1) };
          return {
            even: even,
            odd:  odd
          }
        ),
        even = operations.even,
        odd = operations.odd;
        
Now you can rebind one without breaking the other, because the names outside of the closure have no effect on the bindings inside the closure:

    odd = 'unusual;
    
    even(0)
      //=> true
      
    even(1)
      //=> false
      
    even(42)
      //=> true
      

T> As has often been noted, refactoring *to* a pattern is more important than designing *with* a pattern. So don't rush off to write all your recursive functions this way, but familiarize yourself with the technique so that if and when you run into a subtle bug, you can recognize the problem and know how to fix it.
