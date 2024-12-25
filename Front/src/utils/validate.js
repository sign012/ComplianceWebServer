/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
    return /^(https?:|mailto:|tel:)/.test(path);
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validUsername(str) {
    const valid_map = ['admin', 'editor'];
    return valid_map.indexOf(str.trim()) >= 0;
}

/**
 * @param {string} url
 * @returns {Boolean}
 */
export function validURL(url) {
    const reg =
        /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
    return reg.test(url);
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validLowerCase(str) {
    const reg = /^[a-z]+$/;
    return reg.test(str);
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validUpperCase(str) {
    const reg = /^[A-Z]+$/;
    return reg.test(str);
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validAlphabets(str) {
    const reg = /^[A-Za-z]+$/;
    return reg.test(str);
}

/**
 * @param {string} email
 * @returns {Boolean}
 */
export function validEmail(email) {
    const reg =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return reg.test(email);
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function isString(str) {
    return typeof str === 'string' || str instanceof String;
}

/**
 * @param {Array} arg
 * @returns {Boolean}
 */
export function isArray(arg) {
    if (typeof Array.isArray === 'undefined') {
        return Object.prototype.toString.call(arg) === '[object Array]';
    }
    return Array.isArray(arg);
}

// 计算时长
export function formatSeconds(stime, etime, duaration = '') {
	 
    stime = stime || 0;
    etime = etime || new Date().getTime()/1000;
    let timestampInSeconds = etime - stime;
	
    // 计算小时、分钟和秒
    if (stime == 0 && etime == 0 && duaration !== '') {
        timestampInSeconds = duaration;
        const hours = Math.floor(timestampInSeconds / 3600);
        const minutes = Math.floor((timestampInSeconds % 3600) / 60);
        const seconds = timestampInSeconds % 60;
        return `${hours}:${minutes}:${seconds}`
    } else {
        const hours = Math.floor(timestampInSeconds / 3600);
        const minutes = Math.floor((timestampInSeconds % 3600) / 60);
        const seconds = timestampInSeconds % 60;
        if(hours>0) {
			return `${hours}小时${minutes}分钟`
		} else {
			return `${minutes}分钟`
		}
    }

}
/**
 * @param {Array} arr 目标数组
 * @returns {any} 返回目标应该插入的位置
 */
export function binarySearch(arr, target) {
    let left = 0;
    let right = arr.length - 1;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (arr[mid] === target) {
            return mid; // 如果找到目标，返回索引
        } else if (arr[mid] < target) {
            right = mid - 1; // 目标在左半部分
        } else {
            left = mid + 1; // 目标在右半部分
        }
    }
    return [right, left]; // 返回目标应该插入的位置
}

export function formatSqlData(data) {
    // let typeList = [{
    //         label: '视频违规',
    //         id: 4,
    //         level: 1,
    //         children: []
    //     },
    //     {
    //         label: '音频违规',
    //         id: 2,
    //         level: 1,
    //         children: []
    //     },
    //     {
    //         label: '语⾳敏感词检测',
    //         id: 3,
    //         level: 1,
    //         children: []
    //     },
    //     {
    //         label: '通用风险检测',
    //         id: 5,
    //         level: 1,
    //         children: []
    //     },

    // ]
    // let dataMap = [];
    // for (let i in data) {
    //     typeList.forEach(item => {
    //         if (i.slice(0, 1) == item.id) {
    //             item.children.push({
    //                 label: data[i],
    //                 id: i,
    //                 level: 2,
    //                 pid: item.id 
    //             })
    //         }
    //     })
    // }

    let typeList = [{
            label: '语音敏感词检测',
            id: 3,
            level: 1,
            children: []
        },
        {
            label: '通用风险检测',
            id: 5,
            level: 1,
            children: []
        },

    ]
    let dataMap = [];
    for (let i in data) {
        typeList.forEach(item => {

            item.children.push({
                label: data[i],
                id: i,
                level: 2,
                pid: 5
            })

        })
    }



    return typeList;
    //  先根据level找到大类  再根据小类的pid归类到对应大类的children中

}


// 设置违规词底色
export function  setWordColor  (content, words ) {
	let reg = new RegExp(`(${words.join('|')})`, 'gi');
	let html = content?.replace(reg, '<span style="display: inline;background-color: #0300bf;">$1</span>');
	return html;
}


// 找到当前部门的所有下级部门 （id不可为0 ，顶级部门在外部处理）
export function findChildrenDept  (arr, id = "")  {
	let result = [];
	arr.forEach((item) => {
	  if (id == "" || item.value == id) {
		result.push(item.value); 
		if (item.children.length > 0) {
		  result = result.concat(findChildrenDept(item.children, ""));
		}
	  } else {
		result = result.concat(findChildrenDept(item.children, id));
	  }
	});
	return result;
  };

  // 根据原始部门数组 获取子部门id列表
  export function getSubDepartments (departments, parentId) {
	// 存储结果的数组
	const result = [];
  
	// 递归函数
	function findSubDepartments(id) {
	  // 找到当前部门的子部门
	  const subDepartments = departments.filter(dept => dept.pid == id);
	  // 将当前部门的 id 添加到结果中
	  result.push(Number(id));
	  // 递归查找子部门的子部门
	  subDepartments.forEach(subDept => {
		findSubDepartments(subDept.auto_inc_id);
	  });
	}
	// 开始查找
	findSubDepartments(parentId);
	return result;
  };
 