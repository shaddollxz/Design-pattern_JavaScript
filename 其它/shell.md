# 变量

## 定义和使用

`shell`设置变量不需要使用定义符，直接`a=b`即可设置（注意等号左右不能有空格，否则会把变量名当作命令）

变量定义后可以使用`unset`关键字来删除这个变量

```sh
data="data"
unset data
echo $data # 空
```

变量定义时前面也能加上`readonly`来声明一个只读变量，只读变量不能再被赋值也不能被删除

使用变量时前面需要加上`$`符，在字符串中也使用`$xx ${xxx}`做插入符号（如果使用`$`插入变量，后面必须加空格）

```sh
data="Data"
newData="$data"
echo $newData
```

## 字符串

字符串使用双引号或单引号甚至都不需要就可以定义


> 双引号中可以使用特殊符号，如插入变量，而单引号是存粹的字符串

```sh
a=b # 定义一个字符串
a="${str}"
b='b'
```

通过`${#xxx}`来获取字符串的长度

```sh
data="data"
echo ${#data} # 4
```

## 数组

`shell`只支持一维数组，同时它类似于`javascript`的数组，不需要每个数组元素都是一个类型，可以任意扩展数组长度

通过`()`来初始化一个数组，每个元素之间使用空格分隔

读取数组和数组元素时必须使用`${}`包裹起来，使用`[]`来读取指定位置的元素，如果要读取数组的所有元素，使用`@`或`*`作为下标，如果要读取数组长度，使用`${#arr[@]}`

> 如果只使用`$`会读到数组的第一个元素，相当于`${arr[0]}`
>
> 如果使用下标跳过元素赋值，在读取所有元素时会忽略没有的值

```sh
arr=("1" "2" 3)
echo ${arr[0]} # 1

arr[99]=123
echo ${arr[99]} # 123

echo ${arr[@]} # 1 2 3 123
echo ${#arr[@]} # 4
```

## 脚本参数

运行脚本时可以直接在文件后添加参数，如`sh index.sh arg`，而获得参数则通过`$1 $2`等变量获得指定位置的参数，`$0`指的是运行的脚本的文件名

同时可以通过`$@`来获取所有的参数，`$#`来获取参数的个数

```sh
# sh index.sh one two
echo $0 # index.sh
echo $1 # one
echo $2 # two
echo $@ # one two
echo $# # 2
```

## 环境变量

之前在`.sh`文件中定义的都是只能在文件中使用的局部变量，可以通过`export`关键字设置环境变量，让其它的`.sh`文件也能共享定义的变量，**一般环境变量都使用大写**

```sh
export GLOBAL="global env"
echo $GLOBAL
```

# 运算

## 算数运算

通过在`$[]`或`$(())`中对变量进行加减乘除和取余，符号和所有编程语言一样

> 它不能对字符串等进行拼接，如果一个变量是字符串，会被当作0使用

```sh
one=1
two=2

echo $(($one + $two)) # 3
```
如果使用`++ --`等运算符，使用`(())`包裹

```sh
data=1
((data++))
echo $data # 2
```

也可以使用`linux`的`let`命令进行算数运算

```sh
data=1
let data++ # 这里是字符串 也可以不写双引号
let "data=data+2"
echo $data # 4
```

## 逻辑运算

逻辑运算的符号和普通的一样，同时也可以使用字母来代替

| 操作 | 符号 | 字母 |
| ---- | ---- | ---- |
| 与   | &&   | -a   |
| 或   | \|\| | -o   |
| 非   | !    | !    |

## 关系运算

进行逻辑需要使用`[]`或`(())`来包裹，如果使用`(())`，则使用大于小于号，`[]`中`== !=`以外的符号只能使用字母

> 注意`[]`必须使用`[ $one == $two ]`这样的格式，变量左右都必须有空格

