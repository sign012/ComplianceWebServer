<template>
  <!-- 设置用户密码 -->
  <div v-dialogdrag>
    <el-dialog
      custom-class="up-pop"
      v-model="openUserPop"
      width="500px"
      :title="from == 'system' ? '修改用户密码' : '修改用户密码'"
      :close-on-click-modal="false"
      @close="clearForm"
    >
      <el-form
        :model="userPwdForm"
        ref="userpwdformRef"
        size="mini"
        :rules="rules"
        label-width="100px"
        class="over-error-form"
      >
        <el-form-item label="用户账号">
          <el-input v-model="userPwdForm.uid" maxlength="16" disabled></el-input>
        </el-form-item>
        <el-form-item label="用户姓名">
          <el-input v-model="userPwdForm.realName" maxlength="6" disabled></el-input>
        </el-form-item>

        <el-form-item label="用户密码" maxlength="10" prop="password">
          <el-input
            v-model="userPwdForm.password"
            type="password"
            placeholder="请输入密码"
            autocomplete="new-password"
            :show-password="true"
          ></el-input>
        </el-form-item>
        <el-form-item label="确认密码" maxlength="10" prop="secondPwd">
          <el-input
            v-model="userPwdForm.secondPwd"
            type="password"
            placeholder="请确认密码"
            autocomplete="new-password"
            :show-password="true"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="clearForm" color="#343A4E" class="cancel-btn"
            >取消</el-button
          >
          <el-button type="primary" @click="save">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, toRefs } from "vue";
import { ElMessage } from "element-plus";
import { Md5 } from "md5-typescript";
import { setUserReq } from "@/api/user";

export default defineComponent({
  name: "changeUserPwdPop",

  emits: ["getUserList"],

  setup(props, { emit }) {
    const userpwdformRef = ref();
    const validateCPass = (rule: any, value: any, callback: any) => {
      if (value === "") {
        callback(new Error("请输入确认密码"));
      } else {
        if (dataMap.userPwdForm.secondPwd !== dataMap.userPwdForm.password) {
          callback(new Error("两次密码不一致"));
        }
        callback();
      }
    };

    const dataMap = reactive({
      from: "system",
      userPwdForm: {
        uid: "",
        realName: "",
        userType: "",
        mgrType: "",
        password: "",
        secondPwd: "",
      },
      openUserPop: false,

      rules: {
        password: [
          { required: true, trigger: "blur", message: "请输入密码" },
          {
            // pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/,
            // message: "密码必须包含字符和数字，并且长度为 8~20 位",
            pattern: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{}|;':",.<>?]).{8,20}$/,
            message:
              "密码必须包含大写字母、小写字母、数字和特殊字符，并且长度为 8 到 20 位",
            trigger: "blur",
          },
        ],
        secondPwd: { required: true, validator: validateCPass, trigger: "blur" },
      },
    });

    const clearForm = () => {
      userpwdformRef.value.resetFields();
      dataMap.openUserPop = false;
    };

    const save = () => {
      userpwdformRef.value.validate(async (valid: any) => {
        if (valid) {
          let pwd = Md5.init(
            Md5.init(dataMap.userPwdForm.uid + dataMap.userPwdForm.password)
          );
          let param = {
            userbasic_uid: dataMap.userPwdForm.uid,
            password: pwd,
            userbasic_usertype: dataMap.userPwdForm.userType,
            realname: dataMap.userPwdForm.realName,
            mgrtype: dataMap.userPwdForm.mgrType,
          };

          let retData = null;

          retData = await setUserReq(param, "pwd");

          if (retData.iRet === 0) {
            ElMessage.success(`更新用户 ${dataMap.userPwdForm.realName} 密码成功`);
            clearForm();
          } else {
            ElMessage.error({ message: retData.msg });
          }
        } else {
          return;
        }
      });
    };

    return {
      clearForm,
      save,
      userpwdformRef,
      ...toRefs(dataMap),
    };
  },
});
</script>
<style lang="scss"></style>
