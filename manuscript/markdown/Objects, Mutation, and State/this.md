## This and That {#this}

Let's take another look at [extensible objects](#extensible). Here's a Queue:

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

    queue = QueueMaker()
    queue.pushTail('Hello')
    queue.pushTail('JavaScript')

Let's make a copy of our queue using the `extend` recipe:

    copyOfQueue = extend({}, queue);
    
    queue !== copyOfQueue
      //=> true
    
Wait a second. We know that array values are references. So it probably copied a reference to the original array. Let's make a copy of the array as well:

    copyOfQueue.array = [];
    for (var i = 0; i < 2; ++i) {
      copyOfQueue.array[i] = queue.array[i]
    }

Now let's pull the head off the original:

    queue.pullHead()
      //=> 'Hello'
      
If we've copied everything properly, we should get the exact same result when we pull the head off the copy:
      
    copyOfQueue.pullHead()
      //=> 'JavaScript'
      
What!? Even though we carefully made a copy of the array to prevent aliasing, it seems that our two queues behave like aliases of each other. The problem is that while we've carefully copied our array and other elements over, *the closures all share the same environment*, and therefore the functions in `copyOfQueue` all operate on the first queue's private data, not on the copies.

A> This is a general issue with closures. Closures couple functions to environments, and that makes them very elegant in the small, and very handy for making opaque data structures. Alas, their strength in the small is their weakness in the large. When you're trying to make reusable components, this coupling is sometimes a hindrance.

Let's take an impossibly optimistic flight of fancy:

    var AmnesiacQueueMaker = function () {
      return {
        array: [], 
        head: 0, 
        tail: -1,
        pushTail: function (myself, value) {
          return myself.array[myself.tail += 1] = value
        },
        pullHead: function (myself) {
          var value;
          
          if (myself.tail >= myself.head) {
            value = myself.array[myself.head];
            myself.array[myself.head] = void 0;
            myself.head += 1;
            return value
          }
        },
        isEmpty: function (myself) {
          return myself.tail < myself.head
        }
      }
    };

    queueWithAmnesia = AmnesiacQueueMaker();
    queueWithAmnesia.pushTail(queueWithAmnesia, 'Hello');
    queueWithAmnesia.pushTail(queueWithAmnesia, 'JavaScript')
    
The `AmnesiacQueueMaker` makes queues with amnesia: They don't know who they are, so every time we invoke one of their functions, we have to tell them who they are. You can work out the implications for copying queues as a thought experiment: We don't have to worry about environments, because every function operates on the queue you pass in.

The killer drawback, of course, is making sure we are always passing the correct queue in every time we invoke a function. What to do?

### what's all `this`?

Any time we must do the same repetitive thing over and over and over again, we industrial humans try to build a machine to do it for us. JavaScript is one such machine:

    BanksQueueMaker = function () {
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

    banksQueue = BanksQueueMaker();
    banksQueue.pushTail('Hello');
    banksQueue.pushTail('JavaScript') 

Every time you invoke a function that is a member of an object, JavaScript binds that object to the name `this` in the environment of the function just as if it was an argument.[^this] Now we can easily make copies:

    copyOfQueue = extend({}, banksQueue)
    copyOfQueue.array = []
    for (var i = 0; i < 2; ++i) {
      copyOfQueue.array[i] = banksQueue.array[i]
    }
      
    banksQueue.pullHead()
      //=> 'Hello'

    copyOfQueue.pullHead()
      //=> 'Hello'

Presto, we now have a way to copy arrays. By getting rid of the closure and taking advantage of `this`, we have functions that are more easily portable between objects, and the code is simpler as well.

There is more to `this` than we've discussed here. We'll explore things in more detail later, in [What Context Applies When We Call a Function?](#context).

T> Closures tightly couple functions to the environments where they are created limiting their flexibility. Using `this` alleviates the coupling. Copying objects is but one example of where that flexibility is needed.

[^this]: JavaScript also does other things with `this` as well, but this is all we care about right now.