## Composition and Extension {#composition}

### composition

A deeply fundamental practice is to build components out of smaller components. The choice of how to divide a component into smaller components is called *factoring*, after the operation in number theory [^refactoring]. 

[^refactoring]: And when you take an already factored component and rearrange things so that it is factored into a different set of subcomponents without altering its behaviour, you are *refactoring*.

The simplest and easiest way to build components out of smaller components in JavaScript is also the most obvious: Each component is a value, and the components can be put together into a single object or encapsulated with a closure.

Here's an abstract "model" that supports undo and redo composed from a pair of stacks (see [Encapsulating State](#encapsulation)) and a Plain Old JavaScript Object:

    // helper function
    //
    // For production use, consider what to do about
    // deep copies and own keys
    var shallowCopy = function (source) {
      var dest = {},
          key;
          
      for (key in source) {
        dest[key] = source[key]
      }
      return dest
    };

    // our model maker
    var ModelMaker = function (initialAttributes) {
      var attributes = shallowCopy(initialAttributes || {}), 
          undoStack = StackMaker(), 
          redoStack = StackMaker(),
          obj = {
            set: function (attrsToSet) {
              var key;
              
              undoStack.push(shallowCopy(attributes));
              if (!redoStack.isEmpty()) {
                redoStack = StackMaker()
              }
              for (key in (attrsToSet || {})) {
                attributes[key] = attrsToSet[key]
              }
              return obj
            },
            undo: function () {
              if (!undoStack.isEmpty()) {
                redoStack.push(shallowCopy(attributes));
                attributes = undoStack.pop()
              }
              return obj
            },
            redo: function () {
              if (!redoStack.isEmpty()) {
                undoStack.push(shallowCopy(attributes));
                attributes = redoStack.pop()
              }
              return obj
            },
            get: function (key) {
              return attributes(key)
            },
            has: function (key) {
              return attributes.hasOwnProperty(key)
            },
            attributes: function {
              shallowCopy(attributes)
            }
          };
        return obj
      };
      
The techniques used for encapsulation work well with composition. In this case, we have a "model" that hides its attribute store as well as its implementation that is composed of an undo stack and redo stack.

### extension {#extensible}

Another practice that many people consider fundamental is to *extend* an implementation. Meaning, they wish to define a new data structure in terms of adding new operations and semantics to an existing data structure.

Consider a [queue]:

    var QueueMaker = function () {
      var array = [], 
          head = 0, 
          tail = -1;
      return {
        pushTail: function (value) {
          return array[tail += 1] = value
        },
        pullHead: function () {
          var value;
          
          if tail >= head {
            value = array[head];
            array[head] = void 0;
            head += 1;
            return value
          }
        },
        isEmpty: function () {
          return tail < head
        }
      }
    };

Now we wish to create a [deque] by adding `pullTail` and `pushHead` operations to our queue.[^wasa] Unfortunately, encapsulation prevents us from adding operations that interact with the hidden data structures.

[queue]: http://duckduckgo.com/Queue_(data_structure)
[deque]: https://en.wikipedia.org/wiki/Double-ended_queue "Double-ended queue"
[^wasa]: Before you start wondering whether a deque is-a queue, we said nothing about types and classes. This relationship is called was-a, or "implemented in terms of a."

This isn't really surprising: The entire point of encapsulation is to create an opaque data structure that can only be manipulated through its public interface. The design goals of encapsulation and extension are always going to exist in tension.

Let's "de-encapsulate" our queue:

    var QueueMaker = function () {
      var queue = {
        array: [], 
        head: 0, 
        tail: -1,
        pushTail: function (value) {
          return queue.array[queue.tail += 1] = value
        },
        pullHead: function () {
          var value;
          
          if (queue.tail >= queue.head) {
            value = queue.array[queue.head];
            queue.array[queue.head] = void 0;
            queue.head += 1;
            return value
          }
        },
        isEmpty: function () {
          return queue.tail < queue.head
        }
      };
      return queue
    };

Now we can extend a queue into a deque:

    var DequeMaker = function () {
      var deque = QueueMaker(),
          INCREMENT = 4;
      
      return extend(deque, {
        size: function () {
          return deque.tail - deque.head + 1
        },
        pullTail: function () {
          var value;
          
          if (!deque.isEmpty()) {
            value = deque.array[deque.tail];
            deque.array[deque.tail] = void 0;
            deque.tail -= 1;
            return value
          }
        },
        pushHead: function (value) {
          var i;
          
          if (deque.head === 0) {
            for (i = deque.tail; i <= deque.head; i++) {
              deque.array[i + INCREMENT] = deque.array[i]
            }
            deque.tail += INCREMENT
            deque.head += INCREMENT
          }
          return deque.array[deque.head -= 1] = value
        }
      })
    };

Presto, we have reuse through extension, at the cost of encapsulation.

T> Encapsulation and Extension exist in a natural state of tension. A program with elaborate encapsulation resists breakage but can also be difficult to refactor in other ways. Be mindful of when it's best to Compose and when it's best to Extend.