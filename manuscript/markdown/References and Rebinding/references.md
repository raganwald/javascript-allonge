### a simple question

Consider this code:

    var x = 'June 14, 1962',
        y = x;
        
    x === y
      //=> true

This makes obvious sense, because we know that strings are a value type, so no matter what expression you use to derive the value 'June 14, 1962', you are going to get a string with the exact same identity.

But what about this code?

    var x = [2012, 6, 14],
        y = x;
        
    x === y
      //=> true

Also true, even though we know that every time we evaluate an expression such as `[2012, 6, 14]`, we get a new array with a new identity. So what is happening in our environments?

### arguments and references

In our discussion of [closures](#closures), we said that environments bind values (like `[2012, 6, 14]`) to names (like `x` and `y`), and that when we use these names as expressions, the name evaluates as the value.

What this means is that when we write something like `y = x`, the name `x` is looked up in the current environment, and its value is a specific array that was created when the expression `[2012, 6, 14]` was first evaluated. We then bind *that exact same value* to the name `y` in a new environment, and thus `x` and `y` are both bound to the exact same value, which is identical to itself.

The same thing happens with binding a variable through a more conventional means of applying a function to arguments:

    var x = [2012, 6, 14];
    
    (function (y) {
      return x === y
    })(x)
      //=> true

`x` and `y` both end up bound to the exact same array, not two different arrays that look the same to our eyes.