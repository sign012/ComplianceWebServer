<template>
  <div v-if="!item.hidden">
    <div v-if="showSidebarItem(item.children, item)">
      <Link v-if="onlyOneChild.meta" :to="resolvePath(onlyOneChild.path)">
        <el-menu-item
          :index="resolvePath(onlyOneChild.path)"
          :class="{ 'submenu-title-noDropdown': !isNest }"
        >
          <template #title>{{ onlyOneChild.meta?.title }}</template>
          <template #icon-arrow>
            <img src="../../../assets/images/close.png" />
          </template>
        </el-menu-item>
      </Link>
    </div>
    <el-sub-menu
      v-else
      ref="subMenu"
      :index="resolvePath(item.path)"
      popper-append-to-body
    >
      <template #title>
        <item v-if="item.meta" :icon="item.meta && item.meta.icon" />
        <span>{{ item.meta.title }}</span>
      </template>

      <SidebarItem
        v-for="child in item.children"
        :key="child.path"
        :is-nest="true"
        :item="child"
        :base-path="resolvePath(child.path)"
      />
    </el-sub-menu>
  </div>
</template>

<script setup lang="ts">
/*初始化参数比如引入组件，proxy,state等*/
import { getCurrentInstance, onMounted } from "vue";
import Link from "./Link";
import Item from "./Item";
import { isExternal } from "@/utils/validate";
import path from "path";
import { RouteItemTy } from "@/types/router";
let { proxy }: any = getCurrentInstance();
defineProps({
  //每一个router Item
  item: {
    type: Object,
    required: true,
  },
  //用于判断是不是子Item,设置响应的样式
  isNest: {
    type: Boolean,
    default: false,
  },
  //基础路径，用于拼接
  basePath: {
    type: String,
    default: "",
  },
});
onMounted(() => {
  // console.log("我挂载了");
  // console.log(proxy.item);
});
//显示sidebarItem 的情况
proxy.onlyOneChild = null;

let showSidebarItem = (children = [], parent: RouteItemTy) => {
  const showingChildren = children.filter((item: RouteItemTy) => {
    if (item.hidden) {
      return false;
    } else {
      // Temp set(will be used if only has one showing child)
      proxy.onlyOneChild = item;
      return true;
    }
  });
  // if (showingChildren.length === 1 && !parent?.alwaysShow) {
  if (showingChildren.length === 1) {
    return false;
  }
  if (showingChildren.length === 0) {
    proxy.onlyOneChild = { ...parent, path: "", noChildren: true };
    return true;
  }
  return false;
};
let resolvePath = (routePath: string) => {
  if (isExternal(routePath)) {
    return routePath;
  }
  if (isExternal(proxy.basePath)) {
    return proxy.basePath;
  }
  return path.resolve(proxy.basePath, routePath);
};
</script>
<style lang="scss">
.el-scrollbar {
  background: #fff;
  max-height: calc(100vh - 50px);
}
.el-menu-item {
  color: #000;
  font-size: 14px;
  &:hover {
    color: #e6a23c !important;
    background: linear-gradient(
      269deg,
      rgba(232, 205, 150, 0) 0%,
      rgba(208, 169, 95, 0.5) 100%
    ) !important;
  }
}
.night .el-menu-item {
  color: #fff;
  font-size: 14px;
  font-weight: 400;
  width: 80%;
  margin: 0 auto;
  border-radius: 4px;
  &:hover {
    color: #58a5ff !important;
    // background: linear-gradient(269deg, rgba(232, 205, 150, 0) 0%, rgba(208, 169, 95, 0.5) 100%) !important;
    width: 80%;
    background: #21283d !important;
    margin: 0 auto;
  }
}
.light .el-menu-item.is-active {
  color: #e6a23c !important;
  font-weight: 500;
  background: linear-gradient(
    269deg,
    rgba(232, 205, 150, 0) 0%,
    rgba(208, 169, 95, 0.5) 100%
  );
}
.night .el-menu-item.is-active {
  color: #58a5ff !important;
  font-weight: 500;
  background: #21283d !important;
}
// menu hover
.submenu-title-noDropdown,
.el-sub-menu__title {
  color: #111111 !important;
  font-size: 14px !important;
  &:hover {
    background: #fff !important;
  }
}

.night .submenu-title-noDropdown,
.night .el-sub-menu__title {
  color: #fff !important;
  font-size: 14px !important;
  &:hover {
    color: #58a5ff !important;
    background: #212848 !important;
  }
}
.night .el-sub-menu.is-active .el-sub-menu__title {
  color: #58a5ff !important;
}
</style>
