# 概述

`react`使用`jsx/tsx`的方法，做到在`js/ts`中书写`html`，同时提供了组件化和模块化

`react`的组件可以使用类的写法，和`vue2`类似，到现在还提供了纯函数写法，也就是`hook写法`这里主要学习`hook`的写法

# api

## 设置响应式数据

`react`中的响应式数据通过`useState`函数实现，通过传入一个数据，并使用一个数组来接收返回值

数组第一个元素是放到视图中的可响应元素

数组第二个是用来修改响应值的函数，这个函数接收两种参数，一种是修改后的值，另一种是以现在的数据为参数的回调函数

```tsx
export default function () {
    const [counter, setCounter] = useState({ counter: 0 });

    function add() {
        setCounter((countera) => {
            return { counter: countera.counter + 1 }; // 回调函数获取的对象是引用，不要直接用解构的方式改
        });

        setCounter({ counter: counter.counter + 1 });
    }

    return <button onClick={add}>{counter.counter}</button>;
}
```

## 获得真实DOM和子组件实例

通过`useRef`来获得一个对象，通过在视图中的DOM元素或者组件上添加`ref={}`就可以通过对象的`current`属性获得真实DOM元素或子组件实例了

### 获得DOM

```tsx
function Component() {
    const div = useRef<HTMLDivElement>(null);

    useEffect(() => {
        console.log(div.current?.clientHeight);
    });

    return <div ref={div}></div>;
}
```

### 获得子组件实例

子组件必须用`useImperativeHandle`设置组件向外抛出的数据，`forwardRef`让组件能让外部获取`ref`

```tsx
// Child.tsx
type ChildRef = Ref<{
    name: string;
}>;

function Child(_: unknown, ref: ChildRef) {
    useImperativeHandle(ref, () => {
        return {
            name: "child",
        };
    });

    return <span>child</span>;
}

export default forwardRef(Child);

// App.tsx
type ChildRef<T> = T extends ForwardRefExoticComponent<infer R>
    ? R extends RefAttributes<infer RR>
        ? RR
        : never
    : never;

function App() {
    const childRefs = useRef<ChildRef<typeof Child>>(null);

    useEffect(() => {
        console.log(childRefs.current?.name);
    }, []);

    return (
        <>
            <Child ref={childRefs}></Child>;
        </>
    );
}
```

## 组件间传值

`react`中没有像`vue`一样将父子组件传递的值区分为`props、emits`，它都是统一作为`props`来传递（`vue3`中也有这种写法了）

### 父传子

组件函数的第一个参数`props`就是接收到的所有数据组成的对象，`props`不是一个`ReadOnly`对象，但是修改其中的值不会触发父组件更新

### 子抛父

组件函数的第二个参数`ref`是设置抛出给父组件的对象，在组件内使用`useImperativeHandle`来定义，并且导出的组件函数必须通过`forwardRef`来加工

> 子组件抛出的数据不会被父组件监听到，也不会改变在父组件上的渲染

```tsx
// Child.tsx
interface Props {
    initCounter: number;
}
interface RefData {
    counte: number;
}

function Child(props: Props, ref: Ref<RefData>) {
    const [counter, setCounter] = useState({ counter: props.initCounter });

    useImperativeHandle(ref, () => {
        return {
            counte: counter.counter,
        };
    });

    return <button>{counter.counter}</button>;
}
export default forwardRef(Child);

// Father.tsx
type RefData<T> = T extends ForwardRefExoticComponent<infer R>
    ? R extends RefAttributes<infer RR>
        ? RR
        : never
    : never;

function Appp() {
    const app = useRef<RefData<typeof App>>(null);
    useEffect(() => {
        console.log(app.current?.counte);
    });

    return <Child ref={app} initCounter={3} />;
}
```

### inject&provide

通过使用`createContext`来向所有子孙组件注入数据，子组件使用`useContext`来获取

