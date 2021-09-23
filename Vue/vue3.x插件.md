通过在`main.js`中`app.use()`来使用插件，插件用来配置一些全局的内容，如全局组件，全局属性，全局指令等

## 插件使用

通过导出一个含有`install`方法的对象，即可作为插件使用，`install`方法始终接收一个`app`对象--createVue的返回值，所以`app`即是全局vue实例。

## 配置全局属性

```javascript
// properties.js
export default {
    install(app) {
        app.config.globalProperties.$test = {
            a: "aa",
        };
    },
};
// main.js
import properties from "@/plugins/properties.js";
app.use(properties)
```

## 配置全局组件

```javascript
// components/index.js
import HelloWorld from "./HelloWorld.vue";
export default {
    install(app) {
        app.component("HelloWorld", HelloWorld);
    },
};

// main.js
import components from "@/components/index.js";
app.use(components)
```