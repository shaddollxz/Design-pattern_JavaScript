# React.memo

`react`和`vue`不同，当组件中响应式数据更新时它会重新调用该组件和其下所有子组件的渲染函数（就是函数式组件的函数本身）来获得新的`VNode`，如下面的这个组件，即使App中数据改变不会影响视图更新，每次点击按钮后都会打印出`rerender`

```tsx
// App.tsx
function App() {
    const [count, setCount] = useState(0);

    return (
        <>
            <button onClick={() => setCount(count + 1)}>add</button>
            <Child></Child>;
        </>
    );
}

// Child.tsx
function Child() {
    console.log("rerender");

    return <span>Child</span>;
}
export default Child;
```

对这种情况，`react`提供了一个`memo`函数来让组件可以避免这种不必要的重新执行

```tsx
// Child.tsx
function Child() {
    console.log("rerender");

    return <span>Child</span>;
}
export default memo(Child);
```

这样，只有当子组件中接收的`props`发生更新后才会重新执行`render`

# useMemo useCallback

但是如果`props`是一个对象或函数时`memo`并不会起作用，像下面的组件，无论是只传入对象或函数，它都会打印

```tsx
// App.tsx
function App() {
    const [obj, setObj] = useState({ data: "data" });

    const childObj = { data: "data" };
    const fn = () => {};

    return (
        <>
            <button onClick={() => setObj({ data: obj.data + "a" })}>add</button>
            <Child obj={childObj} cb={fn}></Child>;
        </>
    );
}

// Child.tsx
interface Props {
    obj?: {
        data: string;
    };
    cb?: () => void;
}

function Child(props: Props) {
    console.log("rerender");

    return <span>Child</span>;
}

export default memo(Child);
```

这时因为触发了`setObj`后父组件重新执行了渲染，获得的`obj fn`都是和原来的对象，函数不是同一块内存，这样传递给子组件的数据仍然是发生了变化，对此就要使用`useMemo useCallback`来获得一个即使重新渲染获得的对象仍然指向原来内存的对象

`useCallback`是`useMemo`的语法糖，它们都是根据第二个参数来确定它们的依赖，如果依赖发生改变，它们返回的对象才会发生变化

```tsx
function App() {
    const [obj, setObj] = useState({ data: "data" });

    const childObj = useMemo(() => ({ data: "data" }), []);
    const fn = useCallback(() => {}, []);

    return (
        <>
            <button onClick={() => setObj({ data: obj.data + "a" })}>add</button>
            <Child obj={childObj} cb={fn}></Child>;
        </>
    );
}
```

# 总结

在父组件会时常更新而子组件不需要跟着更新时可以使用这个Api来做到性能优化，当然不能无脑使用，这样也是会发生性能问题的