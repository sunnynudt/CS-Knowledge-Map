## 异步执行：宏、微任务分析

### 1 代码

```js
console.log('sync1')

setTimeout(function() {
  console.log('setTimouet1')
}, 0)

var promise = new Promise(function(resolve, reject) {
  setTimeout(function() {
    console.log('setTimeoutPromise')
  }, 0)
  console.log('promise')
  resolve()
})

promise.then(() => {
  console.log('pro_then')
  setTimeout(() => {
    console.log('pro_tiemout')
  }, 0)
})

setTimeout(function() {
  console.log('last_setTimeout')
}, 0)

console.log('sync2')
```

### 2 分析

1. 第一遍同步执行，是第一个宏任务。第一个宏任务中，调用了 3 次 setTimeout（Promise 中的代码也是同步执行的），调用了一次 resolve，打印了 3 次。所以，它产生了 3 个宏任务，1 个微任务，2 次打印。

2. 首先显示的是 sync1、promise 和 sync2。这时，setTimeout1、setTimeoutPromise、last_setTimeout 在宏任务中，pro_then 在微任务中。

3. 接下来，因为微任务队列没空，第一个宏任务没有结束，继续执行微任务队列，所以 pro_then，被显示出来，然后又调用一次 setTimeout，所以 pro_timeout 进入宏任务队列，成为第 5 个宏任务。

4. 然后，没有微任务了，执行第二个宏任务，所以接下来顺序执行宏任务，显示 setTimeout1、setTimeoutPromise、last_setTimeout、pro_timeout。

### 3 结论

所以，最终显示顺序如下：

1. 宏任务 1

   - 微任务 1

     - sync1
     - promise
     - sync2

   - 微任务 2
     - pro_then

2. 宏任务 2

   - setTimeout1

3. 宏任务 3

   - setTimeoutPromise

4. 宏任务 4

   - last_setTimeout

5. 宏任务 5

   - pro_timeout

### 4 答疑

1. 为什么 promise.then 中的 setTimeout 是最后打印的？不用管是宏任务依次执行吗？

   因为 then 是第一个宏任务中最后执行的微任务，所以它发起的宏任务是最后入队的，依次执行就是最后。

2. 怎么确定这个微任务属于一个宏任务呢，JavaScript 主线程跑下来，遇到 setTimeout 会放到异步队列宏任务中，那下面遇到的 promise 怎么判断出它是属于这个宏任务呢？

   resolve 在哪个宏任务中调用，对应的 then 里的微任务就属于哪个宏任务。宏任务没有从异步队列中取出，中间所碰到的所有微任务都属于这个宏任务。

3. 为什么要设计微任务（micro task），我知道这样 JavaScript 引擎可以自主的执行任务，但这样的好处是什么？提高性能吗？

   不是。微任务是 JS 引擎内部的一种机制，如果不设计微任务，那么 JS 引擎中就完全没有异步了，所以必须要设计微任务。
