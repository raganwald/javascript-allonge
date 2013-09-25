## What Context Applies When We Call a Function? {#context}

In [This and That](#this), we learned that when a function is called as an object method, the name `this` is bound in its environment to the object acting as a "receiver." For example:

    var someObject = {
      returnMyThis: function () {
        return this;
      }
    };
    
    someObject.returnMyThis() === someObject
      //=> true
      
We've constructed a method that returns whatever value is bound to `this` when it is called. It returns the object when called, just as described.

### it's all about the way the function is called

JavaScript programmers talk about functions having a "context" when being called. `this` is bound to the context.[^toobad] The important thing to understand is that the context for a function being called is set by the way the function is called, not the function itself.

[^toobad]: Too bad the language binds the context to the name `this` instead of the name `context`!

This is an important distinction. Consider closures: As we discussed in [Closures and Scope](#closures), a function's free variables are resolved by looking them up in their enclosing functions' environments. You can always determine the functions that define free variables by examining the source code of a JavaScript program, which is why this scheme is known as [Lexical Scope].

[Lexical Scope]: https://en.wikipedia.org/wiki/Scope_(computer_science)#Lexical_scoping

A function's context cannot be determined by examining the source code of a JavaScript program. Let's look at our example again:

    var someObject = {
      someFunction: function () {
        return this;
      }
    };

    someObject.someFunction() === someObject
      //=> true
    
What is the context of the function `someObject.someFunction`? Don't say `someObject`! Watch this:

    var someFunction = someObject.someFunction;

    someFunction === someObject.someFunction
      //=> true
    
    someFunction() === someObject
      //=> false
      
It gets weirder:

    var anotherObject = {
      someFunction: someObject.someFunction
    }
    
    anotherObject.someFunction === someObject.someFunction
      //=> true
      
    anotherObject.someFunction() === anotherObject
      //=> true
      
    anotherObject.someFunction() === someObject
      //=> false
      
So it amounts to this: The exact same function can be called in two different ways, and you end up with two different contexts. If you call it using `someObject.someFunction()` syntax, the context is set to the receiver. If you call it using any other expression for resolving the function's value (such as `someFunction()`), you get something else. Let's investigate:

    (someObject.someFunction)() == someObject
      //=> true
      
    someObject['someFunction']() === someObject
      //=> true
      
    var name = 'someFunction';
    
    someObject[name]() === someObject
      //=> true

Interesting!

    var baz;
    
    (baz = someObject.someFunction)() === this
      //=> true
      
How about:

    var arr = [ someObject.someFunction ];
    
    arr[0]() == arr
      //=> true
    
It seems that whether you use `a.b()` or `a['b']()` or `a[n]()` or `(a.b)()`, you get context `a`. 

    var returnThis = function () { return this };

    var aThirdObject = {
      someFunction: function () {
        return returnThis()
      }
    }
    
    returnThis() === this
      //=> true
    
    aThirdObject.someFunction() === this
      //=> true
      
And if you don't use `a.b()` or `a['b']()` or `a[n]()` or `(a.b)()`, you get the global environment for a context, not the context of whatever function is doing the calling. To simplify things, when you call a function with `.` or `[]` access, you get an object as context, otherwise you get the global environment.

### setting your own context

There are actually two other ways to set the context of a function. And once again, both are determined by the caller. At the very end of [objects everywhere?](#objectseverywhere), we'll see that everything in JavaScript behaves like an object, including functions. We'll learn that functions have methods themselves, and one of them is `call`.

Here's `call` in action:

    returnThis() === aThirdObject
      //=> false

    returnThis.call(aThirdObject) === aThirdObject
      //=> true
      
    anotherObject.someFunction.call(someObject) === someObject
      //=> true
      
When You call a function with `call`, you set the context by passing it in as the first parameter. Other arguments are passed to the function in the normal manner. Much hilarity can result from `call` shenanigans like this:

    var a = [1,2,3],
        b = [4,5,6];
        
    a.concat([2,1])
      //=> [1,2,3,2,1]
      
    a.concat.call(b,[2,1])
      //=> [4,5,6,2,1]
      
But now we thoroughly understand what `a.b()` really means: It's synonymous with `a.b.call(a)`. Whereas in a browser, `c()` is synonymous with `c.call(window)`.

### apply, arguments, and contextualization

JavaScript has another automagic binding in every function's environment. `arguments` is a special object that behaves a little like an array.[^little]

[^little]: Just enough to be frustrating, to be perfectly candid!

For example:

    var third = function () {
      return arguments[2]
    }

    third(77, 76, 75, 74, 73)
      //=> 75

Hold that thought for a moment. JavaScript also provides a fourth way to set the context for a function. `apply` is a method implemented by every function that takes a context as its first argument, and it takes an array or array-like thing of arguments as its second argument. That's a mouthful, let's look at an example:

    third.call(this, 1,2,3,4,5)
      //=> 3

    third.apply(this, [1,2,3,4,5])
      //=> 3
      
Now let's put the two together. Here's another travesty:

    var a = [1,2,3],
        accrete = a.concat;
        
    accrete([4,5])
      //=> Gobbledygook!

We get the result of concatenating `[4,5]` onto an array containing the global environment. Not what we want! Behold:

    var contextualize = function (fn, context) {
      return function () {
        return fn.apply(context, arguments);
      }
    }
    
    accrete = contextualize(a.concat, a);
    accrete([4,5]);
      //=> [ 1, 2, 3, 4, 5 ]
      
Our `contextualize` function returns a new function that calls a function with a fixed context. It can be used to fix some of the unexpected results we had above. Consider:

    var aFourthObject = {},
        returnThis = function () { return this; };
        
    aFourthObject.uncontextualized = returnThis;
    aFourthObject.contextualized = contextualize(returnThis, aFourthObject);
    
    aFourthObject.uncontextualized() === aFourthObject
      //=> true
    aFourthObject.contextualized() === aFourthObject
      //=> true
      
Both are `true` because we are accessing them with `aFourthObject.` Now we write:

    var uncontextualized = aFourthObject.uncontextualized,
        contextualized = aFourthObject.contextualized;
        
    uncontextualized() === aFourthObject;
      //=> false
    contextualized() === aFourthObject
      //=> true
      
When we call these functions without using `aFourthObject.`, only the contextualized version maintains the context of `aFourthObject`.
      
We'll return to contextualizing methods later, in [Binding](#binding). But before we dive too deeply into special handling for methods, we need to spend a little more time looking at how functions and methods work.