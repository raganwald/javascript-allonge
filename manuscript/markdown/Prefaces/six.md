## JavaScript Allongé, the "Six" Edition

This is the original version of JavaScript Allongé. It was written for ECMAScript-5. The overarching theme of the book and approach to programming is as valid today as it was when ECMAScript-5 was the standard for JavaScript, however the details of how best to implement these ideas have changed.

For example, in ECMAScript-5, we write:

    function maybe (fn) {
      return function () {
        var i;
        
        if (arguments.length === 0) {
          return
        }
        else {
          for (i = 0; i < arguments.length; ++i) {
            if (arguments[i] == null) return
          }
          return fn.apply(this, arguments)
        }
      }
    }
    
But in ECMAScript-2015, we write:

    const maybe = (fn) =>
      function (...args) {
        if (args.length === 0) {
          return
        }
        else {
          for (let arg in args) {
            if (arg == null) return;
          }
          return fn.apply(this, args)
        }
      }

Other changes include the introduction of the `class` keyword, which leads to a greater interest in working with objects, prototypes, and functions.

For this reason, this original manuscript has been retired, and a substantially updated edition, [JavaScript Allongé, the "Six" Edition][j6] has been written. Please enjoy this copy, but be sure to read the latest edition.

[j6]: https://leanpub.com/javascriptallongesix