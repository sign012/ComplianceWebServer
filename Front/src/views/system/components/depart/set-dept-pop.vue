<template>
  <div v-dialogdrag>
    <el-dialog
      :close-on-click-modal="false"
      :title="`${setType === 'add' ? '添加' : '编辑'}部门`"
      custom-class="up-pop"
      v-model="dialogVisible"
      @close="clearPop"
    >
      <el-form
        :model="formData"
        inline
        size="mini"
        label-width="80px"
        label-position="left"
      >
        <!-- <el-form-item label="部门编号" v-if="setType === 'edit'">
          <el-input v-model="formData.auto_inc_id" placeholder disabled></el-input>
        </el-form-item> --> 

        <el-form-item label="上级部门">
          <el-cascader
            v-model="formData.pid"
            :options="filtercascaderOptions"
            @change="changeOrg"
            :props="cascaderProps"
			ref="cascaderRef"
          >
          </el-cascader>
        </el-form-item>
        <!-- </el-form-item> -->
        <el-form-item label="部门名称">
          <el-input v-model="formData.deptName" placeholder></el-input>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="formData.remark" placeholder type="textarea"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false" color="#343A4E" class="cancel-btn"
            >取消</el-button
          >
          <el-button type="primary" @click="save">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { createDeptReq, editDeptReq } from "@/api/user";
import { queryEmployee } from "@/api/runCheck";
import { ElMessage } from "element-plus";
import dayjs from "dayjs";
import { departListDict } from "@/utils/dict";
import { mapState } from 'vuex';
type MenuMap = {
  [key: string]: Array<any>;
};
export default defineComponent({
  props: [ "deptList", "cascaderOptions"],
  emits: ["finish"],
  data() {
    return {
      departListDict,
      dialogVisible: false,
      formData: { auto_inc_id: "", deptName: "", remark: "", pid: [] },
      ckeckedNode: [{}],
      checked: {
        bj: false,
        sh: false,
      },
      selectedOptions: [],
      options: [],
      checkedMap: {}, // 多选框选中状态
      employeeList: [],
      cascaderProps: {
        checkStrictly: true, // 允许选择任意一级的选项
      },
      filtercascaderOptions: [],
	  setType:"add"
    };
  },

  watch: {
    dialogVisible: {
      handler(val) {},
    },
  },
  computed: {
    isAdmin() {
      return this.$store.state.user.userMgrType === "S";
    },
	...mapState(['user']),
  },
  methods: {
    clearPop() {},
    async save() {
      this.formData.level = this.formData.pid.length;
      this.formData.pid = this.formData.pid[this.formData.pid.length - 1] || 0;

      console.log("保存角色", this.formData);
      // this.dialogVisible = false;
      if (this.setType === "add") {
        let res = await createDeptReq(this.formData);
        if (res.iRet === 0) {
          ElMessage.success("添加成功");
          this.dialogVisible = false;
          this.$emit("finish");
        } else {
          ElMessage.error(res.msg);
        }
      } else {
        let res = await editDeptReq(this.formData);
        if (res.iRet === 0) {
          ElMessage.success("编辑成功");
          this.dialogVisible = false;
          this.$emit("finish");
        } else {
          ElMessage.error(res.msg);
        }
      }
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
          item.disabled = !status;
          if (item.children.length > 0) {
            item.children = this.setStatus(item.children, id, status);
          }
        }
      });
      return arr;
    },
    init() {
		console.log('')
      if (this.setType === "edit") {
        let _data = this.setStatus(this.cascaderOptions, this.formData.auto_inc_id, true);
        this.filtercascaderOptions = _data;
      } else {
		console.log('user===>',this.user); 
        this.filtercascaderOptions = this.cascaderOptions;
	  }
    },
    changeOrg(val) {
      console.log(val);
	  this.$refs.cascaderRef.togglePopperVisible();
    },
  },
});
</script>
<style lang="scss" scoped></style>
