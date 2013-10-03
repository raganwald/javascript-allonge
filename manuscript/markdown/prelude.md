# Prelude: Values and Expressions

*The following material is extremely basic, however like most stories, the best way to begin is to start at the very beginning.*

Imagine we are visiting our favourite coffee shop. They will make for you just about any drink you desire, from a short, intense espresso ristretto through a dry cappuccino, up to those coffee-flavoured desert concoctions featuring various concentrated syrups and milks. (You tolerate the existence of sugary drinks because they provide a sufficient profit margin to the establishment to finance your hanging out there all day using their WiFi and ordering a $3 drink every few hours.)

You express your order at one end of their counter, the folks behind the counter perform their magic, and deliver the coffee you value at the other end. This is exactly how the JavaScript environment works for the purpose of this book. We are going to dispense with web servers, browsers and other complexities and deal with this simple model: You give the computer an [expression], and it returns a [value], just as you express your wishes to a barista and receive a coffee in return.

[expression]: https://en.wikipedia.org/wiki/Expression_(computer_science)
[value]: https://en.wikipedia.org/wiki/Value_(computer_science)

## values and expressions

All values are expressions. Say you hand the barista a café Cubano. Yup, you hand over a cup with some coffee infused through partially caramelized sugar. You say, "I want one of these." The barista is no fool, she gives it straight back to you, and you get exactly what you want. Thus, a café Cubano is an expression (you can use it to place an order) and a value (you get it back from the barista).

Let's try this with something the computer understands easily:

    42

Is this an expression? A value? Neither? Or both?

The answer is, this is both an expression *and* a value.[^representation] The way you can tell that it's both is very easy: When you type it into JavaScript, you get the same thing back, just like our café Cubano:

    42
      //=> 42

[^representation]: Technically, it's a *representation* of a value using Base10 notation, but we needn't worry about that in this book. You and I both understand that this means "42," and so does the computer.

All values are expressions. That's easy! Are there any other kinds of expressions? Sure! let's go back to the coffee shop. Instead of handing over the finished coffee, we can hand over the ingredients. Let's hand over some ground coffee plus some boiling water.

A> Astute readers will realize we're omitting something. Congratulations! Take a sip of espresso. We'll get to that in a moment.

Now the barista gives us back an espresso. And if we hand over the espresso, we get the espresso right back. So, boiling water plus ground coffee is an expression, but it isn't a value.[^homoiconicity] Boiling water is a value. Ground coffee is a value. Espresso is a value. Boiling water plus ground coffee is an expression.

[^homoiconicity]: In some languages, expressions are a kind of value unto themselves and can be manipulated. The grandfather of such languages is Lisp. JavaScript is not such a language, expressions in and of themselves are not values.

Let's try this as well with something else the computer understands easily:

    "JavaScript" + " " + "Allonge"
      //=> "JavaScript Allonge"

Now we see that "strings" are values, and you can make an expression out of strings and an operator `+`. Since strings are values, they are also expressions by themselves. But strings with operators are not values, they are expressions. Now we know what was missing with our "coffee grounds plus hot water" example. The coffee grounds were a value, the boiling hot water was a value, and the "plus" operator between them made the whole thing an expression that was not a value.

## values and identity

In JavaScript, we test whether two values are identical with the `===` operator, and whether they are not identical with the `!==` operator:

		2 === 2
			//=> true
			
		'hello' !== 'goodbye'
			//=> true
			
How does `===` work, exactly? Imagine that you're shown a cup of coffee. And then you're shown another cup of coffee. Are the two cups "identical?" In JavaScript, there are four possibilities:

First, sometimes, the cups are of different kinds. One is a demitasse, the other a mug. This corresponds to comparing two things in JavaScript that have different *types*. For example, the string `"2"` is not the same thing as the number `2`. Strings and numbers are different types, so strings and numbers are never identical:

    2 === '2'
      //=> false
      
    true !== 'true'
      //=> true

Second, sometimes, the cups are of the same type--perhaps two espresso cups--but they have different contents. One holds a single, one a double. This corresponds to comparing two JavaScript values that have the same type but different "content." For example, the number `5` is not the same thing as the number `2`.

    true === false
      //=> false
      
    2 !== 5
      //=> true
      
    'two' === 'five'
      //=> false

What if the cups are of the same type *and* the contents are the same? Well, JavaScript's third and fourth possibilities cover that.

### value types

Third, some types of cups have no distinguishing marks on them. If they are the same kind of cup, and they hold the same contents, we have no way to tell the difference between them. This is the case with the strings, numbers, and booleans we have seen so far.

    2 + 2 === 4
      //=> true
      
    (2 + 2 === 4) === (2 !== 5)
      //=> true
      
Note well what is happening with these examples: Even when we obtain a string, number, or boolean as the result of evaluating an expression, it is identical to another value of the same type with the same "content." Strings, numbers, and booleans are examples of what JavaScript calls "value" or "primitive" types. We'll use both terms interchangeably.

We haven't encountered the fourth possibility yet. Stretching the metaphor somewhat, some types of cups have a serial number on the bottom. So even if you have two cups of the same type, and their contents are the same, you can still distinguish between them.

![Cafe Macchiato is also a fine drink, especially when following up on the fortunes of the Azzuri or the standings in the Giro D'Italia](images/macchiato_1200.jpg)

### reference types

So what kinds of values might be the same type and have the same contents, but not be considered identical to JavaScript? Let's meet a data structure that is very common in contemporary programming languages, the *Array* (other languages sometimes call it a List or a Vector).

An array looks like this: `[1, 2, 3]`. This is an expression, and you can combine `[]` with other expressions. Go wild with things like:

    [2-1, 2, 2+1]
    [1, 1+1, 1+1+1]
    
Notice that you are always generating arrays with the same contents. But are they identical the same way that every value of `42` is identical to every other value of `42`? Try these for yourself:

    [2-1, 2, 2+1] === [1,2,3]
    [1,2,3] === [1, 2, 3]
    [1, 2, 3] === [1, 2, 3]
  
How about that! When you type `[1, 2, 3]` or any of its variations, you are typing an expression that generates its own *unique* array that is not identical to any other array, even if that other array also looks like `[1, 2, 3]`. It's as if JavaScript is generating new cups of coffee with serial numbers on the bottom.

A> Arrays look exceedingly simple, but this word "reference" is so laden with possibilities that there's an entire chapter devoted to discussing [rebinding and references](#references). Try typing this code out:
A>
A> <<(code/ouroboros.js)
A>
A> You've just created an [ouroborian](https://en.wikipedia.org/wiki/Ouroboros) array, an array that contains itself.

They look the same, but if you examine them with `===`, you see that they are different. Every time you evaluate an expression (including typing something in) to create an array, you're creating a new, distinct value even if it *appears* to be the same as some other array value. As we'll see, this is true of many other kinds of values, including *functions*, the main subject of this book.
