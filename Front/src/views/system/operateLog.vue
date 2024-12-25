<template>
  <!-- 操作日志查询 -->
  <div class=" ">
    <el-row>
      <el-col :span="24">
        <div class="right-side">
          <div class="opr-btn">
            <el-button type="text" @click="reSearch">
              <img
                style="width: 12px; height: 12px; margin-right: 4px"
                src="@/assets/images/refresh.png"
              />
              刷新
            </el-button>
          </div>

          <div class="page-top">
            <el-form :model="searchForm" inline>
              <el-form-item label="用户账号">
                <el-input
                  v-model="searchForm.userId"
                  placeholder="请输入用户账号"
                ></el-input>
              </el-form-item>
              <el-form-item label="内容">
                <el-input
                  v-model="searchForm.cnt"
                  placeholder="请输入日志内容"
                ></el-input>
              </el-form-item>
              <el-form-item label="类型">
                <el-select v-model="searchForm.logType" placeholder clearable>
                  <el-option
                    v-for="item of logType"
                    :key="item.value"
                    :value="item.value"
                    :label="item.name"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="时间">
                <el-date-picker
                  type="daterange"
                  v-model="searchForm.auto_create_time"
                  placeholder
                ></el-date-picker>
              </el-form-item>
              <el-form-item label>
                <el-button type="primary" @click="search">查询</el-button>

                <!-- <el-button type="danger" style="margin-left:10px !important" @click="logPop">日志配置</el-button> -->
              </el-form-item>
            </el-form>
          </div>
          <div class="account-manage">
            <el-table
              style=""
              height="calc(100vh - 234px)"
              :data="tableData"
              size="small"
            >
              <!-- <el-table-column type="expand">
                  <template #default="props">
                    <div style="padding:0 20px;font-size:13px;color:#999">
                      <p>操作类型:{{ props.row.logType }}</p>
                      <p>操作内容: {{ props.row.cnt }}</p>
                    </div>
                  </template>
                </el-table-column>-->
              <el-table-column
                label="用户账号"
                width="150"
                prop="userId"
              ></el-table-column>
              <el-table-column
                label="用户名称"
                width="150"
                prop="realName"
              ></el-table-column>
              <el-table-column label="操作类型" width="80" align="center">
                <template #default="scope">{{ logDict[scope.row.logType] }}</template>
              </el-table-column>
              <el-table-column
                label="操作内容"
                prop="cnt"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                label="操作时间"
                width="180"
                prop="ctime"
              ></el-table-column>
              <el-table-column label="备注" width="200" prop></el-table-column>
            </el-table>
            <div style="text-align: right">
              <el-pagination
                small
                layout="sizes, prev, pager, next"
                @size-change="sizeChange"
                :page-sizes="[20, 50, 100]"
                :page-size="searchForm.pageSize"
                :total="total"
                @current-change="pageChange"
                :current-page="searchForm.pageIndex"
              ></el-pagination>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from "vue";
