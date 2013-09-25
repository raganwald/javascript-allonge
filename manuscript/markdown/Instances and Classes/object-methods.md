## Object Methods {#object-methods}

An *instance method* is a function defined in the constructor's prototype. Every instance acquires this behaviour unless otherwise "overridden." Instance methods usually have some interaction with the instance, such as references to `this` or to other methods that interact with the instance. A *constructor method* is a function belonging to the constructor itself.

There is a third kind of method, one that any object (obviously including all instances) can have. An *object method* is a function defined in the object itself. Like instance methods, object methods usually have some interaction with the object, such as references to `this` or to other methods that interact with the object.

Object methods are really easy to create with Plain Old JavaScript Objects, because they're the only kind of method you can use. Recall from [This and That](#this):

    QueueMaker = function () {
      return {
        array: [], 
        head: 0, 
        tail: -1,
        pushTail: function (value) {
          return this.array[this.tail += 1] = value
        },
        pullHead: function () {
          var value;
          
          if (this.tail >= this.head) {
            value = this.array[this.head];
            this.array[this.head] = void 0;
            this.head += 1;
            return value
          }
        },
        isEmpty: function () {
          return this.tail < this.head
        }
      }
    };
        
`pushTail`, `pullHead`, and `isEmpty` are object methods. Also, from [encapsulation](#hiding-state):

    var stack = (function () {
      var obj = {
        array: [],
        index: -1,
        push: function (value) {
          return obj.array[obj.index += 1] = value
        },
        pop: function () {
          var value = obj.array[obj.index];
          obj.array[obj.index] = void 0;
          if (obj.index >= 0) { 
            obj.index -= 1 
          }
          return value
        },
        isEmpty: function () {
          return obj.index < 0
        }
      };
      
      return obj;
    })();

Although they don't refer to the object, `push`, `pop`, and `isEmpty` semantically interact with the opaque data structure represented by the object, so they are object methods too.

### object methods within instances

Instances of constructors can have object methods as well. Typically, object methods are added in the constructor. Here's a gratuitous example, a widget model that has a read-only `id`:

    var WidgetModel = function (id, attrs) {
      extend(this, attrs || {});
      this.id = function () { return id }
    }
    
    extend(WidgetModel.prototype, {
      set: function (attr, value) {
        this[attr] = value;
        return this;
      },
      get: function (attr) {
        return this[attr]
      }
    });

`set` and `get` are instance methods, but `id` is an object method: Each object has its own `id` closure, where `id` is bound to the id of the widget by the argument `id` in the constructor. The advantage of this approach is that instances can have different object methods, or object methods with their own closures as in this case. The disadvantage is that every object has its own methods, which uses up much more memory than instance methods, which are shared amongst all instances.

T> Object methods are defined within the object. So if you have several different "instances" of the same object, there will be an object method for each object. Object methods can be associated with any object, not just those created with the `new` keyword. Instance methods apply  to instances, objects created with the `new` keyword. Instance methods are defined in a  prototype and are shared by all instances.