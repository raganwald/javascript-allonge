## Once Again {#named-once}

As we noted when we saw the recipe for [once](#once), you do have to be careful that you are calling the function `once` returns multiple times. If you keep calling `once`, you'll get a new function that executes once, so you'll keep calling your function:

    once(function () {
      return 'sure, why not?'
    })()
      //=> 'sure, why not?'

    once(function () {
      return 'sure, why not?'
    })()
      //=> 'sure, why not?'

This is expected, but sometimes not what we want. Instead of the simple implementation, we can use a *named once*:

    function once (fn) {
      var done = false,
          testAndSet;
          
      if (!!fn.name) {
        testAndSet = function () {
          this["__once__"] || (this["__once__"] = {})
          if (this["__once__"][fn.name]) return true;
          this["__once__"][fn.name] = true;
          return false
        }
      }
      else  {
        testAndSet = function (fn) {
          if (done) return true;
          done = true;
          return false
        }
      }
      
      return function () {
        return testAndSet.call(this) ? void 0 : fn.apply(this, arguments)
      }
    }

If you call this with just a function, it behaves exactly like our first recipe. But if you supply a named function, you get a different behaviour:

    once(function askedOnDate () {
      return 'sure, why not?'
    })()
      //=> 'sure, why not?'  
        
    once(function askedOnDate () {
      return 'sure, why not?'
    })()
      //=> undefined

The named once adds a property, `__once__`, to the context where the function is called and uses it to keep track of which named functions have and haven't been run. One very powerful use is for defining object methods that should only be evaluated once, such as an initialization method. Normally this is done in the constructor, but you might write a "fluent" object that lets you call various setters:

    function Widget () {};
    
    Widget.prototype.setVolume = function setVolume (volume) {
      this.volume = volume;
      return this;
    }
    
    Widget.prototype.setDensity = function setDensity (density) {
      this.density = density;
      return this;
    }
    
    Widget.prototype.setLength = function setLength (length) {
      this.length = length;
      return this;
    }
    
    Widget.prototype.initialize = once(function initialize() {
      // do some initialization
      return this;
    });
    
    var w = new Widget()
      .setVolume(...)
      .setDensity)(...)
      .setLength(...)
      .initialize();
      
If you later call `w.initialize()`, it won't be initialized again. You need a named `once`, because an ordinary `once` would be called once for every instance sharing the same prototype, whereas the named once will keep track of whether it has been run separately for each instance.

Caveat: Every instance will have a `__once__` property. If you later write code that iterates over every property, you'll have to take care not to interact with it.