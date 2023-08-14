# 介绍

`turborepo`是用来搭建`monorepo`式项目的工具，并且引入了脚本并行执行和缓存机制，能优化脚本执行速度，即使不是`monorepo`项目也可以试着用它来提升开发速度

[官网链接](https://turbo.build/)

# 使用

## 下载

`turborepo`可以通过`npx`直接创建一个`monorepo`式项目

```sh
npx create-turbo@latest
```

在已有项目中配置`turborepo`也只需要在项目根目录中安装

```sh
pnpm add turbo -D -w
```

## 配置

`turborepo`需要在项目根目录中新建一个`turbo.json`配置文件

```json
{
  "$schema": "https://turbo.build/schema.json"
}
```

同时需要让`git`忽略生成的缓存文件

```
# .gitignore
.turbo
```

下面是一些常用配置，具体配置见[文档](https://turbo.build/repo/docs/reference/configuration)

### pipeline

配置中主要是通过`pipeline`选项配置脚本，其中每个键都是`packages`下项目的`package.json`中脚本名称

如下配置了多个脚本命令

```json
{
	"pipeline": {
        "build": {
            "outputs": ["dist/**", "build/**"], // 如果执行该命令时命中缓存，它的控制台输出会使用指定路径下的log文件
            "dependsOn": ["^build"], // 表示该包里的build命令依赖于引入包的build结果，当引入包的build结束后才会执行该包的build命令
            "env": ""
        },
        "preview": {
            "dependsOn": ["build"] // 如果deploy只需要依赖于自己的build结果，就不需要前缀
        },
        "dev": {
            "cache": false // dev这种监听文件变化的命令就不需要缓存
        },
        "test": {
            "inputs": ["src/**/*.ts"] // 监听文件的变化重新运行这个命令
        }
    }
}
```

### globalDependencies

全局依赖，这里指定的文件哈希值会影响所有缓存的命中

```json
{
    "globalDependencies": [".env"]
}
```

## 命令

下面列出一些常用命令，具体命令见[文档](https://turbo.build/repo/docs/reference/command-line-reference)

### filter

同`pnpm`中的`--filter`命令，`turbo`也有个`--filter`命令指定运行脚本的包名称，不同于`turbo`可以使用包名称，包路径来指定

```sh
turbo dev --filter=@project/packagename
```

### force

执行命令时要忽略以前的缓存，只需要加上`--force`就可以

```sh
turbo build --force
```

### no-cache

执行某条命令时不缓存，使用`--no-cache`命令

```sh
turbo build --no-cache
```

