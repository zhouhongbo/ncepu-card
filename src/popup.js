let date = new Date();

// 设置起始年份
let startYearSelector = document.getElementById("startYear");
for (let i = date.getFullYear() - 5; i <= date.getFullYear(); i++) {
    startYearSelector.options.add(new Option(i, i));
}
startYearSelector.options[startYearSelector.options.length - 1].selected = 1;
// 设置结束年份
let endYearSelector = document.getElementById("endYear");
for (let i = date.getFullYear() - 5; i <= date.getFullYear(); i++) {
    endYearSelector.options.add(new Option(i, i));
}
endYearSelector.options[endYearSelector.options.length - 1].selected = 1;
// 设置起始月份
let startMonthSelector = document.getElementById("startMonth");
for (let i = 1; i <= 12; i++) {
    startMonthSelector.options.add(new Option(i, i));
}
startMonthSelector.options[date.getMonth()].selected = 1;
// 设置结束月份
let endMonthSelector = document.getElementById("endMonth");
for (let i = 1; i <= 12; i++) {
    endMonthSelector.options.add(new Option(i, i));
}
endMonthSelector.options[date.getMonth()].selected = 1;

// 按钮点击事件
document.querySelector("button").onclick = function () {
    document.querySelector("#warn").innerHTML = " ";
    let startYear = +startYearSelector[startYearSelector.selectedIndex].text;
    let endYear = +endYearSelector[endYearSelector.selectedIndex].text;
    let startMonth = +startMonthSelector[startMonthSelector.selectedIndex].text;
    let endMonth = +endMonthSelector[endMonthSelector.selectedIndex].text;

    // 检查时间是否合法
    let startDate = new Date(startYear, startMonth - 1);
    let endDate = new Date(endYear, endMonth - 1);
    debugger
    if (endDate - startDate < 0 || date - startDate < 0 || date - endDate < 0) {
        document.querySelector("#warn").innerHTML = "时间输入错误，请重新选择！";
    } else if (!isLogin()) {
        document.querySelector("#warn").innerHTML = "未登陆！";
    } else {
        let message = {
            startYear: startYear,
            startMonth: startMonth,
            endYear: endYear,
            endMonth: endMonth
        };
        chrome.runtime.sendMessage(message);
    }
}

chrome.runtime.onMessage.addListener((message) => {
    if (message === "未登陆！") {
        document.querySelector("#warn").innerHTML = message;
    } else {
        document.querySelector("#progress").innerHTML = document.querySelector("#progress").innerHTML + message + "<br>";
        console.log(message);
    }
})

function isLogin() {
    let url = "http://ecard.ncepu.edu.cn/cardUserManager.do?method=searchTrjnInfo&page=1&startTime=2020-01-01&endTime=2020-01-01&findType=1210&goPage=";
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.send();
    if (xhr.status === 200) {
        debugger
        if (xhr.response.match(/共(.+)条/)[1] === "-1") {
            return false;
        } else {
            return true;
        }
    }
}