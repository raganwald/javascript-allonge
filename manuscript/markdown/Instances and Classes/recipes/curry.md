## Currying

We discussed currying in [Closures](#closures) and [Partial Application, Binding, and Currying](#pabc). Here is the recipe for a higher-order function that curries its argument function. It works with any function that has a fixed length, and it lets you provide as many arguments as you like.

    var __slice = Array.prototype.slice;
    
    function curry (fn) {
      var arity = fn.length;
      
      return given([]);
      
      function given (argsSoFar) {
        return function helper () {
          var updatedArgsSoFar = argsSoFar.concat(__slice.call(arguments, 0));
          
          if (updatedArgsSoFar.length >= arity) {
            return fn.apply(this, updatedArgsSoFar)
          }
          else return given(updatedArgsSoFar)
        }
      }
      
    }
    
    function sumOfFour (a, b, c, d) { return a + b + c + d }
    
    var curried = curry(sumOfFour);
    
    curried(1)(2)(3)(4)
      //=> 10
    
    curried(1,2)(3,4)
      //=> 10
    
    curried(1,2,3,4)
      //=> 10

We saw earlier that you can derive a curry function from a partial application function. The reverse is also true:

    function callLeft (fn) {
      return curry(fn).apply(null, __slice.call(arguments, 1))
    }
    
    callLeft(sumOfFour, 1)(2, 3, 4)
      //=> 10
    
    callLeft(sumOfFour, 1, 2)(3, 4)
      //=> 10
  
(This is a little different from the previous left partial functions in that it returns a *curried* function).