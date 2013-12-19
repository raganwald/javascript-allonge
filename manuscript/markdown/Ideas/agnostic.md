## New-Agnostic Constructors {#new-agnostic}

JavaScript is inflexible about certain things. One of them is invoking `new` on a constructor. In many of our recipes, we can write functions that can handle a variable number of arguments and use `.apply` to invoke a function. For example:

    function fluent (methodBody) {
      return function () {
        methodBody.apply(this, arguments);
        return this
      }
    }

You can't do the same thing with calling a constructor. This will not work:

    function User (name, password) {
      this.name = name || 'Untitled';
      this.password = password
    };
    
    function withDefaultPassword () {
      var args = Array.prototype.slice.call(arguments, 0);
      args[1] = 'swordfish';
      return new User.apply(this, args);
    } 
    
    withDefaultPassword('James')
      //=> TypeError: function apply() { [native code] } is not a constructor

Another weakness of constructors is that if you call them without using `new`, you usually get nonsense:

    User('James', 'swordfish')
      //=> undefined

In David Herman's [Effective JavaScript][ejs], he describes the "New-Agnostic Constructor Pattern." He gives several variations, but the simplest is this:

    function User (name, password) {
      if (!(this instanceof User)) {
        return new User(name, password);
      }
      this.name = name || 'Untitled';
      this.password = password
    };

Now you can call the constructor without the `new` keyword:

    User('James', 'swordfish')
      //=> { name: 'James', password: 'swordfish' }
  
This in turn opens up the possibility of doing dynamic things with constructors that didn't work when you were forced to use `new`:
    
    function withDefaultPassword () {
      var args = Array.prototype.slice.call(arguments, 0);
      args[1] = 'swordfish';
      return User.apply(this, args);
    } 
    
    withDefaultPassword('James')
      //=> { name: 'James', password: 'swordfish' }
      
(The pattern above has a tradeoff: It works for all circumstances except when you want to set up an inheritance hierarchy.)

[ejs]: http://www.amazon.com/gp/product/B00AC1RP14/ref=as_li_ss_tl?ie=UTF8&camp=1789&creative=390957&creativeASIN=B00AC1RP14&linkCode=as2&tag=raganwald001-20 "Effective JavaScript: 68 Specific Ways to Harness the Power of JavaScript"

## Another New-Agnostic Constructor Pattern

Here's another way to write a new-agnostic constructor:

    function User (name, password) {
      var self = this instanceof User ? this : new User();
      if (name != null) {
        self.name = name;
        self.password = password;
      }
      return self;
    };
    
The principle is that the constructor initializes an object assigned to the variable `self` and returns it. When you call the constructor with `new`, then `self` will be assigned the current context. But if you call this constructor as a standard function, then it will call itself without parameters and assign the newly created User to `self`.
