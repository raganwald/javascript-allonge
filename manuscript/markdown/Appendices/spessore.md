## JavaScript Spessore

![JavaScript Spessore](images/spessore.png)

Programming languages are (loosely) defined by their basic activity. In FORTRAN, we program with numbers. In C, we program with pointers. In ML, we program with types. And as [JavaScript Allongé][ja] explains, in JavaScript we program with functions.

Functions are very interesting building blocks for programs, because they *compose*: It’s easy to build a programming style based on making many small things that can be combined and recombined to make bigger things.

This is the basis of the vaunted “Unix Philosophy:” Write small utilities and scripts that compose neatly. This is also the JavaScript philosophy: Make small things that can be combined and recombined to make bigger things.

Programming with objects can be done in this style, and JavaScript makes it particularly easy to combine and recombine small parts. Classes can be built from traits instead of from superclasses. Objects can delegate and forward behaviour to helpers and meta-objects. Adaptors can be written to change an object’s interface without needing to create another class in a hierarchy.

[JavaScript Spessore][js] is a book that describes this approach to working with objects and metaobjects in JavaScript. It’s exactly the same philosophy as you find in [JavaScript Allongé][ja], only it talks to programming with objects instead of programming with functions.

JavaScript Spessore describes how to build JavaScript programs that scale in code, in time, and across a team, using the one technique that has passed the test of time: Objects and metaobjects that have a single responsibility, are decoupled from each other, and can be composed freely.

Now that you've read [JavaScript Allongé][ja], [JavaScript Spessore][js] should be next. 

[js]: https://leanpub.com/javascript-spessore
[ja]: https://leanpub.com/javascript-allonge
