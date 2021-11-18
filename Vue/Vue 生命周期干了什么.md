# 实例化vm

在实例化vm时进行了一些属性的初始化，再这之后才调用beforeCreate钩子

初始化`$parent $children $attrs $slots`

# setup

> 这时候能读取到`props emit`等数据，但是无法读取到`data`。

# beforeCreate

> 也就是所在beforeCreate时无法读取`data inject`数据
>
> 但是能读取到`props emit`
>
> `vuex`也是在这里挂载的

初始化了`inject methods data computed watch provide`

vue2里似乎是这时候才初始化`props`，我用的vue3


# created

> 从这时开始才能读取data

调用`$mount`挂载组件进DOM，编译模板为render函数

# beforeMount

> 这时候不能读取到`vm.$refs.xxx`此时DOM没有创建

调用生成的render函数生成VNode，然后通过`createElm`创建节点进DOM节点

# mounted

> 这时候就能读取到`vm.$refs.xxx`

mounted后就挂载结束，等待更新了。

# beforeUpdate

>  beforeUpdate在异步中，此时的`this.xx`数据是更新后的，但是DOM没有更新，此时`this.$refs.xxx`仍然是更新前的。

进行patch diff 然后调用updated

# updated

> 这时的`data refs`数据才都是更新后的。

更新结束，等待下一次更新。

# beforeDestroy(beforeUnmount)

> 这时能读取到`vm.refs.xxx vm.$data`

清除父子关系，删除watcher等

# destoyed(unmount)

> 这时也能读取到`vm.$data`读取不到`vm.$refs`

删除完成

# activated

> 都能读取到

# deactivated

> 都能读取到
