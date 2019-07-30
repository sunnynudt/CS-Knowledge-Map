# 异步执行：宏、微任务分析

## [代码 demo](/Demo/JavaScript/Async_狼叔.js)

## 解析

1. 在一个事件循环的周期中，一个任务应该从`macrotask`队列开始执行，当这个`macrotask`队列结束后，所有的`microtask`将在同一个周期中执行。在`microtask`执行时还可以加入更多的`microtask`，然后一个一个执行，直到`microtask`队列被清空。

2. 每个循环的具体执行过程

   - 循环 1： `setInterval`被列为任务。`setTimeout 1`被列为任务。`Promise.resolve 1`中的 2 个`then`方法被列为`microtask`。

     任务队列里有 2 个任务：`setInterval`和`setTimeout 1`。

   - 循环 2：`microtask`队列清空，`setInterval`的回调可以执行，另一个`setInterval`被列为任务，位于`setTimeout 1`后面。

     任务队列中有 2 个任务：`setTimeout 1`和`setInterval`。

   - 循环 3：`microtask`队列清空，`setTimeout 1`的回调可以执行，`promise 3`和`promise 4`被列为`microtask`。`promise 3`和`promise 4`执行，`setTimeout 2`被列为任务。

     任务队列中有 2 个任务：`setInterval`和`setTimeout 2`。

   - 循环 4：`microtask`队列清空，`setInterval`的回调可以执行，然后另一个`setInterval`被列为任务，位于`setTimeout 2`后面。`setTimeout 2`的回调执行，`promise 5`和`promise 6`被列为`microtask`。

     任务队列里有 2 个任务：`setTimeout 2`和`setInterval`。

   现在`promise 5`和`promise 6`的回调应该被执行，并且清空了`interval`。但是有时候不知道为什么`setInterval`还会再执行一遍，`...setTimeout 2, setInterval...`，可能不同版本的`node`产生不同的影响，在`chrome`下执行是正常的。
