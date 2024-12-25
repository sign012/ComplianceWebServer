<template>
  <div class="back-top-btn">
    <el-button type="primary" style="font-size: 20px" class="el-icon-top" @click="backtop" circle></el-button>
  </div>
</template>
<script setup lang="ts">
const emit = defineEmits(['backtop']);
function backtop() {
  emit('backtop');
}
</script>

<style scoped>
.back-top-btn {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 999;
}
</style>
