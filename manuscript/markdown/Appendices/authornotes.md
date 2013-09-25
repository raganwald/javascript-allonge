## Author's Notes

Hello, and thank you for supporting my writing!

An ebook like this is never "done." Like open source software, it lasts as long as people are interested in maintaining it, and then it is abandoned as people move on to something new. But the ideas live on, informing the new books and projects that come after it, just as it was informed by the books and projects that came before it.

Although this book as been "complete" in some sense for months, I continue to use its ideas and to write about things with its ideas in mind. Sometimes I receive confirmation that all is well. Sometimes I receive helpful suggestions. And sometimes, I hear that things could be much, much better.

So please, write and let me know what you think.

Thank you!

### `allong.es`

This book inspired a companion JavaScript library called [allong.es](http://allong.es). It's free to use, of course. Please try it out. It complements libraries you may already be using like Underscore.

### the new nomenclature (2013-04-08)

Based on feedback from people exposed to other programming languages, I've renamed some of the recipe functions. While doing so, I also rewrote the partial application and some other parts of [allong.es](http://allong.es) to exploit symmetry.

The new nomenclature has a few conventions. First, unless suffixed with `Now`, all functions are already curried. So you can write either `map(list, function)` or `map(list)(function)`. There isn't one, but if there was a `map` that wasn't curried, it would be called `mapNow`.

By default, functions take a data structure first and an operation second and are named after a verb, i.e. `map`, `filter`. As noted, they are curried by default.

Binary functions like `map` have a variation with their arguments flipped to have the "verb" first and the subject second. They are suffixed `With`, so you call `map(list, function)` or `mapWith(function, list)`.

Under the new nomenclature, what used to be called `splat` is now called `mapWith`, and when you supply only the function, the currying takes care of returning a function that takes as list as its argument. You're mapping *with* a function.

### apply vs. call

In functional programming tradition, the function `apply` is used for functional application. Variations include `applyLeft` and `applyLast`. JavaScript is a little different: All functions have two methods: `.apply` takes an array of arguments, while `.call` takes separate arguments.

So the recipes in JavaScript Allongé follow the JavaScript convention: Those named `apply` take an array of arguments, while those named `call` take individual arguments. If you're coming to this book with some functional programming under your belt, you'll find the functions work the same way, it's just that there are two of them to handle the two different ways to apply arguments to a function.