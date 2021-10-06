## 下载

`npm i mongoose -s`

## 连接数据库

```javascript
const mongoose = require("mongoose");
mongoose.connect(dbURL);

const db = mongoose.connection;

db.on("error", () => {
    console.log("链接失败");
});
db.on("open", () => {
    console.log("链接成功");
});
```

## `schema Model document`概念

- `schema`：表的结构，索引
- `Model`：使用`Schema实例`获得的具体的表，在这上面对表进行增删改查
- `document`：`Model实例`，相当于表中的每一条数据，`Model`中查到到的数据也是这种类型

## 创建表结构`Schema`

Schema相当于MySql的表结构

通过定义`Schema`来约束数据的类型，支持以下类型数据

| 类型       | 作用         |
| ---------- | ------------ |
| String     | 定义字符串   |
| Number     | 定义数字     |
| Date       | 定义日期     |
| Buffer     | 定义二进制   |
| Boolean    | 定义布尔值   |
| Mixed      | 定义混合类型 |
| ObjectId   | 定义对象ID   |
| Array      | 定义数组     |
| Decimal128 | 定义小数     |
| Map        |              |

约束能用对象的方法描述*数据类型 是否必须 是否重复 默认值 等*，如下定义了一个用户表结构

> 注意：如果定义表结构时没有定义`_id`，mongoose会自己添加一个该字段，该字段不会重复，类型为`ObjectId`，通过`findById()`查询
>
> 在定义表结构时某些字段，如unique会自动创建索引，详情见下章

```javascript
const userSachem = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true, //! 必须
        },
        email: {
            type: String,
            required: true,
            unique: true, //! 不重复
        },
        passWord: {
            type: String,
            required: true,
        },
        avatar: {
            type: String,
            default: null, //! 默认值
        },
        bio: String, //! 默认没有可以不写
    },
    {
        timestamps: true, //! 添加`createdAt updatedAt`创建时间和更新时间两个字段
    }
);
```

如果在定义了结构后需要添加新字段，在实例上使用`add()`方法

## 创建表`model`

通过`mongoose.model(name,sechem)`来创建表结构构造器，通过传入数据来实例化构造器获得具体的表

> 注意：在这一步的时候数据库已经有了表，表名全是小写且表明为name加上s，如这里会创建表`users`

```javascript
const User = mongoose.model("User", userSechem);
```
---
通过上面的操作就获得了表的构造函数，接下来就可以向里面进行增删改查了

## 增

有三种方法在表内增加数据：

### 通过实例化数据：

- 创建表数据`实例化model`

通过传入具体的数据来实例化表，能获得一条具体的表数据，类型为`Mongoose Documents`，向数据库中查找到的也是这种类型数据

```javascript
const user = new User(userData);
```

- 保存`save`

获得具体的表后只需要调用`Model.prototype.save`就会把数据存入数据库中 **注意：该方法为异步方法**

```javascript
await user.save();
```

### 通过`Model.create`方法：

通过表构造器的静态方法`create`自动在表中插入新的数据

该方法可以接收多个插入数据，最后的回调函数参数根据数据量决定

> 该方法支持两种调用：
>
> - 错误优先的回调
> - async await

```javascript
const users = await User.create(
    { name: "1", email: "123@qq.com", passWord: "123" },
    { name: "2", email: "456@qq.com", passWord: "456" },
    { name: "3", email: "789@qq.com", passWord: "789" }
);
res.status(200).json(users); // users是数组

// 或者
User.create(
    { name: "str", email: "159@163.com", passWord: "159" },
    { name: "1", email: "123@qq.com", passWord: "123" },
    { name: "2", email: "456@qq.com", passWord: "456" },
    { name: "3", email: "789@qq.com", passWord: "789" },
    (err, doc1, doc2, doc3) => {
        if (err) {
            return err;
        }
        res.status(200).json({ doc1, doc2, doc3 });
    }
);
```

### 通过`Model.insertMany`方法

该方法与`create`的区别是它接收的第一个参数是数据组成的数组，多条数据只会插入第一条

