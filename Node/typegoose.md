在使用`typescript`写`mongon`项目时只是使用`mongoose`很难准确描述数据类型，通过`typegoose`可以更加优雅

# 安装

`pnpm add @typegoose/typegoose`

需要同时满足`typescript(4.4+) Node(12.22+) mongoose(6.1.6+)`

`tsconfig.json`开启`experimentalDecorators(必须) emitDecoratorMetadata(推荐) target(es6+)`

 # 使用

`typegoose`主要使用装饰器通过类来定义数据库结构


## 数据类型

这是官网下的一段示例代码，简单来看看使用：

```typescript
// 普通写法
const kittenSchema = new mongoose.Schema({
  name: String
});

const KittenModel = mongoose.model('Kitten', kittenSchema);

// typegoose
class KittenClass {
  @prop()
  public name?: string;
}

const KittenModel = getModelForClass(KittenClass);
```

普通数据就像上面一样，通过`@prop`属性装饰器来描述字段类型

如果需要设置默认值，在装饰器中传入相应的设置`@prop({default:"xxx"})`

需要注意的是如果数据为必选，必须使用`@prop({require:true})`，`?:`只是决定从数据库中返回的数据是否可选

### 时间戳

时间戳仍然是有`createdAt updatedAt`两个字段，只需要让构造数据库的类继承`defaultClasses.TimeStamps`类即可

```typescript
import typegoose from "@typegoose/typegoose";
const { prop, defaultClasses, getModelForClass } = typegoose;
const { TimeStamps } = defaultClasses;
class Cat extends TimeStamps {}
```

### ref

```typescript
class Nested {
  @prop()
  public someNestedProperty: string;
}

class Main {
  @prop({ ref: () => Nested }) // for one
  public nested: Ref<Nested>;

  @prop({ ref: () => Nested }) // for an array of references
  public nestedArray: Ref<Nested>[];
}
```

如果另一个表的`_id`是自定义的属性，需要另外设置`Ref`的第二个泛型为对应类型，默认情况下`Ref`的第二个泛型是`mongoose.Types.ObjectId`

## 静态方法

在类上直接定义静态函数，指定`this`类型

```typescript
class KittenClass {
    public static async findByName(this: ReturnModelType<typeof KittenClass>, name: string) {
        return this.find({ name });
    }
}
```

## 实例方法

和静态方法一样，也需要指定`this`的类型

```typescript
class KittenClass {
    public async filter(this: DocumentType<typeofKittenClass>) {
        // ...
        return data;
    }
}
```

## 前后钩子

前后钩子`@pre @post`是类装饰器，和`mongoose`定义一样，不过需要注意不能使用箭头函数

```typescript
@pre<KittenClass>('save', function() {
  this.isKitten = this.age < 1 // 在保存数据前修改数据
})
@post<KittenClass>('save', function(kitten) {
  console.log(kitten.isKitten ? 'We have a kitten here.' : 'We have a big kitty here.')
})
class KittenClass {
  @prop()
  public age?: number
  
  @prop({ default: false })
  public isKitten?: boolean
}

const KittenModel = getModelForClass(KittenClass);

const doc = new KittenModel({ name: 'SomeCat', species: 'SomeSpecies', age: 0 });
await doc.save(); // this should output "We have a kitten here."
const doc = new KittenModel({ name: 'SomeCat', species: 'SomeSpecies', age: 2 });
await doc.save(); // this should output "We have a big kitty here."
```

## 数据库结构转为`interface`

通过上面可以发现数据库结构已经用`class`来描述了，只需要把实例方法和表连接进行对应处理就能直接从`class`获得数据库返回数据的类型

```typescript
// 每个数据库都implements它来让下面的方法知道它是数据库
interface dbBase {
    DB: true,
}

type ChangeProperties<T extends object, K extends keyof T, N> = {
    [Key in keyof T]: Key extends K ? N : T[Key];
};
type OmitByType<T extends object, U> = {
    [K in keyof T as T[K] extends U ? never : K]: T[K];
};
type NotSend = "passWord";

export type SchemaToInfo<T> = ChangeProperties<
    T extends dbBase
        ? {
              [K in keyof T as K extends NotSend ? never : K]: T[K] extends Ref<infer R>[]
                  ? SchemaToInfo<R>[]
                  : T[K] extends Ref<infer RR>
                  ? SchemaToInfo<RR>
                  : T[K] extends Function
                  ? never
                  : T[K];
          } & {
              _id: string;
          }
        : T,
    "createdAt" | "updatedAt",
    Date
>;
```

