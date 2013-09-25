## Deep Mapping {#deepMapWith}

[mapWith](#mapWith) is an excellent tool, but from time to time you will find yourself working with arrays that represent trees rather than lists. For example, here is a partial list of sales extracted from a report of some kind. It's grouped in some mysterious way, and we need to operate on each item in the report.

    var report = 
      [ [ { price: 1.99, id: 1 },
        { price: 4.99, id: 2 },
        { price: 7.99, id: 3 },
        { price: 1.99, id: 4 },
        { price: 2.99, id: 5 },
        { price: 6.99, id: 6 } ],
      [ { price: 5.99, id: 21 },
        { price: 1.99, id: 22 },
        { price: 1.99, id: 23 },
        { price: 1.99, id: 24 },
        { price: 5.99, id: 25 } ],

      // ...

      [ { price: 7.99, id: 221 },
        { price: 4.99, id: 222 },
        { price: 7.99, id: 223 },
        { price: 10.99, id: 224 },
        { price: 9.99, id: 225 },
        { price: 9.99, id: 226 } ] ];

We could nest some mapWiths, but we humans are tool users. If we can use a stick to extract tasty ants from a hole to eat, we can automate working with arrays:

    function deepMapWith (fn) {
      return function innerdeepMapWith (tree) {
        return Array.prototype.map.call(tree, function (element) {
          if (Array.isArray(element)) {
            return innerdeepMapWith(element);
          }
          else return fn(element);
        });
      };
    };

And now we can use `deepMapWith` on a tree the way we use `mapWith` on a flat array:

    deepMapWith(getWith('price'))(report)
      //=>  [ [ 1.99,
                4.99,
                7.99,
                1.99,
                2.99,
                6.99 ],
              [ 5.99,
                1.99,
                1.99,
                1.99,
                5.99 ],
                
              // ...
              
              [ 7.99,
                4.99,
                7.99,
                10.99,
                9.99,
                9.99 ] ]