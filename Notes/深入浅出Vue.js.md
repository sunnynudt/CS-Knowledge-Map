# 《深入浅出 Vue.js》读书笔记

## 第一篇 变化侦测

### 1. Object 的变化侦测

1. 如何追踪变化？

在`js`中通过`Object.defineProperty`和`Proxy`侦测一个对象的变化。

```js
// 定义一个响应式数据，对数据进行变化追踪。
// 每当从data的key中读取数据时，get函数被触发，每当data的key中设置数据时，set函数被触发。
function defineReactive(data, key, val) {
  Object.defineProperty(data, key, {
    enumerable: true,
    configurable: true,
    get: function () {
      return val
    },
    set: function (newVal) {
      if (val === newVal) {
        return
      }
      val = newVal
    },
  })
}
```

2. 依赖收集

在`getter`中收集依赖，在`setter`中触发依赖。

那么依赖收集到哪里去呢？

首先，每个`key`都有一个数组，用来存储当前`key`的依赖。假设依赖是一个函数，保存在`window.target`上，现在就可以把`defneReactive`函数稍微改造一下：

```js
// 把依赖收集的代码封装一个Dep类，专门帮我们管理依赖。
// 使用这个类，我们可以收集依赖、删除依赖或者向依赖发送通知等。
export default class Dep {
  constructor() {
    this.subs = []
  }

  addSub(sub) {
    this.subs.push(sub)
  }

  removeSub(sub) {
    remove(this.subs, sub)
  }

  depend() {
    if (window.target) {
      this.addSub(window.target)
    }
  }

  notify() {
    const subs = this.subs.slice()
    for (let i = 0; i < subs.length; i++) {
      subs[i].update()
    }
  }
}

function remove(arr, item) {
  if (arr.length) {
    const index = arr.indexOf(item)
    if (index > -1) {
      return arr.splice(index, 1)
    }
  }
}

function defineReactive(data, key, val) {
  let dep = new Dep()

  Object.defineProperty(data, key, {
    enumerable: true,
    configurable: true,
    get: function () {
      dep.depend()
      return val
    },
    set: function (newVal) {
      if (val === newVal) {
        return
      }

      val = newVal
      dep.notify()
    },
  })
}
```

3. `watcher`

`watcher`是一个中介的角色，数据发生改变时通知它，然后它再通知其他地方。

```js
export default class Watcher {
  constructor(vm, expOrFn, cb) {
    this.vm = vm
    // 执行this.getter()，就可以读取data.a.b.c的内容
    this.getter = parsePath(expOrFn)
    this.cb = cb
    this.value = this.get()
  }

  get() {
    window.target = this
    let value = this.getter.call(this.vm, this.vm)
    window.target = undefined
    return value
  }

  update() {
    const oldValue = this.value
    this.value = this.get()
    this.cb.call(this.vm, this.value, oldValue)
  }
}
```
