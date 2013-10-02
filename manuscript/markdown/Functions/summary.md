## Summary

T> ### Functions
T>
T> * Functions are values that can be part of expressions, returned from other functions, and so forth.
T> * Functions are *reference values*.
T> * Functions are applied to arguments.
T> * The arguments are passed by sharing, which is also called "pass by value."
T> * Function bodies have zero or more expressions.
T> * Function application evaluates to the value of the last expression evaluated or `undefined`.
T> * Function application creates a scope. Scopes are nested and free variable references closed over.
T> * Variables can shadow variables in an enclosing scope.
T> * `let` is an idiom where we create a function and call it immediately in order to bind values to names.
T> * JavaScript uses `var` to bind variables within a function's scope.
