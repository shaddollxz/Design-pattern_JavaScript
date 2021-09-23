# 中间件

## 中间件是啥

在每次路由执行函数时额外执行的函数，类似于vue-router的路由守卫

## 使用

通过`app.use()`来使用中间件，中间件和路由的执行顺序按上到下依次执行

在中间件中修改的`req res`在后续中间件和路由中都能访问到，如`req.body`就是`express.json()`挂载的属性

中间间也可以使用`res.send`等方法，但是同一条链上只能有依次`send`

### 中间件函数

函数接收三个参数：`req,res,next`，每个路由守卫都要`next()`以跳出这个中间件

> 每个路由也有第三个`next`参数，用来进入下一个中间件，如果没有`next()`该路由不会进入下面的中间件
>
> 如下代码，只有访问`/home`时才会打印
>
> ```javascript
> app.get("/about", (req, res, next) => {
>  res.status(200).send("/about");
>  next();
> });
> app.get("/home", (req, res) => {
>  res.status(200).send("/home");
> });
> 
> app.use((req, res, next) => {
>  console.log("收到请求2");
>  next();
> });
> app.use((req, res, next) => {
>  console.log("收到请求1");
>  next();
> });
> ```

`next()`方法也接收一个参数`“route”`，通过这样调用会跳过通过多个函数定义的中间件中后面的所有中间件

### 中间件的使用

- 只有函数：不指定路径，从上到下依次执行
- 路径加函数（限定路径的中间件）：第一个参数是中间件应用的路径，第二个是中间件函数
- 请求方法加请求路径：和路由定义一样
- 多个中间件函数：可以在一个中间件上添加多个，每个函数的`next()`按顺序跳向下一个中间件函数
- 数组：数组中放入中间件函数，按数组顺序执行，在数组中的中间件函数可以使用`next("route")`跳出数组执行
- express路由对象：通过使用`express.Router()`获得路由对象，在路由对象上定义路由，然后导入进`app.js`并`use`它来实现路由定义，如下，通过将路由单独分离出来更容易维护

```javascript
// router.js
const express = require("express");
const router = express.Router();

router.get("/aaa", (req, res) => {
    res.send("/aaa");
});

module.exports = router;

// app.js
const router = require("./router")
app.use(router)
```

通过在`use`中添加第一个参数，可以限定`router`中定义的路由的前缀，如下

```javascript
// app.js
app.use("/test",router)
```

这样只能通过`/test/aaa`来访问路由中定义的`/aaa`

- 错误处理中间件：在所有中间件后面进行错误处理，函数接收四个参数`err req res next`，通过在其它中间件中捕获到错误，然后通过`next(err)`来传递错误到该中间件中，如下（实际上`next`只要接收到`router`字符串以外的参数都会被判断为错误

```javascript
router.get("/aaa", (req, res, next) => {
    try {
        throw "错误";
    } catch (err) {
        next(err);
    }
});
app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).send("错误");
});
```

- 404处理中间件：通过在所有中间件最后，错误处理前添加一个不指定路径的中间件来处理not found

### express中的中间件

- express.json
- express.urlencoded
- express.raw
- express.text

上面四个用来处理对应格式的请求数据，将数据挂载到`req.body`中

- express.static

### 第三方中间件

使用npm下载后引入

[官方的中间件仓库](https://www.expressjs.com.cn/resources/middleware.html)
