## Once

`once` is an extremely helpful combinator. It ensures that a function can only be called, well, *once*. Here's the recipe:

    function once (fn) {
      var done = false;
      
      return function () {
        return done ? void 0 : ((done = true), fn.apply(this, arguments))
      }
    }

Very simple! You pass it a function, and you get a function back. That function will call your function once, and thereafter will return `undefined` whenever it is called. Let's try it:

    var askedOnBlindDate = once(function () {
      return 'sure, why not?'
    });
    
    askedOnBlindDate()
      //=> 'sure, why not?'
      
    askedOnBlindDate()
      //=> undefined
      
    askedOnBlindDate()
      //=> undefined

It seems some people will only try blind dating once. But you do have to be careful that you are calling the function `once` returns multiple times. If you keep calling `once`, you'll get a new function that executes once, so you'll keep calling your function:

    once(function () {
      return 'sure, why not?'
    })()
      //=> 'sure, why not?'

    once(function () {
      return 'sure, why not?'
    })()
      //=> 'sure, why not?'

This is expected, but sometimes not what we want. So we must either be careful with our code, or use a variation, the [named once](#named-once) recipe.
