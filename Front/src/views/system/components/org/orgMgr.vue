<template>
  <!-- 机构编辑 -->
  <div>
    <el-form
      :model="orgFormData"
      ref="form"
      :rules="rules"
      label-width="130px"
      style="margin-top: 20px; width: 400px; margin: 40px auto"
    >
      <el-form-item label="机构名称" prop="name">
        <el-input v-model="orgFormData.name" placeholder></el-input>
      </el-form-item>
    </el-form>
    <div style="text-align: right">
      <el-button type @click="close">取消</el-button>
      <el-button type="primary" v-if="setType === 'add'" @click="next">下一步</el-button>
      <el-button type="primary" v-else @click="save">保存</el-button>
    </div>
  </div>
</template>
<script lang="ts">
import { opOrgReq } from '@/api/department';
import { ElMessage } from 'element-plus';
import { defineComponent } from 'vue';
type org = {
  [key: string]: string;
};
export default defineComponent({
  emits: ['finish', 'close'],
  props: ['setType'],
  data() {
    return {
      dialogVisible: false,
      orgFormData: {
        name: '',
        orgid: ''
      },
      rules: {
        name: [
          {
            required: true,
            message: '请输入机构名称',
            trigger: 'blur'
          }
        ]
      }
    };
  },
  methods: {
    async save() {
      let res = await opOrgReq('edit', this.orgFormData);
      if (res.iRet === 0) {
        ElMessage.success('编辑成功');
        this.$emit('finish');
      } else {
        ElMessage.error(res.msg);
      }
    },
    next() {
      (this.$refs['form'] as any).validate(async (err: any) => {
        if (err) {
          let req = {
            name: this.orgFormData.name
          };
          let res = await opOrgReq('add', req);
          if (res.iRet === 0) {
            this.$emit('finish', { orgFormData: res.data });
            ElMessage.success('机构创建成功');
          } else {
            ElMessage.error(res.msg);
          }
          // this.$emit('finish', { orgFormData: {orgid:'123'} }); //测试路径
        } else {
          return;
        }
      });
    },
    close() {
      this.$emit('close');
    },
    clearForm() {
      (this.$refs['form'] as any).clearValidate();
      for (let key in this.orgFormData) {
        (this.orgFormData as org)[key] = '';
      }
    }
  }
});
</script>
