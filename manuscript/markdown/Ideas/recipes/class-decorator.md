## A Class Decorator Factory

As [discussed](#class-decorators), a class decorator creates a new class with some additional decoration. It's lighter weight than subclassing. It's also easy to write a factory function that makes decorators for us. Recall:

{:lang="js"}
~~~~~~~~
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
~~~~~~~~

We wish to decorate this with:

{:lang="js"}
~~~~~~~~
({
  setColourRGB: fluent( function (r, g, b) {
    this.colourCode = { r: r, g: g, b: b };
  }),
  getColourRGB: function () {
    return this.colourCode;
  }
});
~~~~~~~~

Instead of writing:

{:lang="js"}
~~~~~~~~
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
~~~~~~~~

We'll extract the decoration into a parameter like this:

{:lang="js"}
~~~~~~~~
function classDecorator (decoration, clazz) {
  function Decorated  () {
    var self = this instanceof Decorated
               ? this
               : new Decorated();

    return clazz.apply(self, arguments);
  };
  Decorated.prototype = extend(new clazz(), decoration);
  return Decorated;
};
~~~~~~~~

And then "curry" the function manually like this:

{:lang="js"}
~~~~~~~~
function classDecorator (decoration) {

  return function (clazz) {
    function Decorated  () {
      var self = this instanceof Decorated
                 ? this
                 : new Decorated();

      return clazz.apply(self, arguments);
    };
    Decorated.prototype = extend(new clazz(), decoration);
    return Decorated;
  };

};
~~~~~~~~

We can try it:

{:lang="js"}
~~~~~~~~
var AndColourCoded = classDecorator({
  setColourRGB: fluent( function (r, g, b) {
    this.colourCode = { r: r, g: g, b: b };
  }),
  getColourRGB: function () {
    return this.colourCode;
  }
});

var ColourTodo = AndColourCoded(Todo);

new ColourTodo('Use More Decorators').setColourRGB(0, 255, 0);
  //=> { name: 'Use More Decorators',
  //     done: false,
  //     colourCode: { r: 0, g: 255, b: 0 } }
~~~~~~~~

Success! Our `classDecorator` function makes class decorators.
