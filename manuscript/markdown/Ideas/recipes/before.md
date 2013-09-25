## Before {#before}

Combinators for functions come in an unlimited panoply of purposes and effects. So do method combinators, but whether from intrinsic utility or custom, certain themes have emerged. One of them that forms a core part of the original [Lisp Flavors][flavors] system and also the [Aspect-Oriented Programming][aop] movement, is decorating a method with some functionality to be performed *before* the method's body is evaluated.

[flavors]: https://en.wikipedia.org/wiki/Flavors_(programming_language)
[aop]: https://en.wikipedia.org/wiki/Aspect-oriented_programming

For example, using our [fluent](#fluent) recipe:

    function Cake () {
      this.ingredients = {}
    }
    
    extend(Cake.prototype, {
      setFlavour: fluent( function (flavour) { 
        this.flavour = flavour
      }),
      setLayers: fluent( function (layers) { 
        this.layers = layers;
      }),
      add: fluent( function (ingredientMap) {
        var ingredient;
        
        for (ingredient in ingredientMap) {
          this.ingredients[ingredient] || 
            (this.ingredients[ingredient] = 0);
          this.ingredients[ingredient] = this.ingredients[ingredient] + 
            ingredientMap[ingredient]
        }
      }),
      mix: fluent( function () {
        // mix ingredients together
      }),
      rise: fluent( function (duration) {
        // let the ingredients rise
      }),
      bake: fluent( function () {
        // do some baking
      })
    });

This particular example might be better-served as a state machine, but what we want to encode is that we must always mix the ingredients before allowing the batter to rise or baking the cake. The direct way to write that is:

      rise: fluent( function (duration) {
        this.mix();
        // let the ingredients rise
      }),
      bake: fluent( function () {
        this.mix();
        // do some baking
      })

Nothing wrong with that, however it does clutter the core functionality of rising and baking with a secondary concern, preconditions. There is a similar problem with cross-cutting concerns like logging or checking permissions: You want functions to be smaller and more focused, and decomposing into smaller methods is ugly:

    reallyRise: function (duration) {
      // let the ingredients rise
    },
    rise: fluent (function (duration) {
      this.mix();
      this.reallyRise()
    }),
    reallyBake: function () {
      // do some baking
    },
    bake: fluent( function () {
      this.mix();
      this.reallyBake()
    })

### the before recipe

This recipe is for a combinator that turns a function into a method decorator. The decorator evaluates the function before evaluating the base method. Here it is:

    function before (decoration) {
      return function (method) {
        return function () {
          decoration.apply(this, arguments);
          return method.apply(this, arguments)
        }
      }
    }
    
And here we are using it in conjunction with `fluent`, showing the power of composing combinators:

    var mixFirst = before(function () {
      this.mix()
    });
    
    extend(Cake.prototype, {
      
      // Other methods...
      
      mix: fluent( function () {
        // mix ingredients together
      }),
      rise: fluent( mixFirst( function (duration) {
        // let the ingredients rise
      })),
      bake: fluent( mixFirst( function () {
        // do some baking
        return this
      }))
    });

The decorators act like keywords or annotations, documenting the method's behaviour but clearly separating these secondary concerns from the core logic of the method.

---

([before](#before), [after](#after), and many more combinators for building method decorators can be found in the [method combinators][mc] module.)

[mc]: https://github.com/raganwald/method-combinators/blob/master/README-JS.md#method-combinators