`ThisType`是ts中内置了一种类型，查看源码发现只能知道它的作用，定义方法中啥都没有

```typescript
/**
 * Marker for contextual 'this' type
 */
interface ThisType<T> { }
```

下面说明一下它怎么用，啥时候用

## ThisType

`ThisType`和[`this`参数](https://www.shaddollxz.space/blog/619cd186aa198bb641a5fadc)都是指定函数的运行时`this`指向的类型，它们的使用不同

- `this`参数是作为函数的参数定义的，它可以定义在任何函数上
- `ThisType`定义一个对象中的所有函数的`this`指向类型，它只能在对象的类型声明时使用

下面这段代码中`initEnvPropertiesB`调用了自己的`initABC`方法给自己添加了三个符合`Env`规范的属性

```typescript
abstract class Env {
    a!: number;
    b!: string;
    c!: boolean;
}

interface InitEnvPropertiesB {
    e: string;
    initABC: () => void;
}

const initEnvPropertiesB: InitEnvPropertiesB & ThisType<Env> = {
    e: "e",
    initABC() {
        this.a = 2;
        this.b = "B";
        this.c = false;
        // this.e = "E"; // error this中没有e属性
    },
};

// 当然还能这样定义
type InitEnvPropertiesB = {
    e: string;
    initABC: () => void;
} & ThisType<Env>;

const initEnvPropertiesB: InitEnvPropertiesB = {
    e: "e",
    initABC() {
        this.a = 2;
        this.b = "B";
        this.c = false;
    },
};

initEnvPropertiesB.initABC();
console.log(initEnvPropertiesB); // 有abce四个属性
```

## 实际使用

这个类型在高级函数的封装中非常有用，如下是对[`Pinia`](https://pinia.esm.dev/)的模仿，它通过使用`ThisType`提供了非常友好的代码提示，这也是[`typeChallenges`中的一题](https://github.com/type-challenges/type-challenges/blob/master/questions/1290-hard-pinia/README.md)，←详细题目见左边链接，推荐先思考下题目再来看下面的答案

---

```typescript
type GetterFunc = Record<string, () => any>;

type ReturnTypes<T extends GetterFunc> = {
    [K in keyof T]: ReturnType<T[K]>;
};

declare function defineStore<State, Getters extends GetterFunc, Actions>(store: {
    id: string;
    state: () => State;
    getters?: Getters & ThisType<Readonly<State> & ReturnTypes<Getters>>;
    actions?: Actions & ThisType<State & Actions>;
}): State & Readonly<ReturnTypes<Getters> & Actions>;

const store = defineStore({
    id: "",
    state: () => ({
        num: 0,
        str: "",
    }),
    getters: {
        stringifiedNum() {
            // @ts-expect-error
            this.num += 1;

            return this.num.toString();
        },
        parsedNum() {
            return parseInt(this.stringifiedNum);
        },
    },
    actions: {
        init() {
            this.reset();
            this.increment();
        },
        increment(step = 1) {
            this.num += step;
        },
        reset() {
            this.num = 0;

            // @ts-expect-error
            this.parsedNum = 0;

            return true;
        },
        setNum(value: number) {
            this.num = value;
        },
    },
});
```

