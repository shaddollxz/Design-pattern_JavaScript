# 打包Vue3.x组件库并上传npm

本来写了几个组件想放npm上，结果放上去了遇到了很多坑，这里已经踩了大部分坑了，配置全列出来甚至只要复制粘贴就能发布成功

## 首先注册并登录npm

`npm adduser`

如果用的是淘宝镜像记得改回去

## 准备项目

将需要打包的组件或函数等文件放入`lib`文件夹下并定义一个`index.js`做主入口用来导出所有模块

项目结构：

```
│  .gitignore
│  package-lock.json
│  package.json		 // 包管理
│  README.md
│  webpack.config.js // 打包配置
│  
├─dist				// 输出文件夹
│     index.js		 // 打包结果
│      
├─lib				// 要打包的文件
│  │  index.js		 // 主入口
│  │  
│  ├─components
│  │      index.js
│  │      component.vue
│          
├─node_modules 		// 这里面都是打包需要的包，不需要下载vue本体啥的
```

## 配置webpack.config.js

配置如下，关于webpack的详细配置可以看我以前的博客

```javascript
const path = require("path");
const { VueLoaderPlugin } = require("vue-loader");

module.exports = {
    entry: {
        index: path.join(__dirname, "/lib/index.js"), // 入口文件
    },
    output: {
        path: path.join(__dirname, "/dist"), // 打包后的文件存放在dist文件夹
        publicPath: "/dist/", // 设置公共路径
        filename: "index.js", // 打包后输出文件的文件名
        libraryTarget: "umd",
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: "vue-loader",
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.less$/,
                use: ["style-loader", "css-loader", "less-loader"],
            },
            {
                test: /\.js$/,
                exclude: /node_modules|vue\/dist|vue-router\/|vue-loader\/|vue-hot-reload-api\//,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"],
                        plugins: ["@babel/plugin-transform-runtime"],
                    },
                },
            },
        ],
    },
    plugins: [new VueLoaderPlugin()],
    externals: /^(@{0,1})vue/i, // 导入时不要导入正则匹配的库 简单来说就是不要将vue打包进去
};
```

### 配置package.json

这里写入发布的包的信息，作者啥的，打包使用的插件，打包的脚本也写入

```json
{
    "name": "sdt3", // 发布时包的名字
    "version": "1.0.4",
    "description": "工具和组件库",
    "main": "./dist/index.js", // 指定包发布后引入包时的主文件
    "repository": {
        "type": "git",
        "url": "git+https://github.com/shaddollxz/SDT.git"
    },
    "keywords": [
        "vue3.x"
    ],
    "author": "shaddollxz",
    "license": "ISC",
    "bugs": {
        "url": "https://github.com/shaddollxz/SDT/issues"
    },
    "homepage": "https://github.com/shaddollxz/SDT#readme",
    "scripts": {
        "build": "webpack --mode production"
    },
    "dependencies": {},
    "devDependencies": {
        "@babel/core": "^7.11.5",
        "@babel/plugin-transform-runtime": "^7.15.0",
        "@babel/preset-env": "^7.11.5",
        "@vue/compiler-sfc": "^3.0.0",
        "babel-loader": "^8.1.0",
        "css-loader": "^4.2.2",
        "less": "^3.0.4",
        "less-loader": "^5.0.0",
        "style-loader": "^1.2.1",
        "vue-loader": "^16.8.1", // vueloader得指定15以上的版本才能下载到该版本的
        "webpack": "^4.44.1",
        "webpack-cli": "^3.3.12"
    }
}
```

然后`npm i npm run build`文件就打包成功了

### 发布

`npm publish`

