先看看Promise的代码转换为callback风格的话是什么样的，更方便后续的参考

```typescript
// promise
const prom = function (arg: string) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(arg);
        }, 1000);
    });
};
prom("a").then((fulfilled) => {
    console.log(fulfilled);
});

// callback
const cbfunc = function (arg: string, cb: (arg: string) => void) {
    setTimeout(() => {
        cb(arg);
    }, 1000);
};
cbfunc("b", (arg) => console.log(arg));
```

稍做分析，两者都是在异步中进行插入函数，不过`callback`是直接插入需要执行的代码，`promise`通过`resolve`函数收集需要的数据后在`then`中的回调中暴露出来，基于这个特性就能实现一个基本的构造函数了

## 构造函数

```typescript
class MyPromise<T> {
    private value!: T;
    private state: "pendding" | "fulfilled" | "rejected";
    constructor(args: (resolve: (value: T) => void, reject: (value: any) => void) => void) {
        this.state = "pending"; // 初始为pending

        const resolve = (value: T) => {
            if (this.state == "pending") {
                this.value = value;
                this.state = "fulfilled";
            }
        };
        const reject = (value: any) => {
            /* ... */
        };

        args(resolve, reject);
    }

    // 为了实现then的链式调用，这里then返回一个新的实例
    then<R>(onFulfilled: (fulfilled: T) => R): MyPromise<R> {
        return new MyPromise((resolve, _reject) => {
            switch (this.state) {
                case "fulfilled":
                    resolve(onFulfilled(this.value));
                    break;
                case "rejected":
                    /* ... */
                    break;
                case "pendding":
                    /* ... */
                    break;
            }
        });
    }
}
```

这个类现在已经能够收集参数并且通过它的`then`方法来获得收集的参数，但是因为`then`是在同步运行，如果在异步中则收集不到数据，只能实现下面的这种用法

```typescript
let mp = new MyPromise<number>((resolve) => {
    resolve(123);
});
mp.then((fulfilled) => {
    console.log(fulfilled);
    return "456";
}).then((fulfilled) => {
    console.log(fulfilled);
});
```

为了能处理异步数据，首先需要把`resolve`方法中的行为全部扔到下一个事件循环中，(这里用了`settimeout`放到了宏任务队列中，实际的是放到了微任务队列中)，这时就会让`then`方法比实例化时的`resolve`更快执行，这样只需要在`then`中收集到`resolve reject`时需要执行的函数，再在实例化的`resolve`收集到数据后执行就可以了

一个例子讲解大概的流程

```typescript
let p1 = new MyPromise<number>((resolve) => {
    console.log("init");
    setTimeout(() => {
        resolve(1);
    }, 1000);
});
let p2 = p1.then((fulfilled) => {
    console.log(fulfilled);
    return "2";
});
p2.then((fulfilled) => {
    console.log(fulfilled);
});
```

1. 执行构造函数中的同步内容，即打印`init`
2. 执行`p1`的`then`，收集传入的回调函数，同时返回出`p2`，`p2`继续同步收集`then`中的回调函数
3. 执行构造函数中的异步内容，同时让`resolve`收集到数据
4. 在下一个事件循环中再将收集到的数据传给`p1的then`收集的回调函数并执行该回调
5. 将回调的返回值作为`p2`的构造函数中的`resolve`接收的参数，然后同第四步
6. 如果出现错误则用`reject`函数接收参数，同时只能使用`then`中的第二个函数接收

---

具体实现代码，相比上面的`resolve`的流程，`reject`需要多添加一个错误传递的功能，具体见代码中的注释

