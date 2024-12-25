<template>
  <!--  运营审查-直播配置 -->
  <div class="live-config">
    <div class="page-top">
      <div class="left">
        <div class="ask-search-line">
          <!-- 选择账号类型 -->
          <div style="margin-right: 16px">选择账号：</div>
          <el-select v-model="employee_id" @change="toQueryLive" filterable>
            <el-option label="全部" value=""></el-option>
            <el-option
              :label="item.label"
              :value="item.value"
              v-for="item in employeeList"
              :key="item.id"
            >
              <template #default>
                <img
                  :src="item.avatar_url"
                  alt=""
                  style="
                    width: 22px;
                    height: 22px;
                    margin-right: 5px;
                    border-radius: 50%;
                    vertical-align: middle;
                  "
                />
                {{ item.label }}({{ plateformList[item.live_platform] }})
              </template>
            </el-option>
          </el-select>
        </div>
      </div>
      <div>
        <el-button
          size="mini"
          color="#3A62F7"
          style="margin-right: 10px"
          @click="showPop('add')"
          v-if="isEditor"
        >
          新增直播计划
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
          <el-button size="mini" color="#3A62F7" @click="downLoadOrder"
            >导出数据</el-button
          >
        </vue3-json-excel>
        <!-- <el-button size="mini" color="#3A62F7" @click="downLoadOrder">导出数据</el-button> -->
      </div>
    </div>
    <div class="account-manage place-table">
      <div class="table-top">共{{ pageObj.total }}场直播计划</div>
      <div class="account-main" id="account-main">
        <div class="account-table">
          <el-table
            :data="tableData"
            size="small"
            highlight-current-row
            fit
            :header-cell-style="{ backgroundColor: '#20283F' }"
            height="calc(100vh - 302px)"
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
              label="计划开始时间"
              prop="kssj"
              width="150"
              align="center"
              show-overflow-tooltip
            />
            <el-table-column
              label="计划结束时间"
              prop="jssj"
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
            <el-table-column
              label="直播内容"
              prop="live_content"
              align="left"
              show-overflow-tooltip
            />

            <el-table-column
              label="直播材料"
              width="80"
              prop="live_script_files"
              align="left"
              show-overflow-tooltip
            >
              <template #default="scope">
                <div
                  class="underline"
                  @click="downloadFile(scope.row.live_script_url)"
                  title="点击下载"
                  style="width: 18px; height: 18px; cursor: pointer; margin-left: 15px"
                  v-if="scope.row.live_script_url"
                >
                  <el-popover placement="right" :width="400" trigger="hover">
                    <template #reference>
                      <Folder />
                    </template>
                    <template #default>
                      <div
                        v-for="(item, index) in scope.row.live_script_files"
                        :key="index"
                      >
                        <div>{{ item }}</div>
                      </div>
                    </template>
                  </el-popover>
                </div>
                <div v-else style="width: 18px; height: 18px; margin-left: 18px"></div>
              </template>
            </el-table-column>

            <el-table-column
              label="推流信息"
              prop="push_addr"
              align="left"
              show-overflow-tooltip
            >
              <template #default="scope">
                <el-button
                  type="text"
                  @click="showPushInfoPop(scope.row)"
                  v-if="scope.row.push_addr || scope.row.push_code"
                  >查看</el-button
                >
                <span v-else style="margin-left: 20px">无</span>
              </template>
            </el-table-column>
            <el-table-column
              label="审核状态"
              prop="review_status"
              width="100"
              align="left"
              show-overflow-tooltip
            >
              <template #default="scope">
                <div :style="{ color: auditStatusColorDict[scope.row.review_status] }">
                  {{ auditStatusDict[scope.row.review_status] }}
                </div>
              </template>
            </el-table-column>

            <el-table-column
              label="操作"
              width="260"
              fixed="right"
              align="center"
              v-if="isEditor || isAuditor"
              class-name="fixed-column"
            >
              <template #default="scope">
                <el-button
                  class="oper update-btn"
                  :class="{ disabled: scope.row.cant_update }"
                  type="text"
                  @click="showPop('edit', scope.row)"
                  :disabled="scope.row.cant_update || scope.row.timeout"
                  :title="
                    scope.row.cant_update
                      ? '已结束，无法修改'
                      : scope.row.timeout
                      ? '报备时间段已过'
                      : '修改'
                  "
                  v-if="isEditor"
                >
                  {{ scope.row.review_status == 3 ? "修改" : "修改" }}
                </el-button>
                <el-button
                  class="oper update-btn"
                  :class="{ disabled: scope.row.review_status == 3 }"
                  type="text"
                  @click="pass(scope.row)"
                  :disabled="scope.row.review_status == 3 || scope.row.timeout"
                  :title="
                    scope.row.review_status == 3
                      ? '已通过'
                      : scope.row.timeout
                      ? '报备时间段已过'
                      : '审核通过'
                  "
                  v-if="isAuditor"
                >
                  审核通过
                </el-button>
                <el-button
                  class="oper delete-btn"
                  :class="{ disabled: scope.row.review_status != 1 }"
                  type="text"
                  @click="userDelPop(scope.row)"
                  :disabled="scope.row.review_status != 1 || scope.row.timeout"
                  :title="
                    scope.row.review_status == 1
                      ? '删除'
                      : scope.row.timeout
                      ? '报备时间段已过'
                      : '已审核，不可删除'
                  "
                  v-if="isAuditor"
                >
                  删除
                </el-button>
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
                :page-sizes="[1, 3, 5, 10, 20, 30, 40]"
                :page-size="pageObj.pageSize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="pageObj.total"
              ></el-pagination>
            </el-config-provider>
          </div>
        </div>
      </div>
    </div>
    <EditPop ref="EditPopRef" @renderList="toQueryLive" />
    <!-- 删除用户 -->
    <DelUserTPL
      ref="delUserPopRef"
      @renderList="toQueryLive"
      :delPopTitle="delPopTitle"
    ></DelUserTPL>
    <el-dialog
      custom-class=""
      v-model="dialogVisible"
      :close-on-click-modal="false"
      title="推流信息"
    >
      <div class="push-info">
        <div class="info-item">
          <span>推送地址</span>
          <span>{{ pushInfo.push_addr }}</span>
          <span class="copy-btn" @click="copy(pushInfo.push_addr)">复制地址</span>
        </div>
        <div class="info-item">
          <span>推送密钥</span>
          <span>{{ pushInfo.push_code }}</span>
          <span class="copy-btn" @click="copy(pushInfo.push_code)">复制密钥</span>
        </div>
        <p class="tips">注释：推流地址在开播前20分钟生效，开播过程请勿断播超过10分钟。</p>
      </div>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { defineComponent, reactive, toRefs, onMounted, onUnmounted, ref } from "vue";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import {
  queryEmployee,
  queryLiveReport,
  auditLiveReportInfo,
  deleteLiveReportInfo,
} from "@/api/runCheck";
import dayjs from "dayjs";
import { Search, Folder } from "@element-plus/icons";
import EditPop from "./components/EditPop.vue";
import { plateformDict, auditStatusDict, auditStatusColorDict } from "@/utils/dict";
import { ElMessage } from "element-plus";
import { useStore } from "vuex";
import DelUserTPL from "./components/del-user-pop";
import { getDeptList } from "@/api/user";
import { getSubDepartments } from "@/utils/validate.js";
import noUser from "@/assets/images/no-user.jpg";

