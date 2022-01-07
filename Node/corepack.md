`node`在`16.9`版后新增了包管理器的管理器（套起来了）`corepack`，通过这个管理器可以不需要安装就能使用`yarn pnpm`，并且`npm`也预计在将来版本不再内置进`node`中，转而使用`corepack`

当然也可以使用`npm`来安装 `npm i corepack -g`

## 手动打开

通过`corepack enable pnpm`就能在**当前工作区**开启`pnpm`，`corepack disable pnpm`就会关闭

## 自动打开

通过`corepack enable`会打开所有的管理器，这样需要工作区中的`package.json`通过`packageManager`指定当前项目使用的包管理器和版本，然后`corepack`会自动切换为指定版本的包管理器，并在工作区中使用该版本；如果使用其它包管理器，则会报错

## 管理器升级

如果使用比内置版本更高的管理器，使用`corepack prepare pnpm@6.25.0 --activate`就能升级到指定版本，并且全局默认版本也会改为该版本

使用`corepack prepare --all --activate`会升级所有管理器到最新的稳定版并切换默认版本

## 命令优先级

如果下载了`npm`等包管理器和`corepack`，包管理器的命令优先级会大于`corepack`配置的包管理器命令



[github 详细文档](https://github.com/nodejs/corepack)

[node v17 文档](https://nodejs.org/api/corepack.html#corepack)