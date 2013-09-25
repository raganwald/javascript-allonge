## pluckWith {#pluck}

This pattern of combining [mapWith](#mapWith) and [getWith](#getWith) is very frequent in JavaScript code. So much so, that we can take it up another level:

    function pluckWith (attr) {
      return mapWith(getWith(attr))
    }
    
Or even better:

    var pluckWith = compose(mapWith, getWith);
    
And now we can write:
    
    pluckWith('eggs')(inventories)
      //=> [ 36, 12, 42 ]
      
Libraries like [Underscore] provide `pluck`, the flipped version of `pluckWith`:

    _.pluck(inventories, 'eggs')
      //=> [ 36, 12, 42 ]

Our recipe is terser when you want to name a function:

    var eggsByStore = pluck('eggs');
    
vs.

    function eggsByStore (inventories) {
      return _.pluck(inventories, 'eggs')
    }
    
And of course, if we have `pluck` we can use [flip](#flip) to derive `pluckWith`:

    var pluckWith = flip(_.pluck);

[Underscore]: http://underscorejs.org