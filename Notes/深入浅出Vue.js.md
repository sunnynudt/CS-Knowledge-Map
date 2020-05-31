# [《深入浅出 Vue.js》](https://item.jd.com/12573168.html)读书笔记

## 第一篇 变化侦测

### 1. Object 的变化侦测

[点击查看代码](/Code/深入浅出Vue.js/Object的变化侦测.js)

变化侦测，就是侦测数据的变化。当数据发生变化时，要能侦测到并发出通知。`Object`可以通过[Object.defineProperty](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)（_Vue2 使用`Object.defineProperty`实现检测对象的变化，Vue3 会使用`Proxy`重写_）将属性转换成`getter/setter`的形式来追踪变化。读取数据时会触发`getter`，收集哪些依赖使用了数据；修改数据时会触发`setter`，去通知`getter`中收集的依赖数据发生了变化。创建`Dep`类来收集依赖、删除依赖、向依赖发生消息等。`Watcher`即所谓的*依赖*，只有`Watcher`触发的`getter`才会收集依赖，哪个`Watcher`出发了`getter`，就把哪个`Watcher`收集到`Dep`中。当数据发生变化时，就会循环依赖列表，把所有的`Watcher`都通知一遍。

`Watcher`的**原理**是*先把自己设置到全局唯一的指定位置（例如 window.target），然后读取数据*。因为读取了数据，所以会触发这个数据的`getter`。接这，在`getter`中就会从全局唯一的那个位置读取当前数据的`Watcher`收集到`Dep`中。通过这样的方式，`Watcher`可以主动去订阅任意一个数据的变化。

创建`Observer`类，作用是把一个`object`中所有数据（包括子数据）都转换成响应式的，也就是它会侦测`object`中所有的数据（包括子数据）的变化。

由于在`ES6`之前`JavaScript`并没有提供[元编程](https://www.zhihu.com/question/23856985/answer/25965835)的能力，所以在**在对象上新增属性和删除属性都无法被追踪到**。

下图是`Data、Observer、Dep、Watcher`之间的关系。

![](/Images/Data、Observer、Dep和Watcher之间的关系.png)

1. `Data`通过`Observer`转换成了`getter/setter`的形式来追踪变化。
2. 当外界通过`Watcher`读取数据时，会触发`getter`从而将`Watcher`添加到依赖中。
3. 当数据发生了变化时，会触发`setter`，从而向`Dep`中的依赖（`Watcher`）发送通知。
4. `Watcher`接收到通知后，会向外界发送通知，变化通知到外界后可能会触发视图更新，也有可能触发用户的某个回调函数等。
