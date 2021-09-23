# 打包命令

`webpack --mode development/production`

# 默认模式

在webpack打包时默认的位置是当前目录下的`./src/index.js`

# 通过命令

通过命令`webpack --mode ./文件夹/文件 -o ./文件夹/文件夹 development`来自定义打包内容和输出，打包输出为`main.js`

# 通过配置文件配置

创建`webpack.config.js`作为配置文件。

- entry：打包的入口文件
- output：打包的输出路径 
- module：打包非js文件时需要引入模块
- plugins：其它的一些插件，如ESlint
- mode：打包的方法 有开发模式和生产模式

# entry

- 只有一个入口时用字符串形式写路径
- 有多个入口时有两种写法
  - 数组写法：把所有入口文件打包进同一个文件
  - 对象写法：把入口文件按键名分别打包
  - 对象加数组写法：按照上面的规则打包

# 打包html

## 使用插件

要在配置中引入插件来提供打包功能，sass或less用的是模块

**下载插件：**`npm i html-webpack-plugin -d`

**使用插件：**在plush中`new`引入的插件，如果不写实例化时的设置，会创建空的html引入打包的js文件；实例时的参数见下面代码的注释。



## 打包多个html

plush数组中传入多个插件的实例来打包，通过`chunk`放入打包的js名来引入。

```javascript
entry: {
        vue: "./src/myVue/vue.js",
        test1: "./src/js/test.js",
        test2: "./src/js/index.js",
        test1Style: "./src/js/test1Style.js", // 用js来设置引入的css
},
output: {
        filename: "[name].js", // name对应entry里的key
        path: path.resolve(__dirname, "build"),
},
plugins: [
    //? test1
        new HtmlWebpackPlugin({
            template: "./src/test1.html",
            filename: "test1.html",
            chunks: ["test1", "test1Style"], 
            minify: {
                //collapseWhitespace: true, //删除空格
                removeComments: true, // 删除注释
            },
        }),
        //? test2
        new HtmlWebpackPlugin({
            template: "./src/test2.html",
            filename: "test2.html",
            chunks: ["vue", "test1"],
            minify: {
                //collapseWhitespace: true, //删除空格
                removeComments: true, // 删除注释
            },
        }),
]
```

# 打包CSS

**下载插件：**`npm i css-loader style-loader -d`

**使用插件：**在`module.rules`中放入设置

被打包的css通过`requre`引入一个js文件，然后配置js文件进需要使用的html

```json
module: {
        rules: [
            //! 将样式写入head里
            {
                test: /\.css$/, //? 匹配css文件
                use: ["style-loader", "css-loader"],
                // loader:"", //! 如果只引入一个
            },
            {
                test: /\.less$/,
                use: ["style-loader", "css-loader", "less-loader"],
            },
        ],
},
```



```javascript
// test1Style.js
require("../css/style.css");
require("../css/lessStyle.less");
```



# 打包Sass Less（打包进html）

**下载插件：**`npm i less less-loader -d` `npm i node-sass sass-loader -d`

**使用插件：**与打包css相似

# 打包Sass Less (打包为单独文件)

**下载插件：**`npm i mini-css-extract-plugin -d`

**使用插件：**与使用打包html的插件相似 需要在module中将原来的`style-loader`改为插件的`loader`静态方法。

```javascript
module:{
    rules:[
        //! 将样式单独引入
        {
            test: /\.css$/, //? 匹配css文件
            use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"],
        },
        {
            test: /\.less$/,
            use: [MiniCssExtractPlugin.loader, "css-loader", "less-loader", "postcss-loader"],
        },
    ]
}
```

# Css的浏览器兼容性

**下载插件：**`npm i postcss-loader postcss-preset-env -d`

**使用插件：**在样式模块最后新加入`postcss-loader`；新建`postcss.config.js`文件配置插件，然后在`package.json`中配置。

```javascript
// postcss.config.js
module.exports = {
    plugins: [require("postcss-preset-env")()],
};

// package.json
{"browserslist": [
        "> 0.2%",
        "not dead"
]}
```



# Css的压缩

**下载插件：**`npm i optimize-css-assets-webpack-plugin -d`

**使用插件：**在plugin中实例化插件。

```javascript
plugins:[new OptimizeCssAssetsWebpackPlugin()],
```



# 打包图片资源

**插件下载：**`npm i url-loader file-loader -d` 在html中引入图片需要`npm i html-withimg-loader -d`



# 开发服务器

**插件下载：**`npm i webpack-dev-server -g -d`

通过`webpack serve`来运行

在`webpack.config.js`中能通过`devServer`进行配置

# 删除无用代码

## 删除js

在webpack中自带了删除无用js代码的工具，只需要在运行webpack时处于pro模式，且js代码是用ES6导入的，就可以进行删减。

## 删除css

**插件下载：**`npm i purgecss-webpack-plugin -d`

**插件使用：**在`plugins`中添加插件实例

```javascript
plugins:[new PurgecssPlugin({
    paths:golb.sync(`${Path.src}/**/*`,{ nodir:true })
})]
```

