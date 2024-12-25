<template>
  <!-- 直播详情页  flv兼容版本 -->
  <div class="live-page">
    <div class="page-top" style="diplay: flex; justify-content: flex-start; align-items: center">
      <el-button color="#169bd5">返回</el-button>
      <div class="item">
        <img :src="employeeObj.avatar_url" alt="" />
        {{ employeeObj.nickname }}
      </div>
    </div>
    <div class="live-container">
      <div class="left">
        <div class="title">直播日历</div>
        <div class="calendar">
          <el-calendar ref="calendarRef" v-model="hasSelectedDate">
            <template #header="{ date }">
              <span>所选时间共{{ filterLiveList.length }}场</span>
              <el-button @click="selectDate('prev-month')" width="14px">
                <el-icon><ArrowLeft /></el-icon>
              </el-button>
              <span>{{ date.split('年')[1].split('月')[0] }}月</span>
              <el-button @click="selectDate('next-month')" width="14px">
                <el-icon><ArrowRight /></el-icon>
              </el-button>
            </template>
            <!-- 如果当天有视频，则显示电视机logo -->
            <template #dateCell="{ data }">
              <p
                :class="[data.isSelected ? 'is-selected ' : '', hasVideo(data.day) ? 'white' : 'gray', 'calendar-cell']"
              >
                {{
                  data.day.split('-')[2] == '01'
                    ? data.day.split('-').slice(1).join('月') + '号'
                    : data.day.split('-')[2]
                }}

                <span v-if="hasVideo(data.day)" class="live-icon">
                  <svg class="svg-icon" width="18" height="16" viewBox="0 0 18 16" xmlns="http://www.w3.org/2000/svg">
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M4.77525 3.83334H1.63095C0.940595 3.83334 0.380951 4.39298 0.380951 5.08334V14.25C0.380951 14.9404 0.940594 15.5 1.63095 15.5H15.7976C16.488 15.5 17.0476 14.9404 17.0476 14.25V5.08334C17.0476 4.39298 16.488 3.83334 15.7976 3.83334H12.6533L14.7538 1.47031L13.5081 0.363037L10.4234 3.83334H7.00517L3.92046 0.363037L2.67478 1.47031L4.77525 3.83334ZM2.04762 5.50001V13.8333H15.381V5.50001H2.04762ZM8.08928 8.86089V10.7452L9.50253 9.72453L8.08928 8.86089ZM6.42262 8.11795C6.42262 7.14178 7.49149 6.54232 8.32443 7.05134L10.9061 8.629C11.6681 9.09467 11.7101 10.1861 10.9861 10.709L8.40448 12.5735C7.57782 13.1705 6.42262 12.5798 6.42262 11.5601V8.11795Z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
              </p>
            </template>
          </el-calendar>
        </div>
        <div class="list">
          <div v-if="filterLiveList.length === 0" style="text-align: center">
            <img src="../../assets/images/empty_live.png" alt="" style="width: 200px; margin-top: 20px" />
          </div>
          <div
            class="list-item"
            v-for="(item, index) in filterLiveList"
            :key="index"
            @click="checkLiveItem(item)"
            :class="{ 'is-selected': item.isSelected }"
          >
            <div class="img">
              <img :src="item.avatar_url" alt="" />
              <div :class="{ mask: item.live_status == 3, living: item.live_status == 2 }"></div>
            </div>
            <div class="list-item-right">
              <div>{{ item.live_title }}</div>
              <div>开播时间：{{ item.kssj }} 直播时长：{{ item.duration }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="mid">
        <div class="title">
          视频画面

          <el-button type="primary" @click="downloadVideo" class="oper-btn">
            <el-icon>
              <Download />
            </el-icon>
            下载本场视频
          </el-button>
        </div>

        <div class="video" v-if="videoType === 'hls'">
          <vue3VideoPlay v-bind="videoOptions" id="videoPlayer" />
        </div>
        <div class="video" v-if="videoType === 'flv'">
          <video
            ref="videoRef"
            autoplay
            class="videoElement"
            controls
            style="width: 600px; height: calc(100vh - 240px)"
            @seeked="handleSeeked"
          ></video>
        </div>
      </div>
      <div class="right">
        <div class="translate">
          <div style="margin-bottom: 24px" class="title">
            语音转文字
            <el-button type="primary" @click="reCheckLive" class="oper-btn">重审本场视频</el-button>
          </div>

          <div class="search">
            <!-- 查找关键字，限制字数不大于12个，并且实时显示 -->
            <el-input v-model="searchText" placeholder="请输入关键字" maxlength="12" clearable @input="search">
              <template #prefix>
                <el-icon>
                  <Search />
                </el-icon>
              </template>
              <template #append>
                <div class="search-append">
                  <span class="search-count">{{ currentIndex + '/' + searchResults.length }}</span>

                  <span
                    class="up-down-btn"
                    @click="focusPrevious"
                    :class="{ disabled: currentIndex === 0 || currentIndex === 1 }"
                  >
                    <el-icon><ArrowUp /></el-icon>
                  </span>
                  <span
                    class="up-down-btn"
                    @click="focusNext"
                    :class="{ disabled: currentIndex === searchResults.length || currentIndex === 0 }"
                  >
                    <el-icon><ArrowDown /></el-icon>
                  </span>
                </div>
              </template>
            </el-input>
            <!-- <el-button @click="focusNext" color="#3a62f7" style="width:70px; !important">搜索</el-button> -->
          </div>
          <div class="content" v-if="liveInfo.transContent" v-html="liveInfo.transContent_light"></div>
          <div class="content" v-else>暂无数据</div>
          <div class="block">
            <el-config-provider :locale="zhCn">
              <el-pagination
                small
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="pageObj.pageIndex"
                :page-sizes="[10, 20, 30, 40]"
                :page-size="pageObj.pageSize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="pageObj.total"
              ></el-pagination>
            </el-config-provider>
          </div>
        </div>
        <div class="violation">
          <div class="title">违规记录</div>
          <div v-if="liveInfo.violationList.length > 0" class="violation-list">
            <div class="violation-item" v-for="(item, index) in liveInfo.violationList" :key="index">
              <div class="time">
                {{ item.real_time }}
                <span class="tag" v-for="(items, indexs) in item.violation_label" :key="indexs">
                  {{
                    (items.label.length > 3 ? violationDict[items.label.slice(0, 3)] + '-' : '') +
                    violationDict[items.label]
                  }}
                </span>
              </div>
              <div v-html="item.violation_detail"></div>
              <img
                :src="item.image_url"
                alt=""
                v-if="item.image_url"
                style="width: 80px; height: 100px; margin-left: 10px"
              />
              <div class="oper-row" v-if="userInfo.isAuditor">
                <el-input
                  v-model="item.remarks"
                  placeholder="请输入审核结论"
                  :disabled="item.status === 2 || item.status === 1"
                >
                  <template #append>
                    <div class="checked" v-show="item.status === 2 || item.status === 1" style="margin-right: 20px">
                      <span style="color: #838ba1; font-size: 12px; margin-right: 20px">
                        审核人：{{ item.role_name }}
                      </span>
                      <el-button type="text" :icon="CircleCheck" v-if="item.status === 2">已通过</el-button>
                      <el-button type="text" :icon="CircleClose" v-if="item.status === 1" style="color: #ff823c">
                        未通过
                      </el-button>
                    </div>
                    <div v-show="item.status !== 1 && item.status !== 2">
                      <el-button
                        type="text"
                        :icon="CircleClose"
                        @click="deal(item, 1)"
                        style="
                          color: #3a62f7;
                          border: 1px solid #3a62f7;
                          background-color: transparent;
                          margin-right: 10px;
                        "
                      >
                        不通过
                      </el-button>
                      <el-button
                        :icon="CircleCheck"
                        size="mini"
                        @click="deal(item, 2)"
                        style="
                          margin-right: 5px;
                          background: #3a62f7 !important;
                          color: white;
                          border: none;
                          padding: 0 10px;
                        "
                      >
                        通过
                      </el-button>
                    </div>
                  </template>
                </el-input>
              </div>
            </div>
          </div>
          <div style="margin-top: 20px" v-else>暂无数据</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, reactive, toRefs, onMounted, onUnmounted, ref, watch, computed, nextTick } from 'vue';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import {
  queryEmployee,
  queryLiveCurrent,
  queryLiveHistory,
  queryLiveContent,
  queryLiveViolation,
  auditLiveViolation
} from '@/api/runCheck';
import dayjs from 'dayjs';
import {
  Search,
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  Download,
  CircleClose,
  CircleCheck
} from '@element-plus/icons';
// import Hls from 'hls.js';
import 'vue3-video-play/dist/style.css';
import { ElMessage } from 'element-plus';
import { formatSeconds, binarySearch } from '@/utils/validate';
import { useRoute } from 'vue-router';
import { violationDict } from '@/utils/dict';
import flvjs from 'flv.js';
import { useStore } from 'vuex';
export default defineComponent({
  name: 'LiveConfig',
  components: {
    Search,
    ArrowLeft,
    ArrowRight,
    ArrowDown,
    ArrowUp,
    Download
    // VideoPlayer
  },
  setup() {
    var timer = null;
    const videoRef = ref(null);
    const route = useRoute();
    const selectedOptions = ref([]);
    const options = ref([
      // 更多选项...
    ]);
    const calendarRef = ref<any>();
    let store = useStore();
    const dataMap = reactive({
      userInfo: store.state.user, // 当前用户信息
      employeeObj: {
        nickname: '',

        avatar_url: '',
        live_title: '',
        date: ''
      },
      videoType: 'flv', // 视频类型 hls:hls/mp4   flv:flv/mp4
      videoDownLoadUrl: '', // 视频下载地址
      currentLive_status: 0, //当前直播状态
      currentLive_id: '',
      video_start_time: 0 as number, // 视频开始时间
      timeArr: [], // 时间数组
      violationDict,
      searchText: '',
      searchResults: [],
      currentIndex: 0,
      currentDate: dayjs().format('YYYY-MM-DD'), //当前日期
      videoOptions: {
        width: '600px', //播放器高度
        height: '670px', //播放器高度
        color: '#409eff', //主题色
        title: '', //视频名称
        // src: 'https://cdn.jsdelivr.net/gh/xdlumia/files/video-play/IronMan.mp4', //mp4
        src: '',
        autoPlay: true,
        type: 'm3u8' //视频类型
      } as any,
      videoUrl:
        'http://pull-f3.douyincdn.com/third/stream-403412210621874859_or4.m3u8?auth_key=1716950935-0-0-80872fb82632da1d6cbd6212e3c18ea9',
      hasSelectedDate: '' as any, // 选中的日期
      dateData: { isSelected: false, type: 'current-month', day: '2024-05-17', date: '2024-05-17T06:57:40.705Z' },
      calendarDictByDate: {} as any, // 整理数据 当前列表，有视频的日期（今天之前的日期）
      zhCn,
      liveList: [], // 直播列表 接口返回
      filterLiveList: [], // 日历筛选后的直播列表
      employeeList: [], //用户列表 接口返回
      liveContents: [], //当前直播/视频内容 接口返回
      liveViolations: [], //违规记录 接口返回
      liveInfo: {
        transContent: '', // 翻译内容
        transContent_light: '', // 翻译内容，高亮版
        violationList: [] // 违规记录
      }, // 直播信息
      checkedMap: {
        1: false,
        2: false,
        3: false
      }, // 多选框选中状态
      calendarData: [], // 日历数据
      urlParams: {
        empId: 1, //  url传入的主播id
        live_id: '', //  url传入的直播id
        date: '' // url传入的直播日期
      } as any,
      isInit: false, //首次加载页面
      pageObj: {
        pageIndex: 1,
        pageSize: 20,
        total: 0
      }
    });
    const lightCurrentKeyword = (text: any) => {
      dataMap.liveInfo.transContent_light = dataMap.liveInfo.transContent.replace(
        new RegExp(text, 'gi'),
        `<span class="highlight">${text}</span>`
      );
      nextTick(() => {
        // 第一个关键词给特殊背景色
        const first = document.querySelector('span.highlight');

        if (first) {
          first.classList.add('highlight-focus');
          first.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    };
    const search = () => {
      // 输入框内容变化时，重新搜索 高亮重置
      dataMap.searchResults = [];
      dataMap.currentIndex = 0;
      const elements = document.querySelectorAll('span.highlight');
      elements.forEach((element) => {
        element.classList.remove('highlight');
        element.classList.remove('highlight-focus');
      });
      const text = dataMap.searchText;
      // **  重置查询文本，清除掉span 解决2次搜索同样关键字时 在span里搜不到的问题 **
      dataMap.liveInfo.transContent_light = JSON.parse(JSON.stringify(dataMap.liveInfo.transContent));
      if (!text) {
        return;
      }
      // ** 解决搜索到html标签
      // 创建一个虚拟的 div 元素来解析 HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(dataMap.liveInfo.transContent, 'text/html');

      // 提取文本内容
      const textContent = doc.body.textContent as any;

      const regex = new RegExp(text, 'gi');
      const matches = textContent.matchAll(regex);
      dataMap.searchResults = [...matches].map((match, index) => ({
        text: match[0],
        index: index + 1 // 索引从1开始，如果需要从0开始，可以去掉+1
      }));
      // 高亮当前关键字
      if (dataMap.searchResults.length > 0) {
        dataMap.currentIndex = 1; // 索引从1开始，如果需要从0开始，可以去掉+1
        lightCurrentKeyword(text);
      } else {
        dataMap.currentIndex = 0; // 索引从1开始，如果需要从0开始，可以去掉+1
      }
    };
    const focusNext = () => {
      if (dataMap.searchResults.length > 0 && dataMap.currentIndex < dataMap.searchResults.length) {
        dataMap.currentIndex++;
        const highlights = document.querySelectorAll(' .highlight');
        const element_old = document.querySelector(` .highlight-focus`);
        if (highlights.length >= dataMap.currentIndex) {
          // 获取第currentIndex个highlight元素
          const element = highlights[dataMap.currentIndex - 1];
          if (element) {
            if (element_old) {
              element_old.classList.remove('highlight-focus');
            }
            element.classList.add('highlight-focus');
            element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      }
    };
    const focusPrevious = () => {
      if (dataMap.searchResults.length > 0 && dataMap.currentIndex > 1) {
        dataMap.currentIndex--;
        const highlights = document.querySelectorAll(' .highlight');
        const element_old = document.querySelector(` .highlight-focus`);
        if (highlights.length >= dataMap.currentIndex) {
          // 获取第currentIndex个highlight元素
          const element = highlights[dataMap.currentIndex - 1];
          if (element) {
            if (element_old) {
              element_old.classList.remove('highlight-focus');
            }
            element.classList.add('highlight-focus');
            element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      }
    };

    // 全选的不确定属性
    const isIndeterminate: any = computed(() => {
      return selectedOptions.value.length > 0 && selectedOptions.value.length < options.value.length;
    });

    const isAllSelected: any = computed(() => {
      return selectedOptions.value.length === options.value.length;
    });

    const handleAllSelectChange = (checked) => {
      if (checked) {
        selectedOptions.value = options.value.map((option) => option.value);
        selectedOptions.value.forEach((item, index) => {
          dataMap.checkedMap[item] = true;
        });
      } else {
        selectedOptions.value = [];
        dataMap.checkedMap = {
          1: false,
          2: false,
          3: false
        };
      }
    };
    // 控制多选框的选中状态  value 选项值 true/false是否选中
    const handleCheckboxChange = (value, checked) => {
      if (checked) {
        let hasChecked = false;
        selectedOptions.value.forEach((option) => {
          if (option.value == value) {
            hasChecked = true;
          }
        });
        !hasChecked && selectedOptions.value.push(value);
        selectedOptions.value.forEach((item, index) => {
          dataMap.checkedMap[item] = true;
        });
      } else {
        selectedOptions.value = selectedOptions.value.filter((option) => option !== value);
        selectedOptions.value.forEach((item, index) => {
          dataMap.checkedMap[item] = true;
        });
      }
    };

    const hasVideo = (date: string) => {
      return dataMap.calendarDictByDate[date] && dataMap.calendarDictByDate[date].length > 0;
    };

    const selectDate = (val: any) => {
      console.log('选择日期', val);
      if (!calendarRef.value) return;
      calendarRef.value.selectDate(val);
    };

    const getLive = async () => {
      //请求直播计划列表  不确定查多少主播的数据，挨个请求
      const apiPromises = [];
      // for (let item of selectedOptions.value) {
      //   apiPromises.push(queryLiveCurrent(item)); // 当前直播
      //   apiPromises.push(queryLiveHistory(item)); // 历史回看
      // }
      let params = {
        employee_id: selectedOptions.value
      };
      apiPromises.push(queryLiveCurrent(params));
      apiPromises.push(queryLiveHistory(params));
      try {
        const results = await Promise.all(apiPromises);
        nextTick(() => {
          dataMap.liveList = [];
          results.forEach((res) => {
            if (res.ret == 0) {
              dataMap.liveList = dataMap.liveList.concat(
                res.data.lives
                  .map((item, index) => {
                    item.live_status = Object.keys(item).includes('replay_url') ? 3 : 2; // 根据是否有replay_url字段判断是3 回看 or 2 直播
                    // 直播接口返回的数据，需要筛选出status == 'live' 的，并取出.live里的数据
                    if (item.live_status == 3) {
                      return {
                        ...item,
                        kssj: dayjs(item.start_time * 1000).format('YYYY/MM/DD HH:mm:ss'),
                        jssj: dayjs(item.end_time * 1000).format('YYYY/MM/DD HH:mm:ss'),
                        //播放时长
                        duration: formatSeconds(item.start_time, item.end_time)
                      };
                    } else if (item.live_status == 2 && item.status == 'live') {
                      return {
                        kssj: dayjs(item.live.start_time * 1000).format('YYYY/MM/DD HH:mm:ss'),
                        jssj: '',
                        //播放时长
                        duration: formatSeconds(item.live.start_time, new Date().getTime() / 1000),
                        ...item.live,
                        live_status: item.live_status
                      };
                    }
                  })
                  .sort((a, b) => b.start_time - a.start_time)
              );
            }
          });
          dataMap.liveList = dataMap.liveList.filter((item) => item !== undefined);
          // return;
          renderCalendar();
        });
      } catch (error) {
        console.error('An error occurred while fetching data:', error);
      }
    };
    const getEmployee = async () => {
      let params = {
        employee_id: dataMap.userInfo.userList
      };
      let resData = await queryEmployee(params);
      if (resData.ret == 0) {
        dataMap.employeeList = resData.data.employees.map((item) => {
          return {
            ...item,
            rzsj: dayjs(item.rzsj).format('YYYY/MM/DD')
          };
        });
        options.value = dataMap.employeeList.map((item) => {
          return {
            value: item.employee_id,
            label: item.nickname
          };
        });

        dataMap.employeeObj = dataMap.employeeList.find((item) => item.employee_id == dataMap.urlParams.empId);
      }
    };
    const getLiveContent = async (id: string) => {
      let params = {
        id: id,
        pageIndex: dataMap.pageObj.pageIndex,
        pageSize: dataMap.pageObj.pageSize,
        type: dataMap.currentLive_status == 2 ? 0 : dataMap.currentLive_status == 3 ? 1 : -1
      };
      let resDataContent = await queryLiveContent(params);

      if (resDataContent.ret == 0) {
        dataMap.liveContents = resDataContent.data.live_contents;
        dataMap.pageObj.total = resDataContent.data.total_count;
        // 整理翻译内容，违规记录
        let transContent = ``;
        let timeArr = [];
        dataMap.liveContents.forEach((item) => {
          timeArr.unshift(item.real_time);
          transContent += `<span class="time">${dayjs(item.real_time * 1000).format('HH:mm:ss')}</span> ${
            item.content
          }</br>`;
        });
        dataMap.timeArr = timeArr;
        dataMap.liveInfo.transContent = transContent;
        dataMap.liveInfo.transContent_light = JSON.parse(JSON.stringify(transContent));
        search();
      }
    };
    const getLiveViolation = async (id: string) => {
      let resDataViolation = await queryLiveViolation({
        id,
        type: dataMap.currentLive_status == 2 ? 0 : dataMap.currentLive_status == 3 ? 1 : -1
      });
      if (resDataViolation.ret == 0) {
        dataMap.liveViolations = resDataViolation.data.live_violations;
        let violationArr = [];

        dataMap.liveViolations.forEach((item) => {
          violationArr.push({
            time: formatSeconds('', '', item.offset_time),
            violation_label: item.labels,
            violation_detail: item.content,
            real_time: dayjs(item.real_time * 1000).format(' HH:mm:ss'),
            remarks: '',
            status: item.status,
            id: item.id,
            role_name: item.role_name,
            image_url: item.image_url
          });
        });

        dataMap.liveInfo.violationList = violationArr;
      }
    };
    onMounted(async () => {
      dataMap.isInit = true;
      // hash模式取参
      const obj = route.query;

      // const url_params = new URLSearchParams(window.location.search);
      dataMap.urlParams.empId = obj.id;
      dataMap.urlParams.live_id = obj.live_id;
      dataMap.urlParams.date = obj.date || dayjs().format('YYYY-MM-DD');
      dataMap.hasSelectedDate = dataMap.urlParams.date;
      selectedOptions.value = [dataMap.urlParams.empId];
      dataMap.checkedMap[dataMap.urlParams.empId] = true;

      await getEmployee();
      await getLive();
      nextTick(() => {});
    });
    // 渲染日历 默认选中url中的日期
    const renderCalendar = () => {
      // 处理数据 以日期分类，存储所有主播场次
      let listbydate = {};
      dataMap.liveList.forEach((item) => {
        let date = dayjs(item.start_time * 1000).format('YYYY-MM-DD');

        if (!listbydate[date]) {
          listbydate[date] = [];
        }
        listbydate[date].push(item);
      });

      dataMap.calendarDictByDate = listbydate;
      filterList();
    };
    // 点击日历日期，筛选下方直播列表
    const filterList = () => {
      let date = dataMap.isInit ? dataMap.urlParams.date : dataMap.currentDate;

      dataMap.filterLiveList = dataMap.calendarDictByDate[date] || [];
      if (dataMap.filterLiveList.length > 0) {
        // 首次进入 url有ID的则播放对应ID的直播
        if (dataMap.urlParams.live_id && dataMap.isInit) {
          let item = dataMap.filterLiveList.find((item) => item.live_id == dataMap.urlParams.live_id);
          if (item) {
            checkLiveItem(item);
          } else {
            checkLiveItem(dataMap.filterLiveList[0]);
          }
        } else {
          checkLiveItem(dataMap.filterLiveList[0]);
        }
      } else {
        // 接口数据有对不上的情况时，可能传的日期当天并没有直播/视频。此时需要直接将isInit置为false，避免操作不了页面
        dataMap.isInit = false;
      }
    };
    // 启动定时器，每 5 秒请求一次数据
    const startInterval = () => {
      timer = setInterval(() => {
        getLiveContent(dataMap.currentLive_id);
        getLiveViolation(dataMap.currentLive_id);
      }, 10000); // 每 10 秒请求一次
    };
    const checkLiveItem = (item: any) => {
      console.log('选择播放项目', item);
      return;
      dataMap.video_start_time = item.start_time;
      dataMap.currentLive_id = item.live_id;
      dataMap.currentLive_status = item.live_status;

      // 有直播时，启动定时器。无直播时，清除定时器。
      if (item.live_status == 2) {
        if (timer) {
          clearInterval(timer);
        }
        startInterval();
      } else {
        if (timer) {
          clearInterval(timer);
        }
      }

      // 样式 选中类名
      dataMap.filterLiveList.forEach((one) => {
        one.isSelected = false;
        if (one.live_id == item.live_id) {
          one.isSelected = true;
        }
      });
      //   中间视频渲染 视频播放url改为https
      item.stream_url = item.stream_url?.replace('http://', '//');
      item.stream_url = item.stream_url?.replace('https://', '//');
      // 视频回放目前只有http ，https无法打开，暂不做协议替换
      // item.replay_url = item.replay_url?.replace('http://', '//');
      // item.replay_url = item?.replay_url.replace('https://', '//');
      let video_url = item.live_status == 2 ? item.stream_url : item.live_status == 3 ? item.replay_url : '';
      dataMap.videoDownLoadUrl = video_url;
      // 区分hls 和 flv 播放器
      dataMap.videoType = video_url.indexOf('.m3u8') > -1 ? 'hls' : 'flv'; // 回放的话默认用flv播放器了

      console.log('videoType', dataMap.videoType);
      if (dataMap.videoType === 'hls') {
        dataMap.videoOptions = {
          ...dataMap.videoOptions,
          type: item.live_status == 2 ? 'm3u8' : 'video/mp4', // 直播是hls 其余MP4
          src: video_url
        };
      } else {
        let flvPlayer = flvjs.createPlayer({
          type: item.live_status == 2 ? 'flv' : 'video/mp4',
          url: video_url
          // 以下mp4 flv示例均可播放
          // type: 'flv',
          // url: '//sf1-cdn-tos.huoshanstatic.com/obj/media-fe/xgplayer_doc_video/flv/xgplayer-demo-360p.flv',
          // type: 'video/mp4',
          // url: 'https://media.w3.org/2010/05/sintel/trailer.mp4'
        });
        // return;
        // 绑定 FLV 播放器到 <video> 标签
        flvPlayer.attachMediaElement(videoRef.value);
        // 初始化 FLV 播放器
        flvPlayer.load();
        flvPlayer.play();
      }

      // 右侧直播内容
      getLiveContent(item.live_id); // 1715667909678
      getLiveViolation(item.live_id);
      // 页面数据走一遍之后  将dataMap.isInit 初始为false
      dataMap.isInit = false;
    };
    // 监听日期变化
    watch(
      () => dataMap.hasSelectedDate,
      (val) => {
        dataMap.currentDate = dayjs(val).format('YYYY-MM-DD');
        if (dataMap.isInit) return;
        filterList();
      }
    );
    // 监听主播变化
    watch(
      () => dataMap.checkedMap,
      (val) => {
        if (dataMap.isInit) return;
        setTimeout(() => {
          getLive();
        }, 100);
      },
      { deep: true }
    );

    const videoError = (event: any) => {
      ElMessage.error('视频加载失败，请检查地址是否正确');
    };
    onUnmounted(() => {
      if (timer) {
        clearInterval(timer);
      }
    });
    const handleCurrentChange = (pageIndex: number) => {
      dataMap.pageObj.pageIndex = pageIndex;
      getLiveContent(dataMap.currentLive_id);
    };
    const handleSizeChange = (pageSize: number) => {
      dataMap.pageObj.pageSize = pageSize;
      getLiveContent(dataMap.currentLive_id);
    };
    const downloadVideo = () => {
      // 直播中
      if (dataMap.currentLive_status == 2) {
        ElMessage.error('直播中，暂不支持下载直播视频');
        return;
      }
      // 回看
      console.log('下载直播视频', dataMap.videoDownLoadUrl);
      let url = dataMap.videoDownLoadUrl + '?download=1';
      const link = document.createElement('a');
      link.href = url;
      link.download = '回放视频.mp4';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };
    const reCheckLive = () => {
      ElMessage.info('重审本场视频');
    };
    const focusContent = (time: number) => {
      // 找到精确real_time或者范围 在根据hh:mm:ss执行搜索定位
      let target = parseInt(dataMap.video_start_time + time);
      console.log('target', target);
      console.log('timeArr', dataMap.timeArr);
      const result = binarySearch(dataMap.timeArr, target);
      if (typeof result === 'number') {
        console.log(`时间戳 ${target} 在数组中的索引是 ${result}`);
      } else {
        console.log(`时间戳 ${target} 位于索引 ${result[0]} 和 ${result[1]} 之间`);
      }
    };

    // 拖动进度条结束
    const handleSeeked = () => {
      const currentTime = videoRef.value.currentTime;
      // console.log('进度条拖动结束:', currentTime);
      // focusContent(currentTime);
    };
    const deal = async (item: any, status: number) => {
      console.log('处理', item);
      // return;

      let timeType = dataMap.currentLive_status == 2 ? 0 : dataMap.currentLive_status == 3 ? 1 : -1;
      let params = {
        ids: [item.id],
        time_type: timeType, // 0: 实时直播 1: 历史直播
        role_name: dataMap.userInfo.username, // 审核人员
        status: status, // 0: 待审核 1: 审核不通过 2: 审核通过
        reason: item.remarks // 审核不通过原因
      };
      console.log('params', params);
      let res = await auditLiveViolation(params);
      if (res.ret == 0) {
        ElMessage.success('操作成功');
        item.status = status;
        item.role_name = dataMap.userInfo.username;
      } else {
        ElMessage.error('操作失败');
      }
    };
    return {
      ...toRefs(dataMap),
      search,
      focusPrevious,
      focusNext,
      selectDate,
      calendarRef,
      hasVideo,
      selectedOptions,
      options,
      isIndeterminate,
      isAllSelected,
      handleAllSelectChange,
      handleCheckboxChange,
      checkLiveItem,
      videoError,
      handleCurrentChange,
      handleSizeChange,
      downloadVideo,
      videoRef,
      reCheckLive,
      handleSeeked,
      CircleClose,
      CircleCheck,
      deal
    };
  }
});
</script>

<style lang="scss" scoped>
.custom-header {
  // 解决全选按钮点击不同步
  .el-scrollbar .el-checkbox {
    width: 100%;
    height: 38px;
  }
}
.el-calendar {
  --el-calendar-cell-width: 55px;
  background-color: #111626;
  --el-calendar-border: 1px solid #1d2b3b;
  --el-calendar-selected-bg-color: #1f3062;
  .el-button {
    background: #111626;
    border-radius: 14px !important;
  }
  :deep(.el-calendar__header),
  :deep(.el-calendar__body) {
    align-items: center !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
  }
  .svg-icon {
    color: #596175; /* 设置 SVG 图形的颜色 */
  }
  .el-calendar-day:hover {
    color: #58a5ff;
    .svg-icon {
      color: #58a5ff;
    }
  }
  .is-selected .svg-icon {
    color: #58a5ff;
  }
  .calendar-cell {
    margin: 0;
    //不换行
    white-space: nowrap;
    &.white {
      color: #fff !important;
    }
    &.gray {
      color: #373f52 !important;
    }
  }
}
.el-calendar {
  :deep(.el-calendar-day) {
    position: relative !important;
    .live-icon {
      position: absolute;
      right: 6px;
      bottom: 4px;
    }
  }
}
.oper-row {
  margin-top: 10px;
}
</style>
