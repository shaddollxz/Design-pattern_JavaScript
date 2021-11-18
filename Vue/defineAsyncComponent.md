# vue3

## `defineAsyncComponent`

创建一个只有在需要时才会加载的异步组件

简单来说就是按需加载，和`vue-router`中的异步组件加载方式相同，会在打包时单独打包成一个js文件，不过`router`是页面级的加载，而该方法是定义组件级的，如果组件上有`v-if`或者通过`<components>`组件使用，会根据是否显示来导入并渲染。

## 案例

加载模型的是很老的代码，在代码里使用了`iife`并且在全局中挂载了过多属性，所以只要`import`导入封装的live2d组件就会执行全局属性的挂载，而在手机上使用live2d造成的性能消耗太大，所以在pe下模型是不能加载的，这里我将模型封装为一个组件，通过进入网站时屏幕的大小判断是否是手机再确定是否渲染组件

但是`v-if`只能决定是否渲染组件，在导入组件时`iife`就会执行并且挂载全局属性，这不能达到最佳优化，这时就可以使用`definAsyncComponent`来导入组件，就和上面说的一样，是和`vue-router`一样的懒加载形式，它只会在组件需要渲染时才导入并渲染组件

具体使用见下：

Live2D.js

```vue
<script setup>
import loadL2D from "@/plugins/loadL2D.js"; // 在导入这个函数时会执行其它代码
onMounted(() => {
    loadL2D({
        path: "/Live2D/angel/model.model.json",
    });
});
</script>
```

app.js

```vue
<template>
    <Live2D v-if="!isMobile"></Live2D>
</template>
<script setup>
	import { defineAsyncComponent, onMounted } from "@vue/runtime-core";
	const Live2D = defineAsyncComponent(() => import("./views/Layout/Live2D.vue"));
</script>
```

## 具体的Api

见[官网](https://v3.cn.vuejs.org/api/global-api.html#defineasynccomponent)吧，一般情况下直接导入就已经够用了

## 其它能用的地方

在能确定不是经常使用的组件都可以用该方法优化，比如登录弹窗组件这种，使用频率很低的组件就可以使用。

# vue2

在vue2中实现懒加载需要在`components`选项中使用`import()`函数即可

```vue
<script>
export default {
    components: {
        test: () => import("./test.vue")
    }
}
</script>
```



