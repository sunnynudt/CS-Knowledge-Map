// 把依赖收集的代码封装一个Dep类，专门帮我们管理依赖。
// 使用这个类，我们可以收集依赖、删除依赖或者向依赖发送通知等。
export class Dep {
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

// 解析简单路径
const bailRE = /[^\w.$]/
export function parsePath(path) {
  if (bailRE.test(path)) {
    return
  }

  const segments = path.split('.')

  return function (obj) {
    for (let i = 0; i < segments.length; i++) {
      if (!obj) {
        return
      }
      obj = obj[segments[i]]
    }
    return obj
  }
}

export class Watcher {
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

// Observer类会附加到每一个被侦测的object上
// 一旦被附加上，Observer会将object的所有属性转换为getter/setter的形式
// 来收集属性的依赖，并且当属性发生变化时会通知这些依赖
export class Observer {
  constructor(value) {
    this.value = value

    if (!Array.isArray(value)) {
      this.walk(value)
    }
  }

  // walk会将每一个属性都转换成getter/setter的形式来侦测变化
  // 这个方法只有数据类型为Object时被调用
  walk(obj) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i], obj[keys[i]])
    }
  }
}

export function defineReactive(data, key, val) {
  // 递归子属性
  if (typeof val === 'object') {
    new Observer(val)
  }

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
