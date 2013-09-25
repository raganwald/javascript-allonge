## Reassignment and Mutation {#reassignment}

Like most imperative programming languages, JavaScript allows you to re-assign the value of variables. The syntax is familiar to users of most popular languages:

    var age = 49;
    age = 50;
    age
      //=> 50

We took the time to carefully examine what happens with bindings in environments. Let's take the time to explore what happens with reassigning values to variables. The key is to understand that we are rebinding a different value to the same name in the same environment.

So let's consider what happens with a shadowed variable:

    (function () {
      var age = 49;
      (function () {
        var age = 50;
      })();
      return age;
    })()
      //=> 49

Binding `50` to age in the inner environment does not change `age` in the outer environment because the binding of `age` in the inner environment shadows the binding of `age` in the outer environment. We go from:

    {age: 49, '..': global-environment}
    
To:

    {age: 50, '..': {age: 49, '..': global-environment}}
    
Then back to:

    {age: 49, '..': global-environment}

{pagebreak}    
However, if we don't shadow `age` by explicitly using `var`, reassigning it in a nested environment changes the original:

    (function () {
      var age = 49;
      (function () {
        age = 50;
      })();
      return age;
    })()
      //=> 50

Like evaluating variable labels, when a binding is rebound, JavaScript searches for the binding in the current environment and then each ancestor in turn until it finds one. It then rebinds the name in that environment.

![Cupping Grinds](images/cupping.jpg)

### mutation and aliases

Now that we can reassign things, there's another important factor to consider: Some values can *mutate*. Their identities stay the same, but not their structure. Specifically, arrays and objects can mutate. Recall that you can access a value from within an array or an object using `[]`. You can reassign a value using `[]` as well:

    var oneTwoThree = [1, 2, 3];
    oneTwoThree[0] = 'one';
    oneTwoThree
      //=> [ 'one', 2, 3 ]

You can even add a value:

    var oneTwoThree = [1, 2, 3];
    oneTwoThree[3] = 'four';
    oneTwoThree
      //=> [ 1, 2, 3, 'four' ]

You can do the same thing with both syntaxes for accessing objects:

    var name = {firstName: 'Leonard', lastName: 'Braithwaite'};
    name.middleName = 'Austin'
    name
      //=> { firstName: 'Leonard',
      #     lastName: 'Braithwaite',
      #     middleName: 'Austin' }

We have established that JavaScript's semantics allow for two different bindings to refer to the same value. For example:

    var allHallowsEve = [2012, 10, 31]
    var halloween = allHallowsEve;  
      
Both `halloween` and `allHallowsEve` are bound to the same array value within the local environment. And also:

    var allHallowsEve = [2012, 10, 31];
    (function (halloween) {
      // ...
    })(allHallowsEve);

There are two nested environments, and each one binds a name to the exact same array value. In each of these examples, we have created two *aliases* for the same value. Before we could reassign things, the most important point about this is that the identities were the same, because they were the same value.

This is vital. Consider what we already know about shadowing:

    var allHallowsEve = [2012, 10, 31];
    (function (halloween) {
      halloween = [2013, 10, 31];
    })(allHallowsEve);
    allHallowsEve
      //=> [2012, 10, 31]
      
The outer value of `allHallowsEve` was not changed because all we did was rebind the name `halloween` within the inner environment. However, what happens if we *mutate* the value in the inner environment?

    var allHallowsEve = [2012, 10, 31];
    (function (halloween) {
      halloween[0] = 2013;
    })(allHallowsEve);
    allHallowsEve
      //=> [2013, 10, 31]
      
This is different. We haven't rebound the inner name to a different variable, we've mutated the value that both bindings share. Now that we've finished with mutation and aliases, let's have a look at it.
      
T> JavaScript permits the reassignment of new values to existing bindings, as well as the reassignment and assignment of new values to elements of containers such as arrays and objects. Mutating existing objects has special implications when two bindings are aliases of the same value.