reactive用来包装一个对象，使其每个对象属性都具有响应性，但是这个包装过程是递归调用的，如果包装的对象有过多属性而又不需要设置相应，无疑是性能浪费

针对这种情况vue设置了`shallowReactive shallowRef`两个方法来包装响应式数据，通过该方法包装的数据只有第一层具有响应性

# `shallowReactive`

和`reactive`一样，该方法只能把对象或数组包装为响应式对象

```vue
<template>
    <div class="about">
        {{ test }}
        <button @click="change">change</button>
    </div>
</template>
<script setup>
const test = shallowReactive({
    a: {
        b: "b",
    },
});

function change() {
    test.a.b = "new";
    console.log(test);
}
</script>
```

通过`change`方法改变了`test`的深层属性，这时会发现控制台中打印的数据是改变后的，而浏览器视图中仍然是原来的对象，而如果把`change`改成修改`test`的第一层属性，则会触发视图的更新

```javascript
function change() {
    test.a = "new";
    console.log(test);
}
```

# `shallowRef`

该方法就可以包装对象和基础类型的数据了，不过包装基础属性的数据和普通的`ref`没有区别，这里就只说说包装对象时的用法

```vue
<template>
    <div class="about">
        {{ test }}
        <button @click="change">change</button>
    </div>
</template>
<script setup>
const test = shallowRef({
    a: "a",
});

function change() {
    test.value.a = "new";
    console.log(test.value);
}
</script>
```

和`shallowReactive`不同，这里修改了对象的第一层属性不会触发视图更新，`shallowRef`的第一层数据实际指的是包装的整个数据，所以改成这样

```javascript
function change() {
    test.value = { b: "b" };
    console.log(test.value);
}
```

vue就会响应数据的更新了

## `triggerRef`

`shallowRef`数据被改变后如果要同步到视图上，可以调用一次`triggerRef`函数，该函数接收`shallowRef`数据，并会把该数据同步到视图上

```javascript
const test = shallowRef({
    a: "A",
    b: "B",
});

function change() {
    test.value.a = "new";
    triggerRef(test);
    test.value.b = "new";
}
```

通过调用一次该方法，两个数据都会被同步

# 使用

可以在通过`ref`获得dom元素时使用来去掉不必要的监听，节省性能