## Invoke {#invoke}

[Send](#send) is useful when invoking a function that's a member of an object (or of an instance's prototype). But we sometimes want to invoke a function that is designed to be executed within an object's context. This happens most often when we want  to "borrow" a method from one "class" and use it on another object.

It's not an unprecedented use case. The Ruby programming language has a handy feature called [instance_exec]. It lets you execute an arbitrary block of code in the context of any object. Does this sound familiar? JavaScript has this exact feature, we just call it `.apply` (or `.call` as the case may be). We can execute any function in the context of any arbitrary object.

[instance_exec]: http://www.ruby-doc.org/core-1.8.7/Object.html#method-i-instance_exec

The only trouble with `.apply` is that being a method, it doesn't compose nicely with other functions like combinators. So, we create a function that allows us to use it as a combinator:

    var __slice = Array.prototype.slice;

    function invoke (fn) {
      var args = __slice.call(arguments, 1);
      
      return function (instance) {
        return fn.apply(instance, args)
      }
    }

For example, let's say someone else's code gives you an array of objects that are in part, but not entirely like arrays. Something like:

    var data = [
      { 0: 'zero', 
        1: 'one', 
        2: 'two', 
        foo: 'foo', 
        length: 3 },
      // ...
    ];

We can use the pattern from [Partial Application, Binding, and Currying](#pabc) to create a context-dependent copy function:

    var __copy = callFirst(Array.prototype.slice, 0);
    
And now we can compose `mapWith` with `invoke` to convert the data to arrays:
    
    mapWith(invoke(__copy))(data)
      //=> [
      //     [ 'zero', 'one', 'two' ],
      //     // ...
      //   ]

`invoke` is useful when you have the function and are looking for the instance. It can be written "the other way around," for when you have the instance and are looking for the function:

    function instanceEval (instance) {
      return function (fn) {
        var args = __slice.call(arguments, 1);
        
        return fn.apply(instance, args)
      }
    }
    
    var args = instanceEval(arguments)(__slice, 0);