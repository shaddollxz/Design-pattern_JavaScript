在ts里，如果一个函数中用了`this`来修改上下文的属性，这时得声明`this`的类型，否则会报错`"this" 隐式具有类型 "any"，因为它没有类型注释。ts(2683)`

一般这种情况是因为函数依赖于外部的上下文或者要通过`call apply bind`来使用，这样就得在函数参数中声明`this`的类型

`this`参数作为函数的第一个参数来声明，实际使用时无视这个参数，用一个防抖函数来看看：

```typescript
export default function debounce(callback: (...arg: unknown[]) => unknown, delay = 300, style = true) {
    let timeoutId: number | undefined = undefined;
    if (style) {
        return function (this: any, ...args: unknown[]) {
            if (!timeoutId) {
                callback.apply(this, args);
            } else {
                clearTimeout(timeoutId);
            }
            timeoutId = window.setTimeout(() => {
                timeoutId = undefined;
            }, delay);
        };
    } else {
        return function (this: any, ...args: unknown[]) {
            window.clearTimeout(timeoutId);
            timeoutId = window.setTimeout(() => {
                callback.apply(this, args);
            }, delay);
        };
    }
}
```

为了让防抖函数中传入的函数能使用外部`this`，这里声明了`this`的类型为`any`

再看另一个例子，这里为了让代码结构清晰，从类中分离了一段函数放在外部，这样调用函数时必须使用`call apply`来调用，函数也指明了`this`指向指定的类

```typescript
class SDIDB {
    constructor() {}
    private async openDB(): Promise<void>;
    private async openDB(type: OpenDBMap, tableName: string, settings?: TableSetting): Promise<void>;
    private async openDB(type?: OpenDBMap, tableName?: string, settings: TableSetting = {}): Promise<void> {
        let DBRequest =
            type && this._version
                ? window.indexedDB.open(this.name, ++this._version)
                : window.indexedDB.open(this.name);

        //? onerror
        DBRequest.onerror = () => {
            throw "数据库打开失败";
        };

        //? 如果type有值则是建表或删表 没值就忽略这个过程
        if (type && tableName) {
            //? onupgradeneeded 在这里面进行添加或删除表
            await onupgradeneeded.call(this, DBRequest, type, tableName, settings);
        }

        //? onsuccess 打开数据库时初始化SDIDB的版本 表列表 缓存这个数据库
        await onsuccess.call(this, DBRequest);
    }
}

async function onsuccess(this: SDIDB, DBRequest: IDBOpenDBRequest): Promise<boolean> {
    return new Promise((resolve, reject) => {
        DBRequest.onsuccess = (e) => {
            const DB: IDBDatabase = (e.target as any).result;
            //? 在升级数据库时触发 关闭数据库 然后会用新版本重新打开 重新触发onsuccess
            DB.onversionchange = () => DB.close();
            __DBcatch__ = DB; //? 如果更新 DBcatch会关闭 要给它重新赋值
            this._version = DB.version;
            this._tableList = Array.from(DB.objectStoreNames);
            resolve(true);
        };
    });
}
```

