## Partial Application {#simple-partial}

In [Building Blocks](#buildingblocks), we discussed partial application, but we didn't write a generalized recipe for it. This is such a common tool that many libraries provide some form of partial application tool. You'll find examples in [Lemonad](https://github.com/fogus/lemonad) from Michael Fogus, [Functional JavaScript](http://osteele.com/sources/javascript/functional/) from Oliver Steele and the terse but handy [node-ap](https://github.com/substack/node-ap) from James Halliday.

These two recipes are for quickly and simply applying a single argument, either the leftmost or rightmost.[^inspired] If you want to bind more than one argument, or you want to leave a "hole" in the argument list, you will need to either use a [generalized partial recipe](#partial), or you will need to repeatedly apply arguments. It is [context](#context)-agnostic.

    var __slice = Array.prototype.slice;
    
    function callFirst (fn, larg) {
      return function () {
        var args = __slice.call(arguments, 0);
        
        return fn.apply(this, [larg].concat(args))
      }
    }

    function callLast (fn, rarg) {
      return function () {
        var args = __slice.call(arguments, 0);
        
        return fn.apply(this, args.concat([rarg]))
      }
    }
    
    function greet (me, you) {
      return "Hello, " + you + ", my name is " + me
    }
    
    var heliosSaysHello = callFirst(greet, 'Helios');
    
    heliosSaysHello('Eartha')
      //=> 'Hello, Eartha, my name is Helios'
      
    var sayHelloToCeline = callLast(greet, 'Celine');
    
    sayHelloToCeline('Eartha')
      //=> 'Hello, Celine, my name is Eartha'
      
As noted above, our partial recipe allows us to create functions that are partial applications of functions that are context aware. We'd need a different recipe if we wish to create partial applications of object methods.

[^inspired]: `callFirst` and `callLast` were inspired by Michael Fogus' [Lemonad](https://github.com/fogus/lemonad). Thanks!