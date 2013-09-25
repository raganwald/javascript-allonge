## Extend {#extend}

It's very common to want to "extend" an object by adding properties to it:

    var inventory = {
      apples: 12,
      oranges: 12
    };
    
    inventory.bananas = 54;
    inventory.pears = 24;

It's also common to want to add a [shallow copy] of the properties of one object to another:

[shallow copy]: https://en.wikipedia.org/wiki/Object_copy#Shallow_copy

      for (var fruit in shipment) {
        inventory[fruit] = shipment[fruit]
      }

Both needs can be met with this recipe for `extend`:

    var extend = variadic( function (consumer, providers) {
      var key,
          i,
          provider;
      
      for (i = 0; i < providers.length; ++i) {
        provider = providers[i];
        for (key in provider) {
          if (provider.hasOwnProperty(key)) {
            consumer[key] = provider[key]
          }
        }
      }
      return consumer
    });
    
You can copy an object by extending an empty object:

    extend({}, {
      apples: 12,
      oranges: 12
    })
      //=> { apples: 12, oranges: 12 }

You can extend one object with another:

    var inventory = {
      apples: 12,
      oranges: 12
    };
    
    var shipment = {
      bananas: 54,
      pears: 24
    }
    
    extend(inventory, shipment)
      //=> { apples: 12,
      //     oranges: 12,
      //     bananas: 54,
      //     pears: 24 }
      
And when we discuss prototypes, we will use `extend` to turn this:

    var Queue = function () {
      this.array = [];
      this.head = 0;
      this.tail = -1
    };
      
    Queue.prototype.pushTail = function (value) {
      // ...
    };
    Queue.prototype.pullHead = function () {
      // ...
    };
    Queue.prototype.isEmpty = function () {
      // ...
    }

Into this:

    var Queue = function () {
      extend(this, {
        array: [],
        head: 0,
        tail: -1
      })
    };
      
    extend(Queue.prototype, {
      pushTail: function (value) {
        // ...
      },
      pullHead: function () {
        // ...
      },
      isEmpty: function () {
        // ...
      }      
    });