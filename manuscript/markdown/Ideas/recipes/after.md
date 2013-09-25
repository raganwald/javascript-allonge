## After {#after}

Combinators for functions come in an unlimited panoply of purposes and effects. So do method combinators, but whether from intrinsic utility or custom, certain themes have emerged. One of them that forms a core part of the original [Lisp Flavors][flavors] system and also the [Aspect-Oriented Programming][aop] movement, is decorating a method with some functionality to be performed *after* the method's body is evaluated.

[flavors]: https://en.wikipedia.org/wiki/Flavors_(programming_language)
[aop]: https://en.wikipedia.org/wiki/Aspect-oriented_programming

For example, consider this "class:"

    Todo = function (name) {
      this.name = name || 'Untitled';
      this.done = false
    }
    
    extend(Todo.prototype, {
      do: fluent( function {
        this.done = true
      }),
      undo: fluent( function {
        this.done = false
      }),
      setName: fluent( maybe( function (name) {
        this.name = name
      }))
    });

If we're rolling our own model class, we might mix in [Backbone.Events]. Now we can have views listen to our todo items and render themselves when there's a change. Since we've already seen [before](#before), we'll jump right to the recipe for `after`, a combinator that turns a function into a method decorator:

    function after (decoration) {
      return function (method) {
        return function () {
          var value = method.apply(this, arguments);
          decoration.call(this, value);
          return value
        }
      }
    }

[Backbone.Events]: http://backbonejs.org/#Events

And here it is in use to trigger change events on our `Todo` "class." We're going to be even *more* sophisticated and paramaterize our decorators.

    extend(Todo.prototype, Backbone.Events);
    
    function changes (propertyName) {
      return after(function () {
        this.trigger('changed changed:'+propertyName, this[propertyName])
      })
    }
    
    extend(Todo.prototype, {
      do: fluent( changes('done')( function {
        this.done = true
      })),
      undo: fluent( changes('done')( function {
        this.done = false
      })),
      setName: fluent( changes('name')( maybe( function (name) {
        this.name = name
      })))
    });
    
The decorators act like keywords or annotations, documenting the method's behaviour but clearly separating these secondary concerns from the core logic of the method.

---

([before](#before), [after](#after), and many more combinators for building method decorators can be found in the [method combinators][mc] module.)

[mc]: https://github.com/raganwald/method-combinators/blob/master/README-JS.md#method-combinators