## Refactoring to Functional Iterators

In [Tortoises, Hares, and Teleporting Turtles](#tortoises), we looked at the "Tortoise and Hare" algorithm for detecting a linked list. Like many such algorithms, it "tangles" two different concerns:

1. The mechanism for iterating over a list.
2. The algorithm for detecting a loop in a list.

{:lang="javascript"}
~~~~~~~~
var LinkedList = (function() {

  function LinkedList(content, next) {
    this.content = content;
    this.next = next != null ? next : void 0;
  }

  LinkedList.prototype.appendTo = function(content) {
    return new LinkedList(content, this);
  };

  LinkedList.prototype.tailNode = function() {
    var nextThis;
    return ((nextThis = this.next) != null ? nextThis.tailNode() : void 0) || this;
  };

  return LinkedList;

})();

function tortoiseAndHareLoopDetector (list) {
  var hare, tortoise, nextHare;
  tortoise = list;
  hare = list.next;
  while ((tortoise != null) && (hare != null)) {
    if (tortoise === hare) {
      return true;
    }
    tortoise = tortoise.next;
    hare = (nextHare = hare.next) != null ? nextHare.next : void 0;
  }
  return false;
};
~~~~~~~~

### functional iterators

We then went on to discuss how to use [functional iterators](#functional-iterators) to untangle concerns like this. A functional iterator is a stateful function that iterates over a data structure. Every time you call it, it returns the next element from the data structure. If and when it completes its traversal, it returns `undefined`.

For example, here is a function that takes an array and returns a functional iterator over the array:

{:lang="javascript"}
~~~~~~~~
function ArrayIterator (array) {
  var index = 0;
  return function() {
    return array[index++];
  };
};
~~~~~~~~

Iterators allow us to write (or refactor) functions to operate on iterators instead of data structures. That increases reuse. We can also write higher-order functions that operate directly on iterators such as mapping and selecting. That allows us to write lazy algorithms.

### refactoring the tortoise and hare

Now we'll refactor the Tortoise and Hare to use iterators instead of directly operate on linked lists. We'll add an `.iterator()` method to linked lists, and we'll rewrite our loop detector function to take an "iterable" instead of a list:

{:lang="javascript"}
~~~~~~~~
LinkedList.prototype.iterator = function() {
  var list = this;
  return function() {
    var value = list != null ? list.content : void 0;
    list = list != null ? list.next : void 0;
    return value;
  };
};

function tortoiseAndHareLoopDetector (iterable) {
  var tortoise = iterable.iterator(),
      hare = iterable.iterator(), 
      tortoiseValue, 
      hareValue;
  while (((tortoiseValue = tortoise()) != null) && ((hare(), hareValue = hare()) != null)) {
    if (tortoiseValue === hareValue) {
      return true;
    }
  }
  return false;
};

list = new LinkedList(5).appendTo(4).appendTo(3).appendTo(2).appendTo(1);

tortoiseAndHareLoopDetector(list);
  //=> false

list.tailNode().next = list.next;

tortoiseAndHareLoopDetector(list);
  //=> true
~~~~~~~~

We have now refactored it into a function that operates on anything that responds to the `.iterator()` method. It's classic "Duck Typed" Object-Orientation. So, how shall we put it to work?

## A Drunken Walk Across A Chequerboard

Here's another job interview puzzle.[^yecch]

[^yecch]: This book does not blindly endorse asking programmers to solve this or any abstract problem in a job interview.

*Consider a finite checkerboard of unknown size. On each square we randomly place an arrow pointing to one of its four sides. For convenience, we shall uniformly label the directions: N, S, E, and W. A chequer is placed randomly on the checkerboard. Each move consists of moving the red chequer one square in the direction of the arrow in the square it occupies. If the arrow should cause the chequer to move off the edge of the board, the game halts.*

*As a player moves the chequer, he calls out the direction of movement, e.g. "N, E, N, S, N, E..." Write an algorithm that will determine whether the game halts strictly from the called out directions, in constant space.*

### the insight

Our solution will rest on the observation that as the chequer follows a path, if it ever visits a square for a second time, it will cycle indefinitely without falling off the board. Otherwise, on a finite board, it must eventually fall off the board after at most visiting every square once.

Therefore, if we think of this as detecting whether the chequer revisits a square in constant space, we can see this is isomorphic to detecting whether a linked list has a loop by checking to see whether it revisits the same node.

### the game

In essence, we're given an object that has a `.iterator()` method. That gives us an iterator, and each time we call the iterator, we get a direction. Here it is:

{:lang="javascript"}
~~~~~~~~
var DIRECTION_TO_DELTA = {
  N: [1, 0],
  E: [0, 1],
  S: [-1, 0],
  W: [0, -1]
};

var Game = (function () {
  function Game (size) {
    var i,
        j;
    
    this.size = size
                ? Math.floor(Math.random() * 8) + 8
                : size ;
    this.board = [];
    for (i = 0; i < this.size; ++i) {
      this.board[i] = [];
      for (j = 0; j < this.size; ++j) {
        this.board[i][j] = 'NSEW'[Math.floor(Math.random() * 4)];
      }
    }
    this.initialPosition = [
      2 + Math.floor(Math.random() * (this.size - 4)), 
      2 + Math.floor(Math.random() * (this.size - 4))
    ];
    return this;
  };
  
  Game.prototype.contains = function (position) {
    return position[0] >= 0 && position[0] < this.size && position[1] >= 0 && position[1] < this.size;
  };
  
  Game.prototype.iterator = function () {
    var position = [this.initialPosition[0], this.initialPosition[1]];
    return function () {
      var direction;
      if (this.contains(position)) {
        direction = this.board[position[0]][position[1]];
        position[0] += DIRECTION_TO_DELTA[direction][0];
        position[1] += DIRECTION_TO_DELTA[direction][1];
        return direction;
      }
      else {
        return void 0;
      }
    }.bind(this);
  };
  
  return Game;
  
})();

var i = new Game().iterator();
  //=> [Function]
i();
  //=> 'N'
i();
  //=> 'S'
i();
  //=> 'N'
i();
  //=> 'S'
  //   ...

~~~~~~~~

In the example above, we have the smallest possible repeating path: The chequer shuttles back and forth between two squares. It will not always be so obvious when a game does not terminate.

### stateful mapping

Our goal is to transform the iteration of directions into an iteration that the Tortoise and Hare can use to detect revisiting the same square. Our approach is to convert the directions into offsets representing the position of the chequer relative to its starting position.

We'll use a `statefulMap`:

{:lang="javascript"}
~~~~~~~~
function statefulMap (iter, binaryFn, initial) {
  var state = initial;
  return function () {
    element = iter();
    if (element == null) {
      return element;
    }
    else {
      if (state === void 0) {
        return (state = element);
      }
      else return (state = binaryFn.call(element, state, element));
    }
  }
};
~~~~~~~~

`statefulMap` takes in iterator and maps it to a new iterator. Unlike a "regular" map, it is computes its elements on demand, so it will not run indefinitely when given an iteration representing an infinitely looping chequer. We need a stateful map because we are tracking a position that changes over time even when given the same direction over and over again.

Here's how we use `statefulMap`:


{:lang="javascript"}
~~~~~~~~
function RelativeIterator (directionIterator) {
  return statefulMap(directionIterator, function (relativePositionStr, directionStr) {
    var delta = DIRECTION_TO_DELTA[directionStr],
        matchData = relativePositionStr.match(/(-?\d+) (-?\d+)/),
        relative0 = parseInt(matchData[1], 10),
        relative1 = parseInt(matchData[2], 10);
    return "" + (relative0 + delta[0]) + " " + (relative1 + delta[1]);
  }, "0 0");
};

var i = RelativeIterator(new Game().iterator());
i();
  //=> '-1 0'
i();
  //=> '-1 -1'
i();
  //=> '-2 -1'
i();
  //=> '-2 0'
i();
  //=> '-2 1'
i();
  //=> '-3 1'
i();
  //=> '-3 2'
i();
  //=> '-3 3'
~~~~~~~~

We're almost there! The refactored `tortoiseAndHareLoopDetector` expects an "iterable," an object that implements the  `.iterator()` method. Let's refactor `RelativeIterable` to accept a game and return an iterable instead of accepting an iteration and returning an iteration:

{:lang="javascript"}
~~~~~~~~
function RelativeIterable (game) {
  return {
    iterator: function () {
        return statefulMap(game.iterator(), function (relativePositionStr, directionStr) {
          var delta = DIRECTION_TO_DELTA[directionStr],
              matchData = relativePositionStr.match(/(-?\d+) (-?\d+)/),
              relative0 = parseInt(matchData[1], 10),
              relative1 = parseInt(matchData[2], 10);
          return "" + (relative0 + delta[0]) + " " + (relative1 + delta[1]);
        }, "0 0");
    }
  };
};

var i = RelativeIterable(new Game()).iterator();
i();
  //=> '0 -1'
i();
  //=> '1 -1'
i();
  //=> '1 0'
i();
  //=> '2 0'
i();
  //=> undefined
~~~~~~~~

### the solution

So. We can take a `Game` instance and produce an iterable that iterates over regular strings representing relative positions. If it terminates on its own, the game obviously terminates. And if it repeats itself, the game does not terminate.

Our refactored `tortoiseAndHareLoopDetector` takes an iterable and detects this for us. Writing a detector function is trivial:

{:lang="javascript"}
~~~~~~~~
function terminates (game) {
  return !tortoiseAndHareLoopDetector(RelativeIterable(game));
}

terminates(new Game(4));
  //=> false
terminates(new Game(4));
  //=> true
terminates(new Game(4));
  //=> false
terminates(new Game(4));
  //=> false
~~~~~~~~

### preliminary conclusion

Untangling the mechanism of following a linked list from the algorithm of searching for a loop allows us to repurpose the Tortoise and Hare algorithm to solve a question about a path looping.

### no-charge extra conclusion

Can we also refactor the "Teleporting Turtle" algorithm to take an iterable? If so, we should be able to swap algorithms for our game termination detection without rewriting everything in sight. Let's try it:

We start with:

{:lang="javascript"}
~~~~~~~~
function teleportingTurtleLoopDetector (list) {
  var i, rabbit, speed, turtle;
  speed = 1;
  turtle = rabbit = list;
  while (true) {
    for (i = 0; i <= speed; i += 1) {
      rabbit = rabbit.next;
      if (rabbit == null) {
        return false;
      }
      if (rabbit === turtle) {
        return true;
      }
    }
    turtle = rabbit;
    speed *= 2;
  }
  return false;
};

list = new LinkedList(5).appendTo(4).appendTo(3).appendTo(2).appendTo(1);

teleportingTurtleLoopDetector(list);
  //=> false

list.tailNode().next = list.next;

teleportingTurtleLoopDetector(list);
  //=> true
~~~~~~~~

And refactor it to become:

{:lang="javascript"}
~~~~~~~~
function teleportingTurtleLoopDetector (iterable) {
  var i, rabbit, rabbitValue, speed, turtleValue;
  speed = 1;
  rabbit = iterable.iterator();
  turtleValue = rabbitValue = rabbit();
  while (true) {
    for (i = 0; i <= speed; i += 1) {
      rabbitValue = rabbit();
      if (rabbitValue == null) {
        return false;
      }
      if (rabbitValue === turtleValue) {
        return true;
      }
    }
    turtleValue = rabbitValue;
    speed *= 2;
  }
  return false;
};

list = new LinkedList(5).appendTo(4).appendTo(3).appendTo(2).appendTo(1);

teleportingTurtleLoopDetector(list);
  //=> false

list.tailNode().next = list.next;

teleportingTurtleLoopDetector(list);
  //=> true
~~~~~~~~

Now we can plug it into our termination detector:

{:lang="javascript"}
~~~~~~~~
function terminates (game) {
  return !teleportingTurtleLoopDetector(RelativeIterable(game));
}

terminates(new Game(4));
  //=> false
terminates(new Game(4));
  //=> false
terminates(new Game(4));
  //=> false
terminates(new Game(4));
  //=> false
terminates(new Game(4));
  //=> true
~~~~~~~~

Refactoring an algorithm to work with iterators allows us to use the same algorithm to solve different problems and to swap algorithms for the same problem. This is natural, we have created an abstraction that allows us to plug different items into either side of of its interface.
