## Method Decorators {#method-decorators}

In [function decorators](#decorators), we learned that a decorator takes a function as an argument, returns a function, and there's a semantic relationship between the two. If a function is a verb, a decorator is an adverb.

Decorators can be used to decorate methods provided that they carefully preserve the function's context. For example, here is a naïve version of `maybe` for one argument:

    function maybe (fn) {
      return function (argument) {
        if (argument != null) {
          return fn(argument)
        }
      }
    }

This version doesn't preserve the context, so it can't be used as a method decorator. Instead, we have to write:

    function maybe (fn) {
      return function (argument) {
        if (argument != null) {
          return fn.call(this, argument)
        }
      }
    }

Now we can write things like:

    someObject = {
      setSize: maybe(function (size) {
        this.size = size;
        return this
      })
    }

And `this` is correctly set:

    someObject.setSize(5)
      //=> { setSize: [Function], size: 5 }

Using `.call` or `.apply` and `arguments` is substantially slower than writing function decorators that don't set the context, so it might be right to sometimes write function decorators that aren't usable as method decorators. However, in practice you're far more likely to introduce a defect by failing to pass the context through a decorator than by introducing a performance pessimization, so the default choice should be to write all function decorators in such a way that they are "context agnostic."

In some cases, there are other considerations to writing a method decorator. If the decorator introduces state of any kind (such as `once` and `memoize` do), this must be carefully managed for the case when several objects share the same method through the mechanism of the [prototype](#prototypes) or through sharing references to the same function.