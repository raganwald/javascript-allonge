## Author's Notes

Dear friends and readers:

On October 1st, 2013, I announced that [JavaScript Allongé](https://leanpub.com/javascript-allonge) became free: It is now licensed under a [Creative Commons Attribution-ShareAlike 3.0 Unported License][license]. You are free:

* to Share—to copy, distribute and transmit the work
* to Remix—to adapt the work
* to make commercial use of the work

Read the [license](http://creativecommons.org/licenses/by-sa/3.0/deed.en_US) yourself for the full details. But the bottom line is, it’s free, *free*, **FREE**!

And don’t just take my word for it, [here’s the entire book online](https://leanpub.com/javascript-allonge/read).

And now, a few questions and answers...

---

### `allong.es` sounds familiar...

The recipes in JavaScript Allonge inspired a companion library called [allong.es](http://allong.es). It's free to use, of course. Please try it out. It complements the libraries you may already be using like Underscore.

### I noticed that the recipes changed in early 2013. Why?

Based on feedback from people exposed to other programming languages, I've renamed some of the recipe functions. While doing so, I also rewrote the partial application and some other parts of [allong.es](http://allong.es) to exploit symmetry.

The new nomenclature has a few conventions. First, unless suffixed with `Now`, all functions are already curried. So you can write either `map(list, function)` or `map(list)(function)`. There isn't one, but if there was a `map` that wasn't curried, it would be called `mapNow`.

By default, functions take a data structure first and an operation second and are named after a verb, i.e. `map`, `filter`. As noted, they are curried by default.

Binary functions like `map` have a variation with their arguments flipped to have the "verb" first and the subject second. They are suffixed `With`, so you call `map(list, function)` or `mapWith(function, list)`.

Under the new nomenclature, what used to be called `splat` is now called `mapWith`, and when you supply only the function, the currying takes care of returning a function that takes as list as its argument. You're mapping *with* a function.

### The examples seem to use `apply` and `call` indiscriminately. Why?

In functional programming tradition, the function `apply` is used for functional application. Variations include `applyLeft` and `applyLast`. JavaScript is a little different: All functions have two methods: `.apply` takes an array of arguments, while `.call` takes separate arguments.

So the recipes in JavaScript Allongé follow the JavaScript convention: Those named `apply` take an array of arguments, while those named `call` take individual arguments. If you're coming to this book with some functional programming under your belt, you'll find the functions work the same way, it's just that there are two of them to handle the two different ways to apply arguments to a function.

### I don't want to pay to download a PDF. Can I make my own?

Yes, you can take the HTML that is available online or the markdown source in this repository and make your own PDF. Or any other format. Please be aware that while it's technically possible to game the LeanPub system to produce the PDF or other formats, I ask you as a personal favour to find another way to make a PDF.

The license permits this choice, but IMO it is contrary to the spirit of sharing and openness to use their resources and work to do something that isn't aligned with their mission. And of course, they may not care for the idea, I don't know and I don't want to undermine what has been a tremendous service for helping people write great technical books.

### Great book! Can I share it?

And I'd also like you to share it, in this form, in PDF, or anything else. Go wild, just follow the attribution rules in the [license].

### Hey, I have a great way to make money with this...

Go for it, you are free to make commercial use of the work. For example, you could host it on your site and make money from ads, or write a JS tool and use the book as part of the help content.

It's all good, just follow the [license terms][license]. It is technically possible to create an identical clone of the book on LeanPub. I do not prohibit this activity, but I do ask you as a personal favour to ask yourself whether you could do *even better*, for instance to add value by adding your own annotations, expansions, and commentary. I'd love to see an "Annotated JavaScript Allongé."

I'd also love to see translations, editions with large print, or anything else that brings something new to the world. Many people have asked for a hard-copy version. Who will be the first to set up shop on lulu.com?

### I found a typo! How do I tell you about it?

My email inbox is a disaster zone, so let's treat the book like open source. In order of my preference, you should:

1. Create an [issue], fork the repo, fix the issue, and then send me a [pull request][pull]. (Best!!)
2. Fork the repo, fix things to your satisfaction, and then send me a [pull request][pull]. (Better!)
3. Create an [issue]. (Good.)

Thanks!