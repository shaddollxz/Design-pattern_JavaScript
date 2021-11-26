# unknow类型

`unknow`就是字面意思，不知道这是啥类型，这点上和`any`似乎有点相似，但它们之间区别很大：

`any`可以赋给任何类型，任何类型也都可以赋值给`any`，这相当于直接放弃了类型检查，为了`type`而写`type`

`unknow`则是只能赋值给`unknow any`，任何类型也能赋给`unknow`，简单来说就是`unknow`也可以是任何类型，但你不能直接假定它的类型是什么，只能通过类型检查来断言它的类型，比`any`安全很多

# 只读数组 只读元组

以前定义只读数组只能使用`ReadonlyArray<T>`定义，现在引入了新语法`let arr: readonly string[] = []`这样定义，这种定义法也能放到元组上

# 常量断言

只有定义变量时能使用这种断言，它会把定义的数据全部转为`readonly`（`let`定义的变量会被当作`const`，数组会被当作枚举）其实这个是上面的只读数组的另一种写法

```typescript
let a = "A" as const; // 用了常量断言不应该给变量定义类型
a = "b"; // error 不能将类型"b"分配给"A"

let arr = [1, "a"] as const;
let arr: readonly [1, "a"] = [1, "a"]; // 两种写法都一样
type Arr = typeof arr; // type Arr = readonly [1, "a"]
let brr: Arr = [1, "a"]; // 这里每个index都必须和arr完全一样

// 数组转联合类型
let arr = [1, "a"] as const;
type Union = typeof arr[number]; // Union = 1 | "a"
```

# 默认泛型

可以在定义泛型时设置泛型的默认值，和函数参数设置默认值一样

```typescript
type Test<T = number> = Array<T>;
let test: Test = [1];
```

# 断言函数

断言函数用来确定在接下来的代码中这个参数的类型，有关键字`assert`

```typescript
// 断言函数没有返回值 或者只能抛出错误
function assert(condition: boolean): asserts condition {
    if (!condition) {
        throw "Error";
    }
}

function test(arg: unknown) {
    arg.toUpperCase(); // unknow error
    assert(typeof arg == "string");
    arg.toUpperCase(); // string ok
    assert(typeof arg == "number");
    arg.toUpperCase(); // never error
}
```

断言函数和谓词签名`is`主要区别是作用范围，`is`只能在`if`判断中使用，并且只能在`if`作用域中改变参数类型

# 不检查文件

和`// @ts-ignore`相似`// @ts-nocheck`放在文件顶部，用来告诉编译器整个文件都不检查

# 私有属性

这不是指ts中的`private`定义的属性，而是`es2020`的新规范，具体见[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Classes/Private_class_fields)

简单来说就是在类中用`#`符号开头声明的属性会被原生js判断为私有属性，和ts的私有属性类似，都是只能在类内部调用，不能被继承，不能使用接口声明，也同样能定义私有静态变量（静态私有变量只能被同一个类的静态方法调用）

和`private`相比的不同：

- 因为js的原型继承，`private`定义的私有属性在子类中不能有同名属性，而新的`#`可以允许子类和父类有同名
- `private`只是代码编写时实现私有，但编译为js时仍然能访问该属性，而`#`则完全不能，真正实现了私有化
- 工程中因为`#`是很新的ES规范，所以会被polyfill，看文档是用`WeakMap`实现的，反正比`private`慢

> 在ES2022中，可以用`in`操作符检查有没有这个私有属性

# 可变元组

元组上现在也能使用扩展运算符，`rest参数`现在也能用元组定义，如下

```typescript
function test(...arg: [number, ...string[]]) {
    type Arg = typeof arg;
    let args: Arg = [1, "2", "3"];
}

test(1, "a", "c");

let arg1 = [1, "a"] as const; // 这里得声明为元组才能传入
let arg2 = ["3", "5"] as const;
test(...arg1, ...arg2);
```

并且`rest参数`可以用在元组的任意地方

```typescript
type NumberAndStrings = [number, ...string[]];
type NumberAdnStringsAndBoolen = [...NumberAndStrings, boolean];
let aaaaa: NumberAdnStringsAndBoolen = [1, "a", "c", true];

// 但是会它会合并两个解构
type NumberAndStrings = [number, ...string[]];
type BooleanAndStrings = [boolean, ...string[]];
type NumberAdnStringsAndBoolen = [...NumberAndStrings, ...BooleanAndStrings, boolean];
let aaaaa: NumberAdnStringsAndBoolen = [1, true, "a", "c", true]; // [number, ...(string | boolean)[], boolean]
```

# 元组标签

```typescript
function foo(...args: [first: string, second: number]) {}
// 这两段代码调用时的提示是一样的
function foo(first: string, second: number) {}
```

```typescript
type Args = [first: string, seconde: number] | [first: string, seconde: number, third: boolen];
function foo(...args: Args) {} // 这里看作是重载函数
```

# 元组的可选属性

在元组后添加`?`或者在标签上添加`?`都会让这个位置的变量成为可选，在当作函数参数时更加方便

```typescript
type A = [number, string?];
type B = [a: number, b?: string];
let a: A = [1];
let b: B = [1];
```



# 模板文字类型

和模板字符串的语法相同，但是它只能运用在类型上

