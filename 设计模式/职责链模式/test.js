/* btn.addEventListener("click", function (event) {
    if (input.value.length == 0) {
        console.log("这里要输入东西");
    } else {
        if (Number.isNaN(+input.value)) {
            console.log("这里是数字");
            if (input.value.length < 3) {
                console.log("这里要三个以上数字");
            }
        }
    }
}); */

function checkEmpty() {
    if (input.value.length == 0) {
        console.log("这里要输入东西");
    }
}
function checkNumber() {
    if (Number.isNaN(+input.value)) {
        console.log("这里是数字");
    }
}
function checkLength() {
    if (input.value.length < 3) {
        console.log("这里要三个以上数字");
    }
}
class Chain {
    constructor(fn) {
        this.checkRule = fn ?? (() => "next");
        this.nextRule = null;
    }
    addRule(nextRule) {
        this.nextRule = new Chain(() => (nextRule(), "next"));
        return this.nextRule;
    }
    end() {
        this.nextRule = { check: () => "end" };
    }
    check() {
        this.checkRule() == "next" ? this.nextRule.check() : null;
    }
}

function checkSum() {
    const result = Array.prototype.reduce.call(
        input.value,
        (result, now) => {
            return (result += +now);
        },
        0
    );
    if (result !== 10) {
        console.log("和必须为10");
    }
}

const checks = new Chain();
checks.addRule(checkEmpty).addRule(checkNumber).addRule(checkSum).addRule(checkLength).end();

btn.addEventListener("click", () => {
    checks.check();
});
