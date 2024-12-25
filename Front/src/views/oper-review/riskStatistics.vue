<template>
  <!--  运营审查-员工登记 -->
  <div class="risk-statistics">
    <div class="page-top">
      <div class="left">
        <div class="ask-search-line">
          <div class="search-label">统计时间段：</div>
          <el-radio-group
            v-model="radio1"
            text-color="#fff"
            fill="#3A62F7"
            @change="radioChange"
          >
            <el-radio-button label="" value="">今日</el-radio-button>
            <el-radio-button label="0" value="0">昨日</el-radio-button>
            <el-radio-button label="1" value="1">近一周</el-radio-button>
            <el-radio-button label="2" value="2">近一月</el-radio-button>
            <el-radio-button label="3" value="3">近90天</el-radio-button>
          </el-radio-group>
          <el-date-picker
            class="up-date-picker"
            v-model="date_range"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            start-date="2021-01-01"
            end-date="2021-12-31"
            @change="dateChange"
            :picker-options="{
              disabledDate: (date) => {
                return date && date < new Date();
              },
            }"
          ></el-date-picker>
          <!-- 选择账号类型 -->
          <div style="margin-left: 40px; margin-right: 16px">选择账号：</div>
          <el-select
            v-model="employee_id"
            @change="toFilterTableData"
            class="employee-select"
            filterable
          >
            <el-option label="全部" value=""></el-option>
            <el-option
              :label="item.label_with_platform"
              :value="item.value"
              v-for="item in employeeList"
              :key="item.id"
            ></el-option>
          </el-select>
        </div>
      </div>
      <div></div>
    </div>
    <div class="account-manage" v-loading="loading" element-loading-text="拼命加载中...">
      <div class="table-top">核心数据</div>
      <div class="account-main">
        <div class="center-data">
          <div class="item">
            <div class="title">直播场次</div>
            <div class="content">
              <span class="value">{{ coreData.live_sessions }}</span>
              场
            </div>
          </div>
          <div class="item">
            <div class="title">直播总时长</div>
            <div class="content">
              <span class="value">{{ coreData.total_duration }}</span>
              小时
            </div>
          </div>
          <div class="item">
            <div class="title">机审疑似违规</div>
            <div class="content">
              <div class="data">
                <span class="value">
                  {{
                    coreData.machine_violation_stats.video_violation_count +
                    coreData.machine_violation_stats.audio_violation_count
                  }}
                </span>
                条
              </div>

              <div class="progress">
                <span class="left-label"
                  >截帧图片
                  {{ coreData.machine_violation_stats.video_violation_count }}</span
                >
                <span class="right-label"
                  >音频切片
                  {{ coreData.machine_violation_stats.audio_violation_count }}</span
                >

                <el-progress
                  :percentage="leftPercent1"
                  :stroke-width="8"
                  :show-text="false"
                  color="#FF823C"
                ></el-progress>
              </div>
            </div>
          </div>
          <div class="item">
            <div class="title">人审结果记录</div>
            <div class="content">
              <div class="data">
                <span class="value">
                  {{
                    coreData.people_violation_stats.pass_count +
                    coreData.people_violation_stats.reject_count
                  }}
                </span>
                条
              </div>

              <div class="progress">
                <span class="left-label"
                  >通过 {{ coreData.people_violation_stats.pass_count }}</span
                >
                <span class="right-label"
                  >不通过 {{ coreData.people_violation_stats.reject_count }}</span
                >

                <el-progress
                  :percentage="leftPercent2"
                  :stroke-width="8"
                  :show-text="false"
                  color="#FF823C"
                ></el-progress>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- <div class="table-top">违规趋势</div> -->
      <div class="account-main">
        <div id="myChart" style="width: 100%; height: 300px"></div>
      </div>

      <div class="table-top">审核明细</div>
      <div class="account-main">
        <div class="account-table">
          <!-- 下单管理表格 -->
          <!-- height="calc(100vh - 753px)" -->
          <el-table
            :data="violationData"
            size="small"
            highlight-current-row
            fit
            :header-cell-style="{ backgroundColor: '#20283F' }"
          >
            <!-- <el-table-column label="直播时段" prop="duration" width="150" align="center" show-overflow-tooltip /> -->
            <el-table-column
              label="机审发现时间"
              prop="time"
              width="150"
              align="center"
              show-overflow-tooltip
            />
            <el-table-column
              label="主播"
              width="150"
              align="center"
              show-overflow-tooltip
            >
              <template #default="scope">
                <div style="display: flex; align-items: center">
                  <img
                    :src="scope.row.avatar_url || noUser"
                    style="
                      width: 30px;
                      height: 30px;
                      border-radius: 50%;
                      margin-right: 10px;
                    "
                  />
                  {{ scope.row.nickname }}
                </div>
              </template>
            </el-table-column>

            <el-table-column
              label="疑似违规类型"
              prop="labels_str"
              width="150"
              align="left"
              show-overflow-tooltip
            >
              <template #default="scope">
                <div
                  style="
                    display: flex;
                    width: 100%;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                  "
                >
                  <!-- <div v-for="(items, index) in scope.row.labels" :key="index">
                    {{
                      (items.label.length > 3 ? violationDict[items.label.slice(0, 3)] + '-' : '') +
                      violationDict[items.label] +
                      ';'
                    }}
                  </div> -->
                  <div>
                    {{ scope.row.labels_str }}
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="疑似违规内容" prop="content" width="780" align="left">
              <template #default="scope">
                <el-popover
                  placement="top-start"
                  title=""
                  trigger="hover"
                  :hide-after="0"
                >
                  <template #reference>
                    <div>
                      <div v-if="scope.row.image_url" style="height: 24px">
                        <div @click="openImagePreview" class="look-image">[截帧图片]</div>
                        <el-image
                          ref="image"
                          src=""
                          :preview-src-list="[scope.row.image_url]"
                          :initial-index="0"
                        >
                          <template #error>
                            <span style="display: none"></span>
                          </template>
                        </el-image>
                      </div>
                      <div
                        v-else
                        class="content-cell"
                        v-html="scope.row.content_html"
                        style="
                          width: 730px;
                          display: -webkit-box;
                          -webkit-box-orient: vertical;
                          -webkit-line-clamp: 2;
                          overflow: hidden;
                          text-overflow: ellipsis;
                          white-space: normal;
                        "
                      ></div>
                    </div>
                  </template>
                  <template #default>
                    <div class="popover-content" v-if="scope.row.image_url">
                      点击查看图片
                    </div>
                    <div class="popover-content" v-else>
                      {{ scope.row.content }}
                    </div>
                  </template>
                </el-popover>
              </template>
            </el-table-column>
            <el-table-column
              label="人审结果"
              prop="status"
              align="center"
              width="80"
              show-overflow-tooltip
            >
              <template #default="scope">
                <div :style="{ color: auditStatusColorDict[scope.row.status] }">
                  {{ auditStatusDict[scope.row.status] }}
                </div>
              </template>
            </el-table-column>
            <el-table-column
              label="人审说明"
              prop="reason"
              align="center"
              show-overflow-tooltip
            />
            <el-table-column
              label="审核人"
              prop="role_name"
              width="80"
              align="center"
              show-overflow-tooltip
            />

            <el-table-column
              label="操作"
              align="center"
              width="150"
              fixed="right"
              class-name="fixed-column"
            >
              <template #default="scope">
                <el-button
                  class="oper update-btn mr0"
                  type="text"
                  @click="toLivePage(scope.row)"
                  >查看详情</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </div>
        <!-- 分页 -->
        <div class="block">
          <el-config-provider :locale="zhCn">
            <el-pagination
              small
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="pageObj.pageIndex"
              :page-sizes="[10, 20]"
              :page-size="pageObj.pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="pageObj.total"
            ></el-pagination>
          </el-config-provider>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
  reactive,
  toRefs,
  onMounted,
  onUnmounted,
  ref,
  getCurrentInstance,
  nextTick,
} from "vue";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import { queryEmployee, queryLiveStats, queryLiveViolationBatch } from "@/api/runCheck";
import dayjs from "dayjs";
import { Search } from "@element-plus/icons";
import EditPop from "./components/Edit-employee-Pop.vue";
import {
  violationDict,
  auditStatusDict,
  auditStatusColorDict,
  plateformDict,
} from "@/utils/dict";
import { ElMessage } from "element-plus";
import { formatSeconds, setWordColor } from "@/utils/validate";
import * as echarts from "echarts";
import { echartsConfig } from "@/utils/echarts-cfg";
import { useStore } from "vuex";
import { getDeptList } from "@/api/user";
import { getSubDepartments } from "@/utils/validate.js";
import noUser from "@/assets/images/no-user.jpg";
export default defineComponent({
  name: "employeeRegist",

  components: {
    Search,
    EditPop,
  },
  setup() {
    const EditPopRef = ref(null);
    const image = ref(null);
    let store = useStore();
    var myChart: any = null;
    let { proxy }: any = getCurrentInstance();
    const dataMap = reactive({
      noUser,
      userInfo: store.state.user, // 当前用户信息
      date_range: null,
      timeType: "radio",
      radio1: "2",
      employee_id: "",
      employeeList: [],
      coreData: {
        machine_violation_stats: "",
        people_violation_stats: "",
      } as any,
      dailData: {} as any,
      violationData: [] as any,

      violationDict,
      auditStatusDict,
      auditStatusColorDict,
      leftPercent1: 50, // 第一类数据的占比
      leftPercent2: 50, // 第二类数据的占比
      sTime: dayjs().subtract(1, "month").startOf("day").valueOf() as any,
      eTime: dayjs(new Date().getTime()) as any,
      showImage: false,
      loading: false,
      pageObj: {
        pageIndex: 1,
        pageSize: 10,
        total: 0,
      },
      zhCn,
      live_ids: [], // 违规直播ID列表
      accessDeptIds: [], // 所属部门+子部门列表
      accessEmployeeIds: [], // 所属部门+子部门下的主播列表
      plateformDict,
    });

    // 筛选条件项
    const toFilterTableData = () => {
      dataMap.pageObj = {
        pageIndex: 1,
        pageSize: 10,
        total: 0,
      };
      let sTime = dataMap.sTime;
      let eTime = dataMap.eTime;
      if (dataMap.timeType == "range") {
        sTime = new Date(dataMap.date_range[0]).getTime();
        eTime = new Date(dataMap.date_range[1]).getTime() + 86400000;
        console.log("eTime", eTime);
      } else {
        switch (dataMap.radio1) {
          case "": // 今天
            sTime = dayjs().startOf("day").valueOf();
            eTime = new Date().getTime();
            break;
          case "0": // 昨天
            sTime = dayjs().subtract(1, "day").startOf("day").valueOf();
            eTime = dayjs().startOf("day").valueOf();

            break;
          case "1": // 近一周
            sTime = dayjs().subtract(7, "day").startOf("day").valueOf();
            eTime = dayjs(new Date().getTime());
            break;
          case "2": // 近一月
            sTime = dayjs().subtract(1, "month").startOf("day").valueOf();
            eTime = dayjs(new Date().getTime());
            break;
          case "3": // 近90天
            sTime = dayjs().subtract(3, "month").startOf("day").valueOf();
            eTime = dayjs(new Date().getTime());
            break;
          default:
            sTime = "";
            eTime = "";
            break;
        }
      }
      dataMap.sTime = sTime;
      dataMap.eTime = eTime;
      toQueryViolation();
    };
    // 选择时间段
    const radioChange = (radio: any) => {
      dataMap.date_range = null;
      dataMap.timeType = "radio";
      toFilterTableData();
    };
    const toQueryViolation = async () => {
      dataMap.loading = true;
      //请求违规记录列表
      // 主播入参  如果数据权限为空，说明不做数据权限隔离，用实时的部门筛选出来的主播列表隔离。如果不为空，则用userList存放的数据权限隔离
      let idlist = [];
      idlist =
        dataMap.userInfo.userList.length > 0
          ? dataMap.userInfo.userList
          : dataMap.accessEmployeeIds;

      let params = {
        employee_id: dataMap.employee_id ? [dataMap.employee_id] : idlist, // 用户web里选了账号
        start_time: {
          timestamp: parseInt((dataMap.sTime / 1000) as any),
          range_type: 1,
        },
        end_time: {
          timestamp: parseInt((dataMap.eTime / 1000) as any),
          range_type: 5,
        },
      };
      // 考虑部门非无，且部门下无主播权限
      let isEmpty =
        dataMap.accessEmployeeIds.length === 0 && dataMap.userInfo.departId !== 0;
      if (isEmpty) {
        dataMap.loading = false;
        return;
      }
      try {
        let res = await queryLiveStats(params);

        if (res.ret == 0) {
          // 核心数据
          dataMap.coreData = {
            ...res.data.core_data,
            total_duration: parseFloat(
              (res.data.core_data.total_duration / 60 / 60) as any
            ).toFixed(2),
          };
          dataMap.leftPercent1 =
            (res.data.core_data.machine_violation_stats.video_violation_count /
              (res.data.core_data.machine_violation_stats.video_violation_count +
                res.data.core_data.machine_violation_stats.audio_violation_count)) *
              100 || 0;

          dataMap.leftPercent2 =
            (res.data.core_data.people_violation_stats.pass_count /
              (res.data.core_data.people_violation_stats.pass_count +
                res.data.core_data.people_violation_stats.reject_count)) *
              100 || 0;
          // 违规趋势
          let _dailData = { dateList: [], durationList: [], violationList: [] };
          res.data.dail_data.reverse().forEach((item) => {
            _dailData.dateList.push(item.date);
            _dailData.durationList.push(
              parseFloat((item.total_duration / 60 / 60) as any).toFixed(2)
            );
            _dailData.violationList.push(item.violation_count);
          });
          dataMap.dailData = _dailData;

          dataMap.live_ids = res.data.live_ids;
          queryLiveViolation();
        } else {
          ElMessage.error("请求失败，请稍后重试");
        }
        initEcharts(
          dataMap.dailData.dateList,
          dataMap.dailData.durationList,
          dataMap.dailData.violationList
        );
        dataMap.loading = false;
      } catch (err) {
        ElMessage.error("请求超时，请稍后重试");
        initEcharts();
        dataMap.loading = false;
      }
    };
    const toLivePage = (row: any) => {
      console.log("跳转直播监控页面", row);

      proxy.$router.push({
        path: "/oper-review/live-monitor",
        query: {
          live_id: row.live_id,
          // live_id: 'LiveA20240611170938AUP00003A2A2A40',
          live_status: 1, // 0实时直播 1 历史直播
        },
      });
    };
    const initEcharts = (date = [], arr1 = [], arr2 = []) => {
      // 基于准备好的dom，初始化echarts实例
      nextTick(() => {
        myChart = echarts.init(document.getElementById("myChart") as any);

        // 使用刚指定的配置项和数据显示图表。
        let option = echartsConfig(date, arr1, arr2);
        myChart.setOption(option);
      });
    };
    onMounted(async () => {
      await togetDeptList();
      await toQueryEmployee();

      toQueryViolation();
    });
    const togetDeptList = async () => {
      let res: any = await getDeptList();
      if (res.iRet === 0) {
        // 获取 id 为 departId 的部门及其所有子部门的 id
        dataMap.accessDeptIds = getSubDepartments(res.data, dataMap.userInfo.departId);
        console.log("子部门", dataMap.accessDeptIds);
      }
    };

    const toQueryEmployee = async () => {
      let params = {
        employee_id: dataMap.userInfo.userList,
      };
      let resEmployee = await queryEmployee(params);
      if (resEmployee.ret == 0) {
        dataMap.employeeList = resEmployee.data.employees
          .filter((item) => dataMap.accessDeptIds.includes(item.dept_id)) // 根据部门隔离员工列表
          .map((item) => {
            return {
              label: item.nickname,
              value: item.employee_id,
              label_with_platform:
                item.nickname + "(" + dataMap.plateformDict[item.live_platform] + ")",
            };
          });
        dataMap.accessEmployeeIds = dataMap.employeeList.map((item) => item.value);
        // console.log("员工列表", dataMap.employeeList);
      }
    };
    onUnmounted(() => {
      // 销毁图表实例
      echarts.dispose(myChart);
    });
    // 筛选日历日期时 时间段无效
    const dateChange = (val: any) => {
      console.log("选择日期", val);
      dataMap.radio1 = null;
      dataMap.timeType = "range";
      toFilterTableData();
    };
    const openImagePreview = () => {
      image.value.clickHandler();
      console.log("image.value.clickHandler", image.value.clickHandler);
    };

    const queryLiveViolation = async () => {
      let params = {
        live_ids: dataMap.live_ids,
        page_number: dataMap.pageObj.pageIndex,
        page_size: dataMap.pageObj.pageSize,
        live_platform: -1,
        status: -1,
      };
      let res = await queryLiveViolationBatch(params);
      // 违规明细
      dataMap.violationData = res.data.live_violations.map((item) => {
        let labels_str = "";
        let label_name = item.labels[0]?.lib_name || "";
        let label_num = item.labels[0]?.label || 0;
        // 判断是哪个类型的违规  lib_name有值则是自定义   无值则是系统违规
        if (item.violation_type === 3) {
          labels_str = "敏感词-" + label_name;
        } else if (item.violation_type === 4) {
          labels_str = "资质展示-" + label_name;
        } else {
          labels_str =
            (label_num.length > 3 ? violationDict[label_num.slice(0, 3)] + "-" : "") +
            violationDict[label_num] +
            "";
        }
        return {
          ...item,
          time: dayjs(item.real_time * 1000).format(" YYYY-MM-DD HH:mm"),
          status: item.status,
          role_name: item.role_name,
          labels_str: labels_str,
          content_html: setWordColor(item.content, item.labels[0].words),
        };
      });

      dataMap.pageObj.total = res.data.total_count;
    };
    const handleCurrentChange = (pageIndex: number) => {
      dataMap.pageObj.pageIndex = pageIndex;
      queryLiveViolation();
    };
    const handleSizeChange = (pageSize: number) => {
      dataMap.pageObj.pageSize = pageSize;
      queryLiveViolation();
    };

    return {
      ...toRefs(dataMap),
      radioChange,
      dateChange,
      toFilterTableData,
      toLivePage,
      openImagePreview,
      image,
      handleCurrentChange,
      handleSizeChange,
    };
  },
});
</script>
<style lang="scss" scoped>
.risk-statistics {
  .account-main {
    margin-bottom: 16px;
    :deep(.el-table__body-wrapper) {
      //   max-height: 52vh !important;
      //   min-height: 15vh !important;
      position: relative;
      overflow-y: auto !important;
    }
  }
  .center-data {
    display: flex;
    justify-content: space-between;
    .item {
      border-radius: 4px;
      overflow: hidden;
      &:first-child,
      &:nth-child(2) {
        width: 142px !important;
        flex: none !important;
      }
      flex: 1;
      height: 110px;
      margin-right: 20px;
      text-align: center;
      background: #181f34;

      .title {
        line-height: 35px;
        background: #2a3d61;
      }
      .content {
        line-height: 75px;
        font-size: 12px;
        .value {
          font-weight: 600;
          font-size: 28px;
        }
        .data,
        .progress {
          display: inline-block;
          width: 28%;
          text-align: center;
        }
        .progress {
          position: relative;
          text-align: center;
          width: 50%;
          :deep(.el-progress-bar__outer) {
            background: #56c3ed !important;
          }
          .left-label,
          .right-label {
            position: absolute;
            left: 0;
            top: -55px;
            color: #ff823c;
          }
          .right-label {
            position: absolute;
            right: 0;
            color: #56c3ed;
            text-align: right;
          }
        }
      }
    }
  }
  .echarts {
    height: 240px;
  }
}
</style>
