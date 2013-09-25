## Encapsulating State with Closures {#encapsulation}

> OOP to me means only messaging, local retention and protection and hiding of state-process, and extreme late-binding of all things.--[Alan Kay][oop]

[oop]: http://userpage.fu-berlin.de/~ram/pub/pub_jf47ht81Ht/doc_kay_oop_en

We're going to look at encapsulation using JavaScript's functions and objects. We're not going to call it object-oriented programming, mind you, because that would start a long debate. This is just plain encapsulation,[^encapsulation] with a dash of information-hiding.

[^encapsulation]: "A language construct that facilitates the bundling of data with the methods (or other functions) operating on that data."--[Wikipedia]

[Wikipedia]: https://en.wikipedia.org/wiki/Encapsulation_(object-oriented_programming)

### what is hiding of state-process, and why does it matter?

> In computer science, information hiding is the principle of segregation of the design decisions in a computer program that are most likely to change, thus protecting other parts of the program from extensive modification if the design decision is changed. The protection involves providing a stable interface which protects the remainder of the program from the implementation (the details that are most likely to change).

> Written another way, information hiding is the ability to prevent certain aspects of a class or software component from being accessible to its clients, using either programming language features (like private variables) or an explicit exporting policy.

> --[Wikipedia][ih]

[ih]:https://en.wikipedia.org/wiki/Information_hiding "Information hiding"

Consider a [stack] data structure. There are three basic operations: Pushing a value onto the top (`push`), popping a value off the top (`pop`), and testing to see whether the stack is empty or not (`isEmpty`). These three operations are the stable interface.

[stack]: https://en.wikipedia.org/wiki/Stack_(data_structure)

Many stacks have an array for holding the contents of the stack. This is relatively stable. You could substitute a linked list, but in JavaScript, the array is highly efficient. You might need an index, you might not. You could grow and shrink the array, or you could allocate a fixed size and use an index to keep track of how much of the array is in use. The design choices for keeping track of the head of the list are often driven by performance considerations.

If you expose the implementation detail such as whether there is an index, sooner or later some programmer is going to find an advantage in using the index directly. For example, she may need to know the size of a stack. The ideal choice would be to add a `size` function that continues to hide the implementation. But she's in a hurry, so she reads the `index` directly. Now her code is coupled to the existence of an index, so if we wish to change the implementation to grow and shrink the array, we will break her code.

The way to avoid this is to hide the array and index from other code and only expose the operations we have deemed stable. If and when someone needs to know the size of the stack, we'll add a `size` function and expose it as well.

Hiding information (or "state") is the design principle that allows us to limit the coupling between components of software.

### how do we hide state using javascript? {#hiding-state}

We've been introduced to JavaScript's objects, and it's fairly easy to see that objects can be used to model what other programming languages call (variously) records, structs, frames, or what-have-you. And given that their elements are mutable, they can clearly model state.

Given an object that holds our state (an array and an index[^length]), we can easily implement our three operations as functions. Bundling the functions with the state does not require any special "magic" features. JavaScript objects can have elements of any type, including functions:

    var stack = (function () {
      var obj = {
        array: [],
        index: -1,
        push: function (value) {
          return obj.array[obj.index += 1] = value
        },
        pop: function () {
          var value = obj.array[obj.index];
          obj.array[obj.index] = void 0;
          if (obj.index >= 0) { 
            obj.index -= 1 
          }
          return value
        },
        isEmpty: function () {
          return obj.index < 0
        }
      };
      
      return obj;
    })();

    stack.isEmpty()
      //=> true
    stack.push('hello')
      //=> 'hello'
    stack.push('JavaScript')
     //=> 'JavaScript'
    stack.isEmpty()
      //=> false
    stack.pop()
     //=> 'JavaScript'
    stack.pop()
     //=> 'hello'
    stack.isEmpty()
      //=> true
      
### method-ology

In this text, we lurch from talking about "functions that belong to an object" to "methods." Other languages may separate methods from functions very strictly, but in JavaScript every method is a function but not all functions are methods.

The view taken in this book is that a function is a method of an object if it belongs to that object and interacts with that object in some way. So the functions implementing the operations on the stack are all absolutely methods of the stack.

But these two wouldn't be methods. Although they "belong" to an object, they don't interact with it:

    {
      min: function (x, y) {
        if (x < y) {
          return x
        }
        else {
          return y
        }
      } 
      max: function (x, y) {
        if (x > y) {
          return x
        }
        else {
          return y
        }
      } 
    }

### hiding state

Our stack does bundle functions with data, but it doesn't hide its state. "Foreign" code could interfere with its array or index. So how do we hide these? We already have a closure, let's use it:

    var stack = (function () {
      var array = [],
          index = -1;
          
      return {
        push: function (value) {
          array[index += 1] = value
        },
        pop: function () {
          var value = array[index];
          if (index >= 0) {
            index -= 1
          }
          return value
        },
        isEmpty: function () {
          return index < 0
        }
      }
    })();

    stack.isEmpty()
      //=> true
    stack.push('hello')
      //=> 'hello'
    stack.push('JavaScript')
     //=> 'JavaScript'
    stack.isEmpty()
      //=> false
    stack.pop()
     //=> 'JavaScript'
    stack.pop()
     //=> 'hello'
    stack.isEmpty()
      //=> true
      
![Coffee DOES grow on trees](images/coffee-trees-1200.jpg)

We don't want to repeat this code every time we want a stack, so let's make ourselves a "stack maker." The temptation is to wrap what we have above in a function:

    var StackMaker = function () {
      return (function () {
        var array = [],
            index = -1;
          
        return {
          push: function (value) {
            array[index += 1] = value
          },
          pop: function () {
            var value = array[index];
            if (index >= 0) {
              index -= 1
            }
            return value
          },
          isEmpty: function () {
            return index < 0
          }
        }
      })() 
    }

But there's an easier way :-)

    var StackMaker = function () {
      var array = [],
          index = -1;
          
      return {
        push: function (value) {
          array[index += 1] = value
        },
        pop: function () {
          var value = array[index];
          if (index >= 0) {
            index -= 1
          }
          return value
        },
        isEmpty: function () {
          return index < 0
        }
      }
    };

    stack = StackMaker()

Now we can make stacks freely, and we've hidden their internal data elements. We have methods and encapsulation, and we've built them out of JavaScript's fundamental functions and objects. In [Instances and Classes](#methods), we'll look at JavaScript's support for class-oriented programming and some of the idioms that functions bring to the party.

A> ### is encapsulation "object-oriented?"
A>
A> We've built something with hidden internal state and "methods," all without needing special `def` or `private` keywords. Mind you, we haven't included all sorts of complicated mechanisms to support inheritance, mixins, and other opportunities for debating the nature of the One True Object-Oriented Style on the Internet.
A>
A> Then again, the key lesson experienced programmers repeat--although it often falls on deaf ears--is [Composition instead of Inheritance](http://www.c2.com/cgi/wiki?CompositionInsteadOfInheritance). So maybe we aren't missing much.

[^length]: Yes, there's another way to track the size of the array, but we don't need it to demonstrate encapsulation and hiding of state.