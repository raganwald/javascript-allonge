function () {
  return function () {}
}

function () {
  return [ 1, 2, 3]
}

[1, [2, 3], 4]

function () {
  return [
    (function () { return 1}),
    (function () { return 2}),
    (function () { return 3})
  ]
}