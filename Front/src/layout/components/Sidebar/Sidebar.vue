<template>
  <div id="Sidebar">
    <!--logo-->
    <Logo :collapse="!isCollapse" v-if="settings.sidebarLogo" />
    <!--router nav-->
    <el-scrollbar wrap-class="scrollbar-wrapper reset-menu-style">
      <el-menu
        :default-active="activeMenu"
        :default-openeds="['/oper-review', '/system', '/rule-config']"
        :collapse="!isCollapse"
        :unique-opened="false"
        :collapse-transition="false"
        :active-text-color="variables.menuActiveText"
        mode="vertical"
        @open="handleOpen"
      >
        <sidebar-item
          v-for="route in currentRoutes"
          :key="route.path"
          :item="route"
          :base-path="route.path"
        />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script lang="ts">
import Logo from "./Logo";
import SidebarItem from "./SidebarItem";
//导入配置文件
import settings from "@/settings";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
// import Item from './Item';
import { defineComponent } from "vue";
import { mapGetters } from "vuex";
export default defineComponent({
  data() {
    return {
      currentRoutes: [{}],
      settings,
      activeMenu: "/oper-review/employeeRegist",
      openeds: [],
    };
  },
  mounted() {
    // let paths = this.$store.state.permission.routes.map((item: any) => {
    //   return item.path;
    // });
    // this.openeds = paths;
    // 获取当前路由

    const route = useRoute();
    const { meta, fullPath } = route;
    // if set path, the sidebar will highlight the path you set
    // console.log('fullPath', fullPath);
    this.$nextTick(() => {
      this.activeMenu = fullPath;
    });
  },
  methods: {
    handleOpen(index) {
      console.log(index);
    },

    changeCurrentRoute(e: any) {
      // const store = useStore();
      // const router = useRouter();
      // 过滤符合规则的路由组
      // console.log('所有路由', this.$store.state.permission.routes);
      this.currentRoutes = this.$store.state.permission.routes;

      return;
      this.currentRoutes = (this.$store as any).state.permission.routes.filter(
        (item: any) => {
          if (e.path == item.path) {
            return item;
          }
          //处理默认页逻辑
          if (e.path === "/dashboard" && item.path === "/") {
            return item;
          }
        }
      );

      // 如果是刷新操作 走target路由
      if (e.target) {
        //解决渲染顺序问题
        this.$nextTick(() => {
          this.activeMenu = e.target;
        });
        (this.$router as any).push(e.target);
      } else {
        (this.$router as any).push(e.path);
      }
    },
  },
  computed: {
    isLivePage: () => {
      const store = useStore();
      return store.state.permission.isLivePage;
    },
    routes: () => {
      const store = useStore();
      return store.state.permission.routes;
    },
    isCollapse: () => {
      const store = useStore();
      return store.state.app.sidebar.opened;
    },
    variables: () => {
      // let data = JSON.parse(scssVariables.replace(/:export\s*/, ''))
      // console.log('scssVariables')
      // console.log(typeof data)
      return {
        menuText: "#bfcbd9",
        menuActiveText: "#409EFF",
        subMenuActiveText: "#f4f4f5",
        menuBg: "#304156",
        menuHover: "#263445",
        subMenuBg: "#1f2d3d",
        subMenuHover: "#001528",
        sideBarWidth: "210px",
      };
    },
    // 返回时渲染顺序发生了变化
    // activeMenu: () => {
    //   const route = useRoute();
    //   const { meta, fullPath } = route;
    //   // if set path, the sidebar will highlight the path you set
    //   if (meta.activeMenu) {
    //     return meta.activeMenu;
    //   }
    //   return fullPath;
    // }
  },
  components: {
    Logo,
    SidebarItem,

    // Item
  },
});
</script>

<style lang="scss">
.el-scrollbar__view {
  max-height: calc(100vh - 50px);
}
.el-menu {
  height: 100%;
}
.night .reset-menu-style {
  background: #121728;
  .el-menu {
    border: none;
    background: #121728;
    color: #999;
  }
  .el-scrollbar__wrap {
    padding-bottom: 8vh;
  }
}
</style>
