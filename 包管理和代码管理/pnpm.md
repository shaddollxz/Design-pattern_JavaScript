pnpm全程`perfection npm`，算是`npm yarn`的升级版，有更快的下载速度，对包的依赖关系进一步优化

# 下载

`npm i pnpm -g`

# 命令

## 常用命令

常用的命令和`npm`都差不多

| npm       | pnpm         |
| --------- | ------------ |
| npm i     | pnpm i       |
| npm i xxx | pnpm add(i) xxx |
| npm un xxx | pnpm un xxx |
| npm up xxx | pnpm up xxx |
| npm run xxx | pnpm (run) xxx |

## 特殊命令

这里只列举常用的，具体命令见[文档](https://pnpm.io/zh/cli/add)

`pnpm import`：可以从其它包管理器的`lock`文件生成`pnpm`的`lock`文件

`pnpm prune`：删除项目安装的包中已经不使用的依赖

`pnpm list`：查看当前已安装包的版本和依赖

# 别名

通过`pnpm add _@npm:lodash@next`可以将`npm`上最新的`lodash`作为`_`来下载，这样在引入时只需要`import _ from "_"`就能引入了

# 工作空间(Monorepo)

`Monorepo`的概念就是几个不同的项目共用一个仓库，并且项目之间能共享代码

## 创建项目

首先在项目根目录创建`pnpm-workspace.yaml`并添加以下配置

```
packages:
    # all packages in subdirs of packages/
    - "packages/**"
```

然后根据配置创建`packages`文件夹，在这里面初始化项目

这里初始化了两个项目`client server`，并在它们的`package.json`中分别命名为`@project/client @project/server`

然后`pnpm add @project/server -r -filter @project/client`，在`@project/client`中将`@project/server`作为依赖，能看到在`client`的`package.josn`中多了一行`"@project/server": "workspace:^1.0.0"`，这样就能用`@project/server`的名字来引入`server`中的代码

## 管理包

如果是所有项目都会依赖的包，则可以通过`pnpm add xx -w`来全局安装，比如`server client`都依赖`typescript`，只需要`pnpm add typescript -D -w`就能让所有项目都安装这个包

如果是单独一个项目需要的包，通过`pnpm add xxx --filter projectname`来安装，如`pnpm add vue-global-api --filter @project/client`就能在`client`中安装

## 配置脚本

可以通过配置根目录下的`package.json`的脚本来直接启动`packages`下的项目，如

```json
{
    "scripts": {
        "dev-client": "cd packages/client && pnpm dev",
        "build-client": "cd packages/client && pnpm build",
        "start-server": "cd packages/server && pnpm start",
        "build-server": "cd packages/server && pnpm build"
    }
}
```

## 其它配置文件

共用的配置文件一半就放在根目录

可以在根目录下配置基础的`tsconfig.json`然后再在每个项目中指定`extends baseUrl`来单独配置`paths include exclude`等

```json
// tsconfig.json
{
    "compilerOptions": {
        "target": "esnext",
        "useDefineForClassFields": true,
        "module": "esnext",
        "moduleResolution": "node",
        "strict": true,
        "jsx": "preserve",
        "resolveJsonModule": true,
        "esModuleInterop": true,
        "lib": [
            "esnext",
            "dom"
        ]
    },
    "exclude": [
        "node_modules"
    ]
}
// packages/client/tsconfig.json
{
    "extends": "../../tsconfig",
    "compilerOptions": {
        "baseUrl": ".",
        "sourceMap": true,
        "paths": {
            "@/*": [
                "src/"
            ],
            "#/*": [
                "src/typings/*",
            ]
        }
    }
}
```

