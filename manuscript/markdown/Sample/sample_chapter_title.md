# Sample: Instances and Classes {#methods}

![Other languages call their objects "beans," but serve extra-weak coffee in an attempt to be all things to all people](images/beans1.jpg)

As discussed in "Rebinding and References" and again in "Encapsulating State," JavaScript objects are very simple, yet the combination of objects, functions, and closures can create powerful data structures. That being said, there are language features that cannot be implemented with Plain Old JavaScript Objects, functions, and closures[^turing].

[^turing]: Since the JavaScript that we have presented so far is [computationally universal](https://en.wikipedia.org/wiki/Turing_completeness "Computational Universality and Turing Completeness"), it is possible to perform any calculation with its existing feature set, including emulating any other programming language. Therefore, it is not theoretically necessary to have any further language features; If we need macros, continuations, generic functions, static typing, or anything else, we can [greenspun](https://en.wikipedia.org/wiki/Greenspun%27s_Tenth_Rule) them ourselves. In practice, however, this is buggy, inefficient, and presents our fellow developers with serious challenges understanding our code.

One of them is *inheritance*. In JavaScript, inheritance provides a cleaner, simpler mechanism for extending data structures, domain models, and anything else you represent as a bundle of state and operations.