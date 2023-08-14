# BEM命名

BEM指`block element modifier`即`块 元素 修饰符`

一个例子

```scss
.btn {
    .btn__lable { }
    .btn__lable--red { }
    .btn__icon { }
}
.btn--blue { }
```

这代表一个类名为`btn`的按钮，里面有`lable icon`两个子元素，其中`lable`为红色，整个按钮为蓝色

# Naive-ui中的修改样式函数

`naive-ui`中导出了对应的`cB cE cM c`四个设置样式的函数，分别与上面对应

下面将上面的结构用函数重写一次

```typescript
const style = cB("btn", `样式的css字符串或对象`, [
  cE("lable", "...", [cM("red", "...")]),
  cE("icon", "..."),
  cM("blue", "...")
])
```

>  `c`只能通过css选折器制定类名修改样式，如果修改`hover`之类的伪元素，只能`c("&:hover")`来实现

它们都返回一个`CNode`对象

```typescript
/** CNode */
export interface CNode {
    $: CSelector;
    props: CProperties;
    children: CNodeChildren;
    instance: CssRenderInstance;
    els: HTMLStyleElement[];
    render: <T extends CRenderProps>(props?: T) => string; // 获得渲染用的css字符串
    mount: <T extends undefined | SsrAdapter = undefined>(options?: MountOption<T>) => T extends undefined ? HTMLStyleElement : void; // 将样式挂载到header的style中
    unmount: (options?: UnmountOption) => void; // 取消挂载
}
```

可以通过`options`制定组件的`name`