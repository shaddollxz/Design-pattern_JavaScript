# 挂载到vm上

vuex也是通过`vm.use()`来挂载的，使用`$store`来访问`state`。

`setup`中通过`import {useStore} from "vuex"; const store = useStore()`来获得`store`

# state

在这里定义的状态可以被其它的几项方法使用，如`mutations actions`。

在`setup`中想要获得`state getter`中的属性且为响应式的，得使用计算属性来获得：

```javascript
let count = computed(() => store.state.count);
```

# mutations

在该对象中定义改变`state`的方法，每个函数接收的第一个参数是`state`，**可以多接收一个参数**，如果有多个参数想要传入用对象来打包传入。

在调用时使用`store.commit(提交)`来使用，类似于发布订阅者模式的emit：

```javascript
mutations: {
    add(state, addnum) {
        state.count += addnum;
    },
},

store.commit("add",2);
```

也可以使用对象的形式提交，但仍然只会接收一个额外参数。

**mutations只能是同步函数，异步函数放入actions中。**

# getters

Vuex的计算属性，可以全局使用。

`getter`可以接收第二个参数----`getters`，可以复用其它的计算属性。

可以使用柯里化来给getter传入其它参数：

```javascript
getters:{
    getter:(state,getters) => (selfValue) => {
        ...
    }
}
```

# actions

在这里获得token等需要请求后台进行异步操作才能获得的值。

通过`dispatch(分发)`来调用。

接收一个上下文作为参数`context`包含state,getter等所有方法，建议使用对象结构的形式获得参数；还能接收第二个参数，类似于`mucations`的参数。

在其中修改`state`使用`mucations`里的方法来`commite`。

# modules

模块划分，每个模块都有`state getter mutations actions modules`

## state

读取模块中的状态通过`$store.state.user.name`，**模块在状态等基础属性后面**，该方法的调用只对`datae`有用。

## mutations

`commit`时直接提交指定的`mutations`名字，vuex会用类似调用原型方法一样**从根目录开始查找提交方法名**，如果找到就直接使用，所以如果有重复的方法名，**要开启命名空间**。

## getters

`getter`在模块中可以接收三个参数：`state getters rootstate`

第三个参数是根的状态。

## actions

`actions`在模块中仍然接收`context`，但是其中包含`rootState rootGetters`两个根属性

## 命名空间

为了防止模块的方法和根的方法重名，在模块中添加`namespaced:true`开启命名空间。

开启后，调用`mucations actions getters`时加上所属模块的名字如`dispath("modelA/actionsA")  getters[modelA/countAA]`

命名空间的模块中

- `getter`拥有四个参数：`state getters rootState rootGetters` 
- `actions`中`context.dispath context.commit`被局部化了，调用本模块中的`actions mucations`可以直接使用，调用根的要在第三个参数中传入`{root : true}`（第二个参数可以为null），调用其它模块的也要从根开始提交。
- 在模块中注册全局`actions`使用对象的结构：

```javascript
actions:{
    afunc:{
        root:true,
        halder(context){
            ...
        }
    }
}
```

# 批量导入

将vuex中的state等批量导入实例中，可以用`mapState、mapGetters、mapActions 和 mapMutations`，返回值是对应的对象或数组，导入进时记得用结构符。

批量导入模块的状态等时可以接收第一个参数为指定模块的字符串：

```javascript
computed: {
  ...mapState('some/nested/module', {
    a: state => state.a,
    b: state => state.b
  })
},
```

# 动态注入模块

在 store 创建**之后**，你可以使用 `store.registerModule` 方法注册模块：

```
import { createStore } from 'vuex'

const store = createStore({ /* 选项 */ })

// 注册模块 `myModule`
store.registerModule('myModule', {
  // ...
})
// 注册嵌套模块 `nested/myModule`
store.registerModule(['nested', 'myModule'], {
  // ...
})
```

你也可以使用 `store.unregisterModule(moduleName)` 来动态卸载模块。注意，你不能使用此方法卸载静态模块（即创建 store 时声明的模块）。
