1. `Vue`组件三大核心概念：属性、事件、插槽。
2. 子组件为什么不可以修改父组件传递的`Prop`，如果修改了，`Vue` 是如何监控到属性的修改并给出警告的？
   - `Object.defineProperty()`
3. `this.$emit`返回值是什么？
4. 相同名称的插槽是合并还是替换？2.5 和 2.6 语法可能有不同的行为。
5. 双向绑定与单向数据流。

   - Vue 是单向数据流，不是双向绑定。
   - Vue 的双向绑定不过是语法糖。
   - Object.defineProperty 是用来做响应式更新的，和双向绑定没有关系。

6. 为什么不能用`index`作为`key`？
7. 数组有哪些方法支持响应式更新，如不支持如何处理，底层原理如何实现的？
8. Vue 生命周期

   - 创建阶段
     - `beforeCreate`
     - `created`
     - `beforeMount`
     - `render`
     - `mounted`
   - 更新阶段： 万万不可更改依赖数据，避免死循环
     - `beforeUpdate`
     - `render`
     - `updated`
   - 销毁阶段
     - `beforeDestroy`
     - `destroyed`

   9. 如何设计一个秒杀倒计时的组件？
