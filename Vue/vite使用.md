# 特性

## 静态资源加载

和webpack使用`require()`函数不同，vite可以直接`import`一个媒体资源作为url绑定到模板上，具体的支持类型有`["png", "jpe?g", "gif", "svg", "ico", "webp", "avif",  "mp4", "webm",  "ogg", "mp3", "wav", "flac", "aac", "woff2?", "eot", "ttf",  "otf",  "wasm"]`，还能通过`assetsInclude`选项配置

```vue
<template>
    <img alt="Vue logo" :src="img" />
</template>
<script setup lang="ts">
	import img from "./assets/logo.png";
</script>
```

导入时可以在文件后面加上后缀来将文件作为特定类型导入

**raw**，将文件作为字符串导入（当然如果是`js ts`代码，也会被作为文本导入

```javascript
// test.txt
aaaaaaa
// vue
import text from "./test.txt?raw";
console.log(text); // aaaaaaa
```

**url**，将文件的url导入

```javascript
// src/App.vue
import Worker from "./worker.js?url";
console.log(Worker); // /src/worker.js 可以看到时相对当前项目根本目录的绝对路径
```

**worker | sharedworker**，将一个webworker作为构造函数导入，同时支持使用`import`在worker中导入其它模块，然后就和普通worker一样使用

> 注意：该功能在开发时只有`chorme`支持，打包上线后所有浏览器都支持~~~到处百度错误最后发现文档里写了~~~

```javascript
// plugin
export default function (str) {
    return str + " by plugin";
}
// worker
import plugin from "./plugin.js";
self.onmessage = ({ data }) => {
    self.postMessage(plugin(data + " from worker"));
};
// vue
import TestWorker from "./worker.js?worker";
const worker = new TestWorker();
worker.onmessage = ({ data }) => {
    console.log(data);
};
worker.postMessage("data");
```

如果脚本代码量不大，可以用`?worker&inline`转为base64内联进代码

**json**，json文件可以直接`import`进代码，同时还支持具名导入，参与到`treeshaking`优化中

## 批量导入

和`webpack`的`require.content`一样，`vite`同样支持批量导入

- `import.meta.glob("./dir/*.js")`，动态导入模块，使用该方法导入的文件被打包时会单独打包
- `import.meta.globEager("./dir/*.js")`，打包时不会单独打包

```javascript
const modules = import.meta.glob('./dir/*.js') // 导入dir下的所有js文件
// 会被编译为
const modules = {
  './dir/foo.js': () => import('./dir/foo.js'),
  './dir/bar.js': () => import('./dir/bar.js')
}
// 因为是懒加载，所以需要里面的模块得异步使用
modules["./dir/foo.js"]().then(...)

const modules = import.meta.globEager('./dir/*.js')
// vite 生成的代码
import * as __glob__0_0 from './dir/foo.js'
import * as __glob__0_1 from './dir/bar.js'
const modules = {
  './dir/foo.js': __glob__0_0,
  './dir/bar.js': __glob__0_1
}
```

# 常用配置

这里只是我开发时用到的配置，所有配置见[官方文档](https://vitejs.cn/config)

> 如果使用的是TS，node的模块不能直接引用，要先下载node的模块类型包`npm i @types/node -D`

## 路径别名

与`vue.config.js`一样配置

> 如果配置了ts，还要去`tsconfig.json`中配置一次路径别名

```json
resolve: {
    alias: {
        "@": path.resolve(__dirname, "src"),
    },
},
```

## 代理服务

代理配置也和`webpack`一样

```javascript
server: {
    proxy: {
        "/api": {
            target: "xxx/xxx",
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, '')
        },
    },
},
```

## 静态资源目录

默认为`public`

## 打包输出目录

默认为`dist`

```javascript
build: {
    outDir: "dist",
},
```

## 强制排除依赖项

上线后某些脚本使用`CDN`引入，而开发时则是下载到项目，或者如果项目是组件库，打包结果也不需要某些依赖，这时打包就需要通过该选项排除这些外部脚本

> 具体打包库文件的配置见后续文章

```javascript
optimizeDeps: {
    exclude: ["vue"],
},
```

# 插件

vite插件使用数组放入，可以指定一个数组再push插件进去最后挂载

```typescript
const plugins: (PluginOption | PluginOption[])[] = [];
plugins.push(vue());
```

## 依赖分析

相当于`webpack`的`webpack-bundle-analyzer`，用来分析打包后代码大小的

有两个包可以选一个用

```
npm i rollup-plugin-analyzer -D // 在控制台输出
npm i rollup-plugin-visualizer -D // 在网页输出~~~没webpack的好看~~~
```

```javascript
import analyzer from "rollup-plugin-analyzer";
plugins.push(analyzer());

import visualizer from "rollup-plugin-visualizer";
plugins.push(visualizer({ open: true, gzipSize: true, brotliSize: true }));
```

## gzip打包

```
npm i vite-plugin-compression -D
```

```javascript
import viteCompression from "vite-plugin-compression";
plugins.push(viteCompression());
```

## pwa支持

更详细配置和SSR支持见[文档](https://vite-plugin-pwa.netlify.app/guide/)

```
npm i vite-plugin-pwa -D 
```

```java
import { VitePWA } from "vite-plugin-pwa";
plugins.push(
    VitePWA({
        includeAssets: ["favicon.svg", "favicon.ico", "robots.txt", "apple-touch-icon.png"],
        manifest: {
            name: "Name of your app",
            short_name: "Short name of your app",
            description: "Description of your app",
            theme_color: "#ffffff",
            icons: [
                {
                    src: "pwa-192x192.png",
                    sizes: "192x192",
                    type: "image/png",
                },
                {
                    src: "pwa-512x512.png",
                    sizes: "512x512",
                    type: "image/png",
                },
                {
                    src: "pwa-512x512.png",
                    sizes: "512x512",
                    type: "image/png",
                    purpose: "any maskable",
                },
            ],
        },
    })
);
```

在public下创建`robots.txt`, `favicon.svg`, `favicon.ico`, `apple-touch-icon.png`

**robots.txt：**这个文件是针对爬虫的文件，告诉爬虫网站哪些信息可以爬取，以下是默认配置

```
User-agent: *
Allow: /
```

**index.html：**还需要在`index`中配置和插件配置匹配的`head`

```html
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Your app title</title>
  <meta name="description" content="Your app description">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="alternate icon" href="/favicon.ico" type="image/png" sizes="16x16">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180">
  <link rel="mask-icon" href="/favicon.svg" color="#FFFFFF">
  <meta name="theme-color" content="#ffffff">
</head>
```

**main.js：**在这里配置app更新时提示用户刷新页面的按钮，如果嫌麻烦又不要需要很好的用户体验，可以在插件配置时加上` registerType: "autoUpdate"`

```javascript
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {}, // 这里面弹出提示用户更新的按钮 刷新按钮绑定updateSW()方法
  onOfflineReady() {}, // 这里面弹出提示用户app安装成功的按钮
})
```

