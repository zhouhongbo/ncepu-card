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
    document.querySelector("#warn").innerHTML = "";
    document.querySelector("#page").innerText = "";
    document.querySelector("#month").innerText = "检查日期和登录状态......";
    setTimeout(() => {
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
            document.querySelector("#month").innerText = "正在下载......";
            let message = {
                startYear: startYear,
                startMonth: startMonth,
                endYear: endYear,
                endMonth: endMonth
            };
            chrome.runtime.sendMessage(message);
        }
    }, 10);
}

// 关于按键
document.querySelector("#about").onclick = function () {
    document.querySelector("#right").innerHTML = `<p class='center'>Buy me a coffee if it helps.</p>
    <img src='../img/wechat.png' width='200px' height='200px'>
    <p class='center'>微信赞赏码</p>`;
    document.querySelector("#left").innerHTML = `<p>目前只在我的校园卡上测试通过，可能会存在意料之外的bug</p>
    <br>
    <p>改进意见和bug反馈欢迎发送至邮件</p>
    <br>
    <p>zhouhongbode@gmail.com</p>
    `;
}

chrome.runtime.onMessage.addListener((message) => {
    if (message === "下载完成！") {
        document.querySelector("#page").innerText = message;
        document.querySelector("#month").innerText = "";
    } else if (message.length < 8) {
        document.querySelector("#page").innerText = message;
    } else {
        document.querySelector("#month").innerText = message;
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