import { Refresh } from "@element-plus/icons";
import { cleanLogReq, getOperLogList } from "@/api/log";
import dayjs from "dayjs";
import { useStore } from "vuex";
import { ElMessage } from "element-plus";
import { getDeptList, getUserReq } from "@/api/user";
import { getSubDepartments } from "@/utils/validate.js";
import { logType, logDict } from "@/utils/dict.ts";
export default defineComponent({
  components: {
    Refresh,
  },
  setup() {
    let store = useStore();
    let tableData = ref([]);
    // let logType = [
    //   {
    //     value: 1,
    //     name: "管理",
    //   },
    //   {
    //     value: 2,
    //     name: "登录",
    //   },
    //   {
    //     value: 3,
    //     name: "错误",
    //   },
    //   {
    //     value: 4,
    //     name: "新增",
    //   },
    //   {
    //     value: 5,
    //     name: "修改",
    //   },
    //   {
    //     value: 6,
    //     name: "审核",
    //   },
    //   {
    //     value: 7,
    //     name: "删除",
    //   },
    //   {
    //     value: "",
    //     name: "全部",
    //   },
    // ];
    // let logDict: any = {
    //   1: "管理",
    //   2: "登录",
    //   3: "错误",
    //   4: "新增",
    //   5: "修改",
    //   6: "审核",
    //   7: "删除",
    // };
    let searchForm: any = reactive({
      userId: "",
      cnt: "",
      logType: "",
      auto_create_time: null,
      pageSize: 20,
      pageIndex: 1,
    });
    let formData = reactive({ value: "1" });

    let total = ref(0);
    let globalSetting = ref("0");
    let globalArr: any = ref([]);

    let departList = reactive([]);
    let subDepartmentIds = reactive([]);
    let userIdByDept = reactive([]);
    const togetDeptList = async () => {
      let res: any = await getDeptList();
      if (res.iRet === 0) {
        departList = res.data.map((item) => {
          return {
            value: item.auto_inc_id,
            label: item.deptName,
          };
        });
        // 获取 id 为 departId 的部门及其所有子部门的 id
        subDepartmentIds = getSubDepartments(res.data, store.state.user.departId);
        console.log("部门子ID", subDepartmentIds);
        let userRes = await getUserReq({ departId: subDepartmentIds });
        if (userRes.iRet === 0) {
          userIdByDept = userRes.data.map((item) => {
            if (subDepartmentIds.includes(Number(item.deptId))) {
              return item.auto_inc_id;
            }
          });
        }
      }
    };

    let search = () => {
      searchForm.pageIndex = 1;
      getLogs();
    };
    let getLogs = async () => {
      let req: any = JSON.parse(JSON.stringify(searchForm));
      if (req.auto_create_time && req.auto_create_time.length > 0) {
        req.auto_create_time[0] = dayjs(req.auto_create_time[0]).format(
          "YYYY-MM-DDTHH:mm:ssZ[Z]"
        );
        req.auto_create_time[1] = dayjs(req.auto_create_time[1])
          .add(1, "day")
          .format("YYYY-MM-DDTHH:mm:ssZ[Z]");
      }
      req.userIdByDept = userIdByDept;
      // 根据登录账号 进行判断展示
      //   req.orgId = store.state.user.userOrg;
      let res = await getOperLogList(req);
      if (res.iRet === 0) {
        res.data.forEach((item: any) => {
          item.ctime = dayjs(item.auto_create_time).format("YYYY/MM/DD HH:mm:ss");
        });
        tableData.value = res.data;
        total.value = res.total;
        // console.log('total', total.value);
      }
    };
    let reSearch = () => {
      searchForm.userId = "";
      searchForm.cnt = "";
      searchForm.logType = "";
      searchForm.auto_create_time = null;
      searchForm.pageIndex = 1;
      getLogs();
    };
    let pageChange = (e: any) => {
      searchForm.pageIndex = e;
      getLogs();
    };
    let sizeChange = (e: any) => {
      searchForm.pageIndex = 1;
      searchForm.pageSize = e;
      getLogs();
    };
    let getConfig = () => {
      globalSetting.value = "1";
    };

    // togetDeptList();

    getConfig();
    getLogs();
    return {
      tableData,
      searchForm,
      formData,
      reSearch,
      search,
      total,
      dayjs,
      pageChange,
      logType,
      logDict,
      sizeChange,
      globalSetting,
    };
  },
});
</script>
<style lang="scss" scoped>
.el-form-item--mini {
  :deep(.el-form-item__label) {
    line-height: 32px !important;
  }
}
.page-top {
  padding-left: 24px;
  height: 68px;
  display: flex;
  align-items: center;
  :deep(.el-range-editor--mini.el-input__inner) {
    margin-left: 0 !important;
  }
}
.el-form-item--mini.el-form-item {
  margin-bottom: 0 !important;
}
</style>
