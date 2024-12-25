<template>
  <div style="padding: 0 12px" @click="toggleClick">
    <svg
      t="1635755003362"
      class="icon"
      viewBox="0 0 1302 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      p-id="2403"
      width="20"
      height="20"
    >
      <path
        d="M138.666667 896l1024 0 0 128L138.666667 1024 138.666667 896 138.666667 896z"
        p-id="2404"
        fill="#ffffff"
      ></path>
      <path
        d="M522.666667 580.266667l640 0 0 128L522.666667 708.266667 522.666667 580.266667 522.666667 580.266667z"
        p-id="2405"
        fill="#ffffff"
      ></path>
      <path
        d="M522.666667 324.266667l640 0 0 128L522.666667 452.266667 522.666667 324.266667 522.666667 324.266667z"
        p-id="2406"
        fill="#ffffff"
      ></path>
      <path d="M138.666667 0l1024 0 0 128L138.666667 128 138.666667 0 138.666667 0z" p-id="2407" fill="#ffffff"></path>
      <path
        d="M138.666667 290.133333l256 256L138.666667 733.866667 138.666667 290.133333 138.666667 290.133333z"
        p-id="2408"
        fill="#ffffff"
      ></path>
    </svg>
    <!-- <el-icon class="el-icon-expand hamburger" ></el-icon> -->
  </div>
</template>

<script setup>
import { getCurrentInstance } from 'vue';
let { proxy } = getCurrentInstance();
defineProps({
  isActive: {
    type: Boolean,
    default: false
  }
});
const toggleClick = () => {
  proxy.$emit('toggleClick');
};
</script>

<style scoped>
.hamburger {
  display: inline-block;
  vertical-align: middle;
  width: 20px;
  height: 20px;
}

.hamburger.is-active {
  transform: rotate(180deg);
}
</style>
