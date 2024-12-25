<template>
  <div v-dialogdrag>
    <el-dialog custom-class="" v-model="dialogVisible" :close-on-click-modal="false">
      <div
        style="
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
        "
      >
        <img :src="url" alt="" style="width: 200px; height: 200px" />
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, toRefs, onMounted } from "vue";

import { ElMessage } from "element-plus";
export default defineComponent({
  setup(props, { emit }) {
    const dataMap = reactive({
      dialogVisible: false,
      url: "",
    });
    return {
      ...toRefs(dataMap),
    };
  },
});
</script>
<style lang="scss" scoped></style>
