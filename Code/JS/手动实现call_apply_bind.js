Function.prototype.myCall = function(context) {
  context = context ? Object(context) : window
  context.fn = this

  const args = [...arguments].slice(1)
  const result = context.fn(...args)

  delete context.fn
  return result
}

Function.prototype.myApply = function(context, arr) {
  context = context ? Object(context) : window
  context.fn = this

  let result

  if (!arr) {
    result = context.fn()
  } else {
    result = context.fn(...arr)
  }

  delete context.fn
  return result
}
