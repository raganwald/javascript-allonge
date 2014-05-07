## From Let to Modules {#modules}

### transient let

In the section on [let and Var](#let), we learned that we can create a new environment any time we want by combining a function definition with a function invocation, to whit:

    (function () {
      //
    })();

Because this function is invoked, if it contains a return statement, it evaluates to a value of some kind. So you can, for example, write something like:

    var factorialOfTwentyFive = (function () {
      var factorial = function (num) {
        if (num  <  2 ) {
          return 1
        }
        else return num * factorial (num - 1)
      }
      return factorial(25)
    })();

This could have been written using a named function to avoid the need for a let, but as we'll see in the [memoize](#recipe) later, sometimes there's good reason to write it like this. In any event, our let serves to create a scope for the `factorial` function. Presumably we write it this way to signal that we do not want to use it elsewhere, so putting it inside of a let keeps it invisible from the rest of the code.

You'll note that once we've calculated the factorial of 25, we have no further need for the environment of the function, so it will   be thrown away. This is what we might call a **transient let**: Nothing we bind in the `let` is returned from the `let` or otherwise passed out through assignment, so the environment of the let is discarded when the let finishes being evaluated.

### private closure

The transient let only uses its environment to generate the result, then it can be discarded. Another type of let is the **private closure**. This let returns a closure that references one or more bindings in the let's environment. For example:

    var counter = (function () {
      var value = 0;
      
      return function () {
        return value++
      }
    })();
    
    counter()
      //=> 0
      
    counter()
      //=> 1
      
    counter()
      //=> 2

`counter` is bound to a function closure that references the binding `value` in the let's environment. So the environment isn't transient, it remains active until the function bound to the name `counter` is discarded. Private closures are often used to manage state as we see in the counter example, but they can also be used for helper functions.

For example, this date format function cribbed from somewhere or other has a helper function that isn't used anywhere else:

    function formatDate (time) {
      var date;

      if (time) {
        date = unformattedDate(time);
        // Have to massage the date because
        // we can't create a date 
        // based on GMT which the server gives us

        if (!(/-\d\d:\d\d/.test(time))) {
          date.setHours(
            date.getHours() - date.getTimezoneOffset()/60);
        }

        var diff = (
            (new Date()).getTime() - date.getTime()
          ) / 1000;
        day_diff = Math.floor(diff / 86400);

        if ( isNaN(day_diff) || day_diff < 0  )
          return;

        return '<span title="' + date.toUTCString() + '">' + (day_diff == 0 && (
            diff < 60 && "just now" ||
            diff < 120 && "1 minute ago" ||
            diff < 3600 && Math.floor( diff / 60 ) + " minutes ago" ||
            diff < 7200 && "1 hour ago" ||
            diff < 86400 && Math.floor( diff / 3600 ) + " hours ago") ||
          day_diff == 1 && "Yesterday" ||
          day_diff < 7 && day_diff + " days ago" ||
          day_diff < 31 && Math.ceil( day_diff / 7 ) + " weeks ago" ||
          (day_diff < 360 && day_diff >= 31) && Math.ceil(day_diff / 31) + 
            ' month' + (day_diff == 31 ? '' : 's') + ' ago' ||
            day_diff > 360 && Math.floor( day_diff / 360) + " years " + 
            Math.floor(day_diff%360/32) + " months ago") + '</span>';
      }
      else return '-'
      
      function unformattedDate (time) {
        return new Date((time || "").replace(/[-+]/g,"/").
          replace(/[TZ]/g," ").replace(/\/\d\d:\d\d/, ''));
      }
    }
    
Every time we call `formatDate`, JavaScript will create an entirely new `unformattedDate` function. That is not necessary, since it's a pure function. In theory, a sufficiently smart interpreter would notice this and only create one function. In practice, we can rewrite it to use a private closure and only create one helper function:

    var formatDate = (function () {
      return function (time) {
        var date;

        if (time) {
          date = unformattedDate(time);
          // Have to massage the date because we can't create a date 
          // based on GMT which the server gives us

          if (!(/-\d\d:\d\d/.test(time))) {
            date.setHours(date.getHours() - date.getTimezoneOffset()/60);
          }

          var diff = ((new Date()).getTime() - date.getTime()) / 1000;
          day_diff = Math.floor(diff / 86400);

          if ( isNaN(day_diff) || day_diff < 0  )
            return;

          return '<span title="' + date.toUTCString() + '">' + (day_diff == 0 && (
              diff < 60 && "just now" ||
              diff < 120 && "1 minute ago" ||
              diff < 3600 && Math.floor( diff / 60 ) + " minutes ago" ||
              diff < 7200 && "1 hour ago" ||
              diff < 86400 && Math.floor( diff / 3600 ) + " hours ago") ||
            day_diff == 1 && "Yesterday" ||
            day_diff < 7 && day_diff + " days ago" ||
            day_diff < 31 && Math.ceil( day_diff / 7 ) + " weeks ago" ||
            (day_diff < 360 && day_diff >= 31) && Math.ceil(day_diff / 31) +
              ' month' + (day_diff == 31 ? '' : 's') + ' ago' ||
              day_diff > 360 && Math.floor( day_diff / 360) + 
              " years " + Math.floor(day_diff%360/32) + " months ago") + '</span>';
        }
        else return '-'
      }
      
      function unformattedDate (time) {
        return new Date((time || "").replace(/[-+]/g,"/").replace(/[TZ]/g," ").replace(/\/\d\d:\d\d/, ''));
      }
    })();

The function `unformattedDate` is still private to `formatDate`, but now we no longer need to construct an entirely new function every time `formatDate` is called.

### modules

Once the power of creating a new environment with a let (or "immediately invoked function expression") is tasted, it won't be long before you find yourself building modules with lets. Modules are any collection of functions that have some private and some public-facing elements.

Consider a module designed to draw some bits on a virtual screen. The public API consists of a series of draw functions. The private API includes a series of helper functions. This is exactly like the **private closure**, the only difference being that we want to return multiple public functions instead of just one.

It looks like this:

    var DrawModule = (function () {
      
      return {
        drawLine: drawLine,
        drawRect: drawRect,
        drawCircle: drawCircle
      }
      
      // public methods
      function drawLine(screen, leftPoint, rightPoint) { ... }
      function drawRect(screen, topLeft, bottomRight) { ... }
      function drawCircle(screen, center, radius) { ... }
      
      // private helpers
      function bitBlt (screen, ...) { ... }
      function resize (screen, ...) { ... }
      
    })();
    
You can then call the public functions using `DrawModule.drawCircle(...)`. The concept scales up to include the concept of state (such as setting default line styles), but when you look at it, it's really just the private closure let with a little more complexity in the form of returning an object with more than one function.
