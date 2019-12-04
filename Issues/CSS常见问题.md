<!-- 1. 双列布局
2. flex 布局
3. position 属性, sticky -->

### 1. 理解 BFC

#### 1. 概念

`BFC`即`Block Formatting Contexts`（块级格式化上下文），具有`BFC`特性的元素可以看作是隔离了的独立容器，容器里面的元素不会在布局上影响到外面的元素，并且`BFC`具有普通容器所没有的一些特性。

#### 2. 触发条件

只要元素满足下面任一条件即可触发`BFC`特性：

- 根元素`html`
- 浮动元素：`float`除`none`以外的值
- 绝对定位元素：`position(absolute, fixed)`
- `display`为`inline-block`、`table-cells`、`flex`
- `overflow`除了`visible`以外的值(`hidden`、`auto`、`scroll`)
- ...

#### 3. 应用

- 同一个`BFC`中外边距会发生折叠
- `BFC`可以包含浮动的元素（清除浮动）
- `BFC`可以阻止元素被浮动元素覆盖
- ...

#### 4. 参考

- [MDN: 块格式化上下文](https://developer.mozilla.org/zh-CN/docs/Web/Guide/CSS/Block_formatting_context)
- [知乎：10 分钟理解 BFC 原理](https://zhuanlan.zhihu.com/p/25321647)

### 2. 理解 `word-break`、`overflow-wrap（word-wrap）`、`white-space`

#### 1. `white-space`

该属性是用来控制空白字符的显示，还能控制是否自动换行。

|              |        |         |          |                 |
| :----------: | :----: | :-----: | :------: | :-------------: |
| 能否发挥作用 | 换行符 |  空格   | 自动换行 | `<br>`、`&nbsp` |
|   `normal`   |   x    | x(合并) |    √     |        √        |
|   `nowrap`   |   x    | x(合并) |    x     |        √        |
|    `pre`     |   √    |    √    |    x     |        √        |
|  `pre-wrap`  |   √    |    √    |    √     |        √        |
|  `pre-line`  |   √    | x(合并) |    √     |        √        |

#### 2. `word-break`

该属性控制单词如何被拆分换行的。

- `keep-all`：所有“单词”一律不拆分，包括连续的中文字符（日韩文等），可以理解为*只有空格可以触发自动换行*。
- `break-all`: 所有“单词”碰到边界一律拆分换行。

#### 3. [`overflow-wrap（word-wrap）`](https://developer.mozilla.org/zh-CN/docs/Web/CSS/word-wrap)

该属性是用来说明当一个不能被分开的字符串太长而不能填充其包裹盒时，为防止其溢出，浏览器是否允许这样的单词中断换行。

> 注：word-wrap 属性原本属于微软的一个私有属性，在 CSS3 现在的文本规范草案中已经被重名为 overflow-wrap 。 word-wrap 现在被当作 overflow-wrap 的 “别名”。

- normal：表示在正常的单词结束处换行。
- break-word：表示如果行内没有多余的地方容纳该单词到结尾，则那些正常的不能被分割的单词会被强制分割换行。
