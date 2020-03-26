/**
 * Promise A+规范
 * 2条核心规范：
 * a. Promise本质是一个状态机，且状态只能为以下三种：Pending(等待态)、Fulfilled（执行态）、Rejected（拒绝态），状态的变更是单向的，
 * 只能从Pending->Fulfilled或Pending->Rejected，状态变更不可逆。
 * b. then方法接收2个参数，分别对应状态改变时触发的回调。then方法返回一个promise。then方法可以被同一个promise调用多次。
 */

// Promise A+规范的三种状态
const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

class MyPromise {
  // 构造方法接收一个回调
  constructor(executor) {
    this._status = PENDING // Promise状态
    this._value = undefined // 存储then回调return的值
    this._resolveQueue = [] // 成功队列，resolve时触发
    this._rejectQueue = [] // 失败队列，reject时触发

    // 由于resolve, reject是在executor内部被调用，所以需要使用=>固定this指向，否则找不到this._resolveQueue
    const _resolve = val => {
      // 把resolve执行回调的操作封装成一个函数，放进setTimeout中，兼容executor是同步代码的情况
      const run = () => {
        // 对应规范中的状态只能由pending到fulfilled或rejected
        if (this._status !== PENDING) {
          return
        }
        this._status = FULFILLED // 变更状态
        this._value = val // 存储当前value

        // 使用一个队列来存储回调，是为了实现规范中要求的then方法可以被同一个Promise调用多次
        // 如果使用一个变量而非队列来存储回调，那么即使多次p.then()也只会执行一次回调
        while (this._resolveQueue.length) {
          const callback = this._resolveQueue.shift()
          callback(val)
        }
      }

      // 其实Promise的默认实现是放进微任务队列，可以使用MutationObserver模拟微任务
      // setTimeout模拟是放进了宏任务队列，大多Promise手动实现和polyfill的转化都是利用此方法
      setTimeout(run)
    }

    const _reject = val => {
      const run = () => {
        if (this._status !== PENDING) {
          return
        }
        this._status = REJECTED
        this._value = val

        while (this._rejectQueue.length) {
          const callback = this._rejectQueue.shift()
          callback(val)
        }
      }

      setTimeout(run)
    }

    // new Promise()时立即执行executor，并传入resolve，reject
    executor(_resolve, _reject)
  }

  // 接收一个成功回调和一个失败回调
  then(resolveFn, rejectFn) {
    // 根据规范，如果then的参数不是function，需要忽略它，让链式调用继续往下执行
    typeof resolveFn !== 'function' ? (resolveFn = val => val) : null
    typeof rejectFn !== 'function' ? (rejectFn = val => val) : null

    // return一个新的Promise
    return new MyPromise((resolve, reject) => {
      // 把resolveFn重新包装一下，再push进resolve执行队列，这是为了能够获取回调的返回值进行分类讨论
      const fulfilledFn = val => {
        try {
          // 执行第一个（当前的）Promise的成功回调，并获取返回值
          let x = resolveFn(val)
          // 分类讨论返回值，如果是Promise，那么等待Promise状态变更，否则直接resolve
          x instanceof MyPromise ? x.then(resolve, reject) : resolve(x)
        } catch (e) {
          reject(e)
        }
      }

      const rejectedFn = e => {
        try {
          let x = rejectFn(e)
          x instanceof MyPromise ? x.then(resolve, reject) : resolve(x)
        } catch (e) {
          reject(e)
        }
      }

      switch (this._status) {
        // 当前状态为pending时候，把then回调push进resolve/reject执行队列，等待执行
        case PENDING:
          // 把后续then的依赖都push进当前的Promise的成功回调队列中，这是为了保证顺序调用
          this._resolveQueue.push(fulfilledFn)
          this._rejectQueue.push(rejectedFn)
          break
        case FULFILLED:
          fulfilledFn(this._value) // this._value是上一个then回调的return值
          break
        case REJECTED:
          rejectedFn(this._value)
          break
      }
    })
  }

  // 返回一个Promise，并处理拒绝的情况
  // 行为与调用Promise.prototype.then(undefined, onRejected)相同
  catch(rejectFn) {
    return this.then(undefined, rejectFn)
  }

  // 返回一个Promise
  // 在Promise结束时，无论结果是fulfilled还是rejected，都会执行指定的回调函数。
  // 在finally之后，还可以继续then，并且会将值原封不动的传递给后面的then
  finally(callback) {
    return this.then(
      value => MyPromise.resolve(callback()).then(() => value), // MyPromise.resolve执行回调，并在then中return结果传递给后面的Promise
      reason =>
        MyPromise.resolve(callback()).then(() => {
          throw reason
        })
    )
  }

  // 返回一个以给定值解析后的Promise对象。
  // 如果该值为Promise，返回这个Promise；
  // 如果这个是thenable(即带有then方法)，返回的Promise会“跟随”这个thenable的对象，采用它的最终状态；
  // 否则返回的Promise将以此值完成。
  // 此函数类Promise对象的多层嵌套展平。
  // 静态方法
  static resolve(val) {
    if (val instanceof MyPromise) {
      return val
    }

    return new MyPromise(resolve => resolve(val))
  }

  // 返回一个带有拒绝原因的Promise对象。
  static reject(reason) {
    return new MyPromise((resolve, reject) => reject(reason))
  }

  // Promise.all(iterable)方法返回一个 Promise 实例，
  // 此实例在 iterable 参数内所有的 promise 都“完成（resolved）”或参数中不包含 promise 时回调完成（resolve）；
  // 如果参数中 promise 有一个失败（rejected），此实例回调失败（reject），失败原因的是第一个失败 promise 的结果。
  static all(promiseArr) {
    let index = 0
    let result = []
    return new MyPromise((resolve, reject) => {
      promiseArr.forEach((p, i) => {
        //Promise.resolve(p)用于处理传入值不为Promise的情况
        MyPromise.resolve(p).then(
          val => {
            index++
            result[i] = val
            //所有then执行后, resolve结果
            if (index === promiseArr.length) {
              resolve(result)
            }
          },
          err => {
            //有一个Promise被reject时，MyPromise的状态变为reject
            reject(err)
          }
        )
      })
    })
  }

  // Promise.race(iterable)方法返回一个 promise，一旦迭代器中的某个promise解决或拒绝，返回的 promise就会解决或拒绝。
  static race(promiseArr) {
    return new MyPromise((resolve, reject) => {
      //同时执行Promise,如果有一个Promise的状态发生改变,就变更新MyPromise的状态
      for (let p of promiseArr) {
        MyPromise.resolve(p).then(
          //Promise.resolve(p)用于处理传入值不为Promise的情况
          value => {
            resolve(value) //注意这个resolve是上边new MyPromise的
          },
          err => {
            reject(err)
          }
        )
      }
    })
  }
}
