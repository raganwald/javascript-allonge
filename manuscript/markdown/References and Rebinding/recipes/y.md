## Why? {#y}

This is the [canonical Y Combinator][y]:

    function Y (f) {
      return ((function (x) {
        return f(function (v) {
          return x(x)(v);
        });
      })(function (x) {
        return f(function (v) {
          return x(x)(v);
        });
      }));
    }

You use it like this:

    var factorial = Y(function (fac) {
      return function (n) {
        return (n == 0 ? 1 : n * fac(n - 1));
      }
    });
 
    factorial(5)
      //=> 120

Why? It enables you to make recursive functions without needing to bind a function to a name in an environment. This has little practical utility in JavaScript, but in combinatory logic it's essential: With fixed-point combinators it's possible to compute everything computable without binding names.

So again, why include the recipe? Well, besides all of the practical applications that combinators provide, there is this little thing called *The joy of working things out.*

There are many explanations of the Y Combinator's mechanism on the internet, but resist the temptation to read any of them: Work it out for yourself. Use it as an excuse to get familiar with your environment's debugging facility. A friendly tip: Name some of the anonymous functions inside it to help you decipher stack traces.

Work things out for yourself. And once you've grokked that recipe, this recipe is for a Y Combinator that is a little more idiomatic. Work it out too:

    function Y (fn) {
      var f = function (f) {
        return function () {
          return fn.apply(f, arguments)
        }
      };
      
      return ((function (x) {
        return f(function (v) {
          return x(x)(v);
        });
      })(function (x) {
        return f(function (v) {
          return x(x)(v);
        });
      }));
    }

You use this version like this:

    var factorial = Y(function (n) {
      return (n == 0 ? 1 : n * this(n - 1));
    });
 
    factorial(5)

There are certain cases involving nested recursive functions it cannot handle due to the ambiguity of `this`, and obviously it is useless as a method combination, but it is an interesting alternative to the `let` pattern.

[y]: https://en.wikipedia.org/wiki/Fixed-point_combinator#Example_in_JavaScript "Call-by-value fixed-point combinator in JavaScript"