# 将图片作为变量引入

可以通用在一个js文件中引入Vue构造函数，在原型上绑定属性来在全局使用。

```javascript
import Vue from "vue";
import img from "./img/img.png";
Vue.prototype.$img = {
    img,
};
```

再在`main.js`中引入即可

```javascript
import "./utils/imgs.js"
```

在Vue3.x中使用`app.config.globalProperties.xxx`来设置

```javascript
// utils/imgs
import logo from "@/assets/logo.png";
export { logo };

// main.js
import * as imgs from "./utils/imgs";
app.config.globalProperties.$img = imgs;
```

# 将图片放入`public`静态文件夹，使用相对于index的路径

```javascript
<!-- index.html -->
<img :src="'./logo.png'" alt="" />
```

