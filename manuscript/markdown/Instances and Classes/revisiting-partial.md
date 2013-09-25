## Partial Application, Binding, and Currying {#pabc}

Now that we've seen how function contexts work, we can revisit the subject of partial application. Recall our recipe for a generalized left partial application:

    var callLeft = variadic( function (fn, args) {
      return variadic( function (remainingArgs) {
        return fn.apply(this, args.concat(remainingArgs))
      })
    })
    
`Function.prototype.bind` can sometimes be used to accomplish the same thing, but will be much faster. For example, instead of:

    function add (verb, a, b) { 
      return "The " + verb + " of " + a + ' and ' + b + ' is ' + (a + b) 
    }
    
    var sumFive = callLeft(add, 'sum', 5);
    
    sumFive(6)
      //=> 'The sum of 5 and 6 is 11'
      
You can write:

    var totalSix = add.bind(null, 'total', 6);
    
    totalSix(5)
      //=> 'The total of 6 and 5 is 11'

The catch is the first parameter to `.bind`: It sets the context. If you write functions that don't use the context, like our `.add`, You can use `.bind` to do left partial application. But if you want to partially apply a method or other function where the context must be preserved, you can't use `.bind`. You can use the recipes given in *JavaScript Allongé* because they preserve the context properly.

Typically, context matters when you want to perform partial application on methods. So for an extremely simple example, we often use `Array.prototype.slice` to convert `arguments` to an array. So instead of:

    var __slice = Array.prototype.slice;
    
    var array = __slice.call(arguments, 0);
    
We could write:

    var __copy = callFirst(Array.prototype.slice, 0);
    
    var array = __copy.call(arguments)

The other catch is that `.bind` only does left partial evaluation. If you want to do right partial application, you'll need `callLast` or `callRight`.

### currying

The terms "partial application" and "currying" are closely related but not synonymous. Currying is the act of taking a function that takes more than one argument and converting it to an equivalent function taking one argument. How can such a function be equivalent? It works provided that it returns a partially applied function.

Code is, as usual, much clearer than words. Recall:

    function add (verb, a, b) { 
      return "The " + verb + " of " + a + ' and ' + b + ' is ' + (a + b) 
    }
    
    add('sum', 5, '6')
      //=> 'The sum of 5 and 6 is 11'
    
Here is the curried version:

    function addCurried (verb) {
      return function (a) {
        return function (b) {
          return "The " + verb + " of " + a + ' and ' + b + ' is ' + (a + b) 
        }
      }
    }
    
    addCurried('total')(6)(5)
      //=> 'The total of 6 and 5 is 11'
      
Currying by hand would be an incredible effort, but its close relationship with partial application means that if you have left partial application, you can derive currying. Or if you have currying, you can derive left partial application. Let's derive currying from `callFirst`. [Recall](#simple-partial):

    var __slice = Array.prototype.slice;
    
    function callFirst (fn, larg) {
      return function () {
        var args = __slice.call(arguments, 0);
        
        return fn.apply(this, [larg].concat(args))
      }
    }

Here's a function that curries any function with two arguments:

    function curryTwo (fn) {
      return function (x) {
        return callFirst(fn, x)
      }
    }
    
    function add2 (a, b) { return a + b }
    
    curryTwo(add)(5)(6)
      //=> 11

And from there we can curry a function with three arguments:

    function curryThree (fn) {
      return function (x) {
        return curryTwo(callFirst(fn, x))
      }
    }

    function add3 (verb, a, b) { 
      return "The " + verb + " of " + a + ' and ' + b + ' is ' + (a + b) 
    }
    
    curryThree(add3)('sum')(5)(6)
      //=> 'The sum of 5 and 6 is 11'
      
We'll develop a generalized curry function in the recipes. But to summarize the difference between currying and partial application, currying is an operation that transforms a function taking two or more arguments into a function that takes a single argument and partially applies it to  the function and then curries the rest of the arguments.
    