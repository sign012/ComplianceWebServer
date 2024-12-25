<template>
  <div class="login-container columnCC">
    <div class="title-container">
      <!-- <h3 class="title text-center">{{ title }}</h3> -->
      <img src="../../assets/logo-plus.png" alt="" />
      <div class="title">优品智能化合规风控平台</div>
    </div>
    <el-form
      ref="refloginForm"
      size="medium"
      class="login-form"
      :model="formInline"
      :rules="formRulesMixin"
    >
      <el-form-item prop="username" :rules="formRulesMixin.isNotNull">
        <div class="rowSC">
          <span class="svg-container">
            <svg-icon icon-class="user" />
          </span>
          <el-input
            v-model="formInline.username"
            @keyup.enter="handleLogin"
            placeholder="用户名"
          />
          <!--占位-->
          <div class="show-pwd" />
        </div>
      </el-form-item>
      <!--<el-form-item prop="password" :rules="formRulesMixin.passwordValid">-->
      <el-form-item prop="password" :rules="formRulesMixin.isNotNull">
        <div class="rowSC">
          <span class="svg-container">
            <svg-icon icon-class="password" />
          </span>
          <el-input
            :key="passwordType"
            ref="refPassword"
            v-model="formInline.password"
            :type="passwordType"
            name="password"
            @keyup.enter="handleLogin"
            placeholder="密码"
          />
          <!-- <span class="show-pwd" @click="showPwd">
            <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
          </span> -->
        </div>
      </el-form-item>
      <el-form-item label="">
        <span class="svg-container">
          <svg-icon icon-class="yzm" />
        </span>
        <el-input
          ref="yzm"
          v-model="formInline.yzm"
          @keyup.enter="handleLogin"
          placeholder="验证码"
          name="yzm"
          style="width: 120px"
          type="text"
          tabindex="3"
          maxlength="6"
        />

        <img
          style="position: absolute; width: 100px; height: 38px; right: 0px; top: 2px"
          @load="verifyLoadState = true"
          @click="toggleVerify"
          :src="verify"
          alt=""
        />
      </el-form-item>
      <!-- <div class="tip-message">{{ tipMessage }}</div> -->
      <el-button
        :loading="loading"
        type="primary"
        class="login-btn"
        size="medium"
        @click.prevent="handleLogin"
      >
        登录
      </el-button>
    </el-form>
  </div>
</template>

<script lang="ts">
/*可以设置默认的名字*/
export default {
  name: "Login",
};
</script>

<script setup lang="ts">
import {
  reactive,
  getCurrentInstance,
  watch,
  ref,
  nextTick,
  onMounted,
  computed,
} from "vue";
import settings from "@/settings";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import { ElMessage } from "element-plus";
import { ObjTy } from "@/types/common";

let { proxy }: any = getCurrentInstance();

import { Md5 } from "md5-typescript";

let env = process.env.NODE_ENV;
let isFirstClick = true;
//form
let formInline: any = reactive({
  username: env === "serve-dev" ? "admin" : localStorage.getItem("last_loginName") || "",
  password: env === "serve-dev" ? "up_2024" : "",
});
let title = import.meta.env.VITE_APP_TITLE;
let state: ObjTy = reactive({
  otherQuery: {},
  redirect: undefined,
});
/* listen router change  */
const route = useRoute();
let getOtherQuery = (query: ObjTy) => {
  return Object.keys(query).reduce((acc: ObjTy, cur) => {
    if (cur !== "redirect") {
      acc[cur] = query[cur];
    }
    return acc;
  }, {});
};

watch(
  route,
  (route) => {
    const query = route.query;
    if (query) {
      state.redirect = query.redirect;
      state.otherQuery = getOtherQuery(query);
    }
  },
  { immediate: true }
);
/*
 *  login relative
 * */
let verifyLoadState = ref(true);
let verify = ref("");
let verifyCode = ref("");
let loading = ref(false);
let tipMessage = ref("");
const store = useStore();
let handleLogin = () => {
  let refloginForm = "";
  proxy.$refs["refloginForm"].validate((valid: boolean) => {
    if (valid) {
      loginReq();
    } else {
      return false;
    }
  });
};
let loginReq = () => {
  loading.value = true;
  let params: any = {
    username: formInline.username,
    password: formInline.password,
    yzm: formInline.yzm,
  };
  try {
    let ctsn = returnCitySN;
    if (ctsn) {
      params.remark = JSON.stringify(ctsn); // env === 'serve-dev' ? '' : returnCitySN ? JSON.stringify(returnCitySN) : '' // 获取用户登入的 ip地址
    }
  } catch (error) {
    console.log("ip 地址获取失败");
  }

  params.password = Md5.init(Md5.init(formInline.username + formInline.password));
  store
    .dispatch("user/login", params)
    .then(() => {
      ElMessage({ message: "登录成功", type: "success" });
      localStorage.setItem("last_loginName", formInline.username);
      proxy.$router.push({ path: state.redirect || "/", query: state.otherQuery });
    })
    .catch((res) => {
      ElMessage({ message: res.msg, type: "error" });
      proxy.sleepMixin(30).then(() => {
        loading.value = false;
      });
    });
};

