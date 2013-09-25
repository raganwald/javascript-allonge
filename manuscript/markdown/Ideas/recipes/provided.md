## Provided and Except {#provided}

Neither the [before](#before) and [after](#after) decorators can actually terminate evaluation without throwing something. Normal execution always results in the base method being evaluated. The `provided` and `excepting` recipes are combinators that produce method decorators that apply a precondition to evaluating the base method body. If the precondition fails, nothing is returned.

The provided combinator turns a function into a method decorator. The function must evaluate to truthy for the base method to be evaluated:

    function provided (predicate) {
      return function(base) {
        return function() {
          if (predicate.apply(this, arguments)) {
            return base.apply(this, arguments);
          }
        };
      };
    };

`provided` can be used to create named decorators like `maybe`:

    var maybe = provided( function (value) {
      return value != null
    });
  
    SomeModel.prototype.setAttribute = maybe( function (value) {
      this.attribute = value
    });
    
You can build your own domain-specific decorators:

    var whenNamed = provided( function (record) {
      return record.name && record.name.length > 0
    })
  
`except` works identically, but with the logic reversed.

    function except (predicate) {
      return function(base) {
        return function() {
          if (!predicate.apply(this, arguments)) {
            return base.apply(this, arguments);
          }
        };
      };
    };
    
    var exceptAdmin = except( function (user) {
      return user.role.isAdmin()
    });