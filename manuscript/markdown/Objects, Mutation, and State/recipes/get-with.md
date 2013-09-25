## getWith {#getWith}

`getWith` is a very simple function. It takes the name of an attribute and returns a function that extracts the value of that attribute from an object:

    function getWith (attr) {
      return function (object) { return object[attr]; }
    }

You can use it like this:

    var inventory = {
      apples: 0,
      oranges 144,
      eggs: 36
    };
    
    getWith('oranges')(inventory)
      //=> 144

This isn't much of a recipe yet. But let's combine it with [mapWith](#mapWith):

    var inventories = [
      { apples: 0, oranges: 144, eggs: 36 },
      { apples: 240, oranges: 54, eggs: 12 },
      { apples: 24, oranges: 12, eggs: 42 }
    ];
  
    mapWith(getWith('oranges'))(inventories)
      //=> [ 144, 54, 12 ]
    
That's nicer than writing things out "longhand:"

    mapWith(function (inventory) { return inventory.oranges })(inventories)
      //=> [ 144, 54, 12 ]

`getWith` plays nicely with [maybe](#maybe) as well. Consider a sparse array. You can use:

    mapWith(maybe(getWith('oranges')))
    
To get the orange count from all the non-null inventories in a list.

### what's in a name?

Why is this called `getWith`? Consider this function that is common in languages that have functions and dictionaries but not methods:

    function get (object, attr) {
      return object[attr];
    };
    
You might ask, "Why use a function instead of just using `[]`?" The answer is, we can manipulate functions in ways that we can't manipulate syntax. For example, do you remember from [filp](#flip) that we can define `mapWith` from `map`?

    var mapWith = flip(map);
    
We can do the same thing with `getWith`, and that's why it's named in this fashion:

    var getWith = flip(get)