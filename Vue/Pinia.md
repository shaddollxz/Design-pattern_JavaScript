# Pinia🍍是什么

pinia和vuex一样都是状态管理库，不过它比vuex更加轻便，简单，相比于vuex，它消除了`mutations`和`actions`的区别，统一使用`actions`修改状态，原生支持`TypeScript`，模块化也更加简单。

# 使用

## 下载

`npm i pinia@next`

## 引入

在`main.js`中做插件引入

```javascript
import { createPinia } from "pinia";
createApp(App).use(createPinia())
```

## 创建store

导入`defineStore`并用它进行声明并导出

```javascript
import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
    state: () => ({}),
    getters: {},
    actions: {},
});
```

## 使用Store

在组件中使用store，通过从文件中导入用`defineStore`定义的函数来使用，在这里，每个不同的文件都是一个模块

```javascript
import { useUserStore } from "@/stores/user";
const userStore = useUserStore();
```

### State

定义：

Pinia的`state`必须是一个返回对象的函数，可以简写为箭头函数：

```javascript
export const useUserStore = defineStore("user", {
    state: () => ({
        name: "shaddollxz",
        age: 17,
    }),
});
```

使用：

可以通过直接访问`store`的属性来访问`state`中的属性，同时还能使用Pinia提供的`storeToRefs`来结构获得响应式的`state`属性，这里也可以使用`toRef toRefs`来获得响应式的属性

```javascript
import { storeToRefs } from "pinia";
import { useUserStore } from "@/store/user.js";
const userStore = useUserStore();
console.log(userStore.name);
const { name } = storeToRefs(userStore);
console.log(name);
```

### getters

定义：

和vuex不同的是第一个参数是`store`，所以在`getter`中访问其它`getter`能直接通过`store`或者`this`访问。

```javascript
getters: {
    ageDetail(store) {
        return store.age + "岁";
    },
    detail(store) {
        return store.name + "现在" + store.ageDetail;
    },
},
```

> 给`getters`传递参数：和vuex一样的技巧，通过返回一个接收参数的函数来达成。
>
> ```javascript
> getters: {
>     test(store) {
>         return (arg) => store.age + arg;
>     }
> }
> ```

使用：

和`state`一样可以通过`store`直接访问或者通过结构来获取

### actions

定义：

通过定义`actions`对象中定义函数来设置

在`actions`中直接通过`this`获得`store`实例，`actions`接收的参数是外部调用时传入的参数

```javascript
actions: {
    changeAge(add) {
        this.age += add;
    },
},
```

如果是异步任务，也是通过`actions`来执行

```javascript
actions: {
    changeAgeAsync(add) {
        new Promise((resolve) => {
            setTimeout(() => {
                resolve(add);
            }, 2000);
        }).then((fulfilled) => {
            this.age += fulfilled;
        });
    },
},
```

使用：

**`actions`不能和`state getters`一样通过`storeToRefs`解构，应该直接从`store`上解构出来或者直接通过属性访问**

### 使用其它store中的数据

通过导入其它`store`的`useStore`方法并使用来获得`store`

```javascript
// time.js
import { defineStore } from "pinia";

export const useTimeStore = defineStore("time", {
    state: () => ({
        year: 2021,
    }),
    getters: {
        yearDetail(store) {
            return store.year + "年";
        },
    },
});

// user.js
import { defineStore } from "pinia";
import { useTimeStore } from "./time.js";

export const useUserStore = defineStore("user", {
    state: () => ({
        name: "shaddollxz",
        age: 17,
    }),
    getters: {
        ageDetail(store) {
            return store.age + "岁";
        },
        detail(store) {
            return store.name + "现在" + store.ageDetail;
        },
        detailWithTime(store) {
            const timeStore = useTimeStore();
            return timeStore.yearDetail + this.detail;
        },
    },
});

```



