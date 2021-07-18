const back = document.querySelector(".back");
const fresh = document.querySelector(".fresh");
const span = document.querySelector("span");
const backNum = document.querySelector("input");

const cache = [];
const firstTime = span.innerText;
const commands = {
    add(value) {
        span.innerText += value;
        cache.push([this.add, value]);
    },
    fresh() {
        span.innerText = firstTime;
        cache.length = 0;
    },
    backto(backNumber) {
        span.innerText = firstTime;
        for (let i = 0; i < backNumber; i++) {
            cache[i][0](cache[i][1]);
        }
    },
};

document.body.addEventListener("keypress", (e) => {
    if (!Number.isNaN(+e.key)) {
        commands.add(e.key);
    }
});
fresh.addEventListener("click", function (event) {
    commands.fresh();
});
back.addEventListener("click", function (event) {
    commands.backto(+backNum.value);
});
