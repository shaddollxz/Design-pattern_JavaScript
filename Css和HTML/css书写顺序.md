# 回流

浏览器的渲染流程为：

1. 浏览器解析html构建dom树，解析css构建cssom树即css rule tree：将html和css都解析成树形的数据结构； dom树的构建过程是一个深度遍历过程：当前节点的所有子节点都构建好后才会去构建当前节点的下一个兄弟节点。
2. 构建render树：DOM树和cssom树合并之后形成render树。为了构建渲染树，浏览器大体完成了下列工作：从DOM树的根节点开始遍历每个可见节点。对于每个可见节点，为其找到适配的CSSOM规则并应用它们。发射可见节点，连同其内容和计算的样式。渲染树中包含了屏幕上所有可见内容及其样式信息。
3. 布局render树：有了render树，浏览器已经知道网页中有哪些节点，各个节点的css定义以及它们的从属关系，接着就开始布局，计算出每个节点在屏幕中的位置和大小。(html采用了一种流式布局的布局模型，从上到下，从左到右顺序布局，布局的起点是从render树的根节点开始的，对应dom树的document节点，其初始位置为(0,0)，详细的布局过程为：每个renderer的宽度由父节点的renderer确定。父节点遍历子节点，确定子节点的位置(x,y)，调用子节点的layout方法确定其高度，父节点根据子节点的height, margin, padding确定自身的高度)。
4. 渲染，绘制render树：浏览器已经知道啦哪些节点要显示，每个节点的css属性是什么，每个节点在屏幕中的位置是哪里。就进入啦最后一步，按照计算出来的规则，通过显卡把内容画在屏幕上。

浏览器并不是一获取到css样式就立马开始解析而是根据css样式的书写顺序按照dom树的结构分布render样式，完成第（2）步，然后开始遍历每个树节点的css样式进行解析，此时的css样式的遍历顺序完全是按照之前的的书写顺序，在解析过程中，一旦浏览器发现某个元素的定位变化影响布局，则需要倒回去重新渲染。

例如css样式：{width: 100px; height: 100px; background-color: red;  position:  absolute;}当浏览器解析到position的时候突然发现该元素是绝对定位元素需要脱离文档流，而之前却是按照普通元素进行解析的，所以不得不重新渲染，解除该元素在文档中所占位置，然而由于该元素的占位发生变化，其他元素也可能会受到回流的影响而重新排位，最终导致（3）步骤花费时间太久而影响到（4）步骤的显示，影响了用户体验。

所以css的顺序也是会影响页面性能的。

# 正确的书写顺序

1. 位置属性(position display float left top right bottom  overflow clear  z-index等)
2. 大小(width, height, padding, border, margin)
3. 文字样式(font, line-height, letter-spacing, color- text-align等)
4. 文本属性(text-align、vertical-align、text-wrap、text-transform等)
5. 其他(animation, transition,box-shadow等)

# 真的有用吗

在[掘金上的这篇文章有过讨论](https://juejin.cn/post/6886348996990730253)，就结果而言这点上的优化效果无论有没有，规范下css的顺序也总是好事