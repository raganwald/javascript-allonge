## Interlude: Tortoises, Hares, and Teleporting Turtles {#tortoises}

A good long while ago (The First Age of Internet Startups), someone asked me one of those pet algorithm questions. It was, "Write an algorithm to detect a loop in a linked list, in constant space."

I'm not particularly surprised that I couldn't think up an answer in a few minutes at the time. And to the interviewer's credit, he didn't terminate the interview on the spot, he asked me to describe the kinds of things going through my head.

I think I told him that I was trying to figure out if I could adapt a hashing algorithm such as XORing everything together. This is the "trick answer" to a question about finding a missing integer from a list, so I was trying the old, "Transform this into [a problem you've already solved](http://www-users.cs.york.ac.uk/susan/joke/3.htm#boil)" meta-algorithm. We moved on from there, and he didn't reveal the "solution."

I went home and pondered the problem. I wanted to solve it. Eventually, I came up with something and tried it (In Java!) on my home PC. I sent him an email sharing my result, to demonstrate my ability to follow through. I then forgot about it for a while. Some time later, I was told that the correct solution was:

{:lang="js"}
~~~~~~~~
var LinkedList, list, tortoiseAndHareLoopDetector;

LinkedList = (function() {

  function LinkedList(content, next) {
    this.content = content;
    this.next = next != null ? next : void 0;
  }

  LinkedList.prototype.appendTo = function(content) {
    return new LinkedList(content, this);
  };

  LinkedList.prototype.tailNode = function() {
    var nextThis;
    return ((nextThis = this.next) != null ? nextThis.tailNode() : void 0) || this;
  };

  return LinkedList;

})();

tortoiseAndHareLoopDetector = function(list) {
  var hare, tortoise, nextHare;
  tortoise = list;
  hare = list.next;
  while ((tortoise != null) && (hare != null)) {
    if (tortoise === hare) {
      return true;
    }
    tortoise = tortoise.next;
    hare = (nextHare = hare.next) != null ? nextHare.next : void 0;
  }
  return false;
};

list = new LinkedList(5).appendTo(4).appendTo(3).appendTo(2).appendTo(1);

tortoiseAndHareLoopDetector(list);
  //=> false

list.tailNode().next = list.next;

tortoiseAndHareLoopDetector(list);
  //=> true
~~~~~~~~
  
This algorithm is called "The Tortoise and the Hare," and was discovered by Robert Floyd in the 1960s. You have two node references, and one traverses the list at twice the speed of the other. No matter how large it is, you will eventually have the fast reference equal to the slow reference, and thus you'll detect the loop.

At the time, I couldn't think of any way to use hashing to solve the problem, so I gave up and tried to fit this into a powers-of-two algorithm. My first pass at it was clumsy, but it was roughly equivalent to this:

{:lang="js"}
~~~~~~~~
var list, teleportingTurtleLoopDetector;

teleportingTurtleLoopDetector = function(list) {
  var i, rabbit, speed, turtle;
  speed = 1;
  turtle = rabbit = list;
  while (true) {
    for (i = 0; i <= speed; i += 1) {
      rabbit = rabbit.next;
      if (rabbit == null) {
        return false;
      }
      if (rabbit === turtle) {
        return true;
      }
    }
    turtle = rabbit;
    speed *= 2;
  }
  return false;
};

list = new LinkedList(5).appendTo(4).appendTo(3).appendTo(2).appendTo(1);

teleportingTurtleLoopDetector(list);
  //=> false

list.tailNode().next = list.next;

teleportingTurtleLoopDetector(list);
  //=> true
~~~~~~~~
  
Years later, I came across a discussion of this algorithm, [The Tale of the Teleporting Turtle](http://www.penzba.co.uk/Writings/TheTeleportingTurtle.html). It seems to be faster under certain circumstances, depending on the size of the loop and the relative costs of certain operations.

What's interesting about these two algorithms is that they both *tangle* two separate concerns: How to traverse a data structure, and what to do with the elements that you encounter. In [Functional Iterators](#functional-iterators), we'll investigate one pattern for separating these concerns.