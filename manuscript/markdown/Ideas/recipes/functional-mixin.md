## A Functional Mixin Factory

[Functional Mixins](#functional-mixins) extend an existing class's prototype. Let's start with:

    function Todo (name) {
      var self = this instanceof Todo
                 ? this
                 : new Todo();
      self.name = name || 'Untitled';
      self.done = false;
    };
    
    Todo.prototype.do = fluent( function () {
      this.done = true;
    });
    
    Todo.prototype.undo = fluent( function () {
      this.done = false;
    });

We wish to decorate this with:

    ({
      setLocation: fluent( function (location) {
        this.location = location;
      }),
      getLocation: function () { return this.location; }
    });
    
Instead of writing:

    function becomeLocationAware () {
      this.setLocation = fluent( function (location) {
        this.location = location;
      });
      
      this.getLocation = function () { return this.location; };
      
      return this;
    };

We'll extract the decoration into a parameter like this:

    function mixin (decoration) {
      extend(this, decoration);
      return this;
    };

And then "curry" the function manually like this:

    function mixin (decoration) {

      return function () {
        extend(this, decoration);
        return this;
      };
      
    };
    
We can try it:

    var MixinLocation = mixin({
      setLocation: fluent( function (location) {
        this.location = location;
      }),
      getLocation: function () { return this.location; }
    });
    
    MixinLocation.call(Todo.prototype);
    
    new Todo('Paint Bedroom').setLocation('Home');
      //=> { name: 'Paint Bedroom',
      //     done: false,
      //     location: 'Home'

Success! Our `mixin` function makes functional mixins. A final refinement is to make it "context-agnostic," so that we can write either `MixinLocation.call(Todo.prototype)` or `MixinLocation(Todo.prototype)`:

    function mixin (decoration) {

      return function decorate () {
        if (arguments[0] !=== void 0) {
          return decorate.call(arguments[0]);
        }
        else {
          extend(this, decoration);
          return this;
        };
      };
      
    };