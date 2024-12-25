<template>
  <div :class="classObj" class="layout-wrapper">
    <!--left side  直播监控页面没有菜单栏，但是要保留logo,所以只去掉背景色-->
    <div v-if="settings.showLeftMenu && !isLivePage">
      <Sidebar class="sidebar-container" ref="sidebar" />
    </div>
    <!--right container-->
    <div class="main-container" :class="{ 'is-live-monitor': isLivePage }">
      <div>
        <Navbar @childClick="childClick" />
        <div v-if="settings.showTagsView">
          <!-- <TagsView ref="tagsview" /> -->
        </div>
      </div>
      <AppMain />
    </div>
    <!--<Settings />-->
  </div>
</template>
<!--原理vue2.0-->
<script lang="ts">
/*可以设置默认的名字*/
export default {
  name: 'Layout'
};
</script>

<script setup lang="ts">
import { Sidebar, Navbar, AppMain, TagsView } from './components';
import { getCurrentInstance, computed, onMounted, ref } from 'vue';
import settings from '@/settings';

let { proxy }: any = getCurrentInstance();
onMounted(() => {});
let opened = computed(() => {
  return proxy.$store.state.app.sidebar.opened;
});
let isLivePage = computed(() => {
  return proxy.$store.state.permission.isLivePage;
});
let classObj = computed(() => {
  return {
    closeSidebar: !opened.value,
    hideSidebar: !settings.showLeftMenu
  };
});
//import ResizeHook to   listen  page size that   open or close
import ResizeHook from './hook/ResizeHandler';

ResizeHook();

function childClick(e: any) {
  // console.log(' ====> ', e);

  // let defaultRouter = menuList.filter(ret => this.$route.fullPath == ret.path)[0];
  if (e.path) {
    if (!e.target || e.out) {
      if (e.target !== proxy.$route.path) {
        // proxy.$refs['tagsview'].closeAllTags();
      }
    }
    proxy.$refs['sidebar'].changeCurrentRoute(e);
  }
}
</script>

<style lang="scss" scoped>
.layout-wrapper {
  background: url('@/assets/images/bg_pic.png') no-repeat;
  overflow: hidden;
  background-size: cover;
  //display: flex;
  //align-content: start;
  //justify-content: start;
}

.main-container {
  min-height: 100%;
  transition: margin-left 0.28s;
  margin-left: $sideBarWidth;
  position: relative;
}

.sidebar-container {
  transition: width 0.28s;
  width: $sideBarWidth !important;
  background-color: $menuBg;
  height: 100%;
  position: fixed;
  font-size: 0;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 1001;
  overflow: hidden;
}

.closeSidebar {
  .sidebar-container {
    width: 54px !important;
  }

  .main-container {
    margin-left: 54px !important;
  }
}

.hideSidebar {
  .sidebar-container {
    width: 0 !important;
  }

  .main-container {
    margin-left: 0;
  }
}
.is-live-monitor {
  margin-left: 0 !important;
}
</style>
