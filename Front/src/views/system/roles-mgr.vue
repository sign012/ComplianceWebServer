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
          新建角色
        </el-button>
      </div>
      <div class="account-main">
        <el-table size="small" :data="tableData">
          <el-table-column label="角色名称" prop="roleName"></el-table-column>
          <el-table-column label="菜单权限" prop="menuList">
            <template #default="scope">{{ scope.row.rights }}</template>
          </el-table-column>

          <el-table-column label="操作权限" prop="roleType">
            <template #default="scope">{{ scope.row.operList }}</template>
          </el-table-column>
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

    <RolesPop
      ref="rolePop"
      :dataSource="dataSource"
      :setType="setType"
      :departObj="departObj"
      @finish="getRole"
    />
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import {
  createRoleReq,
  getRoleReq,
  getMenuReq,
  editRoleReq,
  delRoleReq,
} from "@/api/user";
import { Delete, Edit } from "@element-plus/icons";
import { ElMessageBox, ElMessage } from "element-plus";
import RolesPop from "./components/rolesPop.vue";
import { departObj } from "@/utils/dict";
import { queryEmployee } from "@/api/runCheck";
export default defineComponent({
  data() {
    return {
      setType: "add",
      tableData: [],
      dataSource: [],
      departObj,
      employeeList: [], // 主播列表
    };
  },
  created() {
    this.getRole();
    this.getMenu();
    this.getEmployee();
  },
  computed: {
    isEditor() {
      return this.$store.state.user.isEditor;
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
    async getRole() {
      let data = {
        departId: this.$store.state.user.departId,
      };
      let res = await getRoleReq(data);
      //  根据时间排
      let arr = res.data.sort((a, b) => {
        if (a.create_time < b.create_time) {
          return 1;
        } else if (a.create_time > b.create_time) {
          return -1;
        } else {
          return 0;
        }
      });
      this.tableData = arr;
    },
    async getMenu() {
      let data = {};
      let res = await getMenuReq(data);
      if (res.iRet === 0) {
        let allNodes = JSON.parse(JSON.stringify(res.data));
        let pNode = res.data.filter((e: any) => {
          if (e.pId === 0) {
            return e;
          }
        });
        pNode.forEach((e: any) => {
          e.children = [];
          this.createTree(e, allNodes);
        });
        this.dataSource = pNode;
      }
    },
    createTree(pNode: any, allNodes: any) {
      allNodes.forEach((e: any) => {
        if (e.pId === pNode.auto_inc_id) {
          pNode.children.push(e);
          if (e.isLeaf === 0) {
            this.createTree(e, allNodes);
          }
        }
      });
    },
    openDialog(type: any, data: any) {
      (this.$refs["rolePop"] as any).dialogVisible = true;
      this.setType = type;
      let _arr = [];
      let _checked = { bj: false, sh: false };
      if (type === "edit") {
        let _tempObj = JSON.parse(data.menuList);
        for (let key in _tempObj) {
          // _arr.push(key)
          for (let item of _tempObj[key]) {
            _arr.push(item.id);
          }
        }
        // 操作权限
        if (data.roleType === "A") {
          _checked.bj = true;
          _checked.sh = true;
        } else if (data.roleType === "B") {
          _checked.bj = true;
        } else if (data.roleType === "C") {
          _checked.sh = true;
        }
      }

      (this.$refs["rolePop"] as any).formData = data;
      (this.$refs["rolePop"] as any).ckeckedNode = _arr;
      (this.$refs["rolePop"] as any).checked = _checked;
    },
    delRole(data: any) {
      ElMessageBox.confirm(`确认要删除【${data.roleName}】角色`, "提示", {
        dangerouslyUseHTMLString: true,
        customClass: "messageBox_class",
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          let res = await delRoleReq(data);
          if (res.iRet === 0) {
            ElMessage.success("删除成功");
            this.getRole();
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
    RolesPop,
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
