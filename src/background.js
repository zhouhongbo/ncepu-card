chrome.runtime.onMessage.addListener((message) => {
    console.log(message);
    // 用户输入的参数
    let startDate = new Date(message.startYear, message.startMonth-1);
    let endDate = new Date(message.endYear, message.endMonth-1);
    let filename = `${startDate.getFullYear()}年${startDate.getMonth() + 1}月至${endDate.getFullYear()}年${endDate.getMonth() + 1}月校园卡消费记录.xlsx`;

    // 逆向遍历月份，把所有数据保存到records
    let records = [["消费地点", "设备ID", "消费时间", "消费金额", "卡内余额"]];
    function loop(startDate, endDate, records, pageNum, currentPage) {
        if (endDate - startDate < 0) {
            recordsToExcel(records, filename);
            return;
        } else {
            if (currentPage == 1) {
                console.log(`正在读取${endDate.getFullYear()}年${endDate.getMonth() + 1}月的数据......`);
                chrome.runtime.sendMessage(`正在读取${endDate.getFullYear()}年${endDate.getMonth() + 1}月的数据：`);
            }

            if (currentPage > pageNum) {
                endDate.setMonth(endDate.getMonth() - 1);
                pageNum = getResponse(...getStartEndTime(endDate), "1").match(/第1\/(.+)页/)[1];
                currentPage = 0;
            }
            
            if (currentPage > 0) onePage(endDate, records, currentPage, pageNum);
            setTimeout(loop, 100, startDate, endDate, records, pageNum, currentPage+1);
        }
    };

    let pageNum = getResponse(...getStartEndTime(endDate), "1").match(/第1\/(.+)页/)[1];
    setTimeout(loop, 100, startDate, endDate, records, pageNum, 1);
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

function getStartEndTime(date) {
    // 获得当前月的最后一天
    let dateCopy = new Date(date.getFullYear(), date.getMonth());
    dateCopy.setMonth(dateCopy.getMonth() + 1);
    dateCopy.setDate(dateCopy.getDate() - 1);
    let lastDay = dateCopy.getDate();

    // 设置起始时间
    let startTime = "";
    let endTime = "";
    let year = dateCopy.getFullYear();
    let month = dateCopy.getMonth() + 1;
    if (month < 10) {
        startTime = year + "-0" + month + "-01";
        endTime = year + "-0" + month + "-" + lastDay;
    } else {
        startTime = year + "-" + month + "-01";
        endTime = year + "-" + month + "-" + lastDay;
    }

    return [startTime, endTime];
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

function onePage(endDate, records, currentPage, pageNum) {
    let startTime = "";
    let endTime = "";
    [startTime, endTime] = getStartEndTime(endDate);

    // 把数据保存进records
    let response = getResponse(startTime, endTime, currentPage);
    let recordNum = response.match(/共(.+)条/)[1];
    if (recordNum === "0") {
        console.log(`${endDate.getFullYear()}年${endDate.getMonth()+1}月无消费记录`);
        chrome.runtime.sendMessage(`${endDate.getFullYear()}年${endDate.getMonth()}月无消费记录`);
    } else {
        responseToRecord(response, records);
        console.log(currentPage + "/" + pageNum);
        chrome.runtime.sendMessage(currentPage + "/" + pageNum);
    }
}

function recordsToExcel(records, filename) {
    let data = records;  // 数据，一定注意需要是二维数组
    let ws_name = "Sheet1"; // Excel第一个sheet的名称
    let wb = XLSX.utils.book_new(), ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = [{ wch: 20 }, { wch: 8 }, { wch: 20 }, { wch: 8 }, { wch: 8 }] // 设置列宽
    XLSX.utils.book_append_sheet(wb, ws, ws_name);  // 将数据添加到工作薄
    XLSX.writeFile(wb, filename); // 导出Excel
    console.log("下载完成！");
    chrome.runtime.sendMessage("下载完成！");
}