<template>
  <!-- 员工管理 -->
  <div>
    <el-row>
      <el-col :span="24">
        <div class="right-side">
          <div class="opr-btn">
            <el-button type="text" @click="refresh">
              <img
                style="width: 12px; height: 12px; margin-right: 4px"
                src="@/assets/images/refresh.png"
              />
              刷新
            </el-button>
          </div>

          <div class="page-top">
            <el-form inline>
              <el-form-item label="用户名称">
                <el-input
                  v-model="searchForm.value"
                  clearable
                  placeholder="请输入用户名称/账号"
                ></el-input>
              </el-form-item>
              <el-form-item label>
                <el-button type="primary" @click="getUserList">查询</el-button>
                <el-button
                  type="primary"
                  style="margin-left: 10px !important"
                  @click="userPop('add')"
                  v-if="userObj.isEditor"
                >
                  创建用户
                </el-button>
              </el-form-item>
            </el-form>
          </div>

          <div class="account-manage">
            <el-table
              height="calc(100vh - 273px)"
              :data="tableData"
              size="small"
              class="system-table"
            >
              <el-table-column
                label="用户编号"
                prop="auto_inc_id"
                width="150"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                label="用户账号"
                prop="userbasic_uid"
                width="150"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                label="用户名称"
                prop="realname"
                width="150"
                show-overflow-tooltip
              ></el-table-column>
              <!-- <el-table-column label="用户角色" prop="accountType"  ></el-table-column> -->
              <el-table-column
                label="用户角色"
                prop="roleTypeStr"
                width="150"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                label="数据权限"
                prop="userListStr"
                width="200"
                show-overflow-tooltip
              >
                <template #default="scope">{{ scope.row.userListStr }}</template>
              </el-table-column>

              <el-table-column
                label="所属部门"
                align="center"
                prop="deptName"
                show-overflow-tooltip
              ></el-table-column>

              <el-table-column
                label="创建时间"
                prop="cTime"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                label="操作"
                fixed="right"
                align="center"
                width="260"
                v-if="userObj.isEditor"
                class-name="fixed-column"
              >
                <template #default="scope">
                  <template v-if="scope.row.userbasic_uid !== 'admin'">
                    <el-button
                      class="update-btn"
                      type="text"
                      @click="userPop('edit', scope.row)"
                      >修改</el-button
                    >
                    <el-button
                      class="update-btn"
                      type="text"
                      @click="userPwdPop(scope.row)"
                      >重置密码</el-button
                    >
                  </template>
                  <!-- <el-button type="text" :icon="Document" @click="userLogPop(scope.row)">查看日志</el-button> -->
                  <el-button
                    v-if="scope.row.mgrtype !== 'S'"
                    type="text"
                    class="delete-btn"
                    @click="userDelPop(scope.row)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <div class="block">
              <el-pagination
                small
                layout="sizes, prev, pager, next"
                v-model:page-size="searchForm.pageSize"
                :total="total"
                :page-sizes="[20, 50, 100]"
                @size-change="sizeChange"
                @current-change="pageChange"
                :current-page="searchForm.pageIndex"
              ></el-pagination>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
    <!-- 编辑/添加员工 -->
    <!-- 编辑/添加员工 -->
    <SetUserTPL
      ref="setUserPopRef"
      @getUserList="getUserList"
      :setType="setType"
      :roleList="roleList"
    ></SetUserTPL>

    <!-- 重置密码 -->
    <SetUserPwdTPL ref="setUserPwdPopRef"></SetUserPwdTPL>

    <!-- 删除用户 -->
    <DelUserTPL
      ref="delUserPopRef"
      @getUserList="getUserList"
      :delPopTitle="delPopTitle"
    ></DelUserTPL>
    <!-- 查看日志 -->
    <GetLog ref="getLogPopRef"></GetLog>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  ref,
  nextTick,
  toRefs,
  onMounted,
  computed,
} from "vue";
import { useStore } from "vuex";
import dayjs from "dayjs";
import { getRoleReq, getUserReq, setUserReq, getDeptList } from "@/api/user";
import { queryEmployee } from "@/api/runCheck";
import { Refresh, Collection, Edit, Delete, Lock, Document } from "@element-plus/icons";

