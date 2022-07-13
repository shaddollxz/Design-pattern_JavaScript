# husky

[`husky`](https://typicode.github.io)通过`git`提供的钩子可以让我们在`git`提交前对内容进行检查，如运行单元测试，代码格式化规范

具体钩子见[git文档](https://git-scm.com/docs/githooks#_hooks)

# 配置prettier

`pnpm add prettier lint-staged husky -D`安装依赖

`prettier`用来格式化文档，而`lint-staged`通过与`husky`配合只对要提交的代码进行格式化

1. 在`package.json`中添加脚本`"prepare": "husky install"`并运行，这条脚本会在每次`install`后自动运行，在项目根目录生成`.husky`文件夹，然后执行`npx husky add .husky/<hook> "<cmd>" `
2. 配置`package.json`，添加一条脚本`"lint:lint-staged": "lint-staged"`
3. 添加`lint-staged.config.js`，如果`package.json`设置为`type: "module"`则用`esmodule`规范默认导出，否则用`commonjs`规范，如果需要添加`eslint`也按照下面的样子添加，命令有多条用数组添加

```javascript
export default {
    "*.{js,jsx,ts,tsx,css,less,scss,html,json}": "prettier --write",
};
```

3. 运行`npx husky add .husky/pre-commit "pnpm lint:lint-staged"`添加提交前格式化

# 提交规范

也可以使用`husky`给提交代码时的注释`commit-msg`添加规范，一般都是按照下面的前缀添加

| 前缀     | 说明                   |
| -------- | ---------------------- |
| feat     | 添加新功能             |
| fix      | 修改bug                |
| style    | 代码格式修改           |
| pref     | 代码优化               |
| docs     | 修改文档               |
| test     | 修改测试               |
| refactor | 代码重构               |
| chore    | 构建过程或辅助工具变动 |
| revert   | 代码回滚               |

可以通过`shell`脚本自己定义，在`commit-msg`中通过`$1`获得这次提交的信息文件路径

```sh
# commitLint.sh
allows=('feat:' 'fix:' 'test:' 'chore:' 'pref:' 'style:' 'docs:' 'refactor:' 'revert:' 'Merge')
desc=("添加新功能" "修复bug" "修改测试用例" "配置改变" "代码优化" "代码格式修改" "修改文档" "代码重构" "代码回滚" "合并代码")

msg=$(echo $(cat $__rootDir/$1) | tr -d '\r')
head=${msg%%[[:space:]]*}

if [ $(IndexOf $head ${allows[@]}) != -1 ]; then
    tput setaf 2
    echo "commit success"
else
    tput setaf 1
    echo "提交信息出错，请按照下面的格式重新编写提交信息："
    tput setaf 7
    for ((i = 0; i < ${#allows[@]}; i++)); do
        printf "%-10s %s\n" ${allows[i]} ${desc[i]}
    done
    exit 1
fi
```

```sh
# commit-msg
sh $(pwd)/commitLint.sh $1
```

