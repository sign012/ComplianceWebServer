export const echartsConfig = (date, arr1, arr2) => {
    // arr1 = arr1 || [5, 20, 36, 10, 10, 20];
    // arr2 = arr2 || [15, 30, 46, 20, 20, 30];
    // date = date || ['2024-06-14', '2024-06-15', '2024-06-16', '2024-06-17', '2024-06-18', '2024-06-19'];
    let title = {
        text: '',
        left: 'center',
        top: 'center',
        textStyle: {
            color: '#909399',
            fontSize: 14,
            fontWeight: 'normal'
        }
    }
    if (date.length === 0) {
        title.text = '暂无数据';
    }
    return {
        title: title,
        tooltip: {
            trigger: 'axis',
            textStyle: {
                align: "left",
                color: '#fff'
            },
            backgroundColor: "rgba(38, 42, 57, 0.9)",
            borderWidth: "0", //边框宽度设置1
            axisPointer: {
                type: 'cross', // 设置轴指示器类型为线
                lineStyle: {
                    color: '#999999', // 设置纵向提示线的颜色为红色
                    width: 1, // 设置线的宽度
                    type: 'dashed' // 设置线的类型为实线
                }
            },
            formatter: (params) => {
                let _html = '';
                if (params.length > 0) {
                    _html += `<span style="color:#A2A9BE;">${params[0].axisValue}</span>` + '<br />';
                }
                for (let i = 0, len = params.length; i < len; i++) {
                    // _html += params[i].marker + params[i].seriesName + '：' +
                    //     (parseInt(params[i].value) >= 10000 ? parseFloat(params[i].value / 10000).toFixed(2) + '万' : params[i].value) +
                    //     '<br />';
                    if (i === 0) {
                        _html += params[i].marker + '直播时长' + '：' + (parseInt(params[i].value) >= 10000 ? parseFloat(params[i].value / 10000).toFixed(2) + '万' : params[i].value) + '小时' + '<br />';
                    } else if (i === 1) {
                        _html += params[i].marker + '机审记录' + '：' + (parseInt(params[i].value) >= 10000 ? parseFloat(params[i].value / 10000).toFixed(2) + '万' : params[i].value) + '条' + '<br />';
                    }
                }

                return _html;
            }
        },
        legend: {
            data: ['直播时长（小时）', '机审记录（条）'],
            show: false
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            data: date,
            axisLine: {
                lineStyle: {
                    color: "#606572"
                }
            }

        },
        yAxis: [{
                type: 'value',
                name: '直播时长（小时）',
                show: true,
                // min: 'dataMin',
                min: 0,
                max: 'dataMax',

                axisLabel: {
                    formatter: function(value) {
                        return Math.round(value); // 将值四舍五入为整数
                    }
                },

                axisLine: {
                    lineStyle: {
                        color: '#606572',
                        width: 2
                    }
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: ['transparent'], // 设置第一个 Y 轴的横向背景线颜色为透明
                        width: 1,
                        type: 'dashed'
                    }
                },

            },
            {
                type: 'value',
                name: '机审记录（条）',
                show: true,
                // min: 'dataMin',
                min: 0,
                max: 'dataMax',
                axisLabel: {
                    formatter: '{value} '
                },
                axisLine: {
                    lineStyle: {
                        color: '#606572', //纵坐标轴和字体颜色
                        width: 2
                    }
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: ['transparent'], // 设置第一个 Y 轴的横向背景线颜色为透明
                        width: 1,
                        type: 'dashed'
                    }
                },
            }
        ],
        series: [{
                name: '直播时长（小时）',
                type: 'bar',
                barWidth: '24px',
                // data: [5, 20, 36, 10, 10, 20]  根据x轴不同日期对应不同数据
                data: arr1,
                itemStyle: {
                    color: '#56C3ED', // 柱子的颜色为蓝色

                },
            },
            {
                name: '机审记录（条）',
                type: 'line',
                yAxisIndex: 1,
                smooth: false,
                lineStyle: {
                    color: '#EC2A72',
                    width: 1
                },

                // data: [15, 30, 46, 20, 20, 30]
                data: arr2
            }
        ],
        textStyle: {
            color: '#596175'
        },

    };
}