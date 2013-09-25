## Extending Classes with Inheritance {#classextension}

You recall from [Composition and Extension](#extensible) that we extended a Plain Old JavaScript Queue to create a Plain Old JavaScript Deque. But what if we have decided to use JavaScript's prototypes and the `new` keyword instead of Plain Old JavaScript Objects? How do we extend a queue into a deque?

Here's our `Queue`:

    var Queue = function () {
      extend(this, {
        array: [],
        head: 0,
        tail: -1
      })
    };
      
    extend(Queue.prototype, {
      pushTail: function (value) {
        return this.array[this.tail += 1] = value
      },
      pullHead: function () {
        var value;
        
        if (!this.isEmpty()) {
          value = this.array[this.head]
          this.array[this.head] = void 0;
          this.head += 1;
          return value
        }
      },
      isEmpty: function () {
        return this.tail < this.head
      }      
    });

And here's what our `Deque` would look like before we wire things together:

    var Dequeue = function () {
      Queue.prototype.constructor.call(this)
    };
    
    Dequeue.INCREMENT = 4;
      
    extend(Dequeue.prototype, {
      size: function () {
        return this.tail - this.head + 1
      },
      pullTail: function () {
        var value;
        
        if (!this.isEmpty()) {
          value = this.array[this.tail];
          this.array[this.tail] = void 0;
          this.tail -= 1;
          return value
        }
      },
      pushHead: function (value) {
        var i;
        
        if (this.head === 0) {
          for (i = this.tail; i >= this.head; --i) {
            this.array[i + INCREMENT] = this.array[i]
          }
          this.tail += this.constructor.INCREMENT;
          this.head += this.constructor.INCREMENT
        }
        this.array[this.head -= 1] = value
      }
    });

A> We obviously want to do all of a `Queue`'s initialization, thus we called `Queue.prototype.constructor.call(this)`. But why not just call `Queue.call(this)`? As we'll see when we wire everything together, this ensures that we're calling the correct constructor even when `Queue` itself is wired to inherit from another constructor function.

So what do we want from dequeues such that we can call all of a `Queue`'s methods as well as a `Dequeue`'s? Should we copy everything from `Queue.prototype` into `Deque.prototype`, like `extend(Deque.prototype, Queue.prototype)`? That would work, except for one thing: If we later modified `Queue`, say by mixing in some new methods into its prototype, those wouldn't be picked up by `Dequeue`.

No, there's a better idea. Prototypes are objects, right? Why must they be Plain Old JavaScript Objects? Can't a prototype be an *instance*?

Yes they can. Imagine that `Deque.prototype` was a proxy for an instance of `Queue`. It would, of course, have all of a queue's behaviour through `Queue.prototype`. We don't want it to be an *actual* instance, mind you. It probably doesn't matter with a queue, but some of the things we might work with might make things awkward if we make random instances. A database connection comes to mind, we may not want to create one just for the convenience of having access to its behaviour.

Here's such a proxy:

    var QueueProxy = function () {}
    
    QueueProxy.prototype = Queue.prototype
    
Our `QueueProxy` isn't actually a `Queue`, but its `prototype` is an alias of `Queue.prototype`. Thus, it can pick up `Queue`'s behaviour. We want to use it for our `Deque`'s prototype. Let's insert that code in our class definition:

    var Dequeue = function () {
      Queue.prototype.constructor.call(this)
    };
    
    Dequeue.INCREMENT = 4;
    
    Dequeue.prototype = new QueueProxy();
      
    extend(Dequeue.prototype, {
      size: function () {
        return this.tail - this.head + 1
      },
      pullTail: function () {
        var value;
        
        if (!this.isEmpty()) {
          value = this.array[this.tail];
          this.array[this.tail] = void 0;
          this.tail -= 1;
          return value
        }
      },
      pushHead: function (value) {
        var i;
        
        if (this.head === 0) {
          for (i = this.tail; i >= this.head; --i) {
            this.array[i + INCREMENT] = this.array[i]
          }
          this.tail += this.constructor.INCREMENT;
          this.head += this.constructor.INCREMENT
        }
        this.array[this.head -= 1] = value
      }
    });
      
And it seems to work:

    d = new Dequeue()
    d.pushTail('Hello')
    d.pushTail('JavaScript')
    d.pushTail('!')
    d.pullHead()
      //=> 'Hello'
    d.pullTail()
      //=> '!'
    d.pullHead()
      //=> 'JavaScript'
      
Wonderful!
      
### getting the constructor element right

How about some of the other things we've come to expect from instances?

    d.constructor == Dequeue
      //=> false
      
Oops! Messing around with Dequeue's prototype broke this important equivalence. Luckily for us, the `constructor` property is mutable for objects we create. So, let's make a small change to `QueueProxy`:

    var QueueProxy = function () {
      this.constructor = Dequeue;
    }
    QueueProxy.prototype = Queue.prototype
    
Repeat. Now it works:

    d.constructor === Dequeue
      //=> true

The `QueueProxy` function now sets the `constructor` for every instance of a `QueueProxy` (hopefully just the one we need for the `Dequeue` class). It returns the object being created (it could also return `undefined` and work. But if it carelessly returned something else, that would be assigned to `Dequeue`'s prototype, which would break our code).

### extracting the boilerplate

Let's turn our mechanism into a function:

    var child = function (parent, child) {
      var proxy = function () {
        this.constructor = child
      }
      proxy.prototype = parent.prototype;
      child.prototype = new proxy();
      return child;
    }

And use it in `Dequeue`:

    var Dequeue = child(Queue, function () {
      Queue.prototype.constructor.call(this)
    });
    
    Dequeue.INCREMENT = 4;
      
    extend(Dequeue.prototype, {
      size: function () {
        return this.tail - this.head + 1
      },
      pullTail: function () {
        var value;
        
        if (!this.isEmpty()) {
          value = this.array[this.tail];
          this.array[this.tail] = void 0;
          this.tail -= 1;
          return value
        }
      },
      pushHead: function (value) {
        var i;
        
        if (this.head === 0) {
          for (i = this.tail; i >= this.head; --i) {
            this.array[i + INCREMENT] = this.array[i]
          }
          this.tail += this.constructor.INCREMENT;
          this.head += this.constructor.INCREMENT
        }
        this.array[this.head -= 1] = value
      }
    });

### future directions

Some folks just **love** to build their own mechanisms. When all goes well, they become famous as framework creators and open source thought leaders. When all goes badly they create in-house proprietary one-offs that blur the line between application and framework with abstractions everywhere.

If you're keen on learning, you can work on improving the above code to handle extending constructor properties, automatically calling the parent constructor function, and so forth. Or you can decide that doing it by hand isn't that hard so why bother putting a thin wrapper around it?

It's up to you, while JavaScript isn't the tersest language, it isn't so baroque that building inheritence ontologies requires hundreds of lines of inscrutable code.