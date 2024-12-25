<template>
  <router-view v-slot="{ Component }">
    <!-- <transition name="fade-transform" mode="out-in"> -->
    <div id="app-main" class="app-main" :class="{ 'show-tag-view': setting.showTagsView }" :key="key">
      <keep-alive :include="cachedViews">
        <component :is="Component" :key="key" />
      </keep-alive>
      <!-- <BackTop @backtop="backtop" /> -->
    </div>
    <!-- </transition> -->
  </router-view>
</template>

<script setup lang="ts">
import setting from '@/settings';

import { computed, getCurrentInstance } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
// 返回顶部
// import { BackTop } from './index';
let { proxy }: any = getCurrentInstance();
const key = computed(() => {
  return useRoute().path;
});
let store = useStore();
const cachedViews = computed(() => {
  //TagsView is open: open using cachedViews of TagsView, otherwise using app
  if (setting.showTagsView) {
    return store.state.app.cachedViews;
  } else {
    return store.state.app.cachedViews;
  }
});
// 返回顶部
function backtop() {
  document.getElementById('app-main').scrollTop = 0;
}
</script>

<style scoped lang="scss">
.app-main {
  // padding: 10px;
  /*50 = navbar  */
  height: calc(100vh - #{$navBarHeight});
  width: 100%;
  position: relative;
  overflow: auto;
}
.night .app-main {
  border-left: 1px solid rgba(0, 0, 0, 0.5);
}
.show-tag-view {
  height: calc(100vh - #{$navBarHeight}) !important;
}
.fixed-header + .app-main {
  padding-top: 50px;
}
</style>

<style lang="scss">
.el-popup-parent--hidden {
  .fixed-header {
    padding-right: 15px;
  }
}
</style>