// import TreeDept from '@/components/treeTemplate';
import SetUserTPL from "./components/user/set-user-pop";
import SetUserPwdTPL from "./components/user/set-user-password";
import GetLog from "./components/user/get-log-pop.vue";
import DelUserTPL from "./components/user/del-user-pop";
// import { getDepartList } from '@/api/department';
import { getSubDepartments } from "@/utils/validate.js";
export default defineComponent({
  name: "EmployeeManage",
  components: {
    // TreeDept,
    SetUserTPL,
    SetUserPwdTPL,
    DelUserTPL,
    GetLog,
  },

  setup() {
    const userTreeDeptRef = ref();
    const setUserPopRef = ref();
    const setUserPwdPopRef = ref();
    const delUserPopRef = ref();
    const getLogPopRef = ref();
    const store = useStore();
    const dataMap = reactive({
      userObj: {
        isEditor: store.state.user.isEditor, // 当前用户是否可以编辑
        isAuditor: store.state.user.isAuditor, // 当前用户是否可以审核
        userList: store.state.user.userList, // 用户列表
        departId: store.state.user.userDept, // 公司id
      },
      setType: "add",
      searchForm: {
        value: "",
        pageIndex: 1,
        pageSize: 20,
      },
      delPopTitle: "",
      roleList: [],
      tableData: [],
      total: 0,
      orgid() {
        return store.state.user.userOrg;
      },
      employeeList: [], // 主播列表
      departList: [],
      subDepartmentIds: [], // 子部门id集合
    });

    // 获取所有角色信息
    const queryAllRole = async () => {
      let retRoleData = await getRoleReq({});
      if (retRoleData.iRet === 0 && retRoleData.data.length > 0) {
        let _temp: any = [];
        for (let item of retRoleData.data) {
          // 当前用户非超管 过滤掉角色id为1的角色
          if (store.state.user.userMgrType !== "S" && item.auto_inc_id === 1) continue;
          _temp.push({
            label: item.roleName,
            value: `${item.auto_inc_id}`,
            type: `${item.roleType}`,
            departid: `${item.departId}`,
          });
        }
        dataMap.roleList = _temp;
      }
    };

    //获取用户集合
    function getUserList() {
      let req: any = {
        value: dataMap.searchForm.value,
        pageSize: dataMap.searchForm.pageSize,
        pageIndex: dataMap.searchForm.pageIndex,
        stype: store.state.user.userMgrType,
      };

      if (req) setData(req);
    }
    async function setData(req: any) {
      req["subDepartmentIds"] = dataMap.subDepartmentIds;
      let res = await getUserReq(req);
      res.iRet === 0 &&
        res.data.forEach((item: any) => {
          // item.accountType = item.userbasic_usertype === 'A' ? '管理员' : '交易员';
          item.deptName =
            dataMap.departList.find((d) => d.value == item.departid)?.label || "无"; // 公司名称从角色里取

          item.cTime = dayjs(item.auto_create_time).format("YYYY-MM-DD HH:mm:ss");
          item.roleTypeStr =
            item.mgrtype === "S"
              ? "超级管理员"
              : dataMap.roleList.filter(
                  (r) => r.value === JSON.parse(item.userbasic_rids)[0]
                )[0]?.label || "无";
          item.userListStr = item.userList
            ? JSON.parse(item.userList)
                .map(
                  (user) => dataMap.employeeList.find((emp) => emp.value == user)?.label
                )
                .join(",")
            : "";
        });

      // 现根据时间排，然后超管放最前面
      let arr = res.data.sort((a, b) => {
        if (a.auto_create_time < b.auto_create_time) {
          return 1;
        } else if (a.auto_create_time > b.auto_create_time) {
          return -1;
        } else {
          return 0;
        }
      });

      // dataMap.tableData = arr.sort((a, b) => {
      //   if (a.mgrtype === 'S') {
      //     return -1; // 如果 a 的 type 是 'S'，则 a 排在 b 前面
      //   }
      //   if (b.mgrtype === 'S') {
      //     return 1; // 如果 b 的 type 是 'S'，则 b 排在 a 前面
      //   }
      //   // 对于其他类型的元素，按照默认顺序排序
      //   return 0;
      // });
      dataMap.tableData = arr;
      dataMap.total = res.total;
    }

    function pageChange(e: any) {
      dataMap.searchForm.pageIndex = e;
      getUserList();
    }
    function sizeChange(e: any) {
      dataMap.searchForm.pageSize = e;
      dataMap.searchForm.pageIndex = 1;
      getUserList();
    }

    function refresh() {
      dataMap.searchForm.pageIndex = 1;
      dataMap.searchForm.value = "";
      getUserList();
    }

    /**
     * 创建/编辑用户弹窗
     * */
    const userPop = (type: string, rowData?: any): void => {
      console.log("传入row", rowData);
      dataMap.setType = type;
      setUserPopRef.value.openUserPop = true;
      setUserPopRef.value.init();
      nextTick(() => {
        // let hasZcb: any = false;
        if (type === "add") {
        } else {
          // setUserPopRef.value.hasZcb = hasZcb;
          // setUserPopRef.value.userExtraParams = userExtraParams;
          setUserPopRef.value.userForm = {
            uid: rowData.userbasic_uid,
            password: "",
            secondPwd: "",
            userType: rowData.userbasic_usertype,
            rIds: rowData.userbasic_rids ? JSON.parse(rowData.userbasic_rids)[0] : "", //rowData.rIds === ''?'':(JSON.parse(rowData.rIds))[0],
            departId: Number(rowData.departid) || 0,
            orgId: `${rowData.orgid}`,
            realName: rowData.realname,
            stopMoney: rowData.stopmoney,
            phone: rowData.userbasic_exinfo_telno,
            userbasic_usertype: rowData.userbasic_usertype,
            mgrtype: rowData.mgrtype,
            userList: rowData.userList ? JSON.parse(rowData.userList) : [],
          };
        }
      });
    };

    /**
     * 修改密码弹窗
     * */
    const userPwdPop = (rowData: any) => {
      setUserPwdPopRef.value.userPwdForm = {
        uid: rowData.userbasic_uid,
        realName: rowData.realname,
        userType: rowData.userbasic_usertype,
        mgrType: rowData.mgrtype,
        password: "",
        secondPwd: "",
      };

      setUserPwdPopRef.value.openUserPop = true;
    };

    /**
     * 删除用户弹窗
     * */
    const userDelPop = (rowData: any) => {
      console.log("删除", rowData);

      delUserPopRef.value.userDelForm = {
        uid: rowData.userbasic_uid,
        realName: rowData.realname,
        userType: rowData.userbasic_usertype,
        mgrType: rowData.mgrtype,
        departId: rowData.departid,
        orgId: rowData.orgid,
      };

      dataMap.delPopTitle = `您确定要删除用户${rowData.realname}吗？`;
      delUserPopRef.value.openUserPop = true;
      console.log("删除弹窗");
    };
    async function changeStatus(e: any) {
      let req = {
        userbasic_uid: e.userbasic_uid,
        userbasic_usertype: e.userbasic_usertype,
        mgrtype: e.mgrtype,
        userbasic_rids: JSON.parse(e.userbasic_rids)[0],
        userbasic_userstatus: e.userbasic_userstatus,
      };
      let res = await setUserReq(req, "update");
    }
    function userLogPop(e: any) {
      getLogPopRef.value.show = true;
      getLogPopRef.value.searchForm.userId = e.userbasic_uid;
      getLogPopRef.value.userType = e.userbasic_usertype;
      getLogPopRef.value.getLogs();
    }
    const getEmployee = async () => {
      let resEmployee = await queryEmployee();
      if (resEmployee.ret == 0) {
        dataMap.employeeList = resEmployee.data.employees.map((item) => {
          return {
            label: item.nickname,
            value: item.employee_id,
          };
        });
      }
    };
    const queryDeptList = async () => {
      let res = await getDeptList();
      //  根据时间排
      if (res.iRet === 0) {
        dataMap.departList = res.data.map((item) => {
          return {
            value: item.auto_inc_id,
            label: item.deptName,
          };
        });
        // 获取 id 为 departId 的部门及其所有子部门的 id
        dataMap.subDepartmentIds = getSubDepartments(res.data, store.state.user.departId);
        console.log("部门子ID", dataMap.subDepartmentIds);
      }
    };
    onMounted(async () => {
      await queryDeptList();
      await queryAllRole();
      await getEmployee();
      getUserList();
    });

    return {
      userPop,
      userPwdPop,
      userDelPop,
      userLogPop,
      getLogPopRef,
      userTreeDeptRef,
      setUserPopRef,
      setUserPwdPopRef,
      delUserPopRef,
      Refresh,
      Collection,
      Edit,
      Delete,
      Lock,
      Document,
      pageChange,
      getUserList,
      refresh,
      ...toRefs(dataMap),
      changeStatus,
      sizeChange,
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

  .el-form-item--mini.el-form-item {
    margin-bottom: 0 !important;
  }
}
.el-table--small .el-table__cell {
  padding: 8px 0;
}
</style>