/*
 *  password show or hidden
 * */
let passwordType = ref("password");
const refPassword: any = ref(null);
let showPwd = () => {
  if (passwordType.value === "password") {
    passwordType.value = "";
  } else {
    passwordType.value = "password";
  }
  proxy.$nextTick(() => {
    refPassword.value.focus();
  });
};

// 旧版本

let toggleVerify = (e?: any) => {
  if (!verifyLoadState.value) return;
  // 防止下一次重复点击
  verifyLoadState.value = false;
  let key = parseInt((Math.random() * 100).toFixed(0));
  let id;
  let value: any = store.state.user.yzmid;
  console.log("value", value);
  if (!value) {
    id = key + "" + Date.now();
    store.commit("user/M_SET_yzmid", id);
    console.log("store.commit", id);
  } else {
    id = value;
  }
  console.log("id", id);
  verify.value = `${
    import.meta.env.VITE_APP_BASE_URL
  }/login/verify?t=${Date.now()}&id=${id}`;
};
// toggleVerify();

// // // // 新版本
// let timer = null;
// let toggleVerify = (e?: any) => {
//   if (!verifyLoadState.value) return;
//   // 防止下一次重复点击
//   verifyLoadState.value = false;
//   timer = setInterval(() => {
//     let key = parseInt((Math.random() * 100).toFixed(0));
//     let id;
//     let value = window.sessionStorage.getItem('yzm_id');
//     console.log('value',value);
//     if (!value) {
//       id = key + '' + Date.now();
//       window.sessionStorage.setItem('yzm_id', id);
//     } else {
//       id = value;
//       clearInterval(timer);
//     }
//     console.log('id===>', id);
//     window.sessionStorage.setItem('yzm_id', id);
//     console.log('sessionStorage.setItem', window.sessionStorage);
//     verify.value = `${import.meta.env.VITE_APP_BASE_URL}/login/verify?t=${Date.now()}&id=${id}`;
//   }, 50);
// };
onMounted(() => {
  nextTick(() => {
    toggleVerify();
  });
});

// document.addEventListener('click', function (event) {
//   if (isFirstClick) {
//     console.log('isFirstClick');
//     toggleVerify();
//     isFirstClick = false;
//   } else {
//     console.log('not first click');
//   }
// });
</script>

<style lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;

.login-container {
  height: 100vh;
  width: 100%;
  background-color: #121728;
  background-image: url("../../assets/login_bg.png");
  background-size: contain;
  .login-form {
    position: relative;
    margin-bottom: 22vh;
    width: 340px;
    padding: 30px;
    background: #131828;
    border-radius: 12px; /* 设置圆角 */
    overflow: hidden; /* 隐藏伪元素超出部分 */
  }
  .login-form::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border: 2px solid transparent;
    border-radius: inherit; /* 继承父元素的圆角 */
    background: linear-gradient(to bottom, #3c414c, rgba(60, 65, 76, 0.05)) border-box;
    mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
    mask-composite: exclude;
    -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    pointer-events: none; /* 确保伪元素不会影响鼠标事件 */
    // border-color: linear-gradient(to bottom, #3c414c, rgba(60, 65, 76, 0.05));
  }

  .title-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 60px;
    img {
      width: 252px;
      margin-bottom: 30px;
    }
    .title {
      font-size: 40px;
      color: #eee;
      margin: 0 auto 25px auto;
      text-align: center;
      font-weight: bold;
      font-family: "DouyinFont", sans-serif;
    }
  }
}

.svg-container {
  font-size: 20px;
  padding-left: 10px;
  color: $dark_gray;
  text-align: center;
  width: 30px;
}

//错误提示信息
.tip-message {
  color: #e4393c;
  height: 30px;
  margin-top: -12px;
  font-size: 12px;
}

//登录按钮
.login-btn {
  width: 100%;
  margin-bottom: 30px;
}

.show-pwd {
  width: 50px;
  font-size: 16px;
  color: $dark_gray;
  cursor: pointer;
  text-align: center;
}
</style>

<style lang="scss">
//css 样式重置 增加个前缀避免全局污染
.login-container {
  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: #050914;
    border-radius: 5px;
    color: #454545;
  }

  .el-input input {
    background: transparent;
    border: 0px;
    -webkit-appearance: none;
    border-radius: 0px;
    padding: 10px 5px 10px 15px;
    color: #fff;
    height: 42px; //此处调整item的高度
    caret-color: #fff;
  }
}
</style>
