## pluckWith {#pluck}

This pattern of combining [mapWith](#mapWith) and [getWith](#getWith) is very frequent in JavaScript code. So much so, that we can take it up another level:

{:lang="js"}
~~~~~~~~
function pluckWith (attr) {
  return mapWith(getWith(attr))
}
~~~~~~~~

Or even better:

{:lang="js"}
~~~~~~~~
var pluckWith = compose(mapWith, getWith);
~~~~~~~~

And now we can write:

{:lang="js"}
~~~~~~~~
pluckWith('eggs')(inventories)
  //=> [ 36, 12, 42 ]
~~~~~~~~

Libraries like [Underscore] provide `pluck`, the flipped version of `pluckWith`:

{:lang="js"}
~~~~~~~~
_.pluck(inventories, 'eggs')
  //=> [ 36, 12, 42 ]
~~~~~~~~

Our recipe is terser when you want to name a function:

{:lang="js"}
~~~~~~~~
var eggsByStore = pluckWith('eggs');
~~~~~~~~

vs.

{:lang="js"}
~~~~~~~~
function eggsByStore (inventories) {
  return _.pluck(inventories, 'eggs')
}
~~~~~~~~

And of course, if we have `pluck` we can use [flip](#flip) to derive `pluckWith`:

{:lang="js"}
~~~~~~~~
var pluckWith = flip(_.pluck);
~~~~~~~~

[Underscore]: http://underscorejs.org
