<template>
  <el-breadcrumb class="app-breadcrumb" separator="-">
    <transition-group name="breadcrumb">
      <el-breadcrumb-item v-for="(item, index) in levelList" :key="item.path">
        <span v-if="item.redirect === 'noRedirect' || index === levelList.length - 1" class="no-redirect">
          {{ item.meta?.title }}
        </span>
        <a v-else @click.prevent="handleLink(item)">{{ item.meta.title }}</a>
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { onMounted, onBeforeMount, getCurrentInstance, watch, ref } from 'vue';
import { compile } from 'path-to-regexp';
import { RouteItemTy } from '@/types/router';
let levelList = ref(null);
let { proxy }: any = getCurrentInstance();
const getBreadcrumb = () => {
  // only show routes with meta.title
  let matched = proxy.$route.matched.filter((item: RouteItemTy) => item.meta && item.meta.title);
  const first = matched[0];
  if (!isDashboard(first)) {
    //it can replace the first page if not exits
    // matched = [{ path: '/dashboard', meta: { title: 'Dashboard' } }].concat(matched);
  }
  levelList.value = matched.filter(
    (item: RouteItemTy) => item.meta && item.meta.title && item.meta.breadcrumb !== false
  );
};

const isDashboard = (route: RouteItemTy) => {
  const name = route?.name;
  if (!name) {
    return false;
  }
  return name.trim().toLocaleLowerCase() === 'Dashboard'.toLocaleLowerCase();
};
const pathCompile = (path: string) => {
  const { params } = proxy.$route;
  const toPath = compile(path);
  return toPath(params);
};
const handleLink = (item: RouteItemTy) => {
  // 点面包屑不跳转
  return;
  const { redirect, path } = item;
  if (redirect) {
    proxy.$router.push(redirect);
    return;
  }
  if (path) {
    proxy.$router.push(pathCompile(path));
  }
};
watch(
  () => proxy.$route,
  () => {
    getBreadcrumb();
  },
  { immediate: true }
);
onMounted(() => {});
onBeforeMount(() => {
  getBreadcrumb();
});
</script>

<style lang="scss" scoped>
.app-breadcrumb.el-breadcrumb {
  display: inline-block;
  font-size: 14px;
  line-height: 50px;
  margin-left: 8px;

  .no-redirect {
    color: #97a8be;
    cursor: text;
  }
}
</style>
