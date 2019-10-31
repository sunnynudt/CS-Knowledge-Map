/**
 * @file 实现一个Promise
 * 原文链接: https://juejin.im/post/5ab20c58f265da23a228fe0f
 */

/**
 * @param {Function} executor 一个执行器
 */
function Promise(executor) {
  let _this = this // 先缓存this以免后面指针混乱
  _this.status = 'pending' // 默认为等待态
  _this.value = undefined // 成功时要传给成功回调的数据，默认为undefined
  _this.reason = undefined // 成功时要传给失败回调的数据，默认为undefined
  _this.onResolvedCallbacks = [] // 存放then成功的回调
  _this.onRejectedCallbacks = [] // 存放then失败的回调

  /**
   * 内置一个resolve方法，接收成功状态数据
   * @param {*} value
   */
  function resolve(value) {
    // 只有pending态可以转为其他状态
    if (_this.status === 'pending') {
      _this.status = 'resolved'
      _this.value = value
      // 当成功的函数被调用时，之前缓存的回调函数会被一一调用
      console.log('call A')
      _this.onResolvedCallbacks.forEach(function(fn) {
        fn()
        console.log('call A 1')
      })
    }
  }

  /**
   * 内置一个reject方法，失败状态时接收原因
   * @param {*} reason
   */
  function reject(reason) {
    // 只有pending态可以转为其他状态
    if (_this.status === 'pending') {
      _this.status = 'rejected'
      _this.reason = reason
      console.log('call B')
      _this.onRejectedCallbacks.forEach(function(fn) {
        console.log('call B 1')
        fn()
      })
    }
  }

  try {
    executor(resolve, reject)
  } catch (e) {
    reject(e)
  }
}

/**
 * @param {Function} onFulfilled 成功的回调
 * @param {Function} onRejected 失败的回调
 */
Promise.prototype.then = function(onFulfilled, onRejected) {
  // 成功和失败默认不传给一个函数
  onFulfilled =
    typeof onFulfilled === 'function'
      ? onFulfilled
      : function(value) {
          return value
        }
  onRejected =
    typeof onRejected === 'function'
      ? onRejected
      : function(err) {
          throw err
        }

  let _this = this
  let promise2
  if (_this.status === 'pending') {
    // 每一次then时，如果是等待态，就把回调函数push进数组，什么时候改变状态，什么时候再执行
    console.error('onFulfilled', onFulfilled)
    console.error('onReject', onRejected)
    console.error('this.status AAA = ', _this.status)
    promise2 = new Promise(function(resolve, reject) {
      _this.onResolvedCallbacks.push(function() {
        console.error('111')
        setTimeout(function() {
          try {
            let x = onFulfilled(_this.value)
            resolvePromise(promise2, x, resolve, reject) // 写个方法，统一处理
          } catch (e) {
            reject(e)
          }
        })
      })
      _this.onRejectedCallbacks.push(function() {
        console.error('222')
        setTimeout(function() {
          try {
            let x = onRejected(_this.reason)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })
      })
    })
  }

  if (_this.status === 'resolved') {
    // 如果是成功态，执行用户传递的成功回调，并把数据传进去
    console.log('this.status = resovled')
    promise2 = new Promise(function(resolve, reject) {
      // 当成功或失败执行时有异常那么返回的Promise应该处于失败状态
      setTimeout(function() {
        try {
          let x = onFulfilled(_this.value)
          resolvePromise(promise2, x, resolve, reject)
        } catch (e) {
          reject(e)
        }
      })
    })
  }

  if (_this.status === 'rejected') {
    console.log('this.status = rejected')
    // 如果是失败态，执行用户传递的失败回调，并把数据传进去
    promise2 = new Promise(function(resolve, reject) {
      setTimeout(function() {
        try {
          let x = onRejected(_this.reason)
          resolvePromise(promise2, x, resolve, reject)
        } catch (e) {
          reject(e)
        }
      })
    })
  }

  return promise2
}

// 捕获错误的方法，在原型上有catch方法，返回一个没有resolve的then结果即可
Promise.prototype.catch = function(callback) {
  return this.then(null, callback)
}

// 解析全部方法，接收一个Promise数组promises，返回新的Promise，遍历数组，都完成再resolve
Promise.all = function(promises) {
  return new Promise(function(resolve, reject) {
    let arr = [] // arr是最终返回值的结果
    let i = 0 // 表示成功了多少次
    for (let i = 0; i < promises.length; i++) {
      promises[i].then(function(y) {
        processData(i, y)
      }, reject)
    }
    function processData(index, y) {
      arr[index] = y
      if (++i === promises.length) {
        resolve(arr)
      }
    }
  })
}

// 只要有一个Promise成功了就成功了，如果第一个失败了就失败了
Promise.race = function(promises) {
  return new Promise(function(resolve, reject) {
    for (let i = 0; i < promises.length; i++) {
      promises[i].then(resolve, reject)
    }
  })
}

// 生成一个成功的promise
Promise.resolve = function(value) {
  return new Promise(function(resolve, reject) {
    resolve(value)
  })
}

// 生成一个失败的promise
Promise.reject = function(reason) {
  return new Promise(function(resolve, reject) {
    reject(reason)
  })
}

/**
 * @param {Object} promise2 新promise
 * @param {*} x 返回值
 * @param {Function} resolve 成功回调
 * @param {Function} reject 失败回调
 */
function resolvePromise(promise2, x, resolve, reject) {
  if (promise2 === x) {
    return reject(new TypeError('循环引用了'))
  }

  // 看x是不是一个promise, promise应该是一个对象
  let called
  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    // 可能是promise {}, 看这个对象中是否有then方法，如果有then，认为是promise
    try {
      let then = x.then
      if (typeof then === 'function') {
        // 成功
        // 用call修改指针为x，否则this指向window
        then.call(
          x,
          function(y) {
            if (called) return // 如果调动过，就return掉
            called = true
            // y可能还是一个promise，在解析直到返回的是一个普通值
            resolvePromise(promise2, y, resolve, reject) // 递归调用
          },
          function(err) {
            // 失败
            if (called) return
            called = true
            reject(err)
          }
        )
      } else {
        resolve(x)
      }
    } catch (e) {
      if (called) return
      called = true
      reject(e)
    }
  } else {
    // 说明是一个普通值
    resolve(x) // 表示成功了
  }
}

module.exports = Promise
