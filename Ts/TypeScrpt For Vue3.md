> 本文章是我根据官方文档基于`vue3.2`的`setup`语法糖进行学习的笔记，阅读前请确保：你会使用`TypeScript vue3.2`

# 语法

## Props Emits

当然可以像原来没有使用TS时的`defindProps defindEmits`来定义，不过既然用了TS就用只能在TS下使用的方法吧

**props**：

`defindProps`的泛型可以接收一个接口来定义`props`的属性和属性的类型，属性是否可选（props都是只读的)

```typescript
interface Book {
    name: string;
    author?: string;
}
const props = defineProps<Book>();
```

这里只实现了定义`props`的属性和类型，如果要添加默认值，使用`withDefaults`

> 注意 默认值是对象或数组时要用函数返回
>
> 如果在模板中使用`$props.xx.xx`volar会将第三个属性判断错误

```typescript
interface Book {
    name: string;
    author?: string;
}
const props = withDefaults(defineProps<Book>(), {
    author: "aa",
});
```

**emit**：

定义`emit`和`props`一样，传入一个函数接口，该函数接口定义了多个函数重载，每个函数第一个参数都是指定的方法名

```typescript
interface Emits {
    (e: "onClick"): void;
    (e: "update:name", value: string): void;
}
const emit = defineEmits<Emits>();
emit("update:name", "new Name");
```

> 注意，这两个方法接收的泛型只能在`<script setup>`中定义

## ref reactive

最常用的两个定义响应式数据的方法，其它的方法也是一样

都是和JS中使用一样，ts会自动进行类型推导，不需要自己定义类型

```typescript
const test = ref("test")
const obj = reactive({ a: "a" })
```

当然也可以通过泛型来确定传入的参数的结构

```typescript
let test = ref<{ name: string }>({ name: "aaa" });
```

# 常用包配置

## css预编译

vite已经内置了`less sass postcss`的配置，只需要下载对应的包即可`npm i less -D`

## 路由

通过`vite`创建项目需要手动设置路由，首先下载router`npm i vue-router@next`

配置router，这里用了`vite`的批量导入，`vuecli`用`webpack`的批量导入即可

```typescript
// index.ts
import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [];

const modules = import.meta.globEager("./routes/*.ts");
for (const route in modules) {
    routes.push(modules[route].default);
}

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior: () => ({ top: 0 }),
});

export default router;
```

配置单个路由

```typescript
// home.ts
import type { RouteRecordRaw } from "vue-router";

export default <RouteRecordRaw>{
    path: "/",
    name: "home",
    component: () => import("@/views/Home.vue"),
    meta: {},
};
```

路由守卫和以前一样，就不特别说明了~~~写demo的时候路由守卫忘了`next`出去找了一上午的bug~~~



建议新建一个`d.ts`文件来重新配置`route和meta`的类型，这样才能在模板中使用语法提示，这是修改后的全配置

```typescript
// router.d.ts
import type { RouteRecordRaw } from "vue-router";

interface Meta {
    keepAlive: boolean;
    title: string;
}

declare global {
    export interface RouteItem extends Omit<RouteRecordRaw, "children" | "meta"> {
        children?: RouteItem[];
        meta: Meta;
    }
}

declare module "vue-router" {
    export interface RouteMeta extends Meta {}
}

// home.ts
export default <RouteItem>{
    path: "/",
    name: "home",
    component: () => import("@/views/Home.vue"),
    meta: { title: "home", keepAlive: false },
    children: [{ path: "a", name: "a", meta: { title: "home", keepAlive: false } }],
};

// index.ts
import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

const routes: RouteItem[] = [];
const modules = import.meta.globEager("./routes/*.ts");
for (const route in modules) {
    routes.push(modules[route].default);
}

const router = createRouter({
    history: createWebHistory(),
    routes: routes as RouteRecordRaw[],
    scrollBehavior: () => ({ top: 0 }),
});

export default router;
```

## 状态管理

`pinia和vuex`的配置和js的几乎一样，稍微加上一点类型限制，`pinia`使用见[这里](https://www.shaddollxz.space/blog/61947201aa198bb641a5f5fb)

# 扩展vm

下面的这些配置都是要配合`volar`使用的

## 全局属性

挂载全局属性仍然是通过`app.config.globalProperties`对象添加

为了使用全局属性时不报错，还需要设置`@vue/runtime-core`模块，这个模块一般推荐在`src/types`下新建一个`xx.d.ts`文件指定

```typescript
// img.ts
import logo from "@img/logo.png";

export interface ImgType {
    logo: string;
}

export const img: ImgType = {
    logo,
};
```

```typescript
// index.ts
import type { App } from "vue";
import { img } from "./img";
export type { ImgType } from "./img";

export default {
    install(app: App) {
        app.config.globalProperties.$img = img;
    },
};
```

```typescript
// globalProperties.d.ts
import type { ImgType } from "@/plugins/globalProperties";
// import "@vue/runtime-core"; // 按道理来说应该导入一次的，但不知道为啥其实不导也可以

declare module "@vue/runtime-core" {
    export interface ComponentCustomProperties {
        $img: ImgType;
    }
}
```

## 全局组件

和js注册组件一样注册，然后再在`@vue/runtimecore`模块中声明组件

```typescript
import { HelloWorld } from "@/plugins/globalComponents/HelloWorld"

declare module "@vue/runtime-core" {
    export interface GlobalComponents {
        HelloWorld: typeof HelloWorld
    }
}
```

## 全局指令

没找到声明的方法
