# 在vm上挂载的属性

在`main.js`中用`use(router)`在vm上挂载了两个属性`$router $route`

- `$router`全部的router设置，跳转路由等操作通过它进行
- `$route`当前的router指向，它包含了一些当前路由的属性

通过`$router.push("xxx")`进行路由跳转

`setup`中使用`import { useRouter, useRoute } from 'vue-router'`来导入

# 嵌套路由（子路由）

通过在路由设置的`children`数组中添加router对象来设置嵌套路由：

```javascript
export default {
    path: "/about",
    name: "About",
    component: About,
    children: [
        {
            path: "",
            name: "default",
            component: () => import("@/components/HelloWorld"),
        },
        {
            path: "aaa",
            name: "aaa",
            component: () => import("@/components/HelloWorld"),
        },
    ],
};
```

**注意：**嵌套路由是指在当前组件下加载其它路由组件，如上代码，要在`About`组件中添加`<router-view />`才会显示组件，如果不改变路由会加载默认的配置路由，如：`/about`会加载path为空的组件；`/about/aaa`会加载path为aaa的组件。

# 命名路由

一个路径下有多个`<router-view />`时通过给它添加`name`标签使其只加载指定的组件，加载的组件通过路由配置中的`components`来配置：

```jsx
{
    path: '/',
    components: {
        default: Home,
        // LeftSidebar: LeftSidebar 的缩写
        LeftSidebar,
        // 它们与 `<router-view>` 上的 `name` 属性匹配
        RightSidebar,
    },
},

<router-view />
<router-view name="LeftSidebar"></router-view>
<router-view name="RightSidbar"></router-view>
```



# 动态路由

在路由设置的时候在路径前添加`:`，该位置到下个`/`间的内容将作为值来传递给组件，需要在组件中使用`$route.params.xxx`来使用

```json
// router配置
{
    path: "bbb/:prop",
    name: "bbb",
    component: () => import("@/components/ShowProp"),
},
// 组件使用
{{ $route.parmas.prop }}
```

```jsx
// router配置
{
    path: "bbb",
    name: "bbb",
    component: () => import("@/components/ShowProp"),
},
// 如果是查询字符串
{{ $route.query.xxx }} // about/bbb?name=111&age=222 这里会用对象的形式显示

// 查询字符串可以在link中这样写 $router.push中也能这样写
<router-link :to="{ path: '/about/bbb', query: { name: '111', age: '222' } }">
    bbb
</router-link>
```

# 路由重定向

## 重定向

访问路由时跳转到指定的路由

通过在配置路由时添加`redirect:"/xxx"` `redirect:{name:"xxx"}` `redirect: to => { path:"xxx" , query:{ xxx:to.params.xxx } } // to 和 $route一样`，在访问该路由时会跳转到指定的路由。

## 别名

可以用多个路径访问该路由

通过添加`alias:["/x","/xx:prop"]`这样使用

# 导航守卫

## 全局守卫

有两个：`beforeEach afterEach`

都接收一个回调函数，`beforeEach`接收两个参数`to from` 如果函数返回false则阻止跳转；`afterEach`接收三个参数`to from faild`

## 路由独享守卫

在路由配置上添加：

```json
{
    path: '/users/:id',
    component: UserDetails,
    beforeEnter: (to, from) => { //可以接收一个数组含多个函数
        // reject the navigation
        return false
    },
},
```

该守卫只会在进入`/user`时触发

## 组件内守卫

可以通过它获取离开时页面的路径，再下次打开页面时跳转到指定位置。

`setup`中使用`import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'`来导入。

# keep-alive

vue3中配合router使用`keep-alive`与vue2不同：

```html
<router-view v-slot="{Component}" >
	<keep-alive>
    	<component :is="Component"></component>
    </keep-alive>
</router-view>
```

通过插槽来使用。

`keep-alive`可以用黑名单`exclude`和白名单`include`来选择是否缓存组件，都可以接收字符串或者正则表达式。
