## A Personal Word About The Recipes

As noted, *JavaScript Allongé* alternates between chapters describing the semantics of JavaScript's functions with chapters containing recipes for writing programs with functions. You can read the book in order or read the chapters explaining JavaScript first and return to the recipes later.

The recipes share a common theme: They hail from a style of programming inspired by the creation of small functions that compose with each other. Using these recipes, you'll learn when it's appropriate to write:

    return mapWith(maybe(getWith('name')))(customerList);
    
Instead of:

    return customerList.map(function (customer) {
      if (customer) {
        return customer.name
      }
    });
    
As well as how it works and how to refactor it when you need. This style of programming is hardly the most common thing anyone does in JavaScript, so the argument can be made that more "practical" or "commonplace" recipes would be helpful. If you never read any other books about JavaScript, if you avoid blog posts and screen casts about JavaScript, if you don't attend workshops or talks about JavaScript, then I agree that this is not One Book to Rule Them All.

But given that there are other resources out there, and that programmers are curious creatures with an unslakable thirst for personal growth, we choose to provide recipes that you are unlikely to find anywhere else in anything like this concentration. The recipes reinforce the lessons taught in the book about functions in JavaScript.

You'll find all of the recipes collected online at [http://allong.es](http://allong.es). They're free to share under the MIT license.

[Reginald Braithwaite](http://braythwayt.com)  
reg@braythwayt.com  
@raganwald