> 通过关系的运算后的结果是一个布尔值，可以通过逻辑运算或[流程控制符](#流程控制)来直接使用，或者在运算后使用`$?`来获得结果，其中`0`代表`true`

```sh
one=1
two=2

[ $one != $two ] && echo "y" # y

(($one != $two))
result=$?
(($result == 0)) && echo "y"

[ "a" == "a" -a "a" != "b" ] && echo "y" # 再进行逻辑运算用[]
```

常用的运算符号如下

| (( )) | [ ]      |
| ----- | -------- |
| ==    | -eq / == |
| !=    | -ne / != |
| >     | -gt      |
| >=    | -ge      |
| <     | -lt      |
| <=    | -le      |

| 符号 | 含义                     |
| ---- | ------------------------ |
| -e   | 判断文件是否存在         |
| -d   | 判断路径是否为文件夹     |
| -f   | 判断路径是否为文件       |
| -z   | 判断变量是否为空         |
| -r   | 判断文件是否有可读权限   |
| -w   | 判断文件是否有可写权限   |
| -x   | 判断文件是否有可执行权限 |

```sh
[ -z $aaa ] && echo "变量为空" || echo "变量不为空"
# 也可以使用test命令来判断结果
test -z $aaa
echo $? # 获取上一条命令的结果 0为true 1为false
```

## 字符串操作

截取字符串使用`${str:start:end}`的格式，不指定`end`则截取后面的所有字符

> 截取时会忽略空格
>
> `start`可以使用`0-2`的方式取倒数两个字符

```sh
str="The fat cat sat on the mat"
echo ${str:2} # e fat cat sat on the mat
echo ${str:3} # fat cat sat on the mat
```

通过[`expr`命令](https://www.runoob.com/linux/linux-comm-expr.html)查找字符在字符串中第一次出现的位置，从1开始计数

```sh
str="The fat cat sat on the mat"
echo $(expr index "$str" e) # 3
echo $(expr index "$str" eT) # 1 如果查找的有多个 只查找最先出现的
```

可以使用`${str#} ${str##} ${str%} ${str%%} `来进行更准确的字符串截取

- `#` 代表从左边删除字符，直到和后面的表达式匹配的第一个字符相同
- `##`代表从左边删除字符，直到和后面的表达式匹配的最后一个字符相同
- `%`代表从右边删除字符，直到和后面的表达式匹配的第一个字符相同
- `%%`代表从右边删除字符，直到和后面的表达式匹配的最后一个字符相同

```sh
String="/aaa/sdaf/dsf.png"

echo ${String##*/} # dsf.png
echo ${String#*/} # aaa/sdaf/dsf.png
echo ${String%/*} # /aaa/sdaf
echo ${String%%/*} # 空
```

匹配的字符含义和正则类似

| 符号 | 含义             |
| ---- | ---------------- |
| *    | 任意个任意字符   |
| ？   | 一个任意字符     |
| []   | 括号中指定的字符 |

```sh
echo ${String#*a/} # sdaf/dsf.png
echo ${String#?aaa?} # sdaf/dsf.png
echo ${String#[/a][/a]} # aa/sdaf/dsf.png

str="aa bb"
echo ${str#*[[:space:]]} # bb [[:space:]]代表空格
```

通过使用`${str/pattern/newstr}`对字符内容进行替换

```sh
echo ${String/#*sd/string} # stringaf/dsf.png
# 使用//将所有匹配全部替换
str="abc/ccc/abc"
echo ${str/abc/ddd} # ddd/ccc/abc
echo ${str//abc/ddd} # ddd/ccc/ddd
```

```sh
echo ${String^^} # 转大写
echo ${String,,} # 转小写
```

# 流程控制

## if

```sh
if [ $a == $b ]; then
    echo "a==b"
elif [ $a == $c ]; then
    echo "a==c"
else
    echo "a!=b && a!=c"
fi

# 也可以使用(())
if (($a == $b)); then
    echo "a==b"
elif (($a == $c)); then
    echo "a==c"
else
    echo "a!=b && a!=c"
fi
```

## for

经典的基本`for`循环

```sh
for ((i = 0; i < 10; i++)); do
    echo $i
done
```

也有类似`for...of`的循环，当时循环的内容只能自己用空格隔开

```sh
for str in "1" 2 "3"; do
    echo $str
done

# 循环数组
arr=(1 2 3)
for str in ${arr[@]}; do
    echo $str
done

# 这样字符串是一个整体 只有一次打印
for str in "This is a string"; do
    echo $str
done

# 使用变量储存起来可以多次打印
string="This is a string"
for str in $string; do
    echo $str
done

```

> 循环中也可以使用`break continue`来控制循环

## switch

不过不需要`switch`，只需要使用`case`

```sh
read input
case $input in
a) echo "A" ;;
b) echo "B" ;;
c) echo "c" ;;
*) echo "default" ;;
esac
```

## while

```sh
arr=(a b c)
index=0
while (($index < 3)); do
    echo ${arr[$index]}
    let index++
done
```

`while`的参数也能使用`read`读取用户输入

```sh
echo "从键盘键入信息"
while read input; do
    echo $input
    echo "从键盘键入信息"
done
```

## until 

`until`和`while`相反，只有条件为`false`时才会执行里面的内容

```sh
arr=(a b c)
index=0
until ((!($index < 3))); do
    echo ${arr[$index]}
    let index++
done
```

# 执行命令

使用`$()`或反引号来包裹需要执行的命令，并可以将命令的输出作为参数储存

```sh
pwd=$(pwd)
echo $pwd # 当前路径
```

执行多条命令时可以使用逻辑符号来按顺序执行

| 符号 | 含义                                    |
| ---- | --------------------------------------- |
| &&   | 与 前一条命令正确执行才会执行后一条     |
| \|\| | 或 前一条命令没有正确执行才会执行后一条 |
| ；   | 按照顺序执行两条命令                    |
| \|   | 将前一条命令的输出作为下一条命令的输入  |

# 函数

函数定义和`javascript`相同，使用`function`关键字定义，区别是`function`可以省略，而且函数没有变量提升

调用函数时类似调用脚本，不需要在函数名后加小括号，参数直接在后面使用空格分隔

函数的参数不能定义，只能在函数中使用`$1 $2`的方式获取，具体规则和脚本的参数处理一样

> 使用`$0`仍然只能获取**当前脚本**的文件名
>
> 函数的参数只能传递数字或字符串 要传递数组需要处理一下

```sh
function func() {
    echo "参数1 $1"
    echo "参数2 $2"
}

func a b
# 参数1 a
# 参数2 b

# 指定字符在数组的哪个位置
function indexof() {
    args=$@
    arr=${args#*[[:space:]]}

    index=0
    for item in ${arr[@]}; do
        if [ $item == $1 ]; then
            echo $index
            return 0
        fi
        ((index++))
    done

    echo -1
    return 1
}
```

函数可以使用`return`返回一个数字来表示函数执行状态，`0`表示执行成功，其它数字表示执行失败，如果不指定`return`，它会返回最后一条命令的执行状态，即`$?`

如果函数需要返回一个数字以外的内容，可以使用`echo`当作返回，在调用时使用`$()`来获得

> 如果`echo`出一个数组，获取的会变成字符串

```sh
function add() {
    echo $(($1 + $2))
    return 0
}

result=$(add 1 2)
echo $result
```

# 输入输出

## printf

除了通过`echo`在控制台中输出外，还可以使用`printf`命令进行格式化输出，它和`c`的`printf`类似，通过格式化字符串和参数进行输出，看下面这段代码

```sh
printf "%s %f %d %c" string 3.14 3 \'
```

格式化字符串中的符号代表输出的类型

| 符号 | 类型   |
| ---- | ------ |
| %s   | 字符串 |
| %f   | 浮点数 |
| %d   | 整数   |
| %c   | 字符   |

## read

命令指定到`read`时脚本会暂停执行并等待用户的输入并将输入赋值给后面的参数

```sh
echo "input"
read num
echo "input $num"
```

## 输出到文件

| 符号 | 含义                         |
| ---- | ---------------------------- |
| >>   | 将命令的输出拼接到指定文件   |
| >    | 将命令的输出重新覆盖指定文件 |

```sh
str="The fat cat sat on the mat"

echo $str >>"text.txt"
pwd >> "text.txt"
```

# 导入模块

每个`sh`文件都是一个单独的模块，可以通过`source path`来导入其它脚本的变量和函数

当导入模块时会直接覆盖当前文件的变量

```sh
# a.sh
r="a"

# b.sh
r="b"
echo $r # b
source ./a.sh
echo $r # a
```



