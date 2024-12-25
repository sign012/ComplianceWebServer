<template>
  <div v-dialogdrag>
    <el-dialog
      :close-on-click-modal="false"
      :title="`${setType === 'add' ? '添加' : '编辑'}角色`"
      custom-class="up-pop"
      v-model="dialogVisible"
      @close="clearPop"
    >
      <el-form :model="formData" inline size="mini" label-width="80px" label-position="left">
        <el-form-item label="角色名称">
          <el-input v-model="formData.roleName" placeholder></el-input>
        </el-form-item>

        <el-form-item label="操作权限">
          <el-checkbox v-model="checked.bj" label="编辑" size="large" />
          <el-checkbox v-model="checked.sh" label="审核" size="large" />
        </el-form-item>

        <div style="height: auto; overflow: auto; display: flex; margin-bottom: 20px">
          <div class="label" style="width: 75px">查看权限</div>
          <el-tree
            :data="dataSource"
            node-key="auto_inc_id"
            default-expand-all
            show-checkbox
            :default-checked-keys="ckeckedNode"
            :expand-on-click-node="false"
            ref="menu"
          >
            <template #default="{ data }">
              <div style="flex: 1; display: flex; align-items: center">
                <span style="flex: 1">{{ data.menuName }}</span>
              </div>
            </template>
          </el-tree>
        </div>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false" color="#343A4E" class="cancel-btn">取消</el-button>
          <el-button type="primary" @click="save">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { createRoleReq, editRoleReq } from '@/api/user';
import { queryEmployee } from '@/api/runCheck';
import { ElMessage } from 'element-plus';
import dayjs from 'dayjs';
import { departListDict } from '@/utils/dict';
type MenuMap = {
  [key: string]: Array<any>;
};
export default defineComponent({
  props: ['setType', 'dataSource'],
  emits: ['finish'],
  data() {
    return {
      departListDict,
      dialogVisible: false,
      formData: { roleName: '', menuList: '', roleType: 'A' },
      ckeckedNode: [{}],
      checked: {
        bj: false,
        sh: false
      },
      selectedOptions: [],
      options: [],
      checkedMap: {}, // 多选框选中状态
      employeeList: []
    };
  },

  watch: {
    dialogVisible: {
      handler(val) {}
    }
  },
  computed: {
    isAdmin() {
      return this.$store.state.user.userMgrType === 'S';
    }
  },
  methods: {
    clearPop() {
      (this.$refs['menu'] as any).setCheckedKeys([]);
    },
    async save() {
      let menus = (this.$refs['menu'] as any).getCheckedNodes(true, false);
      let _tempMap: MenuMap = {};
      menus.forEach((e: any) => {
        if (!_tempMap[e.pId]) {
          _tempMap[e.pId] = [];
        }
        _tempMap[e.pId].push({ id: e.auto_inc_id, name: e.menuName });
      });
      this.formData.menuList = JSON.stringify(_tempMap);
      // 默认为 无编辑/审核权限
      let _roleType = 'D';
      if (this.checked.bj && this.checked.sh) {
        _roleType = 'A';
      } else if (this.checked.bj) {
        _roleType = 'B';
      } else if (this.checked.sh) {
        _roleType = 'C';
      }
      this.formData.roleType = _roleType;
      console.log('保存角色', this.formData);
      // this.dialogVisible = false;
      // return;
      if (this.setType === 'add') {
        let res = await createRoleReq(this.formData);
        if (res.iRet === 0) {
          ElMessage.success('添加成功');
          this.dialogVisible = false;
          this.$emit('finish');
        } else {
          ElMessage.error(res.msg);
        }
      } else {
        let res = await editRoleReq(this.formData);
        if (res.iRet === 0) {
          ElMessage.success('编辑成功');
          this.dialogVisible = false;
          this.$emit('finish');
        } else {
          ElMessage.error(res.msg);
        }
      }
    },

    async init() {}
  }
});
</script>
<style lang="scss" scoped></style>
