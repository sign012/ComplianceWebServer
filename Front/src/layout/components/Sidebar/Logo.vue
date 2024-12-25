<template>
  <div class="sidebar-logo-container" :class="{ collapse: collapse }" style="cursor: pointer" title="量加慧眼">
    <transition name="sidebarLogoFade">
      <div v-if="collapse" key="collapse" class="sidebar-logo-link">
        <img v-if="company == 'UP'" src="../../../assets/logo.png" style="width: 170px" class="sidebar-logo" />
        <div v-else>
          <img src="../../../assets/images/logo.png" class="sidebar-logo" />
          <h1 class="sidebar-title">{{ title }}</h1>
        </div>
      </div>
      <div v-else key="expand" class="sidebar-logo-link">
        <img v-if="company == 'UP'" src="../../../assets/logo.png" style="width: 170px" class="sidebar-logo" />
        <div v-else>
          <img src="../../../assets/images/logo.png" class="sidebar-logo" />
          <h1 class="sidebar-title">{{ title }}</h1>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
defineProps({
  collapse: {
    type: Boolean,
    required: true
  }
});
let title = import.meta.env.VITE_APP_TITLE;
let company = import.meta.env.VITE_APP_COMPANY;
// const state = reactive({
//   title: import.meta.env.VITE_APP_TITLE
//   // logo: '../assets/logo.png'
// });
// //export to page for
// let { title, logo } = toRefs(state);
</script>

<style lang="scss">
/*
   vue3.0 过度效果
   enter-> enter-from
   leave-> leave-from
  */
.sidebarLogoFade-enter-active {
  transition: opacity 2s;
}
.sidebarLogoFade-enter-from,
.sidebarLogoFade-leave-to {
  opacity: 0;
}

.sidebar-logo-container {
  position: relative;
  // width: 100%;
  height: 50px;
  line-height: 50px;
  padding-left: 14px;
  text-align: left;
  overflow: hidden;
  & .sidebar-logo-link {
    height: 100%;
    width: 100%;
    & .sidebar-logo {
      width: 32px;
      height: 32px;
      vertical-align: middle;
      margin-right: 12px;
    }
    & .sidebar-title {
      display: inline-block;
      margin: 0;
      color: #fff;
      font-weight: 500;
      line-height: 50px;
      font-size: 24px;
      font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
      vertical-align: middle;
    }
  }
  &.collapse {
    .sidebar-logo {
      margin-right: 0;
    }
  }
}
.sidebar-logo-container {
  background: #16191c;
}
</style>