```javascript
const user = await User.insertMany({ name: "1", email: "123@qq.com", passWord: "123" });
const users = await User.insertMany([
    { name: "2", email: "456@qq.com", passWord: "456" },
    { name: "3", email: "789@qq.com", passWord: "789" },
]);
```

---

## 查

---

### 查找数据

### 通过`Model.find`方法

>  不传入参数会查找该表的所有数据
>
>  该方法返回值始终是数组

*第一个参数*

指定数据的某个键进行查找，键也能是正则表达式

```javascript
const data = await User.find({ name: /\d/ });
```

限制查找范围，通过内置的字段限制某个字段的范围，`$where`函数参数来指定查询的限制范围

```javascript
const data = await User.find({
    name: { $gt: 1 },
    $where: () => this.passWord == parseInt(this.email),
}); // 查找name大于1且密码和邮箱一样的
```

还能通过`$and $or $not`等参数来决定查找的范围

```javascript
const data = await User.find({
    $or: [{ $and: [{ name: /[1,2]/ }, { email: /(@qq.com)$/ }] }, { name: /\w+/ }],
}); // 查找 name为1或2且为QQ邮箱 或 name为字符串 的数据
```

如果查找的是**对象**中的属性用字符串做键或者嵌套查找

> 注意 嵌套查找必须顺序一致

```javascript
// 查找这条数据 { name: "4", email: "357@163.com", passWord: "357", bio: { head: 123, foot: 789 } }
const datas = await User.find({ "bio.head": 123 }); // 字符串查找 可以使用限制
const datas = await User.find({ bio: { head: 123, foot: 456 } }); // 嵌套对象查找 对象要写全且顺序不能改变，里面只能用具体的数据，不能用正则表达式或其它的限制
```

如果查找的是**数组**中的某项

```javascript
// 有这两条数据 { name: "4", email: "357@163.com", passWord: "357", bio: [123, 456, "hahaha"] }
//             { name: "5", email: "258@163.com", passWord: "258", bio: [123, 789, "haha"] }
const datas = await User.find({ bio: 123 }); // 如果数组中有一个数据符合就会找到 也能像上面一样用特殊参数指定范围
const datas = await User.find({ bio: { $all: [123, 456] } }); // 查找含有这两个值 只能找到第二条
const datas = await User.find({ bio: { $in: [456, 789] } }); // 查找这两个值中的任意一条 两条都能找到
const datas = await User.find({ "bio.1": { $gt: 456 } }); // 使用下标指明指定数据的范围 这里找到第二条
```

如果查找的是**数组对象**中的某项

```json
// 有这两条数据
{
    name: "4",
    email: "357@163.com",
    passWord: "357",
    bio: [
        { head: 123, foot: 456 },
        { head: 456, foot: 789 },
    ],
},
{
    name: "5",
    email: "258@163.com",
    passWord: "258",
    bio: [
        { head: 123, foot: 789 },
        { head: 789, foot: 456 },
    ],
}
```

```javascript
const datas = await User.find({ bio: { head: 123, foot: 789 } }); // 数组中含有这个对象就会找到，对象属性要写全，不能只写部分，循序不能修改
const datas = await User.find({ "bio.foot": 789 }); // 数组中只要有一个对象符合就会找到，这里两个都会找到
const datas = await User.find({
    bio: { $elemMatch: { foot: 456, head: { $gt: 100 } } }, // 使用$elemMatch 数组中拥有指定的对象就会找到，可以交换顺序，可以使用限制，但是不能直接使用正则，正则使用$regex
});
```

*第二个参数*

限制返回数据含有的数据

```javascript
const data = await User.find({ name: /\d/ }, { name: 1, email: 1, _id: 0 }); // _id默认带着，这里忽略了
```

*第三个参数*

可以使用`keip limit sort`来对查询结果进行操作

```javascript
const data = await User.find({ name: /\d/ }, null, { skip: 1 }); // 这里只会查找到 2 3
```

### 第二三个参数也能用链式调用的方法定义

查询的结果支持链式调用，可以使用一些方法再对结果进行操作，相当于把第二个参数写道外面了

