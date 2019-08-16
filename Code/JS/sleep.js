export function sleep(duration) {
  return new Promise(function(resolve, reject) {
    setTimeout(resolve, duration)
  })
}
