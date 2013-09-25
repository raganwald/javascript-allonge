## Mixins {#functional-mixins}

In [A Class By Any Other Name](#class-other-name), we saw that you can emulate "mixins" using our `extend` function. We'll revisit this subject now and spend more time looking at mixing functionality into classes.

First, a quick recap: In JavaScript, a "class" is implemented as a constructor function and its prototype. Instances of the class are created by calling the constructor with `new`. They "inherit" shared behaviour from the constructor's `prototype` property. One way to share behaviour scattered across multiple classes, or to untangle behaviour by factoring it out of an overweight prototype, is to extend a prototype with a mixin.

Here's an evolved class of todo items we saw earlier:

    function Todo (name) {
      var self = this instanceof Todo
                 ? this
                 : new Todo();
      self.name = name || 'Untitled';
      self.done = false;
    };
    
    Todo.prototype.do = fluent( function () {
      this.done = true;
    });
    
    Todo.prototype.undo = fluent( function () {
      this.done = false;
    });
    
    Todo.prototype;
      //=> { do: [Function], undo: [Function] }

And a "mixin:"

    var ColourCoded = {
      setColourRGB: fluent( function (r, g, b) {
        this.colourCode = { r: r, g: g, b: b };
      }),
      getColourRGB: function () {
        return this.colourCode;
      }
    };
    
Mixing colour coding into our Todo prototype is straightforward:

    extend(Todo.prototype, ColourCoded);
    
    Todo.prototype;
      //=> { do: [Function],
      //     undo: [Function],
      //     setColourRGB: [Function],
      //     getColourRGB: [Function] }
    
### what is a "mixin?"

Like "class," the word "mixin" means different things to different people. A Ruby user will talk about modules, for example. And a JavaScript user could in truth say that everything is an object and we're just extending one object (that happens to be a prototype) with the properties of another object (that just happens to contain some functions).

A simple definition that works for most purposes is to define a mixin as: *A collection of behaviour that can be added to a class's existing prototype*. `ColourCoded` above is such a mixin. If we had to actually assign a new prototype to the `Todo` class, that wouldn't be mixing functionality in, that would be replacing functionality.

### functional mixins

The mixin we have above works properly, but our little recipe had two distinct steps: Define the mixin and then extend the class prototype. Angus Croll pointed out that it's far more elegant to define a mixin as a function rather than an object. He calls this a [functional mixin][fm]. Here's our `ColourCoded` recast in functional form:

    function becomeColourCoded (target) {
      target.setColourRGB = fluent( function (r, g, b) {
        this.colourCode = { r: r, g: g, b: b };
      });
      
      target.getColourRGB = function () {
        return this.colourCode;
      };
      
      return target;
    };
    
    becomeColourCoded(Todo.prototype);
    
    Todo.prototype;
      //=> { do: [Function],
      //     undo: [Function],
      //     setColourRGB: [Function],
      //     getColourRGB: [Function] }
      
Notice that we mix the functionality into the prototype. This keeps our mixing flexible: You could mix functionality directly into an object if you so choose. Twitter's [Flight] framework uses a variation on this technique that targets the mixin function's context:

    function asColourCoded () {
      this.setColourRGB = fluent( function (r, g, b) {
        this.colourCode = { r: r, g: g, b: b };
      });
      
      this.getColourRGB = function () {
        return this.colourCode;
      };
      
      return this;
    };
    
    asColourCoded.call(Todo.prototype);
    
This approach has some subtle benefits: You can use mixins as methods, for example. It's possible to write a context-agnostic functional mixin:

    function colourCoded () {
      if (arguments.length[0] !== void 0) {
        return colourCoded.call(arguments[0]);
      }
      this.setColourRGB = fluent( function (r, g, b) {
        this.colourCode = { r: r, g: g, b: b };
      });
      
      this.getColourRGB = function () {
        return this.colourCode;
      };
      
      return this;
    };

Bueno!

[fm]: https://javascriptweblog.wordpress.com/2011/05/31/a-fresh-look-at-javascript-mixins/ "A fresh look at JavaScript Mixins"
[Flight]: https://twitter.github.com/flight