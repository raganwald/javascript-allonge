## Prototypes are Simple, it's the Explanations that are Hard To Understand {#prototypes}

As you recall from our code for making objects [extensible](#extensible), we wrote a function that returned a Plain Old JavaScript Object. The colloquial term for this kind of function is a "Factory Function."

Let's strip a function down to the very bare essentials:

    var Ur = function () {};

This doesn't look like a factory function: It doesn't have an expression that yields a Plain Old JavaScript Object when the function is applied. Yet, there is a way to make an object out of it. Behold the power of the `new` keyword:

    new Ur()
      //=> {}
      
We got an object back! What can we find out about this object?

    new Ur() === new Ur()
      //=> false

Every time we call `new` with a function and get an object back, we get a unique object. We could call these "Objects created with the `new` keyword," but this would be cumbersome. So we're going to call them *instances*. Instances of what? Instances of the function that creates them. So given `var i = new Ur()`, we say that `i` is an instance of `Ur`.

For reasons that will be explained after we've discussed prototypes, we also say that `Ur` is the *constructor* of `i`, and that `Ur` is a *constructor function*. Therefore, an instance is an object created by using the `new` keyword on a constructor function, and that function is the instance's constructor.

### prototypes

There's more. Here's something you may not know about functions:

    Ur.prototype
      //=> {}
    
What's this prototype? Let's run our standard test:

    (function () {}).prototype === (function () {}).prototype
      //=> false

Every function is initialized with its own unique `prototype`. What does it do? Let's try something:

    Ur.prototype.language = 'JavaScript';
    
    var continent = new Ur();
      //=> {}
    continent.language
      //=> 'JavaScript'

That's very interesting! Instances seem to behave as if they had the same elements as their constructor's prototype. Let's try a few things:

    continent.language = 'CoffeeScript';
    continent
      //=> {language: 'CoffeeScript'}
    continent.language
      //=> 'CoffeeScript'
    Ur.prototype.language
      'JavaScript'

You can set elements of an instance, and they "override" the constructor's prototype, but they don't actually change the constructor's prototype. Let's make another instance and try something else.

    var another = new Ur();
      //=> {}
    another.language
      //=> 'JavaScript'
      
New instances don't acquire any changes made to other instances. Makes sense. And:

    Ur.prototype.language = 'Sumerian'
    another.language
      //=> 'Sumerian'

Even more interesting: Changing the constructor's prototype changes the behaviour of all of its instances. This strongly implies that there is a dynamic relationship between instances and their constructors, rather than some kind of mechanism that makes objects by copying.[^dynamic]

[^dynamic]: For many programmers, the distinction between a dynamic relationship and a copying mechanism is too fine to worry about. However, it makes many dynamic program modifications possible.

Speaking of prototypes, here's something else that's very interesting:

    continent.constructor
      //=> [Function]
      
    continent.constructor === Ur
      //=> true

Every instance acquires a `constructor` element that is initialized to their constructor. This is true even for objects we don't create with `new` in our own code:

    {}.constructor
      //=> [Function: Object]
      
If that's true, what about prototypes? Do they have constructors?

    Ur.prototype.constructor
      //=> [Function]
    Ur.prototype.constructor === Ur
      //=> true

Very interesting! We will take another look at the `constructor` element when we discuss [class extension](#classextension).

### revisiting `this` idea of queues

Let's rewrite our Queue to use `new` and `.prototype`, using `this` and our `extends` helper from [Composition and Extension](#composition):

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
    })

You recall that when we first looked at `this`, we only covered the case where a function that belongs to an object is invoked. Now we see another case: When a function is invoked by the `new` operator, `this` is set to the new object being created. Thus, our code for `Queue` initializes the queue.

You can see why `this` is so handy in JavaScript: We wouldn't be able to define functions in the prototype that worked on the instance if JavaScript didn't give us an easy way to refer to the instance itself.

### objects everywhere? {#objectseverywhere}

Now that you know about prototypes, it's time to acknowledge something that even small children know: Everything in JavaScript behaves like an object, everything in JavaScript behaves like an instance of a function, and therefore everything in JavaScript behaves as if it inherits some methods from its constructor's prototype and/or has some elements of its own.

