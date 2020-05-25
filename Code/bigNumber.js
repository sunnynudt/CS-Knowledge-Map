function sum(x, y) {
  const maxLength = Math.max(x.length, y.length)
  x = x.padStart(maxLength, '0')
  y = y.padStart(maxLength, '0')

  let tmp = 0
  let flag = 0
  let sum = ''

  for (let i = maxLength - 1; i >= 0; i--) {
    tmp = Number.parseInt(x[i]) + Number.parseInt(y[i]) + flag
    flag = Math.floor(tmp / 10)
    sum = tmp % 10 + sum
  }

  if (flag === 1) {
    sum = '1' + sum
  }

  return sum
}
