`vitest`可以集成进`vite`项目，原生支持`esModule typescript`，并且对于测试代码也能有热更新

# 使用

## 运行

`vitest`开启监听模式，如果只运行一次测试使用`vitest run`

同时也可以使用VScode的`vitest`插件来运行测试代码

## api

`vitest`的测试函数需要从`vitest`中导入，测试函数的使用和`jest`完全相同，不过`jest.fn`等函数被放入了`Vi`中

`vitest`同时还在`describe test`中加入了`skip only`两个api，在运行测试时会跳过设为`skip`的测试，如果测试文件中有`only`则会只运行它，如果有还没实现的测试，可以使用`todo`占位

下面这段测试文件中不会有任何测试运行

```typescript
import { test, describe, beforeAll, expect } from "vitest";
import { add } from "./main";

describe.skip("test main", () => {
    test.only("test add 1", () => {
        expect(add(1, 2)).toBe(3);
    });

    test("test add 2", () => {
        expect(add(1, 2)).toBe(3);
    });
});

describe("test main 2", () => {
    test.skip("test add 3", () => {
        expect(add(1, 2)).toBe(3);
    });

    test("test add 4", () => {
        expect(add(1, 2)).toBe(3);
    });
});

```

`vitest`还提供了在代码内部测试的功能，如果代码涉及到闭包数据，可以直接在测试中使用

```typescript
// the implementation
export function add(...args: number[]) {
  return args.reduce((a, b) => a + b, 0)
}

// in-source test suites
if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest
  it('add', () => {
    expect(add()).toBe(0)
    expect(add(1)).toBe(1)
    expect(add(1, 2, 3)).toBe(6)
  })
}
```

# 配置

`vitest`可以作为插件引入`vite`项目中，如果使用的不是`vite`或在编写`node`代码，可以在项目根目录创建`vitest.config.ts`它的优先级高于插件配置

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        // ...
    },
});

// vite.fonfig.ts
/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
    test: {
        // ...
    },
})
```

## 全局api

为了和`jest`兼容，可以启用全局api设置，有两种方案

- 可以配置`test.global`来启用全局api，同时在`tsconfig.json`中添加`"types": ["vitest/globals"]`来获得类型支持
- 如果是`vite`项目，也可以使用[`unplugin-auto-import`](https://github.com/antfu/unplugin-vue-components)插件，通过该插件可以将`Vi`在导入时改为`jest`和以前的代码做兼容

## 测试覆盖率

要获取测试覆盖率需要单独安装`c8`，再使用`vitest run --coverage`查看

