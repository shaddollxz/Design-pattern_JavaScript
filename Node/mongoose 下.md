# 数据验证

## 前后钩子`pre post`

> mongodb不支持自增，可以用前置钩子实现自增，见[这篇博客](https://www.cnblogs.com/doublerain/p/8897830.html)

类似于vue-router的前后路由守卫，定义在执行某个操作时额外执行的操作，用于数据验证或者修改，支持以下操作：

`init validate savee removee count find findOne findOneAndRemove findOneAndUpdate insertMany update`

钩子在`Schema`上定义：

```javascript
const userSachem = new mongoose.Sachem({...});
userSachem.pre("find", (next) => {
    console.log("开始查找");
    next();
});
userSachem.post("find", (docs) => {
    console.log("找到数据：" + docs);
});
```

## 修饰符

在定义`Schema`时每个数据上定义，前面已经用到过

`类型-type 必须-reuired 不重复-unique 默认值-default`

还有其它的类型不只是用来做数据验证：

> 注意：设置了unique后，会自动创建对应字段的索引，可以再添加name来设置索引名

| 类型名              | 含义                                                         |
| ------------------- | ------------------------------------------------------------ |
| min max             | 定义number的最大最小值                                       |
| minlength maxlength | 定义string的最大最小长度                                     |
| match               | 定义string必须符合的正则                                     |
| enum                | 定义数据必须在该枚举中                                       |
| trim                | 传入的数据会被去掉首尾空格                                   |
| lowercase uppercase | 传入的数据会被转换为大/小写                                  |
| validate            | 自定义匹配，接收一个函数，根据返回布尔类型来判断是否符合匹配，函数接收的参数是要验证的参数 |
| get set             | 在读写数据时进行的额外操作，和对象的`getter setter`不同的是它们都必须有返回值 |
| alias               | 别名，在实例化model时可以用别名代替原本的名字，在document对象上修改别名，原名也会被修改，对象的别名要把路径写全 |
| select              | 在查找结果中是否默认带着它                                   |

对于嵌套对象的验证，通过用直接嵌套定义或为对象单独创建一个`Schema`实例，对象的类型指定为该实例：

```javascript
const boiSachem = new mongoose.Schema({
    head: {
        type: String,
    },
    foot: {
        type: String,
    },
});
const userSachem = new mongoose.Schema({
    boi: [boiSachem], // 如果是数组里的对象，加上[]
})
```

# 索引

> 关于mongon的索引，可以见[这里](https://www.cnblogs.com/wyy1234/p/11032163.html)
>
> 关于mongon如何设置索引，可以见[这里](https://www.cnblogs.com/huangxincheng/archive/2012/02/29/2372699.html)

上面说过，通过指定`unique`会自动生成一个索引，还能通过其它方法生成索引：

| 键      | 索引类型                              |
| ------- | ------------------------------------- |
| index   | 普通索引                              |
| unique  | 唯一索引                              |
| expires | 过期索引 TTL索引 在指定时间之后会删除 |
| sparse  | 稀疏索引                              |

通过`Schame实例`的`index`方法也能添加索引，部分索引也只能通过该方法添加

```javascript
userSachem.index({ name: 1, email: -1 }); // 建立了组合索引 1和-1 代表顺序和倒序
```

# 自定义`Model实例方法`

通过在`Schema`实例上的`methods`上添加新方法，这样该表的所有`document`数据实例都将获得定义的方法：

> 这里用的是promise写法，cb写法见[文档](https://mongoosejs.com/docs/guide.html#methods)

```javascript
// 定义实例方法
// 这里不能使用箭头函数
userSachem.methods.getBiggerName = async function () {
    return new Promise((resolve, reject) => {
        mongoose
            .model("User")
            .find({ name: { $gte: this.name } })
            .select(["name", "-_id"])
            .then((fulfilled) => {
                resolve(fulfilled);
            });
    });
};
// 使用
const User = mongoose.model("User", userSachem);
const numberNameUser = new User({ name: "3" });
const data = await numberNameUser.getBiggerName();
```

# 自定义`Model静态方法`

通过给`Sachem实例`上的`statics`属性添加方法，或者调用`Sachem实例`的`static`方法：

```javascript
// 自定义实例方法 这里也是不能使用箭头函数
userSachem.statics.findByEmail = async function (search) {
    return this.find({ email: new RegExp(search, "i") }, { email: 1, _id: 0 });
};

// 使用
const User = mongoose.model("User", userSachem);
const data = await User.findByEmail("qq");
```

# 连表查询

在`schema`中定义字段时通过设置数据类型为`mongoose.Sachem.types.ObjectId`并设置`ref`属性为对应表的名字，在查询操作的时候加上`populaton("xx")`就会将指定表中的对应id内容替换上来。
