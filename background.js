chrome.runtime.onMessage.addListener((message) => {
    console.log(message);
    // 用户输入的参数
    let startYear = +message.startYear;
    let endYear = +message.endYear;
    let startMonth = +message.startMonth;
    let endMonth = +message.endMonth;

    let records = [["消费地点", "设备ID", "消费时间", "消费金额", "卡内余额"]];
    // 把所有时间的数据保存到records
    // 逆向遍历月份
    for (let year = endYear; year >= startYear; year--) {
        let end = 12;
        let start = 1;
        if (year === startYear) start = startMonth;
        if (year === endYear) end = endMonth;
        for (let month = end; month >= start; month--) {
            console.log(`读取${year}年${month}月的数据...`);
            oneMonth(year, month, records);
        }
    }

    // 导出数据到Excel
    var filename = startYear + "年" + startMonth + "月至" + endYear + "年" + endMonth + "月校园卡消费记录.xlsx"; // 文件名称
    var data = records;  // 数据，一定注意需要是二维数组
    var ws_name = "Sheet1"; // Excel第一个sheet的名称
    var wb = XLSX.utils.book_new(), ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = [{ wch: 20 }, { wch: 8 }, { wch: 20 }, { wch: 8 }, { wch: 8 }] // 设置列宽
    XLSX.utils.book_append_sheet(wb, ws, ws_name);  // 将数据添加到工作薄
    XLSX.writeFile(wb, filename); // 导出Excel
    console.log("导出成功！")

});

function getResponse(startTime, endTime, pageId) {
    // 时间格式 2020-12-01
    let url = `http://ecard.ncepu.edu.cn/cardUserManager.do?method=searchTrjnInfo&page=${pageId}&startTime=${startTime}&endTime=${endTime}&findType=1210&goPage=`;
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.send();
    if (xhr.status === 200) {
        return xhr.response;
    }
}

function responseToRecord(response, records) {
    let recordElements = response.match(/"center">(.+)</g).map((val) => {
        val = val.replace("<", "");
        val = val.replace('"center">', "");
        return val;
    });

    for (let i = 0; i < recordElements.length / 5; i++) {
        let record = [recordElements[i * 5], recordElements[i * 5 + 1], recordElements[i * 5 + 2], recordElements[i * 5 + 3], recordElements[i * 5 + 4]];
        records.push(record);
    }
}

function oneMonth(year, month, records) {
    // 获得当前月的最后一天
    let date = new Date(year, month - 1);
    date.setMonth(date.getMonth() + 1);
    date.setDate(date.getDate() - 1);
    let lastDay = date.getDate();

    // 设置起始时间
    let startTime = "";
    let endTime = "";
    if (month < 10) {
        startTime = year + "-0" + month + "-01";
        endTime = year + "-0" + month + "-" + lastDay;
    } else {
        startTime = year + "-" + month + "-01";
        endTime = year + "-" + month + "-" + lastDay;
    }

    // 把数据保存进records
    let response = getResponse(startTime, endTime, "1");
    let pageNum = response.match(/第1\/(.+)页/)[1];
    let recordNum = response.match(/共(.+)条/)[1];
    if (recordNum === "0") {
        console.log(`${year}年${month}月无消费记录`);
    } else {
        for (let i = 1; i <= parseInt(pageNum); i++) {
            let response = getResponse(startTime, endTime, i);
            responseToRecord(response, records);
            console.log(i + "/" + pageNum);
        }
    }
}