For example:

    3.14159265.toPrecision(5)
      //=> '3.1415'
      
    'FORTRAN, SNOBOL, LISP, BASIC'.split(', ')
      //=> [ 'FORTRAN',
      #     'SNOBOL',
      #     'LISP',
      #     'BASIC' ]
      
    [ 'FORTRAN',
      'SNOBOL',
      'LISP',
      'BASIC' ].length
    //=> 4
    
Functions themselves are instances, and they have methods. For example, every function has a method `call`. `call`'s first argument is a *context*: When you invoke `.call` on a function, it invoked the function, setting `this` to the context. It passes the remainder of the arguments to the function. It seems like objects are everywhere in JavaScript!

### impostors

You may have noticed that we use "weasel words" to describe how everything in JavaScript *behaves like* an instance. Everything *behaves as if* it was created by a function with a prototype.

The full explanation is this: As you know, JavaScript has "value types" like `String`, `Number`, and `Boolean`. As noted in the first chapter, value types are also called *primitives*, and one consequence of the way JavaScript implements primitives is that they aren't objects. Which means they can be identical to other values of the same type with the same contents, but the consequence of certain design decisions is that value types don't actually have methods or constructors. They aren't instances of some constructor.

So. Value types don't have methods or constructors. And yet:

    "Spence Olham".split(' ')
      //=> ["Spence", "Olham"]

Somehow, when we write `"Spence Olham".split(' ')`, the string `"Spence Olham"` isn't an instance, it doesn't have methods, but it does a damn fine job of impersonating an instance of a `String` constructor. How does `"Spence Olham"` impersonate an instance?

JavaScript pulls some legerdemain. When you do something that treats a value like an object, JavaScript checks to see whether the value actually is an object. If the value is actually a primitive,[^reminder] JavaScript temporarily makes an object that is a kinda-sorta copy of the primitive and that kinda-sorta copy has methods and you are temporarily fooled into thinking that `"Spence Olham"` has a `.split` method.

[^reminder]: Recall that Strings, Numbers, Booleans and so forth are value types and primitives. We're calling them primitives here.

These kinda-sorta copies are called String *instances* as opposed to String *primitives*. And the instances have methods, while the primitives do not. How does JavaScript make an instance out of a primitive? With `new`, of course. Let's try it:

    new String("Spence Olham")
      //=> "Spence Olham"
      
The string instance looks just like our string primitive. But does it behave like a string primitive? Not entirely:

    new String("Spence Olham") === "Spence Olham"
      //=> false
      
Aha! It's an object with its own identity, unlike string primitives that behave as if they have a canonical representation. If we didn't care about their identity, that wouldn't be a problem. But if we carelessly used a string instance where we thought we had a string primitive, we could run into a subtle bug:

    if (userName === "Spence Olham") {
      getMarried();
      goCamping()
    }
      
That code is not going to work as we expect should we accidentally bind `new String("Spence Olham")` to `userName` instead of the primitive `"Spence Olham"`.

This basic issue that instances have unique identities but primitives with the same contents have the same identities--is true of all primitive types, including numbers and booleans: If you create an instance of anything with `new`, it gets its own identity.

There are more pitfalls to beware. Consider the truthiness of string, number and boolean primitives:

    '' ? 'truthy' : 'falsy'
      //=> 'falsy'
    0 ? 'truthy' : 'falsy'
      //=> 'falsy'
    false ? 'truthy' : 'falsy'
      //=> 'falsy'
      
Compare this to their corresponding instances:

    new String('') ? 'truthy' : 'falsy'
      //=> 'truthy'
    new Number(0) ? 'truthy' : 'falsy'
      //=> 'truthy'
    new Boolean(false) ? 'truthy' : 'falsy'
      //=> 'truthy'
      
Our notion of "truthiness" and "falsiness" is that all instances are truthy, even string, number, and boolean instances corresponding to primitives that are falsy.

There is one sure cure for "JavaScript Impostor Syndrome." Just as `new PrimitiveType(...)` creates an instance that is an impostor of a primitive, `PrimitiveType(...)` creates an original, canonicalized primitive from a primitive or an instance of a primitive object.

For example:

    String(new String("Spence Olham")) === "Spence Olham"
      //=> true
      
Getting clever, we can write this:

    var original = function (unknown) {
      return unknown.constructor(unknown)
    }
        
    original(true) === true
      //=> true
    original(new Boolean(true)) === true
      //=> true
      
Of course, `original` will not work for your own creations unless you take great care to emulate the same behaviour. But it does work for strings, numbers, and booleans.
