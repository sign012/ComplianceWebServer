<template>
  <div class="navbar rowBC">
    <div class="rowSC">
      <!--logo-->
      <Logo v-if="isLivePage" />
      <hamburger
        v-if="settings.showHamburger"
        :is-active="opened"
        class="hamburger-container"
        @toggleClick="toggleSideBar"
      />
      <ParentRouter ref="pRoute" @childClick="childClick" />
      <Breadcrumb class="breadcrumb-container" />
    </div>
    <!--nav title-->
    <!-- <div class="heardCenterTitle" v-if="settings.showTitle">{{ settings.showTitle }}</div> -->
    <div class="com-nav">{{ userInfo.comName }}</div>
    <div class="right-menu" v-if="settings.ShowDropDown">
      <!-- <el-dropdown trigger="click" size="medium">
        <div><img style="width: 24px; height: 24px; margin-right: 23px" src="../../assets/images/bt_skin.png" /></div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="change('night')">
              <img
                v-show="currentStyle === 'night'"
                style="position: absolute; left: 8px; width: 14px; height: 14px"
                src="@/assets/images/selected.png"
              />
              <i class="el-icon-lock"></i>
              经典暗黑
            </el-dropdown-item>
            <el-dropdown-item @click="change('light')">
              <img
                v-show="currentStyle === 'light'"
                style="width: 14px; height: 14px"
                src="@/assets/images/selected.png"
              />
              <i class="el-icon-switch-button"></i>
              淡雅浅灰
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown> -->
      <!-- <el-badge :value="totalNum" :max="99" class="warm" @click="go" type="danger">
        <img style="width: 24px; height: 24px" src="../../assets/images/warning.png" />
      </el-badge> -->

      <el-dropdown trigger="click" size="medium">
        <div class="avatar-wrapper">
          <span style="font-size: 16px; color: #999; cursor: pointer; min-width: 120px">{{
            username
          }}</span>
          <i class="el-icon-caret-bottom" style="top: 2px" />
          <img class="icon-down" src="../../assets/images/down.png" />
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <!-- <router-link to="/dashboard">
              <el-dropdown-item>
                <i class="el-icon-s-home"></i>
                返回首页
              </el-dropdown-item>
            </router-link> -->

            <el-dropdown-item @click="updatePwd">
              <i class="el-icon-lock"></i>
              修改密码
            </el-dropdown-item>

            <el-dropdown-item @click="loginOut">
              <!-- <span style="display: block" @click="loginOut"> -->
              <i class="el-icon-switch-button"></i>
              退出登录
              <!-- </span> -->
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <!-- 重置密码 -->
    <SetUserPwdTPL ref="setUserPwdPopRef"></SetUserPwdTPL>
  </div>
</template>

<script setup lang="ts">
import Logo from "./Sidebar/Logo";
import Breadcrumb from "./Breadcrumb";
import ParentRouter from "./ParentRouter";
import Hamburger from "./Hamburger";
import { computed, getCurrentInstance, onMounted, ref } from "vue";
import settings from "@/settings";
import { useStore } from "vuex";
import { ElMessage } from "element-plus";
import SetUserPwdTPL from "@/views/system/components/user/set-user-password.vue";
let { proxy }: any = getCurrentInstance();
let pRoute = ref();
let totalNum = ref(0);
let timer = ref();
let currentStyle = ref("night");
let setUserPwdPopRef = ref();
let user: any = computed(() => {
  return proxy.$store.state.user;
});
const opened = computed(() => {
  return proxy.$store.state.app.sidebar.opened;
});
const toggleSideBar = () => {
  proxy.$store.commit("app/M_toggleSideBar");
};

// if (timer.value) clearInterval(timer.value)
// timer.value = setInterval(getNumber, 30000)
/*
 * 退出登录
 * */

const store = useStore();
const username = computed(() => {
  return store.state.user.username;
});
const isLivePage = computed(() => {
  return proxy.$store.state.permission.isLivePage;
});
const userInfo = computed(() => {
  return proxy.$store.state.user;
});
const loginOut = () => {
  store.dispatch("user/logout").then(() => {
    ElMessage({ message: "退出登录成功", type: "success" });
    store.commit("permission/M_isGetUserInfo", false);
    //刷新重新加载路由
    location.reload();
    // proxy.$router.push(`/login`);
  });
};
const updatePwd = () => {
  setUserPwdPopRef.value.userPwdForm = {
    uid: user.value.userid,
    realName: user.value.username,
    userType: user.value.userType,
    mgrType: user.value.userMgrType,
    password: "",
    secondPwd: "",
  };

  setUserPwdPopRef.value.from = "nav";
  setUserPwdPopRef.value.openUserPop = true;
};
const emit = defineEmits(["childClick"]);
function childClick(e: any) {
  emit("childClick", e);
}
function go() {}
function change(type: string) {
  currentStyle.value = type;
  document.body.classList = [type];
  localStorage.setItem("tStyle", type);
}
onMounted(() => {
  let type = localStorage.getItem("tStyle") || "night";
  change(type);
});
</script>

<style lang="scss" scoped>
.navbar {
  height: $navBarHeight;
  overflow: hidden;
  position: relative;
}

//logo
.avatar-wrapper {
  margin-top: 5px;
  position: relative;

  .user-avatar {
    cursor: pointer;
    width: 40px;
    height: 40px;
    border-radius: 10px;
  }

  .el-icon-caret-bottom {
    cursor: pointer;
    position: absolute;
    right: -20px;
    top: 25px;
    font-size: 12px;
  }
}
.warm {
  margin-right: 20px;
  font-size: 20px;
  cursor: pointer;
}
//drop-down
.right-menu {
  display: flex;
  position: relative;
  margin-right: 20px;
}
.icon-down {
  width: 16px;
  height: 16px;
  margin-left: 10px;
  position: relative;
  top: 3px;
}
.night .el-dropdown__popper .el-dropdown-menu {
  background: #4d4d50;

  font-size: 12px;
}
.night .el-dropdown__popper .el-dropdown-menu {
  background: #4d4d50;

  font-size: 12px;
}
.night .el-dropdown-menu__item {
  color: #fff;
  padding: 2px 20px !important;
}
.night .el-dropdown-menu__item:not(.is-disabled):hover {
  background: #414144;
  color: #fff;
}
.el-popper__arrow::before {
  display: none !important;
}
.com-nav {
  font-size: 14px;
  color: #58a5ff;
  margin-right: 60px;
  margin-top: 5px;
  padding: 4px 10px;
  line-height: 20px;
  border: 1px solid #58a5ff;
  border-radius: 20px;
}
</style>
