"## 必要库

```
npm i typescript @types/node nodemon ts-node -D
```

## 运行配置

通过全局下载`npm i ts-node -g`然后选定入口文件来加载`ts`文件

```
ts-node src/app.ts
```

可以配合`nodemon`来热更新代码
``
```
nodemon --watch src/**/*.ts exec ts-node src/app.ts
```

在根目录下配置`nodemon.json`可以直接使用`nodemon`命令
``
```json
{
    "watch": [
        "src/**/*.ts"
    ],
    "ignore": "node_modules",
    "exec": "ts-node src/app.ts",
    "ext": "ts"
}
```

可能遇到bug，按照下面的配置操作

`ts-node`对`esmodule`支持得专门配置，具体可以看[官方文档](https://www.npmjs.com/package/ts-node#commonjs-vs-native-ecmascript-modules)，这里提供两个解决方法

用文档中介绍的方法，只需要在`nodemon.json`中配置`exec`选项

```json
{
    "watch": [
        "src/**/*.ts"
    ],
    "ignore": "node_modules",
    "exec": "node --loader ts-node/esm src/app.ts",
    "ext": "ts"
}
```

---

需要先配置`tsc`的编译结果为`commonjs`，并且`package.json`中不能有`type:module`来声明使用的是`esmodule`，然后开启`allowSyntheticDefaultImports esModuleInterop`选项支持书写时使用`esmodule`模式写法

```json
"compilerOptions": {
    "module": "commonjs",
    "allowSyntheticDefaultImports": true, 
    "esModuleInterop": true
}
```

这样就可以使用`esmodule`规范写代码，编译出`commonjs`规范的代码

如果要编译出`esmodule`规范的代码，需要在tsc编译时指定`module`

同时因为`package.json`中没有`type:"module"`属性，不能直接运行`esmodule`代码，需要在`node`命令后添加其它指令（第一个指令已经废弃，经过查阅`node`文档，还有第二个[实验性的指令](http://nodejs.cn/api/cli.html#--experimental-loadermodule)）：

```json
{
    "scripts": {
        "dev": "nodemon",
        "build": "tsc --m esnext",
        "serve": "node --experimental-modules bin/app.js",  
        "serve": "node --experimental-loader=./bin/app.js"
    }
}
```
