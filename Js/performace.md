# 介绍

`performance Api`是浏览器内置的一个性能检测Api，通过它可以精准知道页面的性能相关数据，也可以做到比`Date`更加准确的时间差计算

# 计算时间Api

`performance`提供了`mark`方法来创建时间戳，通过传入一个字符串作为name来标记这个时间戳的名字

`getEntriesByName getEntriesByType("mark")`两个方法来获得时间戳组成的数组，时间戳包含设置时的时间等信息

`measure`用来创建一个时间段的信息，通过指定时间段的name，开始时间戳和结束时间戳来创建，它也可以通过`getEntriesByName getEntriesByType("measure")`来获取，它包含时间段的开始时间和经过时间等信息

通过`performance.clearMarks performance.clearMeasures`来清空所有的时间戳的时间段

下面这段代码就能获取执行for循环使用的毫秒数

```typescript
performance.mark("start");

for (let i = 0; i < 1e8; i++) {}

performance.mark("end");

performance.measure("during", "start", "end");
console.log(performance.getEntriesByName("during")[0]);
```

# 页面性能Api

通过`performance`也能获取页面的加载性能，通过`performance.timing`可以获得对应事件点的开始时间，不过该对象已经被标准废除，**不应该在生产环境使用**

它可以通过属性的加减获得准确的时间信息，以下都是以毫秒为单位

- `navigationStart` 所有记录中最先记录的时间，它记录上一个网页跳转到这个网页时`unload`执行结束时的时间戳
- `connectStart - connectEnd`建立TCP连接使用的时间
- `domLoading - domInteractive`页面dom解析使用的时间（只是解析html的dom，还没有运行js脚本）
- `domInteractive - domContentLoadedEventStart`解析内联资源（css，js）使用的时间（只是解析，下面才是执行）
- `domContentLoadedEventStart - domContentLoadedEventEnd`页面进入时立即执行的脚本（onload函数）使用时间
- `domComplete - navigationStart`获得从dom解析完成到页面完全加载的时间，这段时间一般就是用户等待网页加载的时间（并不是白屏时间，是浏览器选项卡的转圈结束的时间，包括了图片字体等资源的加载时间）

还有其它的属性可以在[这里](https://developer.mozilla.org/zh-CN/docs/Web/API/PerformanceTiming)查看

