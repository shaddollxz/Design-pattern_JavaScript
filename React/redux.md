# redux

## 基本使用

`redux`和`mobx pinia`等状态管理库的设计理念不同，它只维护一个`store`，且通过使用`dispath`将`action`派发给`reducer`，再由`reducer`返回新的状态来修改状态

### action

action只是一个普通的函数，它需要返回一个带字符串或枚举的`type`属性和其它任意属性组成的对象来通知`reducer`执行修改逻辑。一般来说是把一个分片的所有`action`写成一个对象，好集中调用，配合ts的常量声明更舒服，像下面这样即声明了一个`action`

```typescript
const enum TypeEnum {
    ADD,
    SUB,
    SET,
    SET_ASYNC,
}

export const counterActions = {
    add() {
        return { type: TypeEnum.ADD };
    },
    sub() {
        return { type: TypeEnum.SUB };
    },
    set(v: number) {
        return {
            type: TypeEnum.SET,
            count: v,
        };
    },
} as const;
```

### reducer

`reducer`并不直接修改状态，而是通过返回一个新的状态对象来告诉`redux`修改对象，它是一个接收当前状态`state`和`action`返回值的一个函数，通过在`reducer`中判断`action`返回的`type`来进行对应的返回

初始状态通过设置该函数`state`参数的默认值设置

```typescript
interface CounterState {
    count: number;
}

const initState: CounterState = {
    count: 0,
};

const counterReducer: CounterReducer = (state = initState, action) => {
    switch (action.type) {
        case TypeEnum.ADD:
            return { count: state.count + 1 };
        case TypeEnum.SUB:
            return { count: state.count - 1 };
        case TypeEnum.SET:
            return { count: action.count };
        default:
            return state;
    }
};
```

### combineReducers

每个`reducer`都只维护一个状态，最终通过`combinReducers`将多个`reducer`拼在一起组成一个总状态

```typescript
import { legacy_createStore as createStore, combineReducers } from "redux"; // 官方建议用@reduxjs/toolkit了

const reducers = combineReducers({ counter: counterReducer });
export const store = createStore(reducers); // 这个就是总状态
```

### react-redux

通过这个库将前面创建的`store`注入到`react`程序中，首先使用`Provider`组件包裹最外层组件，再传入`store`，就可以通过`connect`等api在组件中通过`props`使用状态

```tsx
// main.tsx
ReactDOM.render(
    <Provider store={store}>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </Provider>,
    document.getElementById("root")
);

// App.tsx
function Index(props: Props & StoreStates & StoreActions) {
	// ...
}

// 将store中的数据进行包装，当然也能直接给store扔进去
function mapStateToProps(state: Store, ownProps: Props): StoreStates {
    return {
        counter: state.counter,
        countGetter: state.counter.count + " " + state.counter.count * 2,
    };
}
function mapDispatchToProps(dispatch: Dispatch): StoreActions {
    return {
        add: () => dispatch(counterActions.add()),
        sub: () => dispatch(counterActions.sub()),
        set: (v) => dispatch(counterActions.set(v)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Index);
```

## redux-saga

`redux`本身不支持异步处理数据，如果要设置的异步的`action`得使用`redux-saga`作为中间件让`redux`使用

`saga`也分为三个层面：worker、watcher、root，它们都是使用生成器语法写的函数

### worker

该函数使用`saga`提供的工具函数获取异步的返回值并返回对象让`reducer`进行处理

```typescript
function* updateDataAsync(action: any) {
    const result: number = yield call(getAsyncData, action.count); // 第一个参数是异步函数，后面的是异步函数的参数
    const current: number = yield select((state: Store) => state.counter.count); // 获取当前store中的count
    yield put({ type: TypeEnum.SET, count: result + current }); // 获得异步结果，派发任务
}
```

### watcher

这个函数用来监听`action`的派发

```typescript
// 在action中添加异步的任务派发 组件中只需要dispatch这个函数就能派发异步任务了
const counterActions = {
    asyncSet(v: number) {
        return {
            type: TypeEnum.SET_ASYNC,
            count: v,
        };
    },
}

function* watchUpdateDataAsync() {
    // 当派发了SET_ASYNC时触发上面的异步任务
    //* 这里第一个参数必须是字符串 使用枚举的时候它需要特别处理下
    yield takeLatest(TypeEnum.SET_ASYNC, updateDataAsync);  // takeLatest代表如果多次调用，只会根据最后一次调用来执行worker 还有takeEvery支持多次调用
}
```

### root

`root`就是将所有的`watcher`进行收集

```typescript
function* rootSaga() {
    yield watchUpdateDataAsync();
}
```

### 插入中间件

```typescript
import createSagaMiddleware from "redux-saga";
const sagaMiddleware = createSagaMiddleware(); 
export const store = createStore(reducers, applyMiddleware(sagaMiddleware));
sagaMiddleware.run(rootSaga);
```

# redux-toolkit

从上面能看出`redux`的api非常复杂，而它推出了`@reduxjs/toolkit`集成了`saga`等库来化简操作的过程

## 基本使用

现在就是通过使用`createSlice`来创建`reducer action`，`configureStore`接收`reducer`创建`store`

```typescript
const counterSlice = createSlice({
    name: "counter",
    initialState,
    reducers: {
        add(state: CounterState) {
            state.count++; // 因为集成了 可以直接修改状态
        },
        sub(state: CounterState) {
            state.count--;
        },
        set(state: CounterState, action: PayloadAction<number>) {
            state.count += action.payload;
        },
    },
});

export const counterActions = counterSlice.actions;

export const store = configureStore({
    reducer: {
        counterReducer: counterSlice.reducer,
    },
});

export type Store = ReturnType<typeof store.getState>;
export type Dispatch = typeof store.dispatch;
```

在组件里的使用和`redux`完全一样，通过`react-redux`的api实现，同时`@reduxjs/toolkit`提供了`useDispatch useSelector`两个api在组件内获得`dispatch store`，为了不需要每次调用这两个函数时引入类型，比较好的实践是给它们加上类型封装一下

```typescript
import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";

export const useAppDispatch = () => useDispatch<Dispatch>();
export const useAppSelector: TypedUseSelectorHook<Store> = useSelector;
```

## 处理异步

处理异步有两种方案，直接写一个`action`：

```typescript
export const asyncSetCount = (payload: number) => (dispath: Dispatch) => {
    getAsyncData(payload).then((res) => {
        dispath(counterActions.set(res));
    });
};

// 使用时
import { useDispatch } from "react-redux";
const dispatch = useDispatch<Dispatch>(); // 将store的dispatch类型加上，否则下面会报错
dispatch(asyncSetCount(233));
```

使用`createAsyncThunk`注册一个`extraReducers`

```typescript
// 创建thunk自执行异步 第一个参数类似type 与其他的type不能同名
export const asyncCounter = createAsyncThunk("counter/async", async (value: number) => {
    const data = await getAsyncData(value);
    return data; // 返回值会作为reducer的action.payload
});

const counterSlice = createSlice({
    // ...
    extraReducers: {
        [asyncCounter.fulfilled.type](state, { payload }) {
            state.count = payload;
        },
    },
    // 或者另一个写法
    // extraReducers(builder) {
    //     builder.addCase(asyncCounter.fulfilled, (state, { payload }) => {
    //         state.count = payload;
    //     });
    // },
});

// 使用时
dispatch(asyncSetCount(233)); // 它的类型还是不兼容
```





~~~总结：mobx真好用~~~