- `select`：设置查询结果的数据包含哪些键 接收列明字符串组成的数组，如果字符串前加上`-`则是不显示

  ```javascript
  const datas = await User.find().select(["name", "-_id"]); // 查询所有数据 返回对象只有name
  ```

- `limit`：限制查找结果的长度

- `skip`：设置查找结果的起式位置

- `sort`：对查找结果排序 接收列名字符串，按照从小到大排序，如果前面加上`-`则会从大到小排

  ```javascript
  const datas = await User.find().sort("-name"); // str 3 2 1
  const datas = await User.find().sort("name"); // 1 2 3 str
  ```

- `count`：返回查找结果的数量

- `lean`：将结果返回为普通的js对象而不是查询得到的`Mongoose Documents`类型对象



常用的内置字段：
| 字段 | 说明 |
| --- | --- |
| $or | 或关系 |
| $nor　| 或关系取反 |
| $gt　| 大于 |
| $gte　| 大于等于 |
| $lt　| 小于 |
| $lte　| 小于等于 |
| $ne　|  不等于 |
| $in　|  在多个值范围内 |
| $nin　|  不在多个值范围内 |
| $all　| 匹配数组中多个值 |
| $regex　| 正则，用于模糊查询 |
| $size　| 匹配数组大小 |
| $type | 匹配数据的类型 |
| $maxDistance　| 范围查询，距离（基于LBS） |
| $mod　| 取模运算 |
| $near　| 邻域查询，查询附近的位置（基于LBS） |
| $exists　| 字段是否存在 |
| $elemMatch　| 匹配内数组内的元素 |
| $within　| 范围查询（基于LBS） |
| $box　| 范围查询，矩形范围（基于LBS） |
| $center　| 范围醒询，圆形范围（基于LBS） |
| $centerSphere　| 范围查询，球形范围（基于LBS） |
| $slice　|  查询字段集合中的元素（比如从第几个之后，第N到第M个元素 |



### 通过`Model.findOne`方法

该方法返回符合条件的第一条数据

### 通过`Model.findById`方法

通过每个数据的`_id`属性查询

---

## 删

### 通过`Model.remove`方法

> 现在推荐使用`Model.deleteOne Model.deleteMany`来删除 用法一样
>
> 不传入参数会删除该表的所有数据
>
> 该方法返回的是删除数据的条数，不会返回被删除数据

指定要删除数据的某个键，键也可以使用正则表达式

```javascript
const remove = await User.remove({ name: /\d/ });
```

也可以先查找，然后用数据的`remove`方法

```javascript
// 可以链式调用
const data = await User.find({ name: "1" }).remove();
// 也能迭代删除
const data = await User.find({ name: "2" });
data.forEach((item) => {
    item.remove();
});
```

### 通过`Model.findOneAndRemove`方法

删除符合条件的第一条数据，并将这条数据返回

### 通过`Model.findByIdAndRemove`方法

通过`_id`删除

---

## 改

### `Model.update`已经不支持

### 通过`Model.updateOne Model.updateMany`方法

> 该方法返回修改的信息，不是返回修改后的数据

先指定查询的条件，再在第二个参数放入修改的数据，第三个参数为一些设置

```javascript
const datas = await User.updateOne({ name: "1" }, { $set: { name: "999" } }); // 将name为1的数据的name改为999
```

第三个参数如下，一般用不上

| 键名 | 默认值 | 说明 |
| ---- | ---- | ---- |
| safe | true |安全模式|
| upsert | false |是没有这张表时是不是新建数据|
| setDefaultsOnInsert |  |如果upsert选项为true，在新建时插入文档定义的默认值|
| strict |  |以strict模式进行更新|
| overwrite | false |禁用update-only模式，允许覆盖记录|

### 通过修改`find findOne findById`找到的数据后调用`save`方法

```javascript
const data = await User.find({ name: "999" }); // data只会是一个数组 如果是findOne findById则不是
data.forEach((item) => {
    item.name = "1";
    item.save();
});
```

### 通过`findOneAndUpdate findByIdAndUpdate`方法

是上面的语法糖，获得修改后的数据
