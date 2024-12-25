<template>
  <!--  运营审查-员工登记 -->
  <div class="employee-regist">
    <div class="page-top">
      <el-form class="search-form">
        <el-form-item class="show-prefix">
          <el-input v-model="searchForm.nickNameOrName" placeholder="请输入主播昵称/姓名">
            <template #prefix>
              <el-icon style="width: 16px; height: 16px">
                <Search />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="直播平台">
          <el-select
            v-model="searchForm.live_platform"
            placeholder="请选择直播平台"
            style="width: 150px"
          >
            <el-option label="不限" value=""></el-option>
            <el-option
              v-for="(item, index) in plateformList"
              :key="index"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所属部门">
          <el-cascader
            v-model="searchForm.dept_id"
            :options="cascaderOptions"
            @change="changeOrg"
            :props="cascaderProps"
            ref="cascaderRef"
          >
          </el-cascader>
        </el-form-item>
        <el-form-item label="账号状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择账号状态"
            style="width: 150px"
          >
            <el-option label="不限" value=""></el-option>
            <el-option label="停用" :value="0"></el-option>
            <el-option label="正常" :value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="监控状态">
          <el-select
            v-model="searchForm.monitor_status"
            placeholder="请选择监控状态"
            style="width: 150px"
          >
            <el-option label="不限" value=""></el-option>
            <el-option label="禁用" :value="0"></el-option>
            <el-option label="启用" :value="1"></el-option>
          </el-select>
        </el-form-item>
        <!-- <el-button type="primary" size="mini" @click="search" class="com-btn"
          >查询</el-button
        >
        <el-button size="mini" type="primary" @click="reset" class="com-btn"
          >重置</el-button
        > -->
      </el-form>
      <div class="right-div">
        <el-button
          color="#3A62F7"
          @click="showPop('add')"
          v-if="isEditor || isAuditor"
          class="com-btn"
        >
          <img src="../../assets/images/add-user.png" alt="" class="icon-img" />
          新增主播
        </el-button>
        <vue3-json-excel
          :json-data="list"
          :fields="jsonFields"
          class="export-btn"
          type="xls"
          :header="excelheader"
          :name="excelname"
          footer
        >
          <el-button size="mini" color="#3A62F7" @click="downLoadOrder" class="com-btn">
            导出数据
          </el-button>
        </vue3-json-excel>
      </div>
    </div>
    <div class="account-manage place-table">
      <div
        class="title"
        style="display: flex; align-items: center; line-height: 32px; margin-bottom: 20px"
        v-if="userInfo.departId == 0 && userInfo.userList.length == 0"
      >
        <div>
          总账户数：{{ tableData.length }} | 已启用
          <span style="color: #58a5ff">{{ monitoringNum }}</span
          >/{{ maxMonitors }}
        </div>
        <div class="progress" style="width: 200px; margin-left: 12px">
          <el-progress
            :percentage="monitorPersent"
            :stroke-width="8"
            :show-text="false"
            color="#58A5FF"
          ></el-progress>
        </div>
      </div>
      <div class="account-main" id="account-main">
        <div class="account-table">
          <!-- 下单管理表格 -->
          <el-table
            :data="
              filterTableData.slice(
                (pageObj.pageIndex - 1) * pageObj.pageSize,
                pageObj.pageIndex * pageObj.pageSize
              )
            "
            size="small"
            highlight-current-row
            fit
            :header-cell-style="{ backgroundColor: '#20283F' }"
            height="calc(100vh - 310px)"
          >
            <el-table-column
              label="主播编号"
              prop="employee_id"
              width="100"
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
              label="昵称"
              prop="nickname"
              width="120"
              align="left"
              show-overflow-tooltip
            />
            <el-table-column
              label="头像"
              prop="avatar_url"
              width="80"
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
              label="类别"
              prop="live_type"
              width="120"
              align="center"
              show-overflow-tooltip
            >
              <template #default="scope">
                {{ scope.row.live_type }}
              </template>
            </el-table-column>
            <el-table-column
              label="姓名"
              prop="name"
              width="100"
              align="center"
              show-overflow-tooltip
            />
            <el-table-column
              label="执业编号"
              prop="identity_id"
              width="180"
              align="center"
              show-overflow-tooltip
            />

            <el-table-column
              label="简介"
              prop="intro"
              width="300"
              align="left"
              show-overflow-tooltip
            />
            <el-table-column
              label="所属部门"
              prop="deptName"
              width="120"
              align="left"
              show-overflow-tooltip
            />

            <!-- <el-table-column label="直播间地址" prop="live_url" width="200" align="left" show-overflow-tooltip /> -->
            <!-- <el-table-column label="授权开始日" prop="sqrq_start" width="100" align="center" show-overflow-tooltip />
            <el-table-column label="授权到期日" prop="sqrq_end" width="100" align="center" show-overflow-tooltip /> -->

            <el-table-column
              label="账号状态"
              prop="status"
              align="left"
              show-overflow-tooltip
            >
              <template #default="scope">
                <div>
                  <span v-if="scope.row.status === 1" style="color: #0fc351">正常</span>
                  <span v-if="scope.row.status === 0" style="color: #ff2323">停用</span>
                  <span v-if="scope.row.status === 2" style="color: #ff2323">已过期</span>
                  <span v-if="scope.row.status === 3" style="color: #ffcb57">待授权</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              label="监控状态"
              prop="monitor_status"
              align="left"
              show-overflow-tooltip
            >
              <template #default="scope">
                <el-switch
                  v-model="scope.row.monitor_status_value"
                  active-color="#0FC351"
                  inactive-color="#373F52"
                  @change="changeMonitorStatus(scope.row)"
                >
                </el-switch>
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              fixed="right"
              align="center"
              v-if="isEditor || isAuditor"
              class-name="fixed-column"
            >
              <template #default="scope">
                <div>
                  <el-button
                    class="oper update-btn mr0"
                    @click="showPop('edit', scope.row)"
                    type="text"
                  >
                    修改
                  </el-button>
                </div>
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
    <EditPop ref="EditPopRef" :departList="departList" @renderList="getList" />
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
  watch,
} from "vue";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import { queryEmployee, changeEmployeeMonitorStatus } from "@/api/runCheck";
import dayjs from "dayjs";
import { Search } from "@element-plus/icons";
import EditPop from "./components/Edit-employee-Pop.vue";
import { plateformDict, plateformList } from "@/utils/dict";
import { ElMessage } from "element-plus";
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
    const cascaderRef = ref(null);
    let store = useStore();
    const dataMap = reactive({
      noUser,
      isEditor: store.state.user.isEditor, // 当前用户是否可以编辑
      isAuditor: store.state.user.isAuditor, // 当前用户是否可以审核
      userInfo: store.state.user, // 当前用户信息
      list: [],
      jsonFields: {},
      excelheader: "主播信息",
      excelname: "导出表格",
      plateformDict,
      zhCn,
      tableData: [],
      filterTableData: [], // 条件筛选过后的列表
      value1: "",
      pageObj: {
        pageIndex: 1,
        pageSize: 10,
        total: 0,
      },
      departList: [], //部门列表
      subDepartmentIds: [], //所有可查看部门的id
      searchForm: {
        nickNameOrName: "",
        live_platform: "",
        dept_id: -1,
        status: "",
        monitor_status: "",
      },
      plateformList,
      cascaderOptions: [], // 部门选择器数据
      cascaderProps: {
        checkStrictly: true, // 允许选择任意一级的选项
      },
      monitoringNum: 0, // 已启用监控的主播数量
      monitorPersent: 0, // 百分比
      maxMonitors: 20, // 最大监控数
    });

    watch(
      () => dataMap.searchForm,
      (newVal, oldVal) => {
        console.log("searchForm", newVal, oldVal);

        search();
      },
      { deep: true }
    );
    const getList = async (data: any) => {
      //请求员工登记列表
      let params = {
        ...data,
        employee_id: dataMap.userInfo.userList,
      };
      console.log("params", params);

      try {
        let res = await queryEmployee(params);
        if (res.ret == 0) {
          let arr = res.data.employees
            .map((item) => {
              return {
                ...item,
                sqrq_start: dayjs(item.start_time * 1000).format("YYYY/MM/DD"),
                sqrq_end: dayjs(item.expires_time * 1000).format("YYYY/MM/DD"),

                sqrq_start_hms: dayjs(item.start_time * 1000).format(
                  "YYYY/MM/DD HH:mm:ss"
                ),
                sqrq_end_hms: dayjs(item.expires_time * 1000).format(
                  "YYYY/MM/DD HH:mm:ss"
                ),
                deptName:
                  dataMap.departList.find((dept) => dept.value === item.dept_id)?.label ||
                  "无",
                monitor_status_value: item.monitor_status === 1 ? true : false,
              };
            })
            .reverse();
          dataMap.tableData = arr.filter((item) =>
            dataMap.subDepartmentIds.includes(item.dept_id)
          );
          dataMap.monitoringNum = arr.filter((item) => item.monitor_status === 1).length;
          dataMap.monitorPersent = (dataMap.monitoringNum / dataMap.maxMonitors) * 100;
          tofilterList();
          // dataMap.tableData = arr;
          //   console.log("子部门id", dataMap.subDepartmentIds);
        }
      } catch (error) {
        ElMessage.error("主播列表接口异常");
      }
    };
    const togetDeptList = async () => {
      try {
        let res: any = await getDeptList();
        if (res.iRet === 0) {
          dataMap.departList = res.data.map((item) => {
            return {
              value: item.auto_inc_id,
              label: item.deptName,
            };
          });
          // 获取 id 为 departId 的部门及其所有子部门的 id
          dataMap.subDepartmentIds = getSubDepartments(
            res.data,
            dataMap.userInfo.departId
          );
          tofillCascader(res);
        }
      } catch (error) {
        ElMessage.error("部门列表接口异常");
      }
    };
    const tofillCascader = (res: any) => {
      let userDeptId = dataMap.userInfo.departId;
      let userDeptName = res.data.find((item: any) => item.auto_inc_id == userDeptId)
        ? res.data.find((item: any) => item.auto_inc_id == userDeptId).deptName
        : "未知";
      console.log("当前账户所属部门", userDeptId);
      // 只展示所属部门以及下面子部门
      if (!userDeptId || userDeptId == 0) {
        dataMap.cascaderOptions = [
          { value: -1, label: "不限", children: [] },
          { value: 0, label: "无", children: [] },
        ].concat(buildTree(res.data));
      } else {
        dataMap.cascaderOptions = [
          { value: -1, label: "不限", children: [] },
          {
            value: Number(userDeptId),
            label: userDeptName,
            children: buildTree(res.data, userDeptId),
          },
        ];
      }
      console.log("部门选择器数据", dataMap.cascaderOptions);
    };
    const buildTree = (data, pid = "0") => {
      const result = [];
      for (const item of data) {
        if (item.pid == pid) {
          const children = buildTree(data, item.auto_inc_id);
          if (children.length) {
            item.children = children;
          } else {
            item.children = [];
          }
          // result.push(item);
          result.push({
            value: item.auto_inc_id,
            label: item.deptName,
            children: item.children,
          });
        }
      }
      return result;
    };
    const changeOrg = (val) => {
      cascaderRef.value.togglePopperVisible();
    };
    onMounted(async () => {
      // 请求部门列表
      await togetDeptList();
      await getList();
    });
    onUnmounted(() => {});
    const showPop = (type: string, row: any = "") => {
      EditPopRef.value.initPop(type, JSON.parse(JSON.stringify(row)));
    };
    const handleCurrentChange = (pageIndex: number) => {
      dataMap.pageObj.pageIndex = pageIndex;
    };
    const handleSizeChange = (pageSize: number) => {
      dataMap.pageObj.pageSize = pageSize;
    };
    const downLoadOrder = () => {
      dataMap.excelname = `主播信息.xls`;
      dataMap.jsonFields = {
        "主播编号(employee_id)": "employee_id",
        "直播平台(live_platform)": "live_platform",
        "昵称(nickname)": "nickname",
        "头像(avatar_url)": "avatar_url",
        "类别(live_type)": "live_type",
        "姓名(name)": "name",
        "执业编号(identity_id)": "identity_id",
        "简介(intro)": "intro",
        "所属部门(deptName)": "deptName",
        "状态(status)": "status",
      };

      dataMap.list = dataMap.tableData;
      if (dataMap.list.length === 0) {
        ElMessage.warning("暂无数据");
      }
    };
    const changeMonitorStatus = async (row: any) => {
      let params = {
        employee_id: row.employee_id,
        monitor_status: row.monitor_status_value ? 1 : 0,
      };
      try {
        let res = await changeEmployeeMonitorStatus(params);
        if (res.ret === 0) {
          ElMessage.success(`已${row.monitor_status_value ? "启用" : "停用"}监控`);
        } else {
          ElMessage.error(`操作失败，${res.msg}`);
          row.monitor_status_value = !row.monitor_status_value;
        }
      } catch (error) {
        ElMessage.error("监控状态接口异常");
        row.monitor_status_value = !row.monitor_status_value;
      }
    };
    const search = () => {
      let _obj = {};
      for (let key in dataMap.searchForm) {
        if (dataMap.searchForm[key] !== "") {
          _obj[key] = dataMap.searchForm[key];
          if (key === "dept_id") {
            _obj[key] = Array.isArray(_obj[key])
              ? _obj[key][_obj[key].length - 1]
              : _obj[key] || 0;
            // 部门选不限时
            _obj[key] = _obj[key] === -1 ? "" : _obj[key];
          }
        }
      }
      tofilterList(_obj);
    };
    // const reset = () => {
    //   dataMap.searchForm = {
    //     nickNameOrName: "",
    //     live_platform: "",
    //     dept_id: -1,
    //     status: "",
    //     monitor_status: "",
    //   };
    //   tofilterList();
    // };
    // 前端筛选列表 searchForm + pageObj   type  all 不限  page 仅分页
    const tofilterList = (data: any = {}, type: any = "all") => {
      let tmp = dataMap.tableData;
      if (data) {
        console.log("筛选条件", data);
        for (let key in data) {
          if (key === "nickNameOrName") {
            tmp = tmp.filter((item) => {
              if (
                (item.nickname && item.nickname.includes(data[key])) ||
                (item.name && item.name.includes(data[key]))
              ) {
                return true;
              } else {
                return false;
              }
            });
          } else {
            tmp = tmp.filter((item) => {
              return (
                item[key] !== undefined &&
                item[key] !== null &&
                item[key] !== "" &&
                item[key].toString().includes(data[key].toString())
              );
            });
          }
        }
      }
      dataMap.filterTableData = tmp;
      dataMap.pageObj.total = dataMap.filterTableData.length;
    };
    return {
      ...toRefs(dataMap),
      EditPopRef,
      showPop,
      getList,
      handleCurrentChange,
      handleSizeChange,
      downLoadOrder,
      changeMonitorStatus,
      search,
      //   reset,
      changeOrg,
      cascaderRef,
    };
  },
});
</script>
<style lang="scss" scoped>
.employee-regist {
  .page-top {
    margin-bottom: 20px;
    height: 68px;
    font-size: 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left: 24px;
  }

  .account-manage {
    padding: 20px;
  }
  .account-table tr td:last-child {
    background: #0f1425 !important;
  }

  .search-form .el-form-item--mini.el-form-item {
    margin-bottom: 0 !important;
    margin-right: 20px;
  }
  .el-switch {
    width: 32px;
    height: 16px;
    line-height: 16px;
    overflow: hidden;
    border-radius: 20px;
    :deep(.el-switch__core .el-switch__action) {
      scale: 0.9;
    }
  }

  .el-switch:not(.is-checked) {
    :deep(.el-switch__core .el-switch__action) {
      background: #838ba1 !important;
    }
  }
  .el-progress {
    :deep(.el-progress-bar__outer) {
      background: #373f52 !important;
    }
  }
}
</style>
