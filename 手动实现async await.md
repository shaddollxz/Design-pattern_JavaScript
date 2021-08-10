

众所周知，async/await只是一个语法糖，它是基于生成器来实现的，我根据网上的资料，从头开始写出它中间的原理实现。

# 生成器

生成器是在定义函数时在function后添加*定义的，像这样：`function* func(){}`，执行生成器函数后会得到一个迭代器，在生成器函数中能支持`yield`来暂停函数，直到迭代器调用`next`方法.同时`next`能传入一个参数来作为yield的值。



这里先定义两个异步函数来作为以后的实验对象：

```javascript
function afunc() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve("afunc");
        }, 1000);
    });
}
function bfunc() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve("bfunc");
        }, 2000);
    });
}
```

# 第一版

首先分别定义两个函数，一个是收集在async函数中需要使用的异步函数，一个是async函数主体在这里运行异步的函数。

```javascript
function collector(...fn) {
    return function () {
        for (const item of fn) {
            item().then((fulfilled) => it.next(fulfilled));
        }
    };
}
function* async(...fn) {
    let inner = collector(...fn);
    console.log("aaa");
    console.log(yield inner());
    console.log("bbb");
    console.log(yield inner());
}
let it = async(afunc, bfunc);
it.next();

// 运行结果： aaa afunc bbb bfunc
```

可以看到，已经可以让同步方法在两个异步函数中间了，但是这个方案有个问题，本来这个函数期待是三秒打印完，这里只花了两秒，原因在于在`collector`中同步进行了数组遍历，所以需要把。

# 第二版

既然原因是同步执行了收集到的函数，那我直接写在函数体里不就行了？这样就可以得到这个并不好用的第二版：

```javascript
function* generator() {
    console.log("aaa");
    let result = yield afunc().then((fulfilled) => {
        it.next(fulfilled);
    });
    console.log(result);
    let other = yield bfunc().then((fulfilled) => {
        it.next(fulfilled);
    });
    console.log(other);
}
it = generator();
it.next();

// 运行结果： aaa afunc bbb bfunc
```

不过既然已经得到了想要的结果，这里只需要把它包装一下就可以了

# 第三版

这一版就相当接近async/await的写法了，通过在生成器函数中定义函数执行顺序，在每次执行异步函数时跳出，等到异步函数执行完成后再进行下一步。

```javascript
function* generator() {
    let result = yield afunc();
    console.log(result);
    let other = yield bfunc();
    console.log(other);
}
myAwait(generator);

function myAwait(genner, ...args) {
    let iter = genner(...args); //得到生成器的迭代器
    return new Promise((resolve, reject) => {
        let result; //iter每次暂停时的结果
        //! inner就是在手动迭代iter
        let inner = function (yield) {
            result = iter.next(yield); //开始迭代 将这里的yield当作yield传入生成器
            if (result.done) {
                //迭代结束：
                resolve(result.value); //Promise结束
            } else {
                //如果没有结束 等到promise的结束继续递归
                return Promise.resolve(result.value).then((fulfilled) => {
                    inner(fulfilled);
                });
            }
        };
        inner(); //迭代器第一次不应该传入参数
    });
}
```

只要再加上一些错误处理，这样一个手写async/await就完成了。