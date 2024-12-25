<template>
  <!--  运营审查-历史回看 -->
  <div class="his-review">
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
            <!-- <el-radio-button label="4" value="4">自定义</el-radio-button> -->
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
            @change="toQueryHis"
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
      <div>
        <vue3-json-excel
          :json-data="list"
          :fields="jsonFields"
          class="export-btn"
          type="xls"
          :header="excelheader"
          :name="excelname"
          footer
        >
          <el-button size="mini" color="#3A62F7" @click="downLoadOrder"
            >导出数据</el-button
          >
        </vue3-json-excel>
        <!-- <el-button size="mini" color="#3A62F7" @click="downLoadOrder">导出数据</el-button> -->
      </div>
    </div>
    <div class="account-manage place-table">
      <div class="table-top">共{{ pageObj.total }}场直播记录</div>
      <div class="account-main" id="account-main">
        <div class="account-table">
          <!-- 下单管理表格 -->
          <el-table
            :data="tableData"
            size="small"
            highlight-current-row
            fit
            :header-cell-style="{ backgroundColor: '#20283F' }"
            height="calc(100vh - 305px)"
            v-loading="loading"
            element-loading-text="拼命加载中..."
          >
            <el-table-column
              label="主播头像"
              prop="avatar_url"
              width="100"
              align="center"
              show-overflow-tooltip
            >
              <template #default="scope">
                <img
                  :src="scope.row.avatar_url || noUser"
                  style="width: 40px; height: 40px; border-radius: 50%"
                />
              </template>
            </el-table-column>
            <el-table-column
              label="主播昵称"
              prop="nickname"
              width="120"
              align="left"
              show-overflow-tooltip
            />
            <el-table-column
              label="直播平台"
              prop="live_platform"
              width="120"
              align="left"
              show-overflow-tooltip
            >
              <template #default="scope">
                {{ plateformDict[scope.row.live_platform] }}
              </template>
            </el-table-column>

            <el-table-column
              label="开播时间"
              prop="kssj"
              width="150"
              align="center"
              show-overflow-tooltip
            />
            <el-table-column
              label="开播时长"
              prop="duration"
              width="150"
              align="center"
              show-overflow-tooltip
            />
            <el-table-column
              label="直播标题"
              prop="live_title"
              align="left"
              show-overflow-tooltip
            />
            <!-- <el-table-column label="报备脚本" prop="live_title" align="left" show-overflow-tooltip /> -->
            <el-table-column
              label="观看人次"
              prop="watch_count"
              align="left"
              show-overflow-tooltip
            />
            <el-table-column
              label="违规记录"
              prop="violation_count"
              align="left"
              show-overflow-tooltip
            />

            <el-table-column label="操作" align="center" width="110">
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

          <!-- 分页 -->
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
      </div>
    </div>
    <EditPop ref="EditPopRef" @renderList="toQueryHis" />
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
} from "vue";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import { queryEmployee, queryLiveHistory } from "@/api/runCheck";
import dayjs from "dayjs";
import { Search } from "@element-plus/icons";
import EditPop from "./components/EditPop.vue";
import { plateformDict } from "@/utils/dict";
import { ElMessage } from "element-plus";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { getDeptList } from "@/api/user";
import { formatSeconds, getSubDepartments } from "@/utils/validate.js";
import noUser from "@/assets/images/no-user.jpg";
export default defineComponent({
  name: "LiveConfig",
  components: {
    Search,
    EditPop,
  },
  setup() {
    const EditPopRef = ref(null);
    let store = useStore();
    const router = useRouter();
    let { proxy }: any = getCurrentInstance();
    const dataMap = reactive({
      noUser,
      userInfo: store.state.user, // 当前用户信息
      list: [],
      jsonFields: {},
      excelheader: "历史回看",
      excelname: "导出表格",
      zhCn,
      tableData: [],
      date_range: null,
      employeeType: "all",
      employee_id: "",
      employeeList: [],
      pageObj: {
        pageIndex: 1,
        pageSize: 10,
        total: 0,
      },
      radio1: "3",
      countForm: {
        all: 0,
        tbc: 0,
        ok: 0,
        tranded: 0,
        canceled: 0,
      },
      plateformDict,
      timeObj: {
        start_time: "",
        end_time: "",
      } as any,
      loading: false, // 加载状态
      accessDeptIds: [], // 所属部门+子部门列表
      accessEmployeeIds: [], // 所属部门+子部门下的主播列表
    });

    const toFilterRadio = () => {
      let sTime = dataMap.sTime;
      let eTime = dataMap.eTime;
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

      dataMap.timeObj.start_time = sTime;
      dataMap.timeObj.end_time = eTime;
      toQueryHis();
    };

    // 筛选日历日期
    const dateChange = (val: any) => {
      //   console.log('选择日历', dataMap.date_range);
      dataMap.radio1 = null;
      dataMap.timeObj.start_time = new Date(dataMap.date_range[0]).getTime();
      dataMap.timeObj.end_time = new Date(dataMap.date_range[1]).getTime() + 86400000;
      toQueryHis();
    };
    // 选择时间段
    const radioChange = (radio: any) => {
      //   console.log('选择时间段', radio);
      dataMap.date_range = null;
      toFilterRadio();
    };
    const handleCurrentChange = (pageIndex: number) => {
      dataMap.pageObj.pageIndex = pageIndex;
      toQueryHis();
    };
    const handleSizeChange = (pageSize: number) => {
      dataMap.pageObj.pageSize = pageSize;
      toQueryHis();
    };
    const search = () => {
      toQueryHis();
    };
    const showPop = (type: string, row: any = "") => {
      //   console.log('修改直播配置', JSON.parse(JSON.stringify(row)));
      if (type == "edit") {
        ElMessage.warning("功能暂未开放");
        return;
      }
      EditPopRef.value.initPop(type, JSON.parse(JSON.stringify(row)));
    };
    const toLivePage = (row: any) => {
      //   console.log('跳转直播监控页面', row);

      proxy.$router.push({
        path: "/oper-review/live-monitor",
        query: {
          live_id: row.live_id,
          // live_id: 'LiveA20240611170938AUP00003A2A2A40',
          live_status: 1, // 0实时直播 1 历史直播
        },
      });
    };
    const toQueryHis = async () => {
      dataMap.loading = true;
      //请求员工登记列表
      // 主播入参  如果数据权限为空，说明不做数据权限隔离，用实时的部门筛选出来的主播列表隔离。如果不为空，则用userList存放的数据权限隔离
      let idlist = [];
      idlist =
        dataMap.userInfo.userList.length > 0
          ? dataMap.userInfo.userList
          : dataMap.accessEmployeeIds;
      let params = {};
      if (dataMap.timeObj.start_time && dataMap.timeObj.end_time) {
        params = {
          employee_id: dataMap.employee_id ? [dataMap.employee_id] : idlist,
          start_time: {
            timestamp: parseInt((dataMap.timeObj.start_time / 1000) as any),
            range_type: 1,
          },
          end_time: {
            timestamp: parseInt((dataMap.timeObj.end_time / 1000) as any),
            range_type: 5,
          },
          page_number: dataMap.pageObj.pageIndex,
          page_size: dataMap.pageObj.pageSize,
        };
      } else {
        params = {
          employee_id: dataMap.employee_id ? [dataMap.employee_id] : idlist,
          page_number: dataMap.pageObj.pageIndex,
          page_size: dataMap.pageObj.pageSize,
        };
      }
      // 考虑部门非无，且部门下无主播权限
      let isEmpty =
        dataMap.accessEmployeeIds.length === 0 && dataMap.userInfo.departId !== 0;
      if (isEmpty) {
        dataMap.loading = false;
        return;
      }
      try {
        let res = await queryLiveHistory(params);
        if (res.ret == 0) {
          dataMap.tableData = res.data.lives.map((item) => {
            return {
              ...item,
              kssj: dayjs(item.start_time * 1000).format("YYYY/MM/DD HH:mm:ss"),
              duration: formatSeconds(item.start_time, item.end_time),
            };
          });
          let etime = new Date().getTime();

          dataMap.pageObj.total = res.data.total_count;
          dataMap.loading = false;
        } else {
          dataMap.loading = false;
          ElMessage.error("获取列表失败，请重试");
        }
      } catch (error) {
        dataMap.loading = false;
        ElMessage.error("获取列表超时，请重试");
      }
    };

    const downLoadOrder = () => {
      dataMap.excelname = `历史回看.xls`;
      dataMap.jsonFields = {
        "头像(avatar_url)": "avatar_url",
        "主播昵称(nickname)": "nickname",
        "直播平台(live_platform)": "live_platform",
        "开播时间(kssj)": "kssj",
        "开播时长(duration)": "duration",
        "直播标题(live_title)": "live_title",
        "观看人次(watch_count)": "watch_count",
        "违规记录(violation_count)": "violation_count",
      };
      dataMap.list = dataMap.tableData;
      if (dataMap.list.length === 0) {
        ElMessage.warning("暂无数据");
      }
    };
    onUnmounted(() => {});
    onMounted(async () => {
      await togetDeptList();
      await toQueryEmployee();
      toQueryHis();
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
    return {
      ...toRefs(dataMap),
      toLivePage,
      radioChange,
      handleCurrentChange,
      handleSizeChange,
      toQueryHis,
      dateChange,
      showPop,
      EditPopRef,
      search,
      toFilterRadio,
      downLoadOrder,
    };
  },
});
</script>
<style lang="scss" scoped></style>
