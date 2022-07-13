单元测试不是在开发后对页面操作状态等进行测试，而是开发过程中对某些函数功能的测试，所以单元测试不需要覆盖所有内容，只对认为容易出错的复杂函数进行测试即可

# 配置

通过`pnpm add jest -D`下载

`jest`可以开箱即用，即下载后就可以在项目中使用它的api了

也可以通过`jest.config.js`进行更多配置，运行`pnpm jest --init`可以获得基础的配置文件，具体配置见[官网](https://jestjs.io/docs/configuration)

> - 如果`package.json`中配置了`type: module`会导致出错，需要将`jest.config.js`中的内容改成`json`格式并命令为`jest.config.json`，或者将内容作为es模块的默认导出
> - 如果使用`monorepo`架构，每个`package`中都需要一个单独的配置文件

## Typescript支持

使用ts时需要下载`ts-jest @types/jest`，再在`jest.config.json`中配置`preset: ts-jest`即可

## 测试文件

运行`jest`命令会自动对所有测试文件进行测试，测试文件一般放在`__test__`文件夹下，或者使用`xxx.test.js xxx.spec.js`命名，可以修改`testMatch`来修改

# 使用

## describe

通过该函数对测试进行分组，`describe test`和钩子函数都可以放到这里面

## 钩子函数

一共有四个钩子函数`beforeAll beforeEach afterAll afterEach`它们都是在一个测试用例即`test`函数或所有测试用例之前或之后运行的

`describe`中也可以使用钩子函数，其中的`before`函数会在全局的`before`函数后运行，`after`函数在全局的`after`函数前运行，类似洋葱模型

## test it

`test`函数和`it`是同一个函数，它用来创建一个测试

## expect

这是主要函数，需要在`test`中使用，它接收一个数据，一般直接把测试的函数的运行结果放入，并在之后调用一个匹配器来确认测试函数的返回结果和匹配器的匹配结果是否相同

```typescript
it("test sum", () => {
    expect(sum(1, 2)).toBe(3);
});
```

管局匹配器，可以查看官网，这里是一些常用的

| 函数                                                         | 说明                                                         |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| toBe                                                         | 判断基本数据和浅层比较对象                                   |
| toEqual                                                      | 深度判断对象                                                 |
| toMatch                                                      | 使用正则判断                                                 |
| toBeNull \| toBeUndefind \| toBeTruthy \| toBeFalsy          | 判断值是否和这些值一样，`truthy`指if中为true的值，`falsy`同理 |
| toBeGreaterThan \| toBeGreaterThanOrEqual \| toBeLessThan \| toBeLessThanOrEqual | 大于 大于等于 等                                             |
| anything                                                     | `null undefined`以外的值                                     |
| resolves \| rejects                                          | 取出`promise`的返回值                                        |
| extend                                                       | 自定义匹配函数                                               |

## mock

在某些时候测试需要依赖一些函数，这些函数不需要关心它的内部实现和执行结果，这时就可以使用`jest`提供的mock来创建一个这样的函数

### fn

最常见的情况就是判断回调函数是否被调用，测试时不需要关心回调函数的内容是什么，只需要知道在符合条件下函数是否被调用，下面就是一个例子

```typescript
// 需要测试的函数
export function useCB(cb: () => void) {
    cb();
}

// 
it("test cb", () => {
    const cb = jest.fn(); // 创建一个叫cb的函数
    useCB(cb);
    expect(cb).toBeCalled();
});
```

同时还可以指定函数的返回值，内部实现

```javascript
const cb = jest.fn().mockReturnValue("cb return"); // 定义回调函数的返回值为字符串

const cb = jest.fn((arg1, arg2) => arg1 + arg2); // 定义回调函数的实现

const cb = jest.fn().mockResolveValue("async return"); // 回调函数返回promise
```

不仅可以知道mock函数是否被执行，也可以通过下面的函数判断更多信息

| 函数                        | 说明                     |
| --------------------------- | ------------------------ |
| toBeCalled toHaveBeenCalled | 函数是否被执行           |
| toBeCalledTimes             | 函数是否被执行了指定次数 |
| toBeCalledWith              | 函数是否接收了指定的参数 |

### spyOn

`spyOn`是`fn`的语法糖，它使一个对象上的函数属性可以被监听

```javascript
const spy = jest.spyOn(video, 'play');
const isPlaying = video.play();

expect(spy).toHaveBeenCalled();
```

### TimerMock

在面对`setTimeout`等定时器是，测试可以通过`jest`提供的工具跳过这段等待时间

```typescript
export function timmerFnc(cb: () => void) {
    setTimeout(() => {
        cb();
    }, 2000);
}

// 这个测试会失败 因为还没到定时器的两秒 这时cb不会调用
test("timeer", () => {
    const cb = jest.fn(() => {
        console.log("use cb");
    });
    timmerFnc(cb);
    
    expect(cb).toBeCalled();
});

// 这里就会成功 使用了advanceTimersByTime，让定时器提前 
test("timeer", () => {
    jest.useFakeTimers();

    const cb = jest.fn(() => {
        console.log("use cb");
    });
    timmerFnc(cb);

    jest.advanceTimersByTime(4000);

    expect(cb).toBeCalled();
});
```

同时还有其它的函数可以使用

| 函数                 | 说明                                                         |
| -------------------- | ------------------------------------------------------------ |
| advanceTimersByTime  | 跳过指定时间                                                 |
| runAllTimers         | 所有定时器都跳过等待时间                                     |
| runOnlyPendingTimers | 只有还没到时间的定时器全部跳过等待，同时测试函数不会产生新的定时器，一般用于定时器嵌套的情况 |

# VScode插件

如果每次运行测试时使用`jest`命令，它会运行所有的测试，可以安装`Jest Runner`插件对指定的`describe`或`test`单独运行测试

> 如果`package.json`指定了`type: module`，需要将配置文件改为`json`格式