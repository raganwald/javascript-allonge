## I'd Like to Have Some Arguments. Again. {#arguments-again}

As we've discussed, when a function is applied to arguments (or "called"), JavaScript binds the values of arguments to the function's argument names in an environment created for the function's execution. What we didn't discuss is that JavaScript also binds some "magic" names in addition to any you put in the argument list.

You should never attempt to define your own bindings against these names. Consider them read-only at all times. The first is called `this` and it is bound to something called the function's [context](#context). We will explore that when we start discussing objects and classes. The second is very interesting, it's called `arguments`, and the most interesting thing about it is that it contains a list of arguments passed to the function:

    function plus (a, b) {
      return arguments[0] + arguments[1]
    }
    
    plus(2,3)
      //=> 5
      
Although `arguments` looks like an array, it isn't an array:[^pojo] It's more like an object[^pojo] that happens to bind some values to properties with names that look like integers starting with zero:

    function args (a, b) {
      return arguments
    }
    
    args(2,3)
      //=> { '0': 2, '1': 3 }

`arguments` always contains all of the arguments passed to a function, regardless of how many are declared. Therefore, we can write `plus` like this:

    function plus () {
      return arguments[0] + arguments[1]
    }
    
    plus(2,3)
      //=> 5

When discussing objects, we'll discuss properties in more depth. Here's something interesting about `arguments`:

    function howMany () {
      return arguments['length']
    }
    
    howMany()
      //=> 0
    
    howMany('hello')
      //=> 1
    
    howMany('sharks', 'are', 'apex', 'predators')
      //=> 4
      
The most common use of the `arguments` binding is to build functions that can take a variable number of arguments. We'll see it used in many of the recipes, starting off with [partial application](#simple-partial) and [ellipses](#ellipses).
      
[^pojo]: We'll look at [arrays](#arrays) and [plain old javascript objects](#objects) in depth later.