## Unbinding

One of the specifications for `Function.prototype.bind` is that it creates a binding that cannot be overridden. In other words:

    function myName () { return this.name }
    
    var harpo   = { name: 'Harpo' },
        chico   = { name: 'Chico' },
        groucho = { name: 'Groucho' };
        
    var fh = myName.bind(harpo);
    fh()
      //=> 'Harpo'
    
    var fc = myName.bind(chico);
    fc()
      //=> 'Chico'

This looks great. But what happens if we attempt to **re**-bind a bound function, either with `bind` or `.call`?

    var fhg = fh.bind(groucho);
    fhg()
      //=> 'Harpo'
      
    fc.call(groucho)
      //=> 'Chico'
      
    fh.apply(groucho, [])
      //=> 'Harpo'
      
Bzzt! You cannot override the context of a function that has already been bound, even if you're creating a new function with `.bind`. You also don't want to roll your own `bind` function that allows rebinding, lest you be bitten by someone else's code that expects that a bound function cannot be rebound. (One such case is where bound functions--such as callbacks--are stored in an array. Evaluating `callbacks[index]()` will override the bound context with the array unless the context cannot be overridden.)[^reddit]

### the recipe

Our version of `bind` memoizes the original function so that you can later call `unbind` to restore it for rebinding.

    var unbind = function unbind (fn) {
      return fn.unbound ? unbind(fn.unbound()) : fn
    };
   
    function bind (fn, context, force) {
      var unbound, bound;
      
      if (force) {
        fn = unbind(fn)
      }
      bound = function () {
        return fn.apply(context, arguments)
      };
      bound.unbound = function () {
        return fn;
      };
      
      return bound;
    }

    function myName () { return this.name }
    
    var harpo   = { name: 'Harpo' },
        chico   = { name: 'Chico' },
        groucho = { name: 'Groucho' };
        
    var fh = bind(myName, harpo);
    fh()
      //=> 'Harpo'
    
    var fc = bind(myName, chico);
    fc()
      //=> 'Chico'

    var fhg = bind(fh, groucho);
    fhg()
      //=> 'Harpo'

    var fhug = bind(fh, groucho, true);
    fhug()
      //=> 'Groucho'

    var fhug2 = bind(unbind(fh), groucho);
    fhug()
      //=> 'Groucho'
      
    fc.unbound().call(groucho)
      //=> 'Groucho'
      
    unbind(fh).apply(groucho, [])
      //=> 'Groucho'
      
[walled garden]: https://github.com/raganwald/homoiconic/blob/master/2012/12/walled-gardens.md#programmings-walled-gardens
[^reddit]: Isnotlupus on Reddit suggested [this line of thinking](http://www.reddit.com/r/javascript/comments/15ix7s/weak_binding_in_javascript/c7n10yd) against "weak binding" functions.