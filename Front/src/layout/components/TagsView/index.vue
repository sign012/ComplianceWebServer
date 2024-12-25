<template>
  <div id="tags-view-container" class="tags-view-container">
    <div class="tags-view-wrapper">
      <!-- <router-link
        ref="refTag"
        :class="isActive({ path: '/dashboard' }) ? 'active' : ''"
        :to="{ path: '/' }"
        tag="span"
        class="tags-view-item"
      >
        首页
      </router-link> -->
      <router-link
        v-for="tag in visitedViews"
        ref="refTag"
        :key="tag.path"
        :class="isActive(tag) ? 'active' : ''"
        :to="{ path: tag.path, query: tag.query, fullPath: tag.fullPath }"
        tag="span"
        class="tags-view-item"
        @click.middle="!isAffix(tag) ? closeSelectedTag(tag) : ''"
        @contextmenu.prevent="openMenu(tag, $event)"
      >
        {{ tag.title }}
        <span v-if="!isAffix(tag)" style="position: relative; top: 2px" @click.prevent.stop="closeSelectedTag(tag)">
          <el-icon>
            <Close />
          </el-icon>
        </span>
      </router-link>
    </div>
    <ul v-show="visible" :style="{ left: left + 'px', top: top + 'px' }" class="contextmenu">
      <li @click="refreshSelectedTag(selectedTag)">Refresh</li>
      <li v-if="!isAffix(selectedTag)" @click="closeSelectedTag(selectedTag)">Close</li>
      <li @click="closeOthersTags">Close Others</li>
      <li @click="closeAllTags(selectedTag)">Close All</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
// import ScrollPane from './ScrollPane'
import path from 'path';

import { onMounted, getCurrentInstance, watch, toRefs, reactive, computed } from 'vue';
//获取store和router
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { RouterTy, RouteItemTy } from '@/types/router';
import { ObjTy } from '@/types/common';
import { Close } from '@element-plus/icons';
import { log } from 'console';
import component from '@/views/login';
const store = useStore();
const router = useRouter();
let { proxy }: any = getCurrentInstance();
{
  Close;
}
const state: ObjTy = reactive({
  visible: false,
  top: 0,
  left: 0,
  selectedTag: {},
  affixTags: []
});

const visitedViews = computed(() => {
  return store.state.tagsView.visitedViews;
});
const routes = computed(() => {
  return store.state.permission.routes;
});

watch(
  () => proxy.$route,
  () => {
    addTags();
    // tag remove has issue
    // moveToCurrentTag()
  }
);
watch(
  () => state.visible,
  (value) => {
    if (value) {
      document.body.addEventListener('click', closeMenu);
    } else {
      document.body.removeEventListener('click', closeMenu);
    }
  }
);

watch(
  () => state.visible,
  (value) => {
    if (value) {
      document.body.addEventListener('click', closeMenu);
    } else {
      document.body.removeEventListener('click', closeMenu);
    }
  }
);

onMounted(() => {
  initTags();
  addTags();
});

const isActive = (route: RouteItemTy) => {
  return route.path === proxy.$route.path;
};
const isAffix = (tag: RouteItemTy) => {
  return tag.meta && tag.meta.affix;
};

const filterAffixTags = (routes: RouterTy, basePath = '/') => {
  let tags: Array<RouteItemTy> = [];
  routes.forEach((route) => {
    if (route.meta && route.meta.affix) {
      const tagPath = path.resolve(basePath, route.path);
      tags.push({
        fullPath: tagPath,
        path: tagPath,
        name: route.name,
        meta: { ...route.meta }
      });
    }
    if (route.children) {
      const tempTags = filterAffixTags(route.children, route.path);
      if (tempTags.length >= 1) {
        tags = [...tags, ...tempTags];
      }
    }
  });
  return tags;
};
const initTags = () => {
  const affixTags = (state.affixTags = filterAffixTags(routes.value));
  // console.log(affixTags);
  for (const tag of affixTags) {
    // Must have tag name
    if (tag.name) {
      store.dispatch('tagsView/addVisitedView', tag);
    }
  }
};

const addTags = () => {
  const { path } = proxy.$route;
  // 遇到首页不加入访问过得路径数组
  if (proxy.$route.meta.title == '首页') return;
  if (proxy.$route.path == '/login') {
    // 解决从首页退出无法关闭其他标签的问题
    store.state.tagsView.visitedViews = [];
  }
  // console.log(visitedViews.value);
  if (path) {
    store.dispatch('tagsView/addView', proxy.$route);
  }
  return false;
};

