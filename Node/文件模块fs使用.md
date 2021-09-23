## fs文件模块

fs原生的文件模块不支持`promise`API，可以通过在`util`中导入`promisify()`函数，将`fs.readFile`等方法放入后得到支持`promise`API的新方法。

```javascript
const fs = require("fs");
const { promisify } = require("util");
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

exports.getDB = async () => {
    return JSON.parse(await readFile("./src/server/db.json", "utf8"));
};

exports.setDB = async function (data) {
    console.log(data);
    await writeFile("./src/server/db.json", JSON.stringify(data));
    return await this.getDB();
};
```

> 虽然fs有同步读取的方法，但是应该使用异步方法读写文件