<template>
  <!-- 回测参数弹窗 -->
  <div>
    <el-dialog
      :title="`${setType === 'more' ? '批量' : '人工'}审核`"
      @close="clearForm"
      custom-class="up-pop audit-pop "
      width="500px"
      v-model="openDialog"
    >
      <div>
        <el-form :model="formData" ref="livePopRef" class="emp-form" :rules="rules">
          <el-form-item label="人审结果" prop="status">
            <el-radio-group v-model="formData.status">
              <el-radio :label="2" size="large">人审通过</el-radio>
              <el-radio :label="1" size="large">人审不通过</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="人审意见" prop="reason">
            <el-input
              type="textarea"
              v-model="formData.reason"
              placeholder="请输入审核意见(不超过20字)"
            ></el-input>
          </el-form-item>
          <el-form-item
            label="处罚措施"
            prop="refuse_type"
            v-show="formData.status === 1"
          >
            <el-select v-model="formData.refuse_type">
              <el-option label="记录" :value="0"></el-option>
              <el-option label="警告" :value="1"></el-option>
              <el-option label="断流" :value="2"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="save" :loading="btnLoad">确认</el-button>
          <el-button @click="close" color="#343A4E" class="cancel-btn">取消</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { defineComponent, nextTick, reactive, toRefs, ref, onMounted } from "vue";

import { Delete, Download, Plus, ZoomIn } from "@element-plus/icons";
export default defineComponent({
  props: {
    auditList: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["renderList"],
  components: {
    Delete,
    Download,
    Plus,
    ZoomIn,
  },
  setup(props, { emit }) {
    const livePopRef = ref();
    let dataMap = reactive({
      openDialog: false,
      setType: "more",
      formData: {
        reason: "",
        status: 2,
        refuse_type: 0,
      },
      btnLoad: false,
      rules: {
        reason: [
          { required: false, message: "请输入审核意见", trigger: "blur" },
          { max: 20, message: "审核意见不能超过20字", trigger: "blur" },
        ],
      },
    });

    //保存
    const save = () => {
      livePopRef.value.validate((valid) => {
        if (valid) {
          emit("renderList", dataMap.formData);
          close();
        }
      });
    };
    const close = () => {
      dataMap.openDialog = false;
      dataMap.formData = {
        reason: "",
        status: 2,
        refuse_type: 0,
      };
    };
    const clearForm = () => {
      dataMap.formData = {
        reason: "",
        status: 2,
        refuse_type: 0,
      };
    };
    return {
      ...toRefs(dataMap),
      save,
      close,
      livePopRef,
      clearForm,
    };
  },
});
</script>
<style lang="scss" scoped></style>
