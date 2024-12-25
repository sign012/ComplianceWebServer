<template>
  <div v-dialogdrag>
    <el-dialog
      @close="resetForm"
      :title="`${type === 'edit' ? '编辑' : '创建'}菜单`"
      custom-class="up-pop"
      width="600px"
      :close-on-click-modal="false"
      v-model="openMenu"
    >
      <el-form inline :model="formData" label-width="80px">
        <el-form-item label="菜单名称">
          <el-input v-model="formData.menuName" placeholder></el-input>
        </el-form-item>
        <el-form-item label="菜单icon">
          <el-input v-model="formData.menuIcon" placeholder></el-input>
        </el-form-item>
        <el-form-item label="访问地址">
          <el-input v-model="formData.menuPath" placeholder></el-input>
        </el-form-item>
        <el-form-item label="菜单类型" v-if="type === 'add'">
          <el-radio :label="0" v-model="formData.isLeaf">父菜单</el-radio>
          <el-radio :label="1" v-model="formData.isLeaf">子菜单</el-radio>
        </el-form-item>
        <el-form-item label="菜单类型" v-if="type === 'main' || type === 'edit'">
          <el-radio :label="0" v-model="formData.isLeaf" disabled>父菜单</el-radio>
          <el-radio :label="1" v-model="formData.isLeaf" disabled>子菜单</el-radio>
        </el-form-item>
        <el-form-item label="文件路径" v-if="formData.isLeaf === 1">
          <el-input v-model="formData.filePath" placeholder></el-input>
        </el-form-item>
        <el-form-item label="排序">
          <el-input v-model="formData.sort" placeholder></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="openMenu = false" color="#343A4E">取消</el-button>
          <el-button type="primary" @click="save">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { createMenuReq, editMenuReq } from '@/api/user';
import { ElMessage } from 'element-plus';
export default defineComponent({
  emits: ['finish'],
  data() {
    return {
      type: 'edit',
      openMenu: false,
      formData: { menuName: '', menuPath: '', filePath: '', isLeaf: 0, menuIcon: 'table', pId: 0, sort: 0, IsValid: 1 }
    };
  },
  methods: {
    async save() {
      if (this.type === 'main') {
        let res = await createMenuReq(this.formData);
        if (res.iRet === 0) {
          ElMessage.success('添加成功');
          this.openMenu = false;
          this.$emit('finish');
        } else {
          ElMessage.error(`${res.msg}`);
        }
      }
      if (this.type === 'add') {
        let res = await createMenuReq(this.formData);
        if (res.iRet === 0) {
          ElMessage.success('添加成功');
          this.openMenu = false;
          this.$emit('finish');
        } else {
          ElMessage.error(`${res.msg}`);
        }
      }
      if (this.type === 'edit') {
        let res = await editMenuReq(this.formData);
        if (res.iRet === 0) {
          ElMessage.success('编辑成功');
          this.openMenu = false;
          this.$emit('finish');
        } else {
          ElMessage.error(`${res.msg}`);
        }
      }
    },
    resetForm() {
      this.formData = { menuName: '', menuPath: '', filePath: '', isLeaf: 0, menuIcon: 'table', pId: 0, sort: 0 };
    }
  }
});
</script>
