## Immerjs

见如下代码

```javascript
const obj = {
    a: "a",
};
function changeA(obj) {
    obj.a = "b";
    return obj;
}
obj == changeA(obj); // true
```

很明显，修改引用类型的数据是不能直接观察到变化的，一般这种情况是使用解构再重组：`return { ...obj }`，如果是更加复杂的对象，就需要套很多层或者使用深复制函数，如果只是修改一处就遍历整个对象进行复制这无疑是巨大的性能浪费，对此有了`Immer`这个库，它使用`proxy`来监听数据的修改并能以最小代价获得一个新的修改后的数据，并且该数据使用`Object.freeze`使它成为只读的对象

### produce

`Immer`默认导出一个`produce`函数（它也被命名导出了）这是`Immer`的核心函数

`produce`可以直接用来修改一个对象，只需要第一个参数传入需要修改的对象，第二个参数是修改对象的回调，第三个参数是做数据的时空旅行使用的，具体使用见后面

```javascript
const data = {
    name: "name",
};
const newdata = produce(data, (old) => {
    old.name = "new name";
});
```

也可以只传入一个用来修改数据的回调函数，这样会返回一个新的函数，通过这个函数来获取新对象

```typescript
interface Data {
    name: string;
}
const data: Data = { name: "name" };

const func = produce<Data>((old) => {
    old.name = "new name";
});
const newData = func(data);
```

### 集成进react

在使用`useState`设置复杂数据时很适合使用`produce`的第二个重载方法来使用，下面是一段集成的代码

```typescript
export function useStateWithImmer<T extends Exclude<any, void>>(value: T | (() => T)) {
    const [state, setState] = useState(value);

    const setStateWithImmer = useCallback((input: T | ((state: Draft<T>) => void)) => {
        if (typeof input == "function") {
            setState(produce<T>(input as unknown as any));
        } else {
            setState(input);
        }
    }, []);

    return [state, setStateWithImmer] as const;
}
```

### patch

> 如果需要开启这个功能需要先导入`enablePatches`并调用一次

`patch`是`produce`的第三个参数，它的参数`patches inversePatches`会暴露出这次修改涉及的一些信息，可以根据这些信息进行其它需要的操作

这是`patch`函数的定义

```typescript
export interface Patch {
    op: "replace" | "remove" | "add"; // 操作的类型
    path: (string | number)[]; // 操作的路径
    value?: any; // 修改后或前的值
}

type PatchListener = (patches: Patch[], inversePatches: Patch[]) => void;
```

```javascript
const data = {
    name: "name",
};
const newdata = produce(
    data,
    (old) => {
        old.name = "new name";
    },
    (patches, inversePatchs) => {
        console.log(patches); // 这是这次修改时的信息
        console.log(inversePatchs); // 这是修改前的信息
    }
);
```