`createContext`返回一个含有`Provider Consumer`两个`ReactNode`的对象，在需要向下注入数据的组件外包上`Provider`，在其下的所有组件中都能通过`useContext`来获得注入的数据了

如果没有被包裹的组件中调用了`useContext`，它会获得`createContext`调用时定义的默认值

```tsx
// App.tsx
export const Inject = createContext({ data: "default" }); // 如果没有没被注入的组件来获取Inject的注入值，会获得这里的

function App() {
    return (
        /*  value是注入的值 */
        <Inject.Provider value={{ data: "data" }}>
            <Child></Child>
        </Inject.Provider>
    );
}

// Child.tsx
import { Inject } from "../App";

export default function () {
    const provide = useContext(Inject);

    return <span>{provide.data}</span>;
}
```

## 数据监听和生命周期钩子

通过`useEffect、useLayoutEffect`来做到根据数据的更新执行某些操作（这两个函数的唯一区别是前者是异步执行，后者是同步执行，以后在其它博客补充说明）它会在页面渲染后必定执行一次，这个函数接收两个参数

第一个参数是触发时执行的回调函数，回调函数中可以返回一个函数，这个返回函数在组件销毁时执行，相当于`onUnmounted`

第二个参数是需要监听的数据组成的数组，如果设置为空数组，上面设置的回调函数就只会在页面加载完成后执行一次，这时就相当于`onMounted`

```tsx
useEffect(() => {
    console.log("mounted");
    return () => {
        console.log("unMounted");
    };
}, []);

useEffect(() => {
    console.log("counter changed");
}, [counter]);
```

## 设置计算值

和`vue`的`computed`值一样，`react`也有计算属性，它通过`useMemo`来设置有缓存的数据，同时还提供了一个`useCallback`来设置有缓存的函数（关于`useCallback和useMemo`还有其它用法，会在以后的博客说明）

```tsx
function Child(props: Props) {
    const [counter, setCounter] = useState({ counter: props.initCounter });

    let counte = useMemo(() => counter.counter + "次", [counter]);

    function add() {
        setCounter((countera) => {
            return { counter: countera.counter + 1 };
        });
    }

    return <button onClick={add}>{counte}</button>;
}
```

## 组件插槽

### 默认插槽

在组件中放入其它组件或者`html`元素，都会在组件的`props`中添加一个`children`属性，通过这个属性就能做到插槽的作用

```tsx
// Child.tsx
interface Props {
    children: ReactNode;
}

export default function (props: Props) {
    return <div className="child">{props.children}</div>;
}

// App.tsx
export default function () {
    return (
        <Child>
            <h1>haha</h1>
        </Child>
    )
}
```

### 具名插槽

如果放入一个以`html片段`为属性的对象`children`也会被收集为一个对象，这样就可以做具名插槽使用

```tsx
// Child.tsx
interface Props {
    children:
        | {
              name: ReactElement;
              id: ReactElement;
          }
        | ReactElement;
}

export default function (props: Props) {
    return (
        <>
            {props.children && isValidElement(props.children) ? (
                // 默认插槽
                <div className="default">{props.children}</div>
            ) : (
                // 具名插槽
                <>
                    <div className="name">{props.children.name}</div>
                    <div className="id">{props.children.id}</div>
                </>
            )}
        </>
    );
}
// App.tsx
export function () {
    return (
        <>
            <Child>{{ name: <h1>name</h1>, id: <h2>id</h2> }}</Child>;
        </>
    );
}
```

### 函数插槽

通过定义`children`为函数，来为外部暴露数据进行自定义渲染也是可以做到的

这个例子就通过子组件暴露一个数组，父组件根据这个数组进行渲染

```tsx
// Child.tsx
interface Props {
    children: (val: string[]) => ReactElement[];
}

export default function (props: Props) {
    let data = ["item1", "item2", "item3"];

    return <>{props.children(data)}</>;
}

// App.tsx
function App() {
    return <Child>{(data) => data.map((value, index) => <span key={index}>{value}</span>)}</Child>;
}
```

