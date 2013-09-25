## Functional Iterators {#functional-iterators}

Let's consider a remarkably simple problem: Finding the sum of the elements of an array. In iterative style, it looks like this:

{:lang="js"}
~~~~~~~~
function sum (array) {
  var number, total, len;
  total = 0;
  for (i = 0, len = array.length; i < len; i++) {
    number = array[i];
    total += number;
  }
  return total;
};
~~~~~~~~
  
What's the sum of a linked list of numbers? How about the sum of a tree of numbers (represented as an array of array of numbers)? Must we re-write the `sum` function for each data structure?

There are two roads ahead. One involves a generalized `reduce` or `fold` method for each data structure. The other involves writing an [Iterator](https://developer.mozilla.org/en-US/docs/JavaScript/New_in_JavaScript/1.7#Iterators) for each data structure and writing our `sum` to take an iterator as its argument. Let's use iterators, especially since we need two different iterators for the same data structure, so a single object method is inconvenient.

Since we don't have iterators baked into the underlying JavaScript engine yet, we'll write our iterators as functions:

{:lang="js"}
~~~~~~~~
var LinkedList, list;

LinkedList = (function() {

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

function ListIterator (list) {
  return function() {
    var node;
    node = list != null ? list.content : void 0;
    list = list != null ? list.next : void 0;
    return node;
  };
};

function sum (iter) {
  var number, total;
  total = 0;
  number = iter();
  while (number != null) {
    total += number;
    number = iter();
  }
  return total;
};

list = new LinkedList(5).appendTo(4).appendTo(3).appendTo(2).appendTo(1);

sum(ListIterator(list));
  //=> 15

function ArrayIterator (array) {
  var index;
  index = 0;
  return function() {
    return array[index++];
  };
};

sum(ArrayIterator([1, 2, 3, 4, 5]));
  //=> 15
~~~~~~~~
  
Summing an array that can contain nested arrays adds a degree of complexity. Writing a function that iterates recursively over a data structure is an interesting problem, one that is trivial in a language with [coroutines](https://en.wikipedia.org/wiki/Coroutine). Since we don't have Generators yet, and we don't want to try to turn our loop detection inside-out, we'll Greenspun our own coroutine by maintaining our own stack.

> This business of managing your own stack may seem weird to anyone born after 1970, but old fogeys fondly remember that after walking barefoot to and from University uphill in a blizzard both ways, the interview question brain teaser of the day was to write a "Towers of Hanoi" solver in a language like BASIC that didn't have reentrant subroutines.

{:lang="js"}
~~~~~~~~
function LeafIterator (array) {
  var index, myself, state;
  index = 0;
  state = [];
  myself = function() {
    var element, tempState;
    element = array[index++];
    if (element instanceof Array) {
      state.push({
        array: array,
        index: index
      });
      array = element;
      index = 0;
      return myself();
    } else if (element === void 0) {
      if (state.length > 0) {
        tempState = state.pop(), array = tempState.array, index = tempState.index;
        return myself();
      } else {
        return void 0;
      }
    } else {
      return element;
    }
  };
  return myself;
};

sum(LeafIterator([1, [2, [3, 4]], [5]]));
  //=> 15
~~~~~~~~
  
We've successfully separated the issue of what one does with data from how one traverses over the elements.

### folding

Just as pure functional programmers love to talk monads, newcomers to functional programming in multi-paradigm languages often drool over [folding] a/k/a mapping/injecting/reducing. We're just a level of abstraction away:

{:lang="js"}
~~~~~~~~
function fold (iter, binaryFn, seed) {
  var acc, element;
  acc = seed;
  element = iter();
  while (element != null) {
    acc = binaryFn.call(element, acc, element);
    element = iter();
  }
  return acc;
};

function foldingSum (iter) {
  return fold(iter, (function(x, y) {
    return x + y;
  }), 0);
};

foldingSum(LeafIterator([1, [2, [3, 4]], [5]]));
  //=> 15
~~~~~~~~
  
Fold turns an iterator over a finite data structure into an accumulator. And once again, it works with any data structure. You don't need a different kind of fold for each kind of data structure you use.

[folding]: https://en.wikipedia.org/wiki/Fold_(higher-order_function)

### unfolding and laziness

Iterators are functions. When they iterate over an array or linked list, they are traversing something that is already there. But they could, in principle, manufacture the data as they go. Let's consider the simplest example:

{:lang="js"}
~~~~~~~~
function NumberIterator (base) {
  var number;
  if (base == null) {
    base = 0;
  }
  number = base;
  return function() {
    return number++;
  };
};

fromOne = NumberIterator(1);

fromOne();
  //=> 1
fromOne();
  //=> 2
fromOne();
  //=> 3
fromOne();
  //=> 4
fromOne();
  //=> 5
~~~~~~~~
  
And here's another one:

{:lang="js"}
~~~~~~~~
function FibonacciIterator () {
  var current, previous;
  previous = 0;
  current = 1;
  return function() {
    var value, tempValues;
    value = current;
    tempValues = [current, current + previous], previous = tempValues[0], current = tempValues[1];
    return value;
  };
};
  
fib = FibonacciIterator()

fib()
  //=> 1
fib()
  //=> 1
fib()
  //=> 2
fib()
  //=> 3
fib()
  //=> 5
~~~~~~~~
  
A function that starts with a seed and expands it into a data structure is called an *unfold*. It's the opposite of a fold. It's possible to write a generic unfold mechanism, but let's pass on to what we can do with unfolded iterators.

This business of going on forever has some drawbacks. Let's introduce an idea: A function that takes an Iterator and returns another iterator. We can start with `take`, an easy function that returns an iterator that only returns a fixed number of elements:

{:lang="js"}
~~~~~~~~
take = function(iter, numberToTake) {
  var count;
  count = 0;
  return function() {
    if (++count <= numberToTake) {
      return iter();
    } else {
      return void 0;
    }
  };
};

oneToFive = take(NumberIterator(1), 5);

oneToFive();
  //=> 1
oneToFive();
  //=> 2
oneToFive();
  //=> 3
oneToFive();
  //=> 4
oneToFive();
  //=> 5
oneToFive();
  //=> undefined
~~~~~~~~
  
With `take`, we can do things like return the squares of the first five numbers:

{:lang="js"}
~~~~~~~~
square(take(NumberIterator(1), 5))

  //=> [ 1,
  //     4,
  //     9,
  //     16,
  //     25 ]
~~~~~~~~
  
How about the squares of the odd numbers from the first five numbers?

{:lang="js"}
~~~~~~~~
square(odds(take(NumberIterator(1), 5)))
  //=> TypeError: object is not a function
~~~~~~~~
  
Bzzzt! Our `odds` function returns an array, not an iterator.

{:lang="js"}
~~~~~~~~
square(take(odds(NumberIterator(1)), 5))
  //=> RangeError: Maximum call stack size exceeded
~~~~~~~~
  
You can't take the first five odd numbers at all, because `odds` tries to get the entire set of numbers and accumulate the odd ones in an array. This can be fixed. For unfolds and other infinite iterators, we need more functions that transform one iterator into another:

{:lang="js"}
~~~~~~~~

function iteratorMap (iter, unaryFn) {
  return function() {
    var element;
    element = iter();
    if (element != null) {
      return unaryFn.call(element, element);
    } else {
      return void 0;
    }
  };
};

function squaresIterator (iter) {
  return iteratorMap(iter, function(n) {
    return n * n;
  });
};

function iteratorFilter (iter, unaryPredicateFn) {
  return function() {
    var element;
    element = iter();
    while (element != null) {
      if (unaryPredicateFn.call(element, element)) {
        return element;
      }
      element = iter();
    }
    return void 0;
  };
};

function oddsFilter (iter) {
  return iteratorFilter(iter, odd);
};
~~~~~~~~
  
Now we can do things like take the sum of the first five odd squares of fibonacci numbers:

{:lang="js"}
~~~~~~~~
foldingSum(take(oddsFilter(squaresIterator(FibonacciIterator())), 5))
  //=> 205
~~~~~~~~
  
This solution composes the parts we already have, rather than writing a tricky bit of code with ifs and whiles and boundary conditions.

### summary

Untangling the concerns of how to iterate over data from what to do with data leads us to thinking of iterators and working directly with iterators. For example, we can map and filter iterators rather than trying to write separate map and filter functions or methods for each type of data structure. This leads to the possibility of working with lazy or infinite iterators.

### caveat

Please note that unlike most of the other functions discussed in this book, iterators are *stateful*. There are some important implications of stateful functions. One is that while functions like `take(...)` appear to create an entirely new iterator, in reality they return a decorated reference to the original iterator. So as you traverse the new decorator, you're changing the state of the original!

For all intents and purposes, once you pass an iterator to a function, you can expect that you no longer "own" that iterator, and that its state either has changed or will change.