# 基本语法

## 变量

通过`$`定义，可以通过它传递css变量，也可以传递sass变量

```scss
:root {
    --fontsize-default: 2rem;
}
$aa: var(--fontsize-default);
.box {
    font-size: $aa;
    color: black;
}

.box{
    font-size: var(--fontsize-default);
}
```

> 在sass中，变量名的短横线和下划线是互通的，`a-a`和`a_a`代表同一个变量

变量能被再次赋值

```scss
$color: red;
$color: blue;
.box {
    color: $color;
}

.box{
    color: blue;
}
```

变量还能放入多个值，可以当作数组看待，它能被函数循环

```scss
$widths: 10px 20px;
```

## 嵌套

可以通过`&`父选择器选择外层元素，因为一个元素只会有一个父级，这个操作符实际上就是把父级的选择器搬过来

```scss
div > a {
    color: green;
    p + & {
        color: red;
    }
}

div > a {
  color: green;
}
p + div > a {
  color: red;
}
```

sass还支持属性的嵌套，通过这个语法可以把同前缀的属性在一个块中写入

```scss
div {
    font: {
        size: 100px;
        weight: boild;
    }
}

div {
  font-size: 100px;
  font-weight: boild;
}
```

还能配合缩写属性

```scss
nav {
  border: 1px solid #ccc {
     left: 0px;
     right: 0px;
  }
}

nav {
  border: 1px solid #ccc;
  border-left: 0px;
  border-right: 0px;
}
```

通过`@at-root`选择器可以跳到最外层元素同级

```scss
.parent {
    color: #f00;
    @at-root .child {
        width: 200px;
        @at-root & > div {
            color: red;
        }
    }
}

.parent {
  color: #f00;
}
.child {
  width: 200px;
}
.child > div {
  color: red;
}
```

>  `@at-root selector { }`只是一个语法糖，多个选择可以`@at-root { .box1 { } .box2 { } }`这样写

## 插值

通过这个语法可以将**sass变量**或**父级选择器**或**字符串**插入到任意地方

```scss
$a: red;
div {
    .#{$a}-color {
        color: #{$a};
        background-color: $a;
    }
}

div .red-color {
  color: red;
  background-color: red;
}
```

## 计算

