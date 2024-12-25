<template>
  <!-- 父类菜单栏 -->
  <div>
    <div class="menu" v-if="false">
      <div
        v-for="(item, index) of menuList"
        :class="[index == activeIndex ? 'is-active' : '', item.icon]"
        :key="index"
        @click="getChild(index, item.route)"
        class="menu-item"
      >
        <!-- <el-icon>
          <folder />
        </el-icon> -->
        {{ item.label }}
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import store from '@/store';
// import { Folder } from '@element-plus/icons';
import { defineComponent, getCurrentInstance, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
export default defineComponent({
  // components: {
  //   Folder
  // },
  setup() {
    let { proxy }: any = getCurrentInstance();
    watch(
      () => proxy.$route,
      () => {
        let path = `/${proxy.$route.path.split('/')[1]}`;
        proxy.openPage(path, proxy.$route.path);
      }
    );
  },
  data() {
    return {
      activeIndex: -1,
      templatArr: [],
      menuList: []
    };
  },
  created() {
    this.makeMenuList();
  },
  mounted() {
    const route = useRoute();
    this.menuList.forEach((e: any, index: any) => {
      if (`/${route.path.split('/')[1]}` == e.route) {
        this.activeIndex = index;
        this.$emit('childClick', { path: e.route, target: route.path });
      }
    });
  },
  methods: {
    getChild(index: any, path: string) {
      if (this.activeIndex != index) {
        this.activeIndex = index;
        this.$emit('childClick', { path });
      }
    },
    makeMenuList() {
      const store = useStore();
      this.templatArr = store.state.permission.routes.filter((e: any) => {
        if (!e.hidden && e.path != '/') {
          return e;
        }
      });

      (this.menuList as any) = this.templatArr.map((e: any) => {
        return {
          label: e.meta.title,
          route: e.path === '/' ? '/dashboard' : e.path,
          icon: `${e.meta.icon}`
        };
      });
    },
    openPage(path: string, target: string, out: string) {
      this.menuList.forEach((e: any, index: any) => {
        if (path == e.route) {
          this.activeIndex = index;
          this.$emit('childClick', { path, target, out });
        }
      });
    }
  }
});
</script>
<style lang="scss" scoped>
.menu {
  display: flex;
}
.menu-item {
  line-height: 54px;
  min-width: 115px;
  padding: 0 20px;
  color: #999;
  cursor: pointer;
  font-size: 16px;
  text-align: center;
}
.is-active {
  // background: #4f5158;
  color: #d6b26d;
  position: relative;
  &::after {
    content: '';
    position: absolute;
    height: 2px;
    background-image: linear-gradient(225deg, #e8cd96 0%, #d0a95f 100%);
    left: 22%;
    right: 22%;
    bottom: 2px;
  }
}
</style>
