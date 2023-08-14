# 需求

想给博客的头图直接换成随机图片，不过因为有九十多张图，直接打包进前端里面有点不爽，所以是直接把每个图片放到后端静态目录里面，每次都在前端使用`img`标签发送图片请求，这样需要获得后端文件夹中文件的文件名，再从中获得随机图片，

这里的需求很简单，通过获取文件夹中所有文件的名字，然后返给页面代码，让页面代码随机挑选图片并加载，这里就从头开始记录下这个功能的实现

# 实现

## 插件类型

插件是一个对象，它的类型是`Plugin`，为了让插件可配置，一般都是使用函数的形式获得插件对象，所以插件文件一般都导出为一个函数，函数返回值为`Plugin`

`Plugin`中有一个必须参数`name`，其它都是生命周期钩子，它兼容`rollup`钩子并有自己的钩子，下面只介绍部分钩子，具体介绍见[官网](https://vitejs.cn/guide/api-plugin.html#universal-hooks)

## 部分钩子函数

### resolveId(id)

每次进行`import`操作的时候都会触发这个钩子，将导入模块的名字作为`id`传入该钩子，在这个钩子内进行比较，如果是自己定义的模块名，则返回`\0`加上模块名传递给`load transform`，否则不提供返回值或返回`null`让下一个插件继续比较

> 关于为什么加上`\0`，见[这里](https://vitejs.cn/guide/api-plugin.html#conventions)

### load(id)

当`resolveId`确定了应该运用该模块后将会执行这个钩子，它将会返回一串字符串形式的代码，这串代码会被当作一个代码文件被导入

### transform(src,id)

`load`钩子执行后再执行这个钩子，用来配置**非js文件**的加载方式，`css`文件等导入也会走这个钩子来转换，如果vite不支持这种文件时得自己编写转换函数

### transformIndexHtml(html)

这是`vite`特有的钩子，它接收`index.html`内容的字符串，并且将会把返回的字符串作为输出的`html`文件，或是返回一个对象数组`{ tag, attars, children }[]`，或是一个`{ html, tags }`对象

### configureServer(server)

通过这里配置开发服务器，开发服务器使用[connect](https://github.com/senchalabs/connect)，可以在这里给开发服务器配置中间件

## 代码编写

这里只需要写一个插件获得文件夹中的文件名组成的数组，然后通过虚拟文件的方式导出给前端

```typescript
import type { Plugin } from "vite";
import fs from "fs-extra";
import path from "path";

function headPics(path: fs.PathLike): Plugin {
    const virtualModuleId = "virtual:headPics";
    const resolvedVirtualModuleId = "\0" + virtualModuleId;

    let cache: string[]; // 因为文件夹内文件不会动态变化，只需要读取一次

    return {
        name: "headPics",

        resolveId(id) {
            if (id == virtualModuleId) {
                return resolvedVirtualModuleId;
            }
        },

        async load(id) {
            if (id == resolvedVirtualModuleId) {
                if (!cache) {
                    cache = await fs.readdir(path);
                }
                return "export default " + JSON.stringify(cache);
            }
        },
    };
}

export default headPics(path.resolve(__dirname, "../../../server/static/headPic"));
```

```typescript
import headPics from "virtual:headPics";

const headPic = ref<HTMLImageElement | null>(null);
onMounted(() => {
    if (props.blogMsg.headPic) {
        headPic.value!.src = props.blogMsg.headPic;
    } else {
        headPic.value!.src = "/assets/headPic/" + Random.array(headPics);
    }
    headPic.value!.addEventListener("error", function () {
        this.src = defaultHeadPic;
    });
});
```

这样以后要添加图片就可以直接往静态资源里扔了