scss中的运算符有常见的数学运算符和`== != <`等判断符，具体见[这里](https://sass-lang.com/documentation/operators)

在使用除法时，除数不能直接是个值，应该是个变量

```scss
$a: 2;
div {
    height: 100px / $a; // 如果是2编译后没有区别
}
```
> 因为sass是编译时运行的，如果需要依赖如vh之类的值或进行不同单位间的计算，应该使用原生css的`calc()`函数计算
> 
## 继承

通过该字段继承指定的元素和指定元素的子元素的所有样式

```vue
<template>
    <div class="outer">
        <div class="box"></div>
    </div>
    <div class="box">
        <div class="inner"></div>
    </div>
</template>

<style lang="scss" scoped>
.outer {
    width: 200px;
    height: 200px;
    color: blue;
    .box { // 因为外层有个同名元素这个.box无法被继承
        @extend .outer;
    }
}
.box {
    height: 100px;
    width: 100px;
    color: red;
    .inner {
        @extend .outer;
        color: yellow;
    }
}
</style>
<style>
    .box .inner{
        width: 200px;
        height: 200px;
        color: yellow;
    }
</style>
```

同时`sass`新增了一个占位符选择器`%`，该选择器中的样式不会被编译，只能被继承

```scss
%extreme {
    color: blue;
    font-weight: bold;
    font-size: 2em;
}

.box {
    @extend %extreme;
}
```

# 模块化

## `@import`

> 在`dart-sass`中更推荐使用`@use @forward`，并将来会删除这个语法

将其它文件中的所有规则放入这个文件

>  如果要使用原生的css导入，导入的文件后缀为css或使用`@import url()`导入，不建议使用原生导入，它会导致闪屏和加载慢的问题

### 局部文件

局部文件以下划线`_`开头，且不会被编译为css，只能被用作导入，导入时可以不使用后缀和前缀，所以不能同时存在含有下划线和不含下划线的同名文件

```scss
// _b.scss
$color: red;
.b {
    color: $color;
}
// index.scss
@import "./b"
```

### 嵌套导入

scss还支持在样式中导入，这时模块中的样式会作为子级元素合并

```scss
// index.scss
.box {
    color: green;
    @import "./b";
}

.box {
  color: green;
}
.box .b {
  color: red;
}
```

### 默认值

在导入时也会把scss变量一起导入，如果导入的地方需要自定义这个值，这时把变量设置一个默认值

```scss
// _a.scss
$color: red !default;
.a {
    width: 10px;
    height: 10px;
    color: $color;
}

// index.scss
$color: blue;
@import "../assets/style/a";

// index.css
.a {
    width: 10px;
    height: 10px;
    color: blue;
}
```

## `@use`

上面虽然说推荐`@use`，但它和`@import`还是有区别，具体见[这里](https://sass-lang.com/documentation/at-rules/import)

稍微总结下就是

- `@import`导入是全局导入的，scss**变量`$`，混合`@mixin`，函数`@function`**等都会被直接导入，这导致了代码不够清晰：如果从a中导入了b的变量，又将a导入c，那么c可以使用b中的变量，明显可见的混乱
- `@import`会形成重复导入产生亢余代码
- 没有私有变量，某些不应该被导入的变量也会被导入
- `@extends`也会出现混乱

准确来说解决了上述问题的`@use`才真正形成了模块化

### 命名空间

默认形况下，`@use`导入的变量是以文件名为命名空间的

```scss
// _a.scss
$color: red;
.a {
    width: 10px;
    height: 10px;
    color: $color;
}
// index.scss
@use "../assets/style/a";
.box {
    background-color: a.$color;
}

// index.css
.box {
    background-color: red;
}
.a{
    width: 10px;
    height: 10px;
    color: red;
}
```

可以通过`@use "xxx" as name`来指定命名空间的名字

`@use "xxx" as *`会把命名空间抹除，这和`@import`的行为一致

### 隔离模块

在一个sass文件中`@extends`规则只会寻找该文件中的类名，不会出现找到`@import`进来的类的情况

### 默认变量

在模块中仍然能声明默认变量`!default`，默认变量只能在导入时覆盖`@use "xxx" with ($var: xxx)`

### 私有变量

通过前面加上`_`来指定该变量为私有变量，不会被导入

> 在变量中`_`和`-`是一样的，不过`_`更符合一般习惯

```scss
// _a.scss
$_color: red;
// index.scss
@use "../assets/style/a";
.box {
    background-color: a.$_color; //error Undefined variable.
}
```

## `@forward`

直接使用`@forward "url"`时它的行为和`@import`相似，但是导入的内容不能使用，可以被其它模块导入

说人话就是它和JS中的`export * from "xx"`一样，从这个模块从导出其它模块

### 设置默认值

`@forward`同时还支持设置变量

```scss
// _a.scss
$color: red !default;
@mixin bg {
    background-color: $color;
}
// _index.scss
@forward "./a" with ($color:blue);

// use.scss
@use "../assets/style" as a;
.box {
    @include a.bg;
    color: a.$color;
}

// use.css
.box{
    background-color: blue;
    color: blue;
}
```

### 控制导出

通过`hide show`来控制模块哪些变量对外部可见

```scss
@forward "./a" show $color;

@use "../assets/style" as a;
.box {
    @include a.bg; // error undefined
    color: a.$color; // success
}
```

### 变量前缀

```scss
@forward "./a" as a-*;

@use "../assets/style" as model;
.box {
    @include model.a-bg;
    color: model.$a-color;
}
```


# 混合

## `@mixin`

类似一个函数，通过`@mixin name {}`定义一套规则，在其它地方通过`@include name`引入，同时支持参数和默认参数，语法于js一样

```scss
@mixin box($bg: black, $color: white) {
    width: 100px;
    height: 100px;
    background-color: $bg;
    .inner {
        color: $color;
    }
}

$color: red;
.box {
    @include box($color: green, $bg: red); // 指定了参数的值，这里的color和外面的变量color不同
    @include box($color); // 这里的color是外面的变量color，是第一个参数
}

.box{
    width: 100px;
    height: 100px;
    background-color: $bg;
}
.box .inner{
    color: white;
}
```

## `@content`

在`@mixin`中添加`@content`后在混入时也可以添加新的片段，新添加的片段不能使用`@mixin`作用域中的变量

```scss
@mixin bg {
    background-color: red;
    @content;
}
.box {
    @include bg {
        font-size: 1rem;
    }
}

.box{
    background-color: red;
    font-size: 1rem;
}
```

# 函数

## 内置函数

`sass`提供了一些常用函数，现在所有函数都需要导入，如

```scss
@use "sass:color"
```

提供了`color list map math meta selector string`模块

全部函数见[这里](https://sass-lang.com/documentation/modules)

## 自定义函数

自定义函数使用`@function name(arg) { }`定义，并且必须有个`@return`返回值

```scss
@function twoWidth($width) {
    @return $width * 2;
}

.box {
    height: 10px;
    width: twoWidth(10px);
}
```

## 流程控制语句

### if

因为`scss`是编译时执行，不要把`@if`和`@media`搞混了

```scss
$height: 200px;
.box {
    @if $height > 100px {
        height: 100px;
    } @else {
        height: 200px;
    }
}
```

### for

**for...to 循环不会循环i到最后一个 for...through会循环到最后个**

```scss
@for $i from 1 to 3 {
    .div#{$i}{
       height: $i*20px;
    }
}

.div1 {
    height: 20px;
}
.div2 {
    height: 40px;
}
```

### each

类似`for ... of`，循环数组变量

```scss
$colors: red green blue;
@each $color in $colors {
    .div#{$color} {
        background-color: $color;
    }
}

.divred{
    background-color: red;
}
.divgreen{
    background-color: green;
}
.divblue{
    background-color: blue;
}
```

### while

```scss
$height: 2;
@while $height < 3 {
    div#{$height} {
        height: $height * 10px;
    }
    $height: $height + 1;
}

.div1 {
    height: 10px;
}
.div2 {
    height: 20px;
}
```

