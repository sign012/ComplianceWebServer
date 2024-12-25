<template>
  <!-- 编辑创建机构弹窗 -->
  <div v-dialogdrag>
    <el-dialog
      :title="`${setType === 'add' || setType === 'exAdd' ? '添加' : '编辑'}机构`"
      custom-class="up-pop"
      v-model="dialogVisible"
      :close-on-click-modal="false"
      @close="resetForm"
      width="700px"
    >
      <el-steps v-show="setType === 'add'" :active="active" align-center>
        <el-step title="机构信息"></el-step>
        <el-step title="管理员信息"></el-step>
        <el-step title="柜台关联"></el-step>
      </el-steps>
      <div v-show="active === 1">
        <OrgMgr ref="orgPop" :setType="setType" @finish="orgStep" @close="closePop" />
      </div>
      <div v-show="active === 2">
        <AdminInfo ref="admininfo" :setType="setType" @finish="adminStep" @prev="active--" @close="closePop" />
      </div>
      <div v-show="active === 3">
        <CountMgr ref="countPop" :setType="setType" @finish="closePop" @prev="active--" @close="closePop" />
      </div>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import OrgMgr from './orgMgr.vue';
import AdminInfo from './adminInfo.vue';
import CountMgr from './countMgr.vue';
export default defineComponent({
  emits: ['finish'],
  data() {
    return {
      dialogVisible: false,
      setType: 'add',
      tempData: {},
      active: 1
    };
  },
  methods: {
    openDialog(type: any, data: any, step: any) {
      this.dialogVisible = true;
      this.setType = type;
      this.active = step;
      if (type === 'edit' || type === 'exAdd') {
        this.tempData = data;
        switch (step) {
          case 1:
            this.$nextTick(() => {
              (this.$refs['orgPop'] as any).orgFormData.name = data.name;
              (this.$refs['orgPop'] as any).orgFormData.orgid = data.orgid;
            });
            break;
          case 2:
            this.$nextTick(() => {
              (this.$refs['admininfo'] as any).adminForm.orgid = data.orgid;
              (this.$refs['admininfo'] as any).adminForm.realname = data.realname;
              (this.$refs['admininfo'] as any).adminForm.userbasic_uid = data.userbasic_uid;
              (this.$refs['admininfo'] as any).adminForm.userbasic_exinfo_telno = data.userbasic_exinfo_telno;
            });
            break;
        }
      }
    },
    resetForm() {
      switch (this.active) {
        case 1:
          (this.$refs['orgPop'] as any).clearForm();
          break;
        case 2:
          (this.$refs['admininfo'] as any).clearForm();
          break;
        case 3:
          (this.$refs['countPop'] as any).clearForm();
          break;
      }
      if (this.active === 3) {
        this.active = 1;
      }
    },
    orgStep(e: any) {
      if (this.setType === 'edit') {
        this.dialogVisible = false;
        this.$emit('finish');
        return;
      }
      // 没有上一步 清空表单
      this.resetForm();
      this.active = 2;
      (this.$refs['admininfo'] as any).adminForm.orgid = e.orgFormData.orgid;
    },
    adminStep(e: any) {
      if (this.setType === 'edit' || this.setType === 'exAdd') {
        this.dialogVisible = false;
        this.$emit('finish');
        return;
      }
      // 没有上一步 清空表单
      this.resetForm();
      this.active = 3;
      (this.$refs['countPop'] as any).orgForm.orgid = e.adminForm.orgid;
    },
    countStep(e: any) {
      this.dialogVisible = false;
      this.$emit('finish');
    },
    closePop() {
      this.dialogVisible = false;
      this.resetForm();
      this.$emit('finish');
    }
  },
  components: {
    OrgMgr,
    AdminInfo,
    CountMgr
  }
});
</script>
<style scoped>
:deep(.el-step__title.is-process){
  color: #fff;
}
</style>
