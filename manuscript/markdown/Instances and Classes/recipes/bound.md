## Bound {#bound}

Earlier, we saw a recipe for [getWith](#getWith) that plays nicely with properties:

    function get (attr) {
      return function (obj) {
        return obj[attr]
      }
    }

Simple and useful. But now that we've spent some time looking at objects with methods we can see that `get` (and `pluck`) has a failure mode. Specifically, it's not very useful if we ever want to get a *method*, since we'll lose the context. Consider some hypothetical class:

    function InventoryRecord (apples, oranges, eggs) {
      this.record = {
        apples: apples,
        oranges: oranges,
        eggs: eggs
      }
    }
    
    InventoryRecord.prototype.apples = function apples () {
      return this.record.apples
    }
    
    InventoryRecord.prototype.oranges = function oranges () {
      return this.record.oranges
    }
    
    InventoryRecord.prototype.eggs = function eggs () {
      return this.record.eggs
    }
    
    var inventories = [
      new InventoryRecord( 0, 144, 36 ),
      new InventoryRecord( 240, 54, 12 ),
      new InventoryRecord( 24, 12, 42 )
    ];
    
Now how do we get all the egg counts?

    mapWith(getWith('eggs'))(inventories)
      //=> [ [Function: eggs],
      //     [Function: eggs],
      //     [Function: eggs] ]

And if we try applying those functions...

    mapWith(getWith('eggs'))(inventories).map(
      function (unboundmethod) { 
        return unboundmethod() 
      }
    )
      //=> TypeError: Cannot read property 'eggs' of undefined
      
Of course, these are unbound methods we're "getting" from each object. Here's a new version of `get` that plays nicely with methods. It uses [variadic](#ellipses):

    var bound = variadic( function (messageName, args) {
      
      if (args === []) {
        return function (instance) {
          return instance[messageName].bind(instance)
        }
      }
      else {
        return function (instance) {
          return Function.prototype.bind.apply(
            instance[messageName], [instance].concat(args)
          )
        }
      }
    });

    mapWith(bound('eggs'))(inventories).map(
      function (boundmethod) { 
        return boundmethod() 
      }
    )
      //=> [ 36, 12, 42 ]

`bound` is the recipe for getting a bound method from an object by name. It has other uses, such as callbacks. `bound('render')(aView)` is equivalent to `aView.render.bind(aView)`. There's an option to add a variable number of additional arguments, handled by:

    return function (instance) {
      return Function.prototype.bind.apply(
        instance[messageName], [instance].concat(args)
      )
    }
        
The exact behaviour will be covered in [Binding Functions to Contexts](#binding). You can use it like this to add arguments to the bound function to be evaluated:

    InventoryRecord.prototype.add = function (item, amount) {
      this.record[item] || (this.record[item] = 0);
      this.record[item] += amount;
      return this;
    }
    
    mapWith(bound('add', 'eggs', 12))(inventories).map(
      function (boundmethod) { 
        return boundmethod() 
      }
    )
      //=> [ { record: 
      //       { apples: 0,
      //         oranges: 144,
      //         eggs: 48 } },
      //     { record: 
      //       { apples: 240,
      //         oranges: 54,
      //         eggs: 24 } },
      //     { record: 
      //       { apples: 24,
      //         oranges: 12,
      //         eggs: 54 } } ]