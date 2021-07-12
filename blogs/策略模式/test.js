const uname = document.querySelector("#name");
const email = document.querySelector("#email");
const pwd = document.querySelector("#pwd");
const btn = document.querySelector("button");

methods = {
    notEmpty(element, errMsg) {
        return element.value || (alert(errMsg), "error");
    },
    canEmpty(element) {
        return element.value ? true : "break";
    },
    noLonger(element, length, errMsg) {
        return element.value.length < length || (alert(errMsg), "error");
    },
    noShorter(element, length, errMsg) {
        return element.value.length > length || (alert(errMsg), "error");
    },
    isEmail(element, regexp, errMsg) {
        return element.value.match(regexp) || (alert(errMsg), "error");
    },
};

class Check {
    constructor() {
        this.element = new Map();
    }
    put(element, methodName, ...arg) {
        if (this.element.has(element)) {
            this.element.get(element).push({ methodName, args: arg });
        } else {
            this.element.set(element, [{ methodName, args: arg }]);
        }
    }
    start() {
        //? 迭代收集到的数据
        for (const obj of this.element) {
            check: {
                for (const aaa of obj[1]) {
                    //? 如果有错误会返回false，然后跳出现在的循环
                    switch (methods[aaa.methodName](obj[0], ...aaa.args)) {
                        case "break":
                            break check;
                        case "error":
                            return false;
                    }
                }
            }
        }

        return true;
    }
}

const checkInput = new Check();
checkInput.put(uname, "notEmpty", "名字不能为空");
checkInput.put(uname, "noLonger", 4, "名字太长");
checkInput.put(email, "canEmpty");
checkInput.put(email, "isEmail", /@/g, "邮箱不正确");
checkInput.put(pwd, "notEmpty", "密码不能为空");
checkInput.put(pwd, "noShorter", 3, "密码太短");

btn.addEventListener("click", function () {
    console.log(checkInput.start());
});