const refreshSelectedTag = (view: RouteItemTy) => {
  store.dispatch('tagsView/delCachedView', view).then(() => {
    const { fullPath } = view;
    proxy.$nextTick(() => {
      proxy.$router.replace({
        path: '/redirect' + fullPath
      });
    });
  });
};
const closeSelectedTag = (view: RouteItemTy) => {
  store.dispatch('tagsView/delView', view).then(({ visitedViews }) => {
    if (isActive(view)) {
      toLastView(visitedViews, view);
    }
  });
};
const closeOthersTags = () => {
  proxy.$router.push(state.selectedTag);
  store.dispatch('tagsView/delOthersViews', state.selectedTag).then(() => {
    // moveToCurrentTag()
  });
};
const closeAllTags = (view: RouteItemTy) => {
  store.dispatch('tagsView/delAllViews').then(({ visitedViews }) => {
    if (state.affixTags.some((tag: RouteItemTy) => tag.path === view.path)) {
      return;
    }
    if (view) {
      toLastView(visitedViews, view);
    }
  });
};
const toLastView = (visitedViews: RouterTy, view: RouteItemTy) => {
  const latestView: ObjTy = visitedViews.slice(-1)[0];
  if (latestView) {
    router.push(latestView.fullPath);
  } else {
    // now the default is to redirect to the home page if there is no tags-view,
    // you can adjust it according to your needs.
    if (view.name === 'Dashboard') {
      // to reload home page
      router.replace({ path: '/redirect' + view.fullPath });
    } else {
      router.push('/');
    }
  }
};
const openMenu = (tag: RouteItemTy, e: any) => {
  const menuMinWidth = 105;
  const offsetLeft = proxy.$el.getBoundingClientRect().left; // container margin left
  const offsetWidth = proxy.$el.offsetWidth; // container width
  const maxLeft = offsetWidth - menuMinWidth; // left boundary
  const left = e.clientX - offsetLeft + 15; // 15: margin right

  if (left > maxLeft) {
    state.left = maxLeft;
  } else {
    state.left = left;
  }
  state.top = e.clientY;
  state.visible = true;
  state.selectedTag = tag;
};
const closeMenu = () => {
  state.visible = false;
};
// const handleScroll = () => {
//   closeMenu()
// }

//export to page use
let { visible, top, left, selectedTag } = toRefs(state);

defineExpose({ closeAllTags });
</script>

<style lang="scss" scoped>
.night .tags-view-container {
  background: linear-gradient(-45deg, #0f151a 0%, #0a0801 66%, #0d1316 100%);
  .tags-view-wrapper {
    .tags-view-item {
      color: #999999;
      background: #4d4d50;
      &.active {
        color: #fff;
      }
    }
  }
}
.tags-view-container {
  padding: 1px 0;
  height: $tagViewHeight;
  width: 100%;
  background: #e1e1e1;
  .tags-view-wrapper {
    .tags-view-item {
      display: inline-block;
      position: relative;
      cursor: pointer;
      // border: 1px solid #d8dce5;
      background: #F5f5f5;
      color: #999999;
      padding: 7px 12px;
      font-size: 14px;
      margin-right: 1px;
      border-radius: 0;
      &.active {
        color: #111;
      }
    }
  }
  .contextmenu {
    margin: 0;
    background: #fff;
    z-index: 3000;
    position: absolute;
    list-style-type: none;
    padding: 5px 0;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 400;
    color: #333;
    box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);
    li {
      margin: 0;
      padding: 7px 16px;
      cursor: pointer;
      &:hover {
        background: #eee;
      }
    }
  }
}
</style>

<style lang="scss">
//reset element css of el-icon-close
.tags-view-wrapper {
  .tags-view-item {
    border-radius: 3px;
    .el-icon-close {
      width: 16px;
      height: 16px;
      vertical-align: 2px;
      border-radius: 50%;
      text-align: center;
      transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      transform-origin: 100% 50%;
      &:before {
        transform: scale(0.6);
        display: inline-block;
        vertical-align: -3px;
      }
      &:hover {
        background-color: #b4bccc;
        color: #fff;
      }
    }
  }
}
</style>
