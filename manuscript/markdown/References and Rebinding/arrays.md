## Arguments and Arrays {#arrays}

JavaScript provides two different kinds of containers for values. We've met one already, the array. Let's see how it treats values and identities. For starters, we'll learn how to extract a value from an array. We'll start with a function that makes a new value with a unique identity every time we call it. We already know that every function we create is unique, so that's what we'll use:

    var unique = function () {
                    return function () {}
                  };
    
      unique()
        //=> [Function]
        
      unique() === unique()
        //=> false

Let's verify that what we said about references applies to functions as well as arrays:

      var x = unique(),
          y = x;
          
      x === y
        //=> true

Ok. So what about things *inside* arrays? We know how to create an array with something inside it:

      [ unique() ]
        //=> [ [Function] ]

That's an array with one of our unique functions in it. How do we get something *out* of it?

      var a = [ 'hello' ];
      
      a[0]
        //=> 'hello'

Cool, arrays work a lot like arrays in other languages and are zero-based. The trouble with this example is that strings are value types in JavaScript, so we have no idea whether `a[0]` always gives us the same value back like looking up a name in an environment, or whether it does some magic that tries to give us a new value.

We need to put a reference type into an array. If we get the same thing back, we know that the array stores a reference to whatever you put into it. If you get something different back, you know that arrays store copies of things.[^hunh]

[^hunh]: Arrays in all contemporary languages store references and not copies, so we can be forgiven for expecting them to work the same way in JavaScript. Nevertheless, it's a useful exercise to test things for ourself.

Let's test it:

    var unique = function () {
                    return function () {}
                  },
        x = unique(),
        a = [ x ];
        
    a[0] === x
      //=> true

If we get a value out of an array using the `[]` suffix, it's the exact same value with the same identity. Question: Does that apply to other locations in the array? Yes:

    var unique = function () {
                   return function () {}
                 },
        x = unique(),
        y = unique(),
        z = unique(),
        a = [ x, y, z ];
        
    a[0] === x && a[1] === y && a[2] === z
      //=> true