```typescript
type World = "world";
type Greeting = `hello ${World}`; 
```

ts还能根据字符串名字推断类型

```typescript
type PropEventSource<T> = {
    on<K extends string & keyof T>
        (eventName: `${K}Changed`, callback: (newValue: T[K]) => void ): void;
};
 
declare function makeWatchedObject<T>(obj: T): T & PropEventSource<T>;
 
let person = makeWatchedObject({
    firstName: "Homer",
    age: 42,
    location: "Springfield",
});
 
// works! 'newName' is typed as 'string'
person.on("firstNameChanged", newName => {
    // 'newName' has the type of 'firstName'
    console.log(`new name is ${newName.toUpperCase()}`);
});
 
// works! 'newAge' is typed as 'number'
person.on("ageChanged", newAge => {
    if (newAge < 0) {
        console.log("warning! negative age");
    }
})
```



同时还新增了四种别名来修改文字类型

| 类型         | 作用                 |
| ------------ | -------------------- |
| Uppercase    | 将每个字符都转为大写 |
| Lowercase    | 将每个字符都转为小写 |
| Capitalize   | 将首字母大写         |
| Uncapitalize | 将首字母小写         |

# 键重映射

通过映射类型能快速从一个联合类型创造一个对象：

```typescript
type Union = "a" | "b" | "c";
type Obj = {
    [K in Union]: string;
}
```

现在能使用新的`as`修饰符配合上面的模板文字类型创建更灵活的对象：

```typescript
type Union = "a" | "b" | "c";
type Obj = {
    [K in Union as `get${K}`]: string; // geta getb get c
};
```

```typescript
interface Person {
    name: string;
    age: number;
    sex: boolean;
}
type GetPerson = {
    [K in keyof Person as `get${Capitalize<K>}`]: () => Person[K];
};
```

```typescript
// Remove the 'kind' property
type RemoveKindField<T> = {
    [K in keyof T as Exclude<K, "kind">]: T[K]
};
 
interface Circle {
    kind: "circle";
    radius: number;
}
 
type KindlessCircle = RemoveKindField<Circle>;
```

# resolve必须接收一个参数

现在ts中resolve必须接收一个参数，但是有时候确实不需要有参数，这时候得直接声明`Promise`的返回值的泛型，异步函数的返回类型为`void`

```typescript
function tes(): Promise<void> {
    return new Promise((resolve, rejected) => {
        resolve();
    });
}
// 或者这样
function tes() {
    return new Promise<void>((resolve, rejected) => {
        resolve();
    });
}
```

# 显示声明不使用变量

比如在数组解构时不需要第一个变量，这时可以在变量前面加上`_`告诉ts，这个变量不会被使用，避免出现参数未使用错误（一般默认不会用错误来提示的，但这样看着更舒服）

```typescript
// 这里编译器不会提示你reject没有使用
async function test() {
    return new Promise((resolve, _reject) => {
        resolve(void 0);
    });
}
```

# override修饰符

> 该修饰符要配合`noImplicitOverride:true`使用

如果子类继承了父类后重写了父类的同名方法，这里一般推荐再加上`override`修饰符，他能检查父类上是否定义了同名方法

```typescript
class Test {
    constructor(public a: string) {}

    show() {
        console.log(this.a);
    }
}

class Child extends Test {
    constructor(a: string) {
        super(a);
    }
    override show() {
        console.log("b");
    }
}
```

# 使用接口定义抽象类

> [文档](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-3.html)中写了有这种方法，但我会报错。。。了解下吧

虽然接口不能用`private`等确定属性的私有性，但是现在支持用`abstract`来定义构造函数是一个抽象类

```typescript
type MyConstructorOf<T> = {
    abstract new(...args: any[]): T;
}
// or using the shorthand syntax:
type MyConstructorOf<T> = abstract new (...args: any[]) => T;
```

# 类中的索引签名

```typescript
class Test {
    [key: string]: string;
    static [key: string]: number;
}
Test.aaa = 1;
let test = new Test();
test.aaa = "a";
```

# 可以将类型判断赋给一个值了

```typescript
const isString = (arg: unknown): arg is string => typeof arg == "string";
(function (something: unknown) {
    const isStr = isString(something);
    if (isStr) {
        something.toUpperCase()
    }else{
        ...
    }
})(123);
```

# static代码块

这也是ES2022中的提案，现在可以通过定义一个静态代码块进入类中，初始化类的静态变量，代码块可以有多个，始终是从上往下执行，代码块最大作用是可以在类里面初始化私有静态属性

```typescript
class Test {
    static a = 1;
    static #b: number;
    static log() {
        console.log(this.a);
        console.log(this.#b);
    }
    static {
        this.a = 9;
        this.#b = 8;
    }
}

Test.log(); // 9 8
Test.#b; // error
```

# awaited

新增了`Awaited`泛型类型来解构`Promise`类型

```typescript
// A = string
type A = Awaited<Promise<string>>;
// B = number
type B = Awaited<Promise<Promise<number>>>;
// C = boolean | number
type C = Awaited<boolean | Promise<number>>;
```

# 类型导入

如果要在一个文件中同时导入一个文件的变量和类型，现在有新的语法支持一句话导入

```typescript
import { default as AAA, type AAAType } from "./AAA"
```

