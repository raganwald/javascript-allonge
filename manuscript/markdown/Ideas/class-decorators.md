## Class Decorators {#class-decorators}

[Functional Mixins](#functional-mixins) look a lot like the function and method decorators we've seen. The big difference is that the mixin alters its subject, whereas the function decorators return a new function that wraps the old one. That can be handy if we wish, for example, to have some Todos that are not colour coded and we don't want to have a wild hierarchy of inheritance or if we wish to dynamically mix functionality into a class.

> There is a strong caveat: At this time, JavaScript is inflexible about dynamically paramaterizing calls to constructors. Therefore,
the function decorator pattern being discussed here only works with constructors that are [new agnostic](#new-agnostic)[^create] and that can
create an "empty object."

[^create]: Another approach that works with ECMAScript 5 and later is to base all classes around [Object.create](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/create)

Once again, our Todo class:

    function Todo (name) {
      var self = this instanceof Todo
                 ? this
                 : new Todo();
      self.name = name || 'Untitled';
      self.done = false;
      return self;
    };
    
    Todo.prototype.do = fluent( function () {
      this.done = true;
    });
    
    Todo.prototype.undo = fluent( function () {
      this.done = false;
    });
    
    Todo.prototype;
      //=> { do: [Function], undo: [Function] }

Here's our `ColourCoded` as a class decorator: It returns a new class rather than modifying `ToDo`:

    function AndColourCoded (clazz) {
      function Decorated  () {
        var self = this instanceof Decorated
                   ? this
                   : new Decorated();
        
        return clazz.apply(self, arguments);
      };
      Decorated.prototype = new clazz();
      
      Decorated.prototype.setColourRGB = fluent( function (r, g, b) {
        this.colourCode = { r: r, g: g, b: b };
      });
      
      Decorated.prototype.getColourRGB = function () {
        return this.colourCode;
      };
      
      return Decorated;
    };
    
    var ColourTodo = AndColourCoded(Todo);
    
    Todo.prototype;
      //=> { do: [Function], undo: [Function] }
    
    var colourTodo = new ColourTodo('Write more JavaScript');
    colourTodo.setColourRGB(255, 255, 0);
      //=> { name: 'Write more JavaScript',
      //     done: false,
      //     colourCode: { r: 255, g: 255, b: 0 } }
      
    colourTodo instanceof Todo
      //=> true
      
    colourTodo instanceof ColourTodo
      //=> true

Although the implementation is more subtle, class decorators can be an improvement on functional mixins when you wish to avoid destructively modifying an existing prototype.
