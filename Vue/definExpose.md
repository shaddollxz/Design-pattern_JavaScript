在vue3.x的setup语法糖中定义的变量默认不会暴露出去，这时使用`definExpose({ })`来暴露组件内部属性给父组件使用

```html
// 子组件
<script setup>
    let aaa = ref("aaa")
    defineExpose({ aaa });
</script>
```

```html
<Chlid></Chlid>
<script setup>
	let child = ref(null)
    child.value.aaa //获取子组件的aaa
</script>
```

在父组件中直接修改子组件的属性，子组件也会相应更新