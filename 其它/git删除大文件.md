## 对Word进行版本管理

`git`是为代码这种纯文本作版本迭代使用的工具，不过它也能对二进制文件的修改进行记录，比如`word`，不过一般只能记录到文件改变，对文件具体的更改是无法记录到的

对于这种情况，可以用一些外部插件来格式化`word`文件，再进行对比，这里介绍下具体方法：

1. 安装 [pandoc](https://objects.githubusercontent.com/github-production-release-asset-2e65be/571770/d3ea0ca2-a296-4d37-a71f-409acd7b9c69?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAIWNJYAX4CSVEH53A%2F20220330%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220330T075541Z&X-Amz-Expires=300&X-Amz-Signature=a3bda74d7ac76e2b32a84547e1d04517f39696407bf61bd4316f6d18878085d6&X-Amz-SignedHeaders=host&actor_id=56341682&key_id=0&repo_id=571770&response-content-disposition=attachment%3B%20filename%3Dpandoc-2.17.1.1-windows-x86_64.msi&response-content-type=application%2Foctet-stream)，它可以将`word`的二进制文件转为`markdown`的形式进行阅读（安装后需要将它设置进环境变量中，一般会自动设置，只需要重启电脑，也可以手动将`C://User/AppData/Local/Pandoc`设置）

2. 找到`C://User/.gitconfig`，在里面加入

 ```
   [diff "pandoc"]
       textconv=pandoc --to=markdown
       prompt = false
   [alias]
       wdiff = diff --word-diff=color --unified=1
 ```

这样就可以查看两个`word`文件的版本修改区别了

## 删除无用的文件记录

`git`对二进制文件的修改记录和纯文本不同，是将原本的文件和新文件都无脑保存记录的，所以即使只是一两个字的修改也会将整个`word`都保存一份，这样`.git`文件夹会变得越来越大

使用[`BFG`](https://rtyley.github.io/bfg-repo-cleaner/)这个`java`包可以在`git`的记录中把指定的文件彻底删除

1. 首先将项目用`git clone --mirror xxx`拉下来，可以看到一个`项目名.git`文件夹，后续将对这个文件夹进行操作，如果直接修改项目的`.git`文件夹，会无法将修改后的提交
2. 将`bfg.jar`放到`项目名.git`文件夹的同级目录下
3. 可以执行命名将指定的文件从记录中删除了(如果要删除的文件现在还存在，并且向删掉，在命令后加上`--no-blob-protection`)，这里列举常用的命令，具体命令可以直接运行`bfg.jar`文件查看

| 命令                                           | 说明                     |
| ---------------------------------------------- | ------------------------ |
| `--D [文件名] [.git文件夹路径]`                | 指定文件名删除           |
| `--b [大小] [.git文件夹路径]`                  | 指定大于设置值的所有文件 |
| `--delete-folders [文件夹名] [.git文件夹路径]` | 指定文件夹删除           |

4. 然后进入`项目名.git`文件夹中运行`git reflog expire --expire=now --all && git gc --prune=now --aggressive`进行垃圾删除
5. 最后`git push`将改后的推到线上仓库

需要注意的是如果项目中有重名文件，它会将两个文件记录都删除