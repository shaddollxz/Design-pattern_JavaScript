# 首先看看element-plus的`$message`方法

通过调用`Message`方法并传入显示的文字就会在页面上渲染出指定的消息提示框。

现在就根据这个需求来制作一个`message`组件

## 首先准备一个`Message.vue`组件

正常地写一个单文件组件，该组件的`props`就是会从函数中接收的参数，根据传入的`props`来渲染出不同的组件样式

这个组件用`v-show`来隐藏自己并在外面使用`transtion`组件包裹，这样在组件离开时就使用`transition`的`@before-leave`来触发组件的卸载时事件，使用`@after-leave`来触发组件卸载

> 这里不能用`v-if`来做组件卸载，`v-if`不会触发`unmounted`，意味着组件实际上没有被卸载
>
> 具体怎样卸载见下

## 然后需要一个组件的渲染流程，这里需要额外写一个js文件

这个文件就是向外导出的组件，我们调用的`message`函数就是它

这里的核心就是导入刚才的`Message.vue`，然后使用vue的`render createVNode`来将组件渲染出来，最后挂载到页面中，在触发了卸载事件时再将这个组件卸载

使用`render`来渲染组件：

- 首先通过`createVNode`来把`Message.vue`转为`VNode`

	> 这里`createVNode`会把接收的第二个参数作为组件接收的`props`

- 然后创建一个元素，并把`VNode`渲染到该元素上，这里类似于`app.mount("#app")`，会把真实的dom作为子元素挂载到元素内部

- 最后在body上添加渲染的组件

卸载组件：

- 在`vm`实例上添加一个`onDestroy`方法，该方法会在原先挂载vm的元素上重新渲染一个`null`
- 在`Message.vue`组件中注册`destroy`方法，并在`transition`的`@after-leave`中`emit`，这样在该组件离开屏幕后将会提交卸载方法把自己卸载

至此，将`.vue`组件渲染到真实dom上的过程就结束了，但是要让多个消息提示框做到不重叠，这代表不能让每个元素都`fiex`到同一个位置，在element-plus中是通过每次点击计算提示框大小的方式固定它的位置，具体可以见[源码](https://github1s.com/element-plus/element-plus/blob/dev/packages/components/message/src/message-method.ts)的25行，这里它就计算了以前渲染并没有被删除的实例的高，再加上偏移量来确定了下一个实例的位置。

我这里使用另一个方法，在body中新添加一个元素接收消息框的真实dom，将该消息框设为`flex`并纵向排列，这样每个元素都会被该布局放到上一个元素下方，有元素被卸载下一个元素也会被移上去。

## 使用

通过将`Message.js`中的渲染函数导出，在组件中就能直接使用

如果要挂载到全局，得使用`app.config.globalProperties.$message`来挂载，具体可以见这篇[插件的写法](https://www.cnblogs.com/shaddollxz/p/15268516.html)

vue3的setup中因为不能直接拿到`this`，有两个方法解决：

- 官方文档中介绍了一个函数，通过它可以在`setup`获取当前组件的实例，但是并不推荐使用，具体使用见下

  > ```javascript
  > import { getCurrentInstance } from "@vue/runtime-core";
  > const internalInstance = getCurrentInstance();
  > const $message = internalInstance.appContext.config.globalProperties.$message;
  > ```

- 通过`provide`在根中注入，以后每次使用都通过`inject`来获取，似乎官方更推荐使用这个方法来挂载全局变量

## 代码

具体代码见下：

Message.vue

```vue
<template>
    <transition name="message" @before-leave="onClose" @after-leave="$emit('destroy')">
        <div class="message" v-show="isShow" :class="type" :style="style">
            <div :class="['text', align]">{{ text }}</div>
            <div
                @click="isShow = !isShow"
                :class="isCanClose || duration ? 'canClose' : 'cantClose'"
            >
                ✖
            </div>
        </div>
    </transition>
</template>

<script>
import { defineComponent, onMounted, ref } from "@vue/runtime-core";
export default defineComponent({
    name: "message",
});
</script>
<script setup scoped>
const props = defineProps({
    text: {
        type: String,
        default: "",
    },
    // 弹框显示时间 为零则只能手动关
    duration: {
        type: Number,
        default: 1300,
    },
    // 文字对齐方式
    align: {
        type: String,
        default: "left",
    },
    // 是否显示删除按钮
    isCanClose: {
        type: Boolean,
        default: true,
    },
    // 样式 用来修改框的宽，高，背景色，文字颜色
    style: {
        type: Object,
        default: () => {},
    },
    // 弹框颜色快捷
    type: {
        type: String,
        default: "default",
    },
    // 关闭时的触发回调
    onClose: {
        type: Function,
        default: () => () => {},
    },
});

// 定义时间之后消失
const isShow = ref(true);
// 如果持续设为零 则不会定时删除
onMounted(() => {
    if (props.duration) {
        setTimeout(() => {
            isShow.value = false;
        }, props.duration);
    }
});
</script>

<style lang="less">
.message {
    width: 33%;
    height: max-content;
    box-sizing: border-box;
    padding: 1rem 1.8rem;
    margin-bottom: 0.6rem;
    border-radius: 0.4rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    &.default {
        color: #909399;
        background-color: #e9e9eb;
    }
    &.success {
        color: #67c23a;
        background-color: #e1f3d8;
    }
    &.error {
        color: #f56c6c;
        background-color: #fde2e2;
    }
    .text {
        margin-right: 1rem;
        font-size: 1rem;
        font-weight: 600;
        flex: 1;
        &.center {
            text-align: center;
        }
        &.left {
            text-align: left;
        }
    }
    .canClose {
        // 叉叉
        cursor: pointer;
    }
    .cantClose {
        display: none;
    }
}
.message-leave-active {
    transition: all 0.7s ease;
}
.message-leave-to {
    opacity: 0;
    transform: translateY(-100%);
}
</style>
```

Message.js

```javascript
import { createVNode, render } from "vue";
import messageComp from "./message.vue";

const messageBox = document.createElement("div");
messageBox.style.width = "100%";
messageBox.style.height = "0px";
messageBox.style.position = "fixed";
messageBox.style.top = "5%";
messageBox.style.display = "flex";
messageBox.style.flexDirection = "column";
messageBox.style.alignItems = "center";
messageBox.style.zIndex = "999";
document.body.appendChild(messageBox);

function renderMessage(options) {
    //todo 获得组件的实例
    const vm = createVNode(messageComp, options);

    //todo 创建一个新元素并将组件渲染到上面，最后添加到messageBox中
    const renderBody = document.createElement("div");
    render(vm, renderBody);
    messageBox.appendChild(renderBody.firstElementChild);

    //todo 通过该方法卸载，该方法会作为emit放入message.vue
    vm.props.onDestroy = () => render(null, renderBody);
}

function Message(text, options) {
    options = {
        ...options,
        text,
    };
    renderMessage(options);
}
Message.success = (text, options) => {
    options = {
        ...options,
        type: "success",
        text,
    };
    renderMessage(options);
};
Message.error = (text, options) => {
    options = {
        ...options,
        type: "error",
        text,
    };
    renderMessage(options);
};

export default Message;
```

---

广告：遇到经常使用的需求时我会自己封装一些组件或方法，有兴趣的可以[来看看](https://github.com/shaddollxz/SDT)（虽然文档根本没空写

