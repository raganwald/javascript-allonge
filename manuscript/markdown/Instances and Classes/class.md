## A Class By Any Other Name {#class-other-name}

JavaScript has "classes," for some definition of "class." You've met them already, they're constructors that are designed to work with the `new` keyword and have behaviour in their `.prototype` element. You can create one any time you like by:

1. Writing the constructor so that it performs any initialization on `this`, and:
2. Putting all of the method definitions in its prototype.

Let's see it again: Here's a class of todo items:

    function Todo (name) {
      this.name = name || 'Untitled';
      this.done = false;
    };
    
    Todo.prototype.do = function () {
      this.done = true;
    };
    
    Todo.prototype.undo = function () {
      this.done = false;
    };
    
You can mix other functionality into this class by extending the prototype with an object:

    extend(Todo.prototype, {
      prioritize: function (priority) {
        this.priority = priority;
      };
    });
    
Naturally, that allows us to define mixins for other classes:

    var ColourCoded = {
      setColourRGB: function (r, g, b) {
        // ...
      },
      getColourRGB: function () {
        // ...
      },
      setColourCSS: function (css) {
        // ...
      },
      getColourCSS: function () {
        // ...
      }
    };
    
    extend(Todo.prototype, ColourCoded);

This does exactly the same thing as declaring a "class," defining a "method," and adding a "mixin." How does it differ? It doesn't use the words *class*, *method*, *def(ine)* or *mixin*. And it has this `prototype` property that most other popular languages eschew. It also doesn't deal with inheritance, a deal-breaker for programmers who are attached to taxonomies.

For these reasons, many programmers choose to write their own library of functions to mimic the semantics of other programming languages. This has happened so often that most of the popular utility-belt frameworks like [Backbone] have some form of support for defining or extending classes baked in.

[Backbone]: http://backbonejs.org

Nevertheless, JavaScript right out of the box has everything you need for defining classes, methods, mixins, and even inheritance (as we'll see in [Extending Classes with Inheritance]). If we choose to adopt a library with more streamlined syntax, it's vital to understand JavaScript's semantics well enough to know what is happening "under the hood" so that we can work directly with objects, functions, methods, and prototypes when needed.

[Extending Classes with Inheritance]: #classextension

A> One note of caution: A few libraries, such as the vile creation [YouAreDaChef](https://github.com/raganwald/YouAreDaChef#you-are-da-chef), manipulate JavaScript such that ordinary programming such as extending a prototype either don't work at all or break the library's abstraction. Think long and carefully before adopting such a library. The best libraries "Cut with JavaScript's grain."