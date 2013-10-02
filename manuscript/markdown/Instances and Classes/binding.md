## Binding Functions to Contexts {#binding}

Recall that in [What Context Applies When We Call a Function?](#context), we adjourned our look at setting the context of a function with a look at a `contextualize` helper function:

    var contextualize = function (fn, context) {
      return function () {
        return fn.apply(context, arguments)
      }
    },
    a = [1,2,3],
    accrete = contextualize(a.concat, a);
        
    accrete([4,5])
      //=> [ 1, 2, 3, 4, 5 ]
      
How would this help us in a practical way? Consider building an event-driven application. For example, an MVC application would bind certain views to update events when their models change. The [Backbone] framework uses events just like this:

    var someView = ...,
        someModel = ...;

    someModel.on('change', function () {
      someView.render()
    });
    
This tells `someModel` that when it invoked a `change` event, it should call the anonymous function that in turn invoked `someView`'s `.render` method. Wouldn't it be simpler to simply write:

    someModel.on('change', someView.render);
    
It would, except that the implementation for `.on` and similar framework methods looks something like this:

    Model.prototype.on = function (eventName, callback) { ... callback() ... }
    
Although `someView.render()` correctly sets the method's context as `someView`, `callback()` will not. What can we do without wrapping `someView.render()` in a function call as we did above?

### binding methods

Before enumerating approaches, let's describe what we're trying to do. We want to take a method call and treat it as a function. Now, methods are functions in JavaScript, but as we've learned from looking at contexts, method calls involve both invoking a function *and* setting the context of the function call to be the receiver of the method call.

When we write something like:

    var unbound = someObject.someMethod;
    
We're binding the name `unbound` to the method's function, but we aren't doing anything with the identity of the receiver. In most programming languages, such methods are called "unbound" methods because they aren't associated with, or "bound" to the intended receiver.

So what we're really trying to do is get ahold of a *bound* method, a method that is associated with a specific receiver. We saw an obvious way to do that above, to wrap the method call in another function. Of course, we're responsible for replicating the *arity* of the method being bound. For example:

    var boundSetter = function (value) {
      return someObject.setSomeValue(value);
    };
    
Now our bound method takes one argument, just like the function it calls. We can use a bound method anywhere:

    someDomField.on('update', boundSetter);

This pattern is very handy, but it requires keeping track of these bound methods. One thing we can do is bind the method "in place," using the `let` pattern like this:

    someObject.setSomeValue = (function () {
      var unboundMethod = someObject.setSomeValue;
      
      return function (value) {
        return unboundMethod.call(someObject, value);
      }
    })();
    
Now we know where to find it:

    someDomField.on('update', someObject.setSomeValue);
    
This is a very popular pattern, so much so that many frameworks provide helper functions to make this easy. [Underscore], for example, provides `_.bind` to return a bound copy of a function and `_.bindAll` to bind methods in place:

    // bind *all* of someObject's methods in place
    _.bindAll(someObject); 
    
    // bind setSomeValue and someMethod in place
    _.bindAll(someObject, 'setSomeValue', 'someMethod');

There are two considerations to ponder. First, we may be converting an instance method into an object method. Specifically, we're creating an object method that is bound to the object.

Most of the time, the only change this makes is that it uses slightly more memory (we're creating an extra function for each bound method in each object). But if you are a little more dynamic and actually change methods in the prototype, your changes won't "override" the object methods that you created. You'd have to roll your own binding method that refers to the prototype's method dynamically or reorganize your code.

This is one of the realities of "meta-programming." Each technique looks useful and interesting in isolation, but when multiple techniques are used together, they can have unpredictable results. It's not surprising, because most popular languages consider classes and methods to be fairly global, and they handle dynamic changes through side-effects. This is roughly equivalent to programming in 1970s-era BASIC by imperatively changing global variables.

If you aren't working with old JavaScript environments in non-current browsers, you needn't use a framework or roll your own binding functions: JavaScript has a [`.bind`][bind] method defined for functions:

    someObject.someMethod = someObject.someMethod.bind(someObject);

`.bind` also does some currying for you, you can bind one or more arguments in addition to the context. For example:

    AccountModel.prototype.getBalancePromise(forceRemote) = {
      // if forceRemote is true, always goes to the remote
      // database for the most real-time value, returns
      // a promise.
    };
    
    var account = new AccountModel(...);
    
    var boundGetRemoteBalancePromise = account.
      getBalancePromise.
      bind(account, true);
    
Very handy, and not just for binding contexts!

[Backbone]: http://backbonejs.org
[Underscore]: http://underscorejs.org
[bind]: https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Function/bind

T> Getting the context right for methods is essential. The commonplace terminology is that we want bound methods rather than unbound methods. Current flavours of JavaScript provide a `.bind` method to help, and frameworks like Underscore also provide helpers to make binding methods easy.