```typescript
class MyPromise<T> {
    private value!: T;
    private reason!: any;
    private state: "pending" | "fulfilled" | "rejected";
    private successWaiting: ((fulfilled: any) => void)[];
    private faildWaiting: ((reason: any) => void)[];
    constructor(argFunc: (resolve: (value: T | MyPromise<T>) => void, reject: (value: any) => void) => void) {
        this.state = "pending";
        this.reason = undefined;
        this.successWaiting = [];
        this.faildWaiting = [];

        // 实例化时这两个函数不会执行
        // 它们在调用处的下一次事件循环中执行 这时候接收到resolve的数据
        // 然后把这个对象的then接收的回调函数执行
        const resolve = (value: T | MyPromise<T>) => {
            setTimeout(() => {
                if (this.state == "pending") {
                    if (value instanceof MyPromise) {
                        value.then(resolve); // 如果接收一个promise 在它完成后再resolve
                    } else {
                        this.state = "fulfilled";
                        this.value = value;
                        for (const func of this.successWaiting) {
                            func(this.value); // 这里执行then接收的回调
                        }
                    }
                }
            }, 0);
        };
        const reject = (value: any) => {
            setTimeout(() => {
                if (this.state == "pending") {
                    if (value instanceof MyPromise) {
                        value.catch(reject);
                    } else {
                        this.state = "rejected";
                        this.reason = value;
                        for (const func of this.faildWaiting) {
                            func(this.reason);
                        }
                    }
                }
            }, 0);
        };

        argFunc(resolve, reject);
    }

    then<RT, RF = never>(onfulfilled: (fulfilled: T) => RT | MyPromise<RT>, onrejected?: (reason: any) => RF | MyPromise<RF>): MyPromise<RT | RF> {
        return new MyPromise<RT | RF>((resolve, reject) => {
            const successFunc = (value: T) => {
                try {
                    const result = onfulfilled(value);
                    // 如果回调中新返回一个promise 在返回的promise完成时resolve结果
                    if (result instanceof MyPromise) {
                        result.then(resolve, reject);
                    } else {
                        resolve(result);
                    }
                } catch (e) {
                    // 如果在函数中抛出错误 在这里reject 它会在下一个proise中挂载reason
                    reject(e);
                }
            };
            const faildFunc = (reason: any) => {
                try {
                    if (onrejected) {
                        const result = onrejected(reason);
                        if (result instanceof MyPromise) {
                            result.catch(reject);
                        } else {
                            resolve(result);
                        }
                    } else {
                        reject(this.reason); // 如果没有错误处理函数，就继续抛出错误
                    }
                } catch (e) {
                    reject(e);
                }
            };

            switch (this.state) {
                // 调用时在pendding状态，将处理过程保存，等到这个实例中的resolve或reject中执行
                case "pending":
                    this.successWaiting.push(successFunc);
                    this.faildWaiting.push(faildFunc);
                    break;
                case "fulfilled":
                    successFunc(this.value);
                    break;
                case "rejected":
                    faildFunc(this.reason);
                    break;
            }
        });
    }

    // catch中的行为和then中处理reject一样
    catch<R>(onrejected: (e: any) => R | MyPromise<R>): MyPromise<R> {
        return new MyPromise<R>((resolve) => {
            if (this.state == "rejected") {
                // catch的返回值也是通过then的第一个回调获得
                resolve(onrejected(this.reason));
            } else {
                this.faildWaiting.push((reason: any) => resolve(onrejected(reason)));
            }
        });
    }

    finally(callBack: () => void) {
        return new MyPromise<never>(() => {
            switch (this.state) {
                case "pending":
                    this.successWaiting.push(callBack);
                    this.faildWaiting.push(callBack);
                    break;
                case "fulfilled":
                case "rejected":
                    callBack();
                    break;
            }
        });
    }
}
```

## 静态方法

### `Promise.resolve Promise.reject`

都是返回一个接收的参数组成的`Promise`，如果接收一个`Promise`，则直接返回它

```typescript
type MyAwaited<T> = T extends MyPromise<infer R> ? MyAwaited<R> : T;
function isMyPromise<T>(value: unknown): value is MyPromise<T> {
    return value instanceof MyPromise;
}

static resolve<V>(v: V): MyPromise<MyAwaited<V>> {
    // 虽然构造函数中也会处理接收的Promise 但是返回值和原本的不是同一个 所以这里直接返回它
    return isMyPromise<MyAwaited<V>>(v)
        ? v
        : (new MyPromise<V>((resolve) => resolve(v)) as MyPromise<MyAwaited<V>>);
}
static reject(v: unknown): MyPromise<never> {
    return isMyPromise(v) ? (v as MyPromise<never>) : new MyPromise((_, reject) => reject(v));
}
```

### `all`

通过接收一个`promise`组成的数组，如果全部都`resolve`就返回结果组成的数组，如果有一个`reject`就失败

其实下面的静态方法都是差不多的，只有`resolve reject`的位置不同而已

```typescript
static all<T extends readonly any[]>(promises: T): MyPromise<MyAwaited<T[number]>[]> {
    return new MyPromise((resolve, reject) => {
        const result: any[] = [];
        for (const promise of promises) {
            MyPromise.resolve(promise).then(
                (fulfilled) => result.push(fulfilled),
                (rejected) => reject(rejected)
            );
            if (result.length == promises.length) {
                resolve(result); // resolve必须在循环内，不然会先执行打印的宏任务
            }
        }
    });
}
```

> 数组中内置了异步迭代器的，所以如果要手动实现`Promise.all`可以用`for await ... of`，像下面这样

```javascript
function all(promises) {
    return new Promise(async (resolve, reject) => {
        const result = [];
        try {
            for await (const promise of promises) {
                result.push(promise);
            }
        } catch (e) {
            reject(e);
        }
        resolve(result);
    });
}
```

### `any`

any和`all`正好相反，只需要记录失败的数组，并且全部失败再`reject`

```typescript
static any<T extends readonly any[]>(promises: T): MyPromise<MyAwaited<T[number]>> {
    return new MyPromise((resolve, reject) => {
        const failds: any[] = [];
        for (const promise of promises) {
            MyPromise.resolve(promise).then(resolve, (e) => {
                failds.push(e);
                if (failds.length == promises.length) {
                    reject(failds);
                }
            });
        }
    });
}
```

### `race`

```typescript
static race<T extends readonly any[]>(promises: T): MyPromise<MyAwaited<T[number]>> {
    return new MyPromise((resolve, reject) => {
        for (const promise of promises) {
            MyPromise.resolve(promise).then(resolve, reject);
        }
    });
}
```

### `allSettled`

```typescript
static allSettled<T extends readonly any[]>(promises: T): MyPromise<Result<MyAwaited<T>>[]> {
    return new MyPromise((resolve) => {
        const result: Result<MyAwaited<T>>[] = [];
        for (const promise of promises) {
            Promise.resolve(promise).then(
                (fulfilled) =>
                result.push({ status: "fulfilled", value: fulfilled }) == promises.length
                ? resolve(result)
                : null,
                (e) =>
                result.push({ status: "rejected", reason: e }) == promises.length
                ? resolve(result)
                : null
            );
        }
    });
}
```





