## Iterator Recipes

### iterators for standard data structures

Note: Despite having capitalized names, iterators are not meant to be used with the `new` keyword.

{:lang="js"}
~~~~~~~~
function FlatArrayIterator (array) {
  var index;
  index = 0;
  return function() {
    return array[index++];
  };
};

function RecursiveArrayIterator (array) {
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
~~~~~~~~

### unfolding iterators

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
~~~~~~~~

### decorators for slicing iterators

{:lang="js"}
~~~~~~~~
function take (iter, numberToTake) {
  var count = 0;
  return function() {
    if (++count <= numberToTake) {
      return iter();
    } else {
      return void 0;
    }
  };
};

function drop (iter, numberToDrop) {
  while (numberToDrop-- !== 0) {
    iter();
  }
  return iter;
};

function slice (iter, numberToDrop, numberToTake) {
  var count = 0;
  while (numberToDrop-- !== 0) {
    iter();
  }
  if (numberToTake != null) {
    return function() {
      if (++count <= numberToTake) {
        return iter();
      } else {
        return void 0;
      }
    };
  }
  else return iter;
};
~~~~~~~~

(`drop` was suggested by Redditor [skeeto](http://www.reddit.com/user/skeeto). His code also cleaned up an earlier version of `slice`.)

### catamorphic decorator

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
~~~~~~~~

### hylomorphic decorators

{:lang="js"}
~~~~~~~~
function map (iter, unaryFn) {
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

function filter (iter, unaryPredicateFn) {
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
~~~~~~~~