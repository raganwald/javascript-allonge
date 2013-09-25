## Fluent {#fluent}

Object and instance methods can be bifurcated into two classes: Those that query something, and those that update something. Most design philosophies arrange things such that update methods return the value being updated. For example:

    function Cake () {}
    
    extend(Cake.prototype, {
      setFlavour: function (flavour) { 
        return this.flavour = flavour 
      },
      setLayers: function (layers) { 
        return this.layers = layers 
      },
      bake: function () {
        // do some baking
      }
    });
    
    var cake = new Cake();
    cake.setFlavour('chocolate');
    cake.setLayers(3);
    cake.bake();

Having methods like `setFlavour` return the value being set mimics the behaviour of assignment, where `cake.flavour = 'chocolate'` is an expression that in addition to setting a property also evaluates to the value `'chocolate'`.

The [fluent] style presumes that most of the time when you perform an update you are more interested in doing other things with the receiver then the values being passed as argument(s), so the rule is to return the receiver unless the method is a query:

    function Cake () {}
    
    extend(Cake.prototype, {
      setFlavour: function (flavour) { 
        this.flavour = flavour;
        return this
      },
      setLayers: function (layers) { 
        this.layers = layers;
        return this
      },
      bake: function () {
        // do some baking
        return this
      }
    });

The code to work with cakes is now easier to read and less repetitive:

    var cake = new Cake().
      setFlavour('chocolate').
      setLayers(3).
      bake();

For one-liners like setting a property, this is fine. But some functions are longer, and we want to signal the intent of the method at the top, not buried at the bottom. Normally this is done in the method's name, but fluent interfaces are rarely written to include methods like `setLayersAndReturnThis`.

[fluent]: https://en.wikipedia.org/wiki/Fluent_interface

The `fluent` method decorator solves this problem:

    function fluent (methodBody) {
      return function () {
        methodBody.apply(this, arguments);
        return this;
      }
    }

Now you can write methods like this:

    Cake.prototype.bake = fluent( function () {
      // do some baking
      // using many lines of code
      // and possibly multiple returns
    });

It's obvious at a glance that this method is "fluent."