export default defineComponent({
  name: "LiveConfig",
  components: {
    Search,
    EditPop,
    Folder,
    DelUserTPL,
  },
  setup() {
    const EditPopRef = ref(null);
    const delUserPopRef = ref();
    let store = useStore();
    const dataMap = reactive({
      noUser,
      isEditor: store.state.user.isEditor, // 当前用户是否可以编辑
      isAuditor: store.state.user.isAuditor, // 当前用户是否可以审核
      userInfo: store.state.user, // 当前用户信息
      list: [],
      jsonFields: {},
      excelheader: "直播报备",
      excelname: "导出表格",
      zhCn,
      tableData: [],
      date_range: "",
      timeType: "radio",
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
      auditStatusDict,
      auditStatusColorDict,
      plateformList: Object.values(plateformDict),

      delPopTitle: "",
      loading: false,
      accessDeptIds: [], // 所属部门+子部门列表
      accessEmployeeIds: [], // 所属部门+子部门下的主播列表
      pushInfo: {
        push_addr: "",
        push_code: "",
      },
      dialogVisible: false,
    });

    const handleCurrentChange = (pageIndex: number) => {
      dataMap.pageObj.pageIndex = pageIndex;
      toQueryLive();
    };
    const handleSizeChange = (pageSize: number) => {
      dataMap.pageObj.pageSize = pageSize;
      toQueryLive();
    };
    const search = () => {
      toQueryLive();
    };
    const showPop = (type: string, row: any = "") => {
      //   console.log("dataMap.employeeList===>", dataMap.employeeList);
      EditPopRef.value.initPop(type, JSON.parse(JSON.stringify(row)));
      EditPopRef.value.liveReportList = dataMap.tableData;
      if (type === "add") {
        EditPopRef.value.employeeList = dataMap.employeeList;
      }
    };

    const toQueryLive = async () => {
      dataMap.loading = true;
      let stime = new Date().getTime();
      //请求员工登记列表
      // 主播入参  如果数据权限为空，说明不做数据权限隔离，用实时的部门筛选出来的主播列表隔离。如果不为空，则用userList存放的数据权限隔离
      let idlist = [];
      idlist =
        dataMap.userInfo.userList.length > 0
          ? dataMap.userInfo.userList
          : dataMap.accessEmployeeIds;
      let params = {
        employee_id: dataMap.employee_id ? [dataMap.employee_id] : idlist,
        page_number: dataMap.pageObj.pageIndex,
        page_size: dataMap.pageObj.pageSize,
      };
      let jkstime = new Date().getTime();
      try {
        let res = await queryLiveReport(params);

        if (res.ret == 0) {
          dataMap.tableData = res.data.live_reports.map((item) => {
            return {
              ...item,
              kssj: dayjs(item.start_time * 1000).format("YYYY-MM-DD HH:mm"),
              jssj: dayjs(item.end_time * 1000).format("YYYY-MM-DD HH:mm"),
              cant_update:
                item.review_status == 3 && item.end_time < new Date().getTime() / 1000, //true 禁止修改
              timeout: item.end_time < new Date().getTime() / 1000, // true 超时了
              //   push_addr: item.push_addr || "test_addr",
              //   push_code: item.push_code || "test_code",
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
              avatar_url: item.avatar_url,
              live_platform: item.live_platform,
            };
          });
        dataMap.accessEmployeeIds = dataMap.employeeList.map((item) => item.value);
        // console.log("员工列表", dataMap.employeeList);
      }
    };

    const downLoadOrder = () => {
      dataMap.excelname = `直播报备.xls`;
      dataMap.jsonFields = {
        "头像(avatar_url)": "avatar_url",
        "主播昵称(nickname)": "nickname",
        "直播平台(live_platform)": "live_platform",
        "计划开始时间(kssj)": "kssj",
        "计划结束时间(jssj)": "jssj",
        "直播标题(live_title)": "live_title",
        "直播材料(stream_url)": "stream_url",
        "审核状态(review_status)": "review_status",
      };
      dataMap.list = dataMap.tableData;
      if (dataMap.list.length === 0) {
        ElMessage.warning("暂无数据");
      }
    };
    const pass = async (row: any) => {
      let params = {
        id: row.id,
        status: 3,
      };
      let res = await auditLiveReportInfo(params);
      if (res.ret == 0) {
        ElMessage.success("审核通过");
        dataMap.tableData = dataMap.tableData.map((item) => {
          if (item.id === row.id) {
            item.review_status = 3;
            item.push_addr = res.data.push_addr;
            item.push_code = res.data.push_code;
          }
          return item;
        });
      } else {
        ElMessage.error("操作失败");
      }
    };

    /**
     * 删除用户弹窗
     * */
    const userDelPop = (rowData: any) => {
      delUserPopRef.value.userDelForm = {
        id: rowData.id,
        nickname: rowData.nickname,
        live_title: rowData.live_title,
      };

      dataMap.delPopTitle = `您确定要删除【${rowData.nickname}-${rowData.live_title}】直播计划吗？`;
      delUserPopRef.value.openUserPop = true;
    };
    const downloadFile = (url) => {
      console.log("下载直播材料", url);
      // 创建一个隐藏的 a 元素
      const link = document.createElement("a");
      link.href = url;
      link.download = "直播材料压缩包"; // 设置下载文件的名称，可选
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    //请求审核通过接口
    onUnmounted(() => {});
    onMounted(async () => {
      // 请求部门列表
      await togetDeptList();
      await toQueryEmployee();
      toQueryLive();
    });
    const togetDeptList = async () => {
      let res: any = await getDeptList();
      if (res.iRet === 0) {
        // 获取 id 为 departId 的部门及其所有子部门的 id
        dataMap.accessDeptIds = getSubDepartments(res.data, dataMap.userInfo.departId);
        console.log("子部门", dataMap.accessDeptIds);
      }
    };
    // 查看推流信息
    const showPushInfoPop = (data: any) => {
      console.log("查看推流信息", data);
      dataMap.dialogVisible = true;
      dataMap.pushInfo = {
        push_addr: data.push_addr,
        push_code: data.push_code,
      };
    };
    const copy = (text: string) => {
      const input = document.createElement("input");
      input.value = text;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      ElMessage.success("复制成功");
    };
    return {
      ...toRefs(dataMap),

      handleCurrentChange,
      handleSizeChange,
      toQueryLive,
      showPop,
      EditPopRef,
      search,
      downLoadOrder,
      pass,
      downloadFile,
      delUserPopRef,
      userDelPop,
      showPushInfoPop,
      copy,
    };
  },
});
</script>
<style lang="scss" scoped>
.live-config {
  .page-top {
    min-height: 68px;
    font-size: 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;
    .ask-search-line {
      display: flex;
      width: 100%;
      align-items: center;
      .search-label {
        flex: 1;
        font-size: 14px;
        line-height: 32px;
        min-width: 85px;
      }

      :deep(.el-radio-button .el-radio-button__inner) {
        border-radius: 4px !important;
        background-color: #242d4d;
        border-color: transparent;
        color: #838ba1;
      }
    }
  }
  .table-top {
    height: 40px;
    line-height: 1;
  }

  .underline {
    // 文本下划线
    text-decoration: underline;
    cursor: pointer;
    &:hover {
      color: #3a62f7;
    }
  }
  .oper.disabled {
    color: #636873 !important;
  }
}
.push-info {
  line-height: 32px;
  .info-item {
    position: relative;
    margin-bottom: 16px;
    line-height: 36px;
    span {
      flex: 1;
      margin-right: 10px;
      font-size: 14px;
    }
    .copy-btn {
      position: absolute;
      right: 0;
      top: 0;
      color: #3a62f7;
      cursor: pointer;
      margin-left: 10px;
      text-decoration: underline;
    }
  }
  .tips {
    color: #ffcb57;
    font-size: 12px;
    line-height: 12px;
  }
}
</style>
