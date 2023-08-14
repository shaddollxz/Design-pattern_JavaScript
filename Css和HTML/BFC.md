# 触发BFC的方式

- 是body 元素
- 浮动元素：float 除 none 以外的值
- 绝对定位元素：position (absolute、fixed)
- display 为 inline-block、table-cell、table-caption、flex、inline-flex
- overflow 除了 visible 以外的值(hidden、auto、scroll)

# BFC规则

- 有BFC容器内box会垂直放置
- 两个元素的margin会重叠
- BFC容器不会与浮动重叠
- BFC高度包括浮动元素高度
- BFC容器内元素不会影响到外面元素

# 应用

## 放置margin重叠

只需要在两个box外再套上一个div，让它们不属于同一个BFC即可。

## 清除浮动

把浮动元素的父元素设置为BFC，BFC高度会包括浮动的。

## 避免浮动重叠

将浮动元素的下一个元素设为BFC，后面的元素都不会与浮动元素重叠。

## 清除文字环绕

给文字标签设置BFC就不会让文字环绕浮动元素了

## 自适应布局

```html
<style>
.main {
    height: 500px;
}
.main > div {
    height: 100%;
}
.center {
    width: auto;
    overflow: hidden;
    margin: 0 100px;
    background-color: aqua;
}
.left {
    width: 100px;
    float: left;
    background-color: aquamarine;
}
.right {
    width: 100px;
    float: right;
    background-color: beige;
}
</style>

<div class="main">
    <div class="left"></div>
    <div class="right"></div>
    <div class="center">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Non placeat quae libero
        quidem, suscipit ex in quas recusandae vel, iste odio velit commodi blanditiis
        minus fugit unde soluta? Dolor, sunt.
    </div>
</div>
```

