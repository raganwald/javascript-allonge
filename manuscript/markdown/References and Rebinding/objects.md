## References and Objects {#objects}

JavaScript also provides objects. The word "object" is loaded in programming circles, due to the widespread use of the term "object-oriented programming" that was coined by Alan Kay but has since come to mean many, many things to many different people.

In JavaScript, an object[^pojo] is a map from names to values, a lot like an environment. The most common syntax for creating an object is simple:

    { year: 2012, month: 6, day: 14 }
    
Two objects created this way have differing identities, just like arrays:

    { year: 2012, month: 6, day: 14 } === { year: 2012, month: 6, day: 14 }
      //=> false
      
Objects use `[]` to access the values by name, using a string:

    { year: 2012, month: 6, day: 14 }['day']
      //=> 14

Values contained within an object work just like values contained within an array:

    var unique = function () {
                    return function () {}
                  },
        x = unique(),
        y = unique(),
        z = unique(),
        o = { a: x, b: y, c: z };
        
    o['a'] === x && o['b'] === y && o['c'] === z
      //=> true
      
Names needn't be alphanumeric strings. For anything else, enclose the label in quotes:

    { 'first name': 'reginald', 'last name': 'lewis' }['first name']
      //=> 'reginald'
      
If the name is an alphanumeric string conforming to the same rules as names of variables, there's a simplified syntax for accessing the values:

    { year: 2012, month: 6, day: 14 }['day'] ===
        { year: 2012, month: 6, day: 14 }.day
      //=> true
      
All containers can contain any value, including functions or other containers:

    var Mathematics = { 
      abs: function (a) {
             return a < 0 ? -a : a
           }
    };
            
    Mathematics.abs(-5)
      //=> 5
      
Funny we should mention `Mathematics`. If you recall, JavaScript provides a global environment that contains some existing object that have handy functions you can use. One of them is called `Math`, and it contains functions for `abs`, `max`, `min`, and many others. Since it is always available, you can use it in any environment provided you don't shadow `Math`.

    Math.abs(-5)
      //=> 5
      
[^pojo]: Tradition would have us call objects that don't contain any functions "POJOs," meaning Plain Old JavaScript Objects.