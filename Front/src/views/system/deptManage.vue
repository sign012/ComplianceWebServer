<template>
  <div>
    <!-- 角色管理 -->

    <div class="account-manage">
      <div class="table-top" v-if="isEditor">
        <el-button
          type="primary"
          @click="openDialog('add', {})"
          size="mini"
          color="#3A62F7"
          class="com-btn ml0"
        >
          新建部门
        </el-button>
      </div>
      <div class="account-main">
        <el-table size="small" :data="tableData">
          <el-table-column label="上级部门" prop="p_deptName"></el-table-column>
          <!-- <el-table-column label="部门编号" prop="auto_inc_id"></el-table-column> -->
          <el-table-column label="部门名称" prop="deptName"></el-table-column>
          <el-table-column label="备注" prop="remark"></el-table-column>

          <el-table-column label="修改时间" prop="update_time"></el-table-column>
          <el-table-column label="创建时间" prop="create_time"></el-table-column>
          <el-table-column label="操作" fixed="right" align="center" v-if="isEditor">
            <template #default="scope">
              <el-button
                type="text"
                class="update-btn"
                @click="openDialog('edit', scope.row)"
                >修改</el-button
              >
              <el-button type="text" class="delete-btn" @click="delRole(scope.row)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <DeptsPop
      ref="deptPop"
      :setType="setType"
      :deptList="tableData"
      :cascaderOptions="cascaderOptions"
      @finish="getDeptList"
    />
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { getDeptList, delDeptReq } from "@/api/user";
import { Delete, Edit } from "@element-plus/icons";
import { ElMessageBox, ElMessage } from "element-plus";
import DeptsPop from "./components/depart/set-dept-pop.vue";
import { queryEmployee } from "@/api/runCheck";
import { findChildrenDept } from "@/utils/validate.js";
export default defineComponent({
  data() {
    return {
      tableData: [],
      employeeList: [], // 主播列表
      cascaderOptions: [], // 部门树
    };
  },
  created() {
    this.getDeptList();
    this.getEmployee();
  },
  computed: {
    isEditor() {
      return this.$store.state.user.isEditor;
    },
    departId() {
      return this.$store.state.user.departId;
    },
  },
  methods: {
    async getEmployee() {
      let resEmployee = await queryEmployee();
      if (resEmployee.ret == 0) {
        this.employeeList = resEmployee.data.employees.map((item) => {
          return {
            label: item.nickname,
            value: item.employee_id,
          };
        });
      }
    },
    buildTree(data, pid = "0") {
      const result = [];
      for (const item of data) {
        if (item.pid == pid) {
          const children = this.buildTree(data, item.auto_inc_id);
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
    },
    async getDeptList() {
      let res = await getDeptList();
      //  根据时间排
      let arr = res.data
        .sort((a, b) => {
          if (a.create_time < b.create_time) {
            return 1;
          } else if (a.create_time > b.create_time) {
            return -1;
          } else {
            return 0;
          }
        })
        .map((item) => {
          item.p_deptName =
            item.pid == 0
              ? "无"
              : res.data.find((i) => i.auto_inc_id == item.pid).deptName;
          return item;
        })
        .sort((a, b) => a.pid - b.pid);

      // 赋值部门树 ，供用户设置弹框内选择
      // 只展示所属部门以及下面子部门
      let userDeptName = arr.find((item: any) => item.auto_inc_id == this.departId)
        ? res.data.find((item: any) => item.auto_inc_id == this.departId).deptName
        : "未知";
      if (!this.departId || this.departId == 0) {
        this.cascaderOptions = [{ value: 0, label: "无", children: [] }].concat(
          this.buildTree(res.data)
        );
      } else {
        this.cascaderOptions = [
          {
            value: this.departId,
            label: userDeptName,
            children: this.buildTree(res.data, this.departId),
          },
        ];
      }
      // 用树结构查询出 当前部门及子部门id列表
      let childrenDept = [];
      if (!this.departId || this.departId == 0) {
        childrenDept = arr.map((item) => item.auto_inc_id);
      } else {
        childrenDept = findChildrenDept(this.cascaderOptions, this.departId);
      }
      this.tableData = arr.filter((item) => {
        return (
          childrenDept.includes(String(item.auto_inc_id)) ||
          childrenDept.includes(Number(item.auto_inc_id))
        );
      });
    },

    // 将id部门 及 id子部门设置为禁止选择
    setStatus(arr, id = "", status) {
      arr.forEach((item) => {
        if (id == "" || item.value == id) {
          item.disabled = status;
          if (item.children.length > 0) {
            item.children = this.setStatus(item.children, "", status);
          }
        } else {
          if (item.children.length > 0) {
            item.children = this.setStatus(item.children, id, status);
          }
        }
      });
      return arr;
    },
    openDialog(type: any, data: any) {
      //   return;
      (this.$refs["deptPop"] as any).setType = type;
      (this.$refs["deptPop"] as any).dialogVisible = true;
      (this.$refs["deptPop"] as any).formData = JSON.parse(JSON.stringify(data));
      // 设置禁选部门
      (this.$refs["deptPop"] as any).init();
    },
    delRole(data: any) {
      ElMessageBox.confirm(`确认要删除【${data.deptName}】部门`, "提示", {
        dangerouslyUseHTMLString: true,
        customClass: "messageBox_class",
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          let res = await delDeptReq(data);
          if (res.iRet === 0) {
            ElMessage.success("删除成功");
            this.getDeptList();
          }
        })
        .catch(() => {
          // catch error
        });
    },
  },
  components: {
    Delete,
    Edit,
    DeptsPop,
  },
});
</script>
<style lang="scss" scoped>
.table-top {
  height: 32px;
  margin-bottom: 20px;
  line-height: 32px;
}
.account-manage {
  min-height: calc(100vh - 100px);
}
</style>
