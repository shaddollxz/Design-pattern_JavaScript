# 声明文件

声明文件就是指`xx.d.ts`这个文件

## 全局声明

如果代码作为第三方库发布出去，其他人使用`CDN`的形式引入这个代码库，就像用`<script src="https://cdn.bootcdn.net/ajax/libs/jquery/3.6.0/jquery.js"></script>`来引入JQuery，这样编译器是不知道包里的函数类等变量的类型的信息的，这时候就需要声明文件让编译器知道这个包里的类型信息。

声明文件中用`declare 或 export`来声明一个数据类型或接口

```typescript
declare const jQuery: (selector: string) => any;
// 或者
declare function JQuery(selector: string): any;
```

现在我即使没有引入jQuery，仍然能在工作区中获得代码提示

> 现在模块化开发的情况下这种用法不常用，一般是下面的用法

也可以同样方式抛出全局类型，在模块化下全局变量只能用`(window as any).xxx`来显式挂载，但是类型能直接抛出

```typescript
declare type Nullable<T> = T | null;
```

这样能直接全局使用这个别名

## 模块声明

在模块化下，需要使用`moduel`关键字来声明模块

```typescript
// d.ts文件
declare module "test" {
    export interface Obj {
        a: number;
    }
    export default interface OObj {
        b: number;
    }
}
// ts文件
import type OObj from "test"; // 这里就像是从一个文件中引入的
import type { Obj } from "test";
let obj: Obj = { a: 1 };
let oobj: OObj = { b: 2 };
```

模块中的类型也能被覆盖、继承

```typescript
// 另一个d.ts文件
declare module "test" {
    export interface ABC {
        c: number;
    }
    export interface ABC extends Obj {}
}
// ts文件
import type { ABC } from "test";
let abc: ABC = { a: 1, c: 2 };
```

但是如果是`node_modules`中的模块，声明模块会覆盖它，得在重新声明模块之前用副作用导入它

> 不过挂载vue全局属性或者修改vue-router的meta属性的时候也是这样，但不需要引入，没搞懂

## 手动试试

你可以在`node_modules`文件夹下新建一个文件夹，我这里就叫test了，放入以下文件

```json
// package.json
{
    "main": "./index.js",
    "types": "./index.d.ts" // 如果就是index是可以不声明的
}
```

```javascript
// index.js
export function A(arg) {
    return arg
}

export function B(arg) {
    return arg + " from B"
}
```

```typescript
// index.d.ts
export interface AType {
    (arg: number): number
}
export const A: AType
```

在导入函数A时会有语法提示并且能导入A的类型，但是导入B时会报错

```typescript
import { A } from "test" // OK
import type { AType } from "test" // OK
import { B } from "test" // ERROR
```

这时能在项目中声明它

```typescript
// test.d.ts
import "test";

declare module "test" {
    export function B(arg: number): string;
}
```

这样用B的时候就不会报错了



## 在ts文件中声明全局模块

使用`declare global{ }`来声明



**一些题外话**，为什么在用脚手架搭建的框架项目中能直接引用`css`等文件？这是因为它们都内置了一些类似`declare module "*.css" { ... }`这样的模块，这样ts就会以为你引入的是模块而不是文件

在vue项目中就有有类似的代码用来声明`*.vue`文件的导入类型
