> 这篇文章主要根据[官方中文文档](https://www.tslang.cn/docs/handbook/basic-types.html)学习ts的笔记，因为中文文档版本只到`3.1`（当前ts版本为`4.4.3`）后期新版本的特性学习会以短篇博客的形式记录

# 数据类型定义

## 基础数据类型

通过在定义数据时指定数据的类型，这样会类似于静态的语言，如c的`int`

```typescript
let a: number = 1;
let b: string = "b";
let bool: boolean = true;
// null和undefined可以互相替换 它们也是其它类型的子类型，可以赋给number等
let un: undefined = null;
let nu: null = undefined;
```

如果不确定数据的类型可以使用`any`来代指所有的数据类型~~~AnyScript~~~

```typescript
let something: any;
something = "A";
something = 2;
```

`never`代表永远不会到达的类型，如一个无限循环的函数，一个必定抛出错误的函数，都使用`never`定义，通常情况下不会使用

### 类型断言

类型断言就是告诉编译器你比它更懂这个参数是啥，让它不检查类型，用你定义的类型

类型断言有两种声明方法

```typescript
// 使用尖括号
let someValue: any = "this is a string";
let strLength: number = (<string>someValue).length;
// 使用as
let someValue: any = "this is a string";
let strLength: number = (someValue as string).length;
```

### 非空断言

在上下文中当类型检查器无法断定类型时，一个新的**后缀表达式操作符 `!` 可以用于断言操作对象是非 null 和非 undefined 类型**。具体而言，x! 将从 x 值域中排除 null 和 undefined 。

```typescript
// 忽略函数可能是undefined
type NumGenerator = () => number;
function myFunc(numGenerator: NumGenerator | undefined) {
    const num1 = numGenerator(); // Error
    const num2 = numGenerator!(); //OK
}
//  忽略参数可能是undefined或null
function myFunc(maybeString: string | undefined | null) {
    const onlyString: string = maybeString; // Error
    const ignoreUndefinedAndNull: string = maybeString!; // Ok
}
```

### 确定赋值断言

也是使用`!`，它告诉编译器，这个变量确实会被赋值

```typescript
let a!: string; // 在声明时告诉编译器，这里a当作已经被赋了值
setA();
console.log(a); // 如果不加断言，这里会报错，在赋值前使用了a

function setA() {
    a = "a";
}
```



## 数组

有多种定义数组的方法：

```typescript
let arr: Array<number> = [1, 2, 3];
let arr: number[] = [1, 2, 3];
```

前两种方法没有区别，都指定了数组中只能出现数字，如果是有多个数据类型的数组使用`any[]`，数据类型是对象时把对象的接口作为类型；

第三种方法通过**元组`Tupl`**

### 元组

通过这种方法定义的数组固定了长度和每个位置的数据类型

```typescript
let arr: [number, string, boolean, number] = [1, "s", true, 3];
```

在4.0版本后，元组能支持加上标签使用，这样代码提示会更加友好

```typescript
let tuple: [name: string, age: number] = ["1", 2];
```



## 枚举

通过`enum`定义一个枚举，枚举是一种键值对的储存对象，允许枚举的内容为`number string`

```typescript
enum MagicNumber {
    success = 1,
    error = -1,
}

let success: MagicNumber = MagicNumber.success;
console.log(success); // 1
```

如果初始化时不指定枚举属性的具体内容，则默认为数字，从0开始自增，因为这个特性，参数的顺序对枚举还是有用的

> 如果第一个参数指定了一个数字，后面的自增是从第一个数字开始

```typescript
enum MagicNumber {
    success,
    error,
}

let success: MagicNumber = MagicNumber.success;
console.log(success); // 0
```

### 计算成员

枚举的参数也能计算

```typescript
enum Nums {
    a = 1,		// 1
    b = 2 + 2,	// 4
    c = b * 2,	// 8
    d,		    // 9
}
```

### 枚举成员做类型

> 如果没学TS，以下内容请看完高级类型后再回来看，你现在只需要知道枚举成员能做类型的声明就行

存在一种特殊的非计算的常量枚举成员的子集：字面量枚举成员。 字面量枚举成员是指不带有初始值的常量枚举成员，或者是值被初始化为                

- 任何字符串字面量（例如：`"foo"`，`"bar"`，`"baz"`）
- 任何数字字面量（例如：`1`,  `100`）
- 应用了一元 `-`符号的数字字面量（例如：-1`, -100`）

```typescript
enum Enum {
    a = "A",
    b = "B",
    c = 1,
}
// 使用枚举的成员作为接口
function test(arg: Enum.a): Enum.a {
    return arg;
}
test(Enum.a); // 使用了枚举中的成员，能接收的参数只能从枚举中选择，即使是"A"也是错的
// 也能作为别名
type AA = Enum.a | Enum.b;
function test(arg: AA): AA {
    return arg;
}
test(Enum.a);
```

### 常量枚举

常量枚举只能使用常量枚举表达式，并且不同于常规的枚举，它们在编译阶段会被删除。

```typescript
const enum Enum {
    A = 1,
    B = A * 2,
}
console.log(Enum.A);

// 编译后↓↓↓

console.log(1 /* A */);
```



## 对象（接口）

> 当然接口不止用来定义对象，定义类，函数会放进对应内容

通过`interface`关键字定义一个数据接口，在定义对象时声明为这个接口，定义的对象就只能包含接口中定义的键和指定的数据类型

```typescript
interface Obj {
    a: string;
    b: number;
}
let obj: Obj = {
    a: "a",
    b: 1,
};
```

> 如果同一个文件中声明了同名的接口，它们会被合并为同一个接口，即这个接口需要实现两个声明中的所有属性
>
> 两个接口中如果有同名属性它们的类型应该相同
>
> 当合并时后面的接口优先级高于前面的接口

### 可选属性

```typescript
interface Obj {
    a?: string;
    b: number;
}
let obj: Obj = {
    b: 1,
};
```

### 只读属性

设定了只读的属性只能在一开始定义时赋值，之后都不能再更改

> 如果是基础类型用`const`声明只读！

```typescript
interface Obj {
    readonly a: string;
    b: number;
}
let obj: Obj = {
    a: "a",
    b: 1,
};
obj.a = "new"; // 报错
obj.b = 2;
```

> ts中内置了`ReadonlyArray<T>`类型，用来生成固定长度和内容的数组 -- 不能使用`push`等改变数组的方法（当然还是能用`forEach`来改变数组中对象的属性）

### 绕过类型检查

如果定义的对象拥有属性比接口的要多，TS会报错，但是也可以通过绕过类型检查而不报错：

- 通过类型断言

```typescript
interface Obj {
    a: string;
    b: number;
}
let obj = {
    a: "a",
    b: 1,
    c: "cc",
} as Obj;
```

- 通过索引签名 该方法更推荐

```typescript
interface Obj {
    a: string;
    b: number;
    [property: string]: any;
}
let obj: Obj = {
    a: "a",
    b: 1,
    c: "cc",
    d: "dd",
};
```

### 索引签名

类似在给对象添加新键时用变量为键名，索引签名只支持`string number`两种类型

> ts4.4后可以使用`symbol`和联合类型

```typescript
interface StringArr {
    length: number;
    [key: number]: string;
}
let arr: StringArr = {
    0: "a",
    1: "b",
    length: 2,
};
```

> 给索引签名加上`readonly`后所有的属性都不能再赋值了

### 接口定义数组

接口可以通过索引签名的方式定义数组

```typescript
interface Arr {
    [index: number]: string;
    length: number;
}
const arr: Arr = ["a", "b"];
```

### 接口继承

接口也能继承，和类一样，通过`extends`关键字

```typescript
interface Arr {
    length: number;
}
interface Arrr extends Arr {
    name: string;
}
interface Arrrr extends Arr, Arrr { // 能同时继承多个接口
    age: number;
}
const arr: Arr = { length: 3 };
const arrr: Arrr = { length: 3, name: "arrr" };
const arrrr: Arrrr = { length: 3, name: "arrrr", age: 1};
```



## 函数

### 参数

定义函数时需要指定函数的参数和返回值，如果函数没有返回值则要声明为`void`，如果函数有参数是可选参数，可以在声明时加上`?`，如果是有默认值的参数，和ES6一样

> 可选参数要放在最后

```typescript
function add(o: number, t: number): number {
    return o + t;
}
function test(arg: string): void { // 没有返回值声明为void
    console.log(arg);
}
function sum(o: number, t: number, three?: number): number {
    return o + t + three;
}
```

### 接口定义参数

用接口定义参数时，ts有特殊的检查方法，看下面的代码

```typescript
interface Arg1 {
    a: string;
}
interface Arg2 {
    a: string;
    b: number;
}
interface Arg3 {
    a: string;
    b: number;
    c: number;
}

const arg1: Arg1 = {
    a: "a",
};
const arg2: Arg2 = {
    a: "a",
    b: 1,
};
const arg3: Arg3 = {
    a: "a",
    b: 1,
    c: 2,
};

function test(arg: Arg2): void {
    console.log(arg);
}

test(arg1); // 错误 缺少属性
test(arg2); // 正确
test(arg3); // 正确
test({ a: "a", b: 1, c: "a" }); // 错误 有多的属性c
```

### 解构传参

如果时使用解构传参，必须声明为数组类型

```typescript
function add(...num: Array<number>): number {
    return num.reduce((prev, curr) => prev + curr);
}
```
### 匿名函数

定义匿名函数有多种写法，下面的箭头函数也都能替换为普通函数

```typescript
let test = (a: number): number => { return a }; // 和普通函数一样，这里当然也能简写return
let test: { (a: number): number } = (a) => a; // 这里大括号代表一个接口
let test: (a: number) => number = (a) => a; // 这里第一个箭头函数是一个别名
```

它们都会编译为以下js代码

```typescript
let test = (a) => a;
```

当然一般匿名函数都是作为回调函数使用，下面展示了第二种的写法，第三种是类似的，这里就不重复了

```typescript
function test(cb: { (num: number): number }): number {
    return cb(5);
}
test((num) => num * 2);
```

加上默认参数，看不懂就编译下看看

```typescript
function test(cb: { (num: number): number } = (num) => num + 1): number {
    return cb(5);
}
test((num) => num * 2);
```

### 接口定义函数

```typescript
interface Func {
    (str: string, num: number): void;
}
// 接口的参数名不是必须和函数的参数名一样，但是类型会按顺序对上
// 使用接口定义函数时可以不声明函数的参数类型，它会按照接口中定义的顺序设置类型
let testFunc: Func = (strr, numm) => {
    console.log(strr, numm);
};
// 当然能用普通函数
let testFunc: Func = function (str, num) {
    console.log(str, num)
}
```

在js中，函数的本质是一个对象，对象就能有属性和方法，函数自然一样，比如`call bind`这些都是函数的方法，ts中也能通过接口来声明函数的属性和方法，这是官方文档里的例子：

```typescript
interface Counter {
    (start: number): string;
    interval: number;
    reset(): void;
}

function getCounter(): Counter {
    let counter = <Counter>function (start: number) { }; // 这里是用了类型断言，看上面的介绍
    counter.interval = 123;
    counter.reset = function () { };
    return counter;
}

let c = getCounter();
c(10);
c.reset();
c.interval = 5.0;
```

### 函数赋值

函数可以进行赋值操作

```typescript
// 使用接口
interface Func {
    (a: number): number;
}
let func: Func = (a) => a;
let funcTwo: Func = func;

// 不使用接口
function test(a: number): number {
    return a;
}
const testClone: { (a: number): number } = test; // 这里的大括号是接口
```

### 重载

通过多次声明函数和传入的参数实现类型检查

当然js是没用重载的，ts也没有真正实现java的那种重载，这里可以理解为重载了函数的声明，告诉使用者这个函数的调用方式有几种，实际上的判断仍然是在代码中

```typescript
function clone(a: number, b: number): number;
function clone(a: string): string;
function clone(): null;
function clone(a?: any, b?: number): any {
    if (typeof a == "string") {
        return (a += a);
    }
    if (b && typeof a == "number") {
        return a + b;
    }
    return null;
}
```

> 关于为什么用重载而不用联合类型来声明函数：
>
> 使用重载vscode会自动提示函数的参数类型和对应类型返回值的类型，而联合声明只能原样返回提供的类型

使用接口来重载：

```typescript
interface Func {
    (a: number): string;
    (a: string): number;
}
let func: Func = function (a: number | string): any {
    switch (typeof a) {
        case "number":
            return <string>"a";
        case "string":
            return <number>1;
    }
};
func("2");
```



## 类

类在构造函数之前声明类中的成员，并在构造函数中实现声明的成员

```typescript
class Person {
    name: string;
    age: number;
    constructor(name: string, age: number) {
        this.name = name;
    }
}
```

> 类也可以当作**实例**的接口来使用，所以在实例化类时可以用类来作为实例的类型声明

```typescript
const person: Person = new Person("aaa", 123);
```

### 公有、私有、保护属性

在类中可以使用`public private protected`三种修饰符定义属性

- `public`：属性对该类自身，子类和外部都暴露

  意味着声明的属性无论在哪都能用`instence.property`来使用

  > 在ts中，不显示地声明类型所有属性都默认是`public`
  >
  > 注意，所有属性包含`constructor`和所有的原型方法

- `private`：属性只对该类自身暴露

- `protected`：属性只对该类本身和子类暴露

```typescript
class Test {
    public a: string;
    private b: string;
    protected c: string;

    constructor() {
        this.a = "a";
        this.b = "b";
        this.c = "c";
    }
}
const test: Test = new Test();
console.log(test.a); // 三个属性只有a能从外部访问
```

### readonly

和接口的`readonly`一样，属性只能在构造函数中声明或赋初始值，以后都不能修改和删除（包括`delete`）

```typescript
class Test {
    readonly a: string;
    constructor(a: string) {
        this.a = a;
    }
}
const test: Test = new Test("a");
```

### 修饰符的简写

对于上面的写法：将传入构造函数的参数作为实例的属性，ts有一种简便写法：在传入参数时指定属性的修饰符

```typescript
class Test {
    constructor(readonly a: string, public b: string) {}
}
const test: Test = new Test("a", "b");
console.log(test); // 这样test就有a和b两个属性
```

### `getter setter`

`getter 和 setter`在写法上和ES6相同

```typescript
class Test {
    private _c: string;

    constructor() {}
    get c(): string {
        return this._c;
    }
    set c(value: string) {
        this._c = value;
    }
}
const test: Test = new Test();
test.c = "c";
console.log(test);
```

不过需要注意三点：

- `setter`不能有函数返回类型，即使是`void`
- 只有`getter`没有`setter`时，ts会自动推断该属性为`readonly`
- `getter 和 setter`可以使用`private`等修饰器，这时它们应该是相同的修饰符

### 类继承

ts的继承仍然和ES6的继承一样，使用`extends`关键字和`super()`函数

### 静态方法

和ES6一样用`static`定义

- 子类不能有和父类同名的私有属性
- 子类可以用同名的保护属性覆盖父类的保护属性

### 抽象类

抽象类不能被实例化，使用`abstract`关键字定义抽象类，在抽象类中也同样使用`abstract`定义抽象方法

> 抽象方法：在抽象类中声明，但是不定义，继承抽象类的子类必须定义

```typescript
abstract class Test {
    constructor(protected a: string) {}
    sayA(): void {
        console.log(this.a);
    }
    abstract sayThis(): void; //! 抽象类中用abstact声明的函数，子类必须实现
    protected abstract haha(): void; //! 声明的函数也能包含修饰符，不能使用`private`，`public`可以省略，所以只使用`protected readonly`
    protected abstract get b(): string;
    protected abstract set b(value: string); //! 也能声明`getter setter`
}
class AAA extends Test {
    private _b: string;

    constructor(a: string, public c: number) {
        super(a);
        this._b = "b";
    }
    sayThis() {
        console.log(this);
    }
    haha() {
        console.log("haha");
    }
    get b() {
        return this._b;
    }
    //! 抽象类中已经声明了value的类型，这里可以不再声明
    set b(value) {
        this._b = value;
    }
}
let aaa: Test = new AAA("a", 1);
console.log(aaa); // 这里不能访问抽象类中没有的属性 如c
```

> 注意：实例化子类时指定的类型应该是抽象类，这样才能获得抽象类中声明的关键字设置
>
> 如上：如果使用`let aaa: AAA = new AAA("a", 1)` 则可以从外部访问`aaa.b`

### 多态

众所周知，js是原型链的继承，如果子类找不到属性才会向原型上寻找，所以多态在这里本质上就是为子类定义一个方法标准和保底，子类实现该方法的同名方法来覆盖父类的方法，如果没有实现则会使用父类的方法。

和抽象类的的抽象方法区别是抽象方法必须被子类实现，而多态就像前面说的，只是js原型继承的机制，或者说只是一个保底机制。

当然也可以用ES6的`super.xx`来调用父类的实例方法：

```typescript
class Father {
    constructor() {}
    say(): void {
        console.log("father");
    }
}
class Child extends Father {
    constructor() {
        super();
    }
    say(): void {
        super.say();
        console.log("child");
    }
}
const child: Child = new Child();
child.say(); // father child
```

### 方法重载

类方法也同样支持重载

```typescript
class Test {
    func(arg: number): number;
    func(arg: boolean): "ture";
    func(arg: number | boolean): any {
        switch (typeof arg) {
            case "number":
                return arg;
            case "boolean":
                return "true";
        }
    }
}
```

### 通过接口来定义

通过接口定义一个类中**必须**有的属性和方法，再在类中实现这些属性方法

> 使用接口定义类只能声明公有成员
>
> 类中能实现比接口中更多的属性

```javascript
interface AnimalInerface {
    age: number;
    name: string;
    say(): void;
}

class Animal implements AnimalInerface {
    age: number;
    name: string;
    sex: boolean;
    constructor(theAge: number, theName: string) {
        this.age = theAge;
        this.name = theName;
        this.sex = true;
    }
    say() {
        console.log(`${this.age} ${this.name}`);
    }
}
console.log(new Animal(23, "haha"));
```

一个类能同时实现多个接口，只需要在`implements`时多声明就行

```typescript
class Test imlements Interface1, Interface2 {
    ...
}
```

这样Test类就必须实现两个接口中定义的所有属性方法

#### 静态方法检查

上面的接口中定义的只是类的实例需要的属性，不能检查到类的静态部分，即静态方法和构造函数

如果要检查到静态方法和构造函数，需要额外定义一个接口并使用一个函数来获得实例，类似`Vue.createApp`方法

```typescript
interface Static {
    new (arg1: number, arg2: number): Constructor; // 这里new指代构造函数
    staticFunc(): void;
    staticProp: string;
}
interface Constructor {
    a: number;
    b: number;
    print(): void;
}

class App implements Constructor { // 这里Constructor检查了实例上的属性
    a: number;
    b: number;
    constructor(a: number, b: number) {
        this.a = a;
    }
    print() {
        console.log(this.a);
    }
}

// 在这里Static检查了构造函数和静态方法
function createApp(Class: Static, ...arg: [number, number]): Constructor {
    return new Class(...arg);
}
```

#### 接口继承类

类也能当作接口使用，所以接口自然也能继承类

- 如果原来的类中有私有或保护属性，继承的接口也会继承它的私有性，这意味着这个接口只能分配给这个类的子类

```typescript
class Base {
    private a: number;
    constructor() {
        this.a = 1;
    }
}
interface BaseInterface extends Base {
    func(): void;
}

// 错误 a是私有属性，这个对象里是公有的
const obj: BaseInterface = {
    a: 1,
    func() {},
};

// 错误 私有属性应该在父类上且父类是Base 
// 就算用鸭子类型，新声明一个有私有属性a的类，然后继承它实现接口也是错误
class Obj implements BaseInterface {
    private a: number;
    constructor() {
        this.a = 1;
    }
    func() {}
}

class NewBase extends Base {
    constructor() {
        super();
    }
    func() {}
}
// 正确 该对象继承自Base类并且实现了func方法
const newBase: BaseInterface = new NewBase();

class NeoBase extends Base implements BaseInterface {
    constructor() {
        super();
    }
    func() {}
}
// 正确 这个和上面的区别是该方法显示声明实现了接口，更加推荐这样写
const neoBase: BaseInterface = new NeoBase();
```

#### 混入

类可以作为接口使用，所以类也能`implements`类（包括多个）

```typescript
class A {
    a!: number;
}
class B {
    b!: number;
}

class AB implements A, B {
    a: number;
    b: number;
    constructor() {
        this.a = 1;
        this.b = 2;
    }
}
```



# 泛型

为了重用性，在定义接口、函数、类时不预先指定的类型，当使用时指定数据的类型

## 泛型对象、函数、类

数组定义就有使用泛型定义的方法：`const arr: Array<number> = []`

定义泛型：

```typescript
// 使用泛型定义接口
interface InterFace<T, F> {
    a: string;
    b: T;
    c: F;
}
const obj: InterFace<string, number> = {
    a: "a",
    b: "b",
    c: 1,
};

// 使用泛型定义泛型函数
function test<T>(input: T): T {
    return input;
}
test<string>("a"); // 使用时声明泛型的指定类型
test(1); // 如果是简单的数据类型，编译器会自己确定类型，可以不写

// 使用接口定义含泛型函数的对象 如果不多写属性，可以用来定义泛型函数
interface Func {
    func<T>(a: T): T;
    b: number;
}
function Tfunc<T>(a: T): T {
    return a;
}
const func: Func = { func: Tfunc, b: 1 };
```

> 官网上的一个例子，看不懂的话倒回去看<a href="#匿名函数">匿名函数</a>
>
> ```typescript
> function identity<T>(arg: T): T {
>     return arg;
> }
> let myIdentity: {<T>(arg: T): T} = identity;
> ```

泛型也能传递：

```typescript
function test<T>(arr: Array<T>): number {
    return arr.length;
}
```

这里就将`T`传递进`Array`的泛型中

下面是把一个泛型箭头函数赋值给一个新变量，这里是为了说明只需要变量和返回值能对应上，函数就能通过类型验证

```typescript
const arrowFunc: <T>(a: T) => T = (a) => a;
const funcTwo: <U>(a: U) => U = arrowFunc;
```

难看懂？看看编译后的

```typescript
const arrowFunc = (a) => a;
const funcTwo = arrowFunc;
```

类和定义接口一样在类后面添加`<>`

> 泛型类也只能定义类的实例部分

```typescript
class GenericNumber<T> {
    zeroValue!: T;
    add!: (x: T, y: T) => T;
}

let myGenericNumber = new GenericNumber<number>();
myGenericNumber.zeroValue = 0;
myGenericNumber.add = function (x, y) {
    return x + y;
};
```

## 泛型约束

看下面的错误，这里编译器不能保证所有类型都有`length`属性，所以报错了

```typescript
function loggingIdentity<T>(arg: T): T {
    console.log(arg.length);  // Error: T doesn't have .length
    return arg;
}
```

为此要保证传入的类型一定含有`length`属性，这时需要设置一个含有该属性的接口，让泛型继承该接口，就能保证传入的参数有该属性

```typescript
interface Lengthwise {
    length: number;
}
function loggingIdentity<T extends Lengthwise>(arg: T): T {
    console.log(arg.length); 
    return arg;
}
```

可以用声明被一个泛型约束的泛型，如下的K就只能是T的`key`

```typescript
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}

let x = { a: 1, b: 2, c: 3, d: 4 };
getProperty(x, "a"); // 正常
getProperty(x, "m"); // 异常
```

> `keyof`返回一个由T的所有key组成的联合类型，具体了解见下面的<a href="#keyof">keyof</a>

泛型约束能使用联合类型

> 关于`type(别名)`见下一节

```typescript
type A = "a" | "A";
type B = "b" | "B";

function test<T extends A | B>(arg: T): string {
    return arg;
}

test("B");
```

在约束中使用类，这里如果看不懂见<a href="#静态方法检查">静态方法检查</a>

```typescript
function create<T>(c: { new (): T }): T {
    return new c();
}
```

# 高级类型

## 联合类型 

在参数有多个选择时可以使用`|`来表示该参数能是多种类型，简单来说就是将多个类型进行或运算

> `never`类型不会被加入联合类型 `unknow`类型加入联合后只会返回`unknow`

```typescript
interface obj1 {
    a: string;
    b: string;
}
interface obj2 {
    a: number;
    b: boolean;
}

function test(obj: obj1 | obj2): string | number {
    return obj.a;
}
function test2(number: number | string): string | number {
    return number;
}
```

## 交叉类型 

联合类型是或运算，交叉类型就是和运算了，它将多个接口的属性混合在一起，如果两个接口的属性类型不同，会混合为`never`类型，所以要保证两个接口的同一个属性类型相同

```typescript
interface Test1 {
    a: string;
    b: number;
    d: number;
}
interface Test2 {
    a: string;
    b: number;
    c: number;
}
let test: Test1 & Test2 = {
    a: "a",
    b: 1,
    c: 1,
    d: 2,
};
```

## 条件类型

该语法类似三目运算符，会根据条件返回类型

```typescript
type Key<T> = T extends number ? number : string;
let a: Key<boolean> = "a";
```

## 类型别名

使用`type`声明，它的作用很像接口，但是别名可以用在基础数据类型，联合类型，元组等一切能定义的变量、类型上，当然，别给基础类型加别名

```typescript
const symbol = Symbol("c");
type a = number | string;
interface Obj {
    a: a;
    b: string;
    [symbol]: number;
}
type keys = keyof Obj; // keyof 返回了Obj的所有key组成的联合类型

function getProperty(obj: Obj, key: keys): Obj[keys] {
    return obj[key];
}
getProperty({ a: 1, b: "2", [symbol]: 2 }, symbol);
```

类型别名也能使用泛型，这时它的行为很像函数，可以使用一个新别名来接收传入了泛型的别名

```typescript
type Test<T> = {
    a: T;
};
type A = Test<number>; // {a:number}

// 甚至能嵌套
const obj: Test<Test<number>> = {
    a: {
        a: 1,
    },
};
```

别名使用类似箭头函数的语法确定函数类型

```typescript
type Func = (arg: number) => void;
let func: Func = (arg) => {};
```



## 别名和接口的区别

- 接口创建了一个新的名字，可以在其它任何地方使用。 类型别名并不创建新名字，如果类型报错，编译器是报原来的类型错误而不是别名
- 类型别名不能被`extends`和 `implements`（自己也不能`extends`和`implements`其它类型）根据开放封闭原则，能用接口就不要用别名
- 如果你无法通过接口来描述一个类型并且需要使用联合类型或元组类型，这时通常会使用类型别名。

## 字面量类型

这个很好理解，指定了内容只能在固定内容中选择

```typescript
type Bool = true | false | 1 | 0 | "";
let bool: Bool = 1; 
```

## 枚举成员类型

见<a href="#枚举成员做类型">枚举成员做类型</a>

## 可辨识联合

你可以合并单例类型，联合类型，类型保护和类型别名来创建一个叫做*可辨识联合*的高级模式，它也称做*标签联合*或 *代数数据类型*。 可辨识联合在函数式编程很有用处。 一些语言会自动地为你辨识联合；而TypeScript则基于已有的JavaScript模式。 

它具有3个要素：                

1. 具有普通的单例类型属性—*可辨识的特征*。
2. 一个类型别名包含了那些类型的联合—*联合*。
3. 此属性上的类型保护。

```typescript
interface ADD {
    label: "ADD"; // 每个接口的label都是不同的，这是可辨识的特征
    baseNum: number;
    add: number;
}
interface SUB {
    label: "SUB";
    baseNum: number;
    sub: number;
}
interface MUL {
    label: "MUL";
    baseNum: number;
    mul: number;
}

type Compute = ADD | SUB | MUL; // 将多个接口联合 这就是可辨识联合

function compute(obj: Compute): number {
    switch (obj.label) {
        case "ADD":
            return obj.baseNum + obj.add;
        case "SUB":
            return obj.baseNum - obj.sub;
        case "MUL":
            return obj.baseNum * obj.mul;
    }
}
```

> 这里自己敲下代码就会发现每个case中obj给的提示变量都不同

## 映射类型

映射类型是通过泛型来将接口的全部属性都转为设定的特性，如下是`Readonly`的实现

```typescript
type Readonly<T> = {
    readonly [P in keyof T]: T[P];
}
```

它这样使用

```typescript
interface Test {
    a: string;
    b: string;
}
type ReadOnlyTest = Readonly<Test>;

const test: ReadOnlyTest = {
    a: "A",
    b: "B",
};
test.a = "new"; // 错误 这是只读属性
```

但是从`Readonly`的实现能看出它只能将第一层设为`readonly`，如下就不起作用了

```typescript
interface Obj {
    a: { a: string };
    b: [number, string];
}
type ReadonlyObj = Readonly<Obj>;

let obj: ReadonlyObj = {
    a: { a: "a" },
    b: [1, "a"],
};
obj.a.a = "b"; // 正确
```

这时要手动实现`DeepReadonly`，其它的映射类型同理

```typescript
interface Obj {
    a: { a: string };
    b: [number, string];
}
type DeepReadonly<T> = {
    // 使用三元运算符和递归
    readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};
type ReadonlyObj = DeepReadonly<Obj>;

let obj: ReadonlyObj = {
    a: { a: "a" },
    b: [1, "a"],
};
obj.a.a = "b"; // 错误，obj.a.a是只读属性
```

TS中内置了多个类型

| 类型       | 说明               |
| ---------- | ------------------ |
| `Readonly<T>` | 将属性全转换为只读 |
| `Mutable<T>` |将属性全转换为可改|
| `Partial<T>` | 将属性全转换为可选 |
| `Required<T>` | 将属性全转换为必选 |
| `Record<T, U>` | 返回一个新类型，其中属性`key`为`T`的内容，每个属性类型为`U`的类型 |
| `Pick<T, U>` | 将`T`中的属性提取出来作为新的类型 |
| `Omit<T, U>` | 从`T`从剔除`U`指定的类型 |
| `Exclude<T, U>` | 从`T`中剔除可以赋值给`U`的类型 |
| `Extract<T, U>` | 提取`T`中可以赋值给`U`的类型 |
| `NonNullable<T>` | 从`T`中剔除`null`和`undefined` |
| `ReturnType<T>` | 获取函数返回值类型 |
| `InstanceType<T>` | 获取构造函数类型的实例类型 |

```typescript
// Record
type Obj = Record<"a" | "b", string>;
let obj: Obj = { a: "s", b: "s" };

type Obj = Record<number, string>;
let obj: Obj = { 1: "s", 2: "s" };

// Pick
interface Obj {
    a: string;
    b: string;
    c: string;
}
type ObjB = Pick<Obj, "a" | "b">;
let b: ObjB = { a: "a", b: "a" };

// Exclude Extract
type T00 = Exclude<"a" | "b" | "c" | "d", "a" | "c" | "f">;  // "b" | "d"
type T01 = Extract<"a" | "b" | "c" | "d", "a" | "c" | "f">;  // "a" | "c"

type T02 = Exclude<string | number | (() => void), Function>;  // string | number
type T03 = Extract<string | number | (() => void), Function>;  // () => void

// ReturnType
interface Obj {
    a: string;
}
function func(): Obj {
    return { a: "a" };
}
type FuncReturn = ReturnType<typeof func>; // 如果函数是用接口定义的这里直接放接口就行
let result: FuncReturn = { a: "a" };
```

# 操作符

## `typeof`

`typeof`返回一个真实变量的当前类型（只能是变量，不能直接放一个基础类型数据，如`typeof 1`是错的）

- 如果用`var let const`来接收返回值，它会返回和JS一样的字符串，如`number object`，这里就不讨论JS中的类型判断了
- 如果用`type`接收返回值，它返回自己定义的接口，类

```typescript
interface Test {
    a: string;
    b: string;
}
const test: Test = {
    a: "A",
    b: "B",
};

type TestKeys = typeof test; // 这里的TestKeys是Test的别名
let a: TestKeys = { a: "AA", b: "BB" };

// typeof对联合类型不能区分
type N = number | string;
let n: N = 1;
type NType = typeof n;
let newN: NType = "1"; // 错误 NType是n的当前类型number
```

## `keyof`

`keyof`返回一个类型的所有`key`的字符串组成的联合类型，和泛型配合非常有用

```typescript
// 从接口中提取keys
interface Test {
    a: string;
    b: string;
}
type Keys = keyof Test;
let keyA: Keys = "a";

// 如果是索引签名
interface Test {
    a: string;
    b: string;
    [numberKey: number]: string;
}
let keyA: keyof Test = 1; // 这里就可以是 a b 所有数字

// 如果对一个基础类型使用keyof 会返回该类型的所有实例方法组成的联合类型
let num = 1;
type Key = keyof typeof num;
let key: Key = "toFixed";
```

用来返回一个接口的所有方法的键名组成的联合类型（这里用了`never`不会进入联合类型的特性）

```typescript
type FunctionPropertyNames<T> = { [K in keyof T]: T[K] extends Function ? K : never }[keyof T];
interface Part {
    id: number;
    name: string;
    subparts: Part[];
    firstFn: (brand: string) => void;
    anotherFn: (channel: string) => string;
}

type FnNames = FunctionPropertyNames<Part>; // "firstFn" | "anotherFn"
```

## `in`

TS中的`in`和JS中不同，它不会返回任何变量或类型，它用来遍历联合类型（如果要遍历接口的key，先使用`keyof`）

```typescript
// 遍历联合类型
type Keys = "a" | "b" | "c";
// 这里不能用interface
type Obj = {
    [K in Keys]: number;
};
// 遍历接口
interface Obj {
    a: string;
    b: number;
}
type Keys = {
    [K in keyof Obj]: number;
};
let keys: Keys = { a: 1, b: 1 };
```

## `is`

`is`被称为类型谓词，一般用于函数返回值类型中，判断参数是否属于某一类型，并根据结果返回对应的布尔类型。

返回值中使用了`is`的函数可以用来做其它函数内的类型断言

```typescript
// 这个函数能正常运行
function toUpperCase(x: unknown) {
    if (typeof x == "string") {
        x.toUpperCase();
    }
}
// 如果改成这样ts不能知道已经进行了类型判断
function isString(arg: unknown): boolean {
    return typeof arg === "string";
}
function toUpperCase(x: unknown) {
    if (isString(x)) {
        x.toUpperCase();
    }
}
// 只需要修改isString函数就行
function isString(arg: unknown): arg is string {
    return typeof arg === "string";
}
function toUpperCase(x: unknown) {
    if (isString(x)) {
        x.toUpperCase();
    }
}
```

## `infer`

这个关键字只能在`extends(泛型约束)`中使用，能获得对应数据的类型

```typescript
// 获得数组元素的类型
type ElementOf<T> = T extends Array<infer E> ? E : T;
type StringArray = Array<string>;
type ArrayArg = ElementOf<StringArray>; // string

// 获得对象的属性的类型
type Foo<T> = T extends { a: infer U } ? U : never;
type T10 = Foo<{ a: string; b: number }>; // string

// 获得函数的参数类型
type Func = (arg: number) => string;
type GetArgType<T> = T extends (arg: infer U) => any ? U : never;
type ArgType = GetArgType<Func>;

// 可以将多个属性的类型作为联合类型返回
type Foo<T> = T extends { a: infer U; b: infer U } ? U : never;
type T10 = Foo<{ a: string; b: number }>; // number | string

// 如果是函数的参数，会返回交叉类型
type T1 = {name: string};
type T2 = {age: number};
type K2<T> = T extends {a: (x: infer U) => void, b: (x: infer U) => void} ? U : never;
interface Props {
  a: (x: T1) => void; // 这里参数必须是对象，如果是基础类型，两个基础类型取交叉会得到never
  b: (x: T2) => void;
}
type k3 = K2<Props> // T1 & T2

// 将元组转联合类型
type Tuple = [number, string, null];
type TupleToUnion<T> = T extends Array<infer U> ? U : never;
type Union = TupleToUnion<Tuple>; // number | string | null
```



# 模块

和ES6的语法一样，但是不止能导出变量，还能导出`interface type class`等类型

如果要导入类型，使用`import type { xx } from "xxx"`的形式

导出的默认模块如果要加入类型：`export default <Type>{ }`

# 命名空间

命名空间是在文件中开启一个具名作用域，在这个作用域中的类型变量不会影响外部，需要通过导出才能从外部通过作用域的属性来获得

> 在基于文件模块的项目中几乎用不到命名空间，因为每个文件都是单独的一个作用域，这里了解一下即可

```typescript
namespace Space {
    export interface A {
        a: string;
        b: string;
    }
    export const a: A = { a: "s", b: "s" };
}

console.log(Space.a);
let A: Space.A = { a: "a", b: "a" };
```

看看编译后的代码就能明白这个的原理是啥了

```javascript
// 编译后
var Space;
(function (Space) {
    Space.a = { a: "s", b: "s" };
})(Space || (Space = {}));
console.log(Space.a);
let A = { a: "a", b: "a" };
```

> 本质上就是通过`iife`实现了一个对象，这是JS的作用域方面的知识

看编译后的代码，能发现每个命名空间都是使用`var`来定义的，这说明它们都是挂载到全局上

> 在`<script src="xx" type="module"></script>`标签中，`var`声明也会被限制在文件作用域中，换句话说，在模块化的现在，命名空间已经用不上了

## 命名空间别名

使用`import xx = namespace.xx`来取别名

```typescript
namespace Space {
    export interface A {
        a: string;
        b: string;
    }
    export const a: A = { a: "s", b: "s" };
}
import A = Space.A;
let a: A = { a: "a", b: "b" };
```

## 命名空间合并

首先上面已经说了命名空间的作用原理，所以合并的原理也很简单，将全局的这个命名空间对象在这个文件中使用，或者添加新属性

使用`/// <reference path="xxx.ts" /> `注释来将文件中的命名空间和本文件的合并，然后进行以下操作

- 通过`tsc --outFile index.js Test.ts`来编译`Test.ts`文件和它依赖的文件进`index.js`中
- 通过把每个`ts`文件编译后再在`html`中按照依赖顺序进行导入（这里我没实验，但是看命名空间的实现原理应该容易看出这是啥意思吧）

如果确实要在模块中使用命名空间合并，可以使用`import`将另一个模块中的命名空间导入本模块，如果不需要使用另一个模块的导出或者没有导出，直接用副作用导出`import "xx.js"`即可

> 这里说的比较简单，深入了解ES模块就知道怎么回事了

命名空间本质就是对象，也能支持ES模块导出

> 不过不能直接`export default namespace Space`这样默认导出，非默认导出倒是能直接写完；如果要默认导出，应该要先声明`Space`，再导出

在同一作用域下，如果类和命名空间命名重复，命名空间中的导出会作为类的静态变量/方法存在

```javascript
// 编译后
class Album {
    label;
}
(function (Album) {
    class AlbumLabel {
    }
    Album.AlbumLabel = AlbumLabel;
})(Album || (Album = {}));
```

# 装饰器

*装饰器*是一种特殊类型的声明，它能够被附加到类、函数、访问符、属性、参数上

装饰器和设计模式的装饰器模式是同样的思想，让你在不破坏原有代码解构的基础上修改它们

> 使用装饰器得在`tsconfig.json`中配置`"experimentalDecorators": true`

## 类装饰器

类装饰器就是给类追加属性的，它接收一个类做参数，并能返回一个新的类作为添加了新属性的类

```typescript
function classDecorator<T extends { new (...args: any[]): {} }>(constructor: T) {
    constructor.prototype.prototypeFunc = () => {}; // 动态添加属性时不能加类型，所以这个函数的参数和返回值也没有语法提示
    return class extends constructor {
        newProperty = "new property";
        hello = "override";
        static staticFunc() {} // 添加静态方法在返回的类上添
    };
}

@classDecorator
class Greeter {
    property = "property";
    hello: string;
    constructor(m: string) {
        this.hello = m;
    }
}

const greeter: Greeter = new Greeter("hello");
console.log((<any>greeter).newProperty); // 类型仍然是Greeter而不是装饰后的类
console.log(greeter.hello); // override
```

## 装饰器工厂

装饰器柯里化后就能获得传入参数的装饰器

```typescript
function classDecorator(arg: number): Function {
    return function <T extends { new (...args: any[]): {} }>(constructor: T) {
        constructor.prototype.prototypeFunc = () => {}; // 动态添加属性时不能加类型
        return class extends constructor {
            newProperty = arg;
            hello = "override";
            static staticFunc() {} // 添加静态方法在返回的类上添
        };
    };
}

@classDecorator(3)
class Greeter {
    property = "property";
    hello: string;
    constructor(m: string) {
        this.hello = m;
    }
}
```

## 装饰器组合

一个能用装饰器的地方可以运用多个装饰器，看一下官方例子

```typescript
function f() {
    console.log("f(): evaluated");
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        console.log("f(): called");
    };
}
function g() {
    console.log("g(): evaluated");
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        console.log("g(): called");
    };
}

class C {
    @f()
    @g()
    method() {}
}
// 打印顺序：
// f(): evaluated
// g(): evaluated
// g(): called
// f(): called
```

## 方法装饰器

它会被应用到方法的*属性描述符*上，可以用来监视，修改或者替换方法定义

它接收三个参数：

1. 对于静态成员来说是类的构造函数，对于实例成员是类的原型对象。
2. 成员的名字。
3. 成员的*属性描述符*。[Object.getOwnPropertyDescriptor](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptor)的返回结果

```typescript
function enumerable(value: boolean) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        // 装饰器模式给方法添加新内容 不要使用 target[propertyKey] 来修改函数，这没用
        const originFunc = descriptor.value;
        descriptor.value = function (...arg: any) {
            console.log("before method use");
            let result = originFunc.apply(this, arg);
            console.log("after method use");
            return result;
        };
        descriptor.enumerable = value; // 修改这个方法的可枚举性
    };
}
class Greeter {
    greeting: string;
    constructor(message: string) {
        this.greeting = message;
    }
    @enumerable(false)
    greet() {
        console.log(this.greeting);
        return "Hello, " + this.greeting;
    }
}
const greeter: Greeter = new Greeter("hello");
console.log(greeter.greet());
```

## 访问器装饰器

 访问器装饰器应用于访问器的*属性描述符*并且可以用来监视，修改或替换一个访问器的定义，一般只拿来修改`getter setter`，因为不会改变类的类型，所以即使修改了`readonly`编译器还是不让你改

它接收的参数和方法装饰器的参数一样

>  TypeScript不允许同时装饰一个成员的`get`和`set`访问器。取而代之的是，一个成员的所有装饰的必须应用在文档顺序的第一个访问器上。这是因为，在装饰器应用于一个*属性描述符*时，它联合了`get`和`set`访问器，而不是分开声明的。

```typescript
function changeGetterSetter(value: boolean) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        descriptor.set = function (value: string) {
            this["_" + propertyKey] = value + "from set";
        };
        descriptor.get = function () {
            return this["_" + propertyKey] + " and from get";
        };
    };
}

class Greeter {
    private _greeting: string;
    constructor(message: string) {
        this.greeting = message;
    }
    @changeGetterSetter(false)
    get greeting(): string {
        return this._greeting;
    }
    set greeting(v: string) {
        this._greeting = v;
    }

    greet() {
        console.log(this.greeting);
    }
}
const greeter: Greeter = new Greeter("hello");
greeter.greet(); // hellow from set and from get
```

## 属性装饰器

属性装饰器作用在属性上，这个我暂时没有想到有啥能用的地方，因为使用这个装饰器也只能修改原型，而要修改的属性在实例上

属性装饰器传入下列2个参数：

1. 对于静态成员来说是类的构造函数，对于实例成员是类的原型对象。
2. 成员的名字。

## 参数装饰器

参数装饰器应用于类构造函数或方法声明

> 参数装饰器只能用来监视一个方法的参数是否被传入。

传入下列3个参数：

1. 对于静态成员来说是类的构造函数，对于实例成员是类的原型对象。
2. 成员的名字。
3. 参数在函数参数列表中的索引。

这个修饰器我也不知道咋用，只不过注意下它和其它修饰器不同，是放在函数的参数前的

```typescript
class Greeter {
    greeting: string;

    constructor(message: string) {
        this.greeting = message;
    }
	// 像这样
    greet(@required name: string) {
        return "Hello " + name + ", " + this.greeting;
    }
}
```
