<template>
  <!-- 机构管理 -->
  <div v-dialogdrag>
    <el-dialog title="重置密码" custom-class="up-pop" width="350px" @close="clearForm" v-model="changePop">
      <el-form :model="pwdForm" ref="pwdPop" :rules="rules" label-width="120px">
        <el-form-item label="新密码" prop="password">
          <el-input v-model="pwdForm.password" type="password" placeholder></el-input>
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirm">
          <el-input v-model="pwdForm.confirm" type="password" placeholder></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="changePop = false">取消</el-button>
          <el-button type="primary" @click="save">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ElMessage } from 'element-plus';
import { setUserReq } from '@/api/user';
import { Md5 } from 'md5-typescript';
export default defineComponent({
  data() {
    const validatePass = (rule: any, value: any, callback: any) => {
      let flag = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>《》/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？ ]");
      var reg = new RegExp('[\\u4E00-\\u9FFF]+', 'g');
      if (value === '') {
        callback(new Error('请输入密码'));
      } else if (flag.test(value) || reg.test(value)) {
        callback(new Error('存在特殊字符/中文'));
      } else if (value.length < 3) {
        callback(new Error('长度不能小于3'));
      } else {
        callback();
      }
    };
    const validateCPass = (rule: any, value: any, callback: any) => {
      if (value === '') {
        callback(new Error('请输入确认密码'));
      } else if (value !== (this.pwdForm as any).password) {
        callback(new Error('两次密码不一致'));
      } else {
        callback();
      }
    };
    return {
      changePop: false,
      pwdForm: {
        mgrtype: '',
        userbasic_uid: '',
        userbasic_usertype: '',
        password: '',
        confirm: ''
      },
      rules: {
        password: [{ required: true, validator: validatePass, trigger: 'blur' }],
        confirm: [{ required: true, validator: validateCPass, trigger: 'blur' }]
      }
    };
  },
  components: {},
  methods: {
    async save() {
      (this.$refs.pwdPop as any).validate(async (err: any) => {
        if (err) {
          let req = {
            mgrtype: this.pwdForm.mgrtype,
            userbasic_usertype: this.pwdForm.userbasic_usertype,
            userbasic_uid: this.pwdForm.userbasic_uid,
            password: Md5.init(Md5.init(`${this.pwdForm.userbasic_uid}${this.pwdForm.password}`))
          };
          let res = await setUserReq(req, 'pwd');
          if (res.iRet === 0) {
            ElMessage.success('修改成功');
            this.changePop = false;
          } else {
            ElMessage.error(res.msg);
          }
        } else {
          return;
        }
      });
    },
    clearForm() {
      this.pwdForm = {
        mgrtype: '',
        userbasic_uid: '',
        userbasic_usertype: '',
        password: '',
        confirm: ''
      };
    },
    init(data: any) {
      // console.log("💉💧🐂🍺 ~ data", data)
      this.changePop = true;
      this.pwdForm.mgrtype = data.mgrtype;
      this.pwdForm.userbasic_usertype = data.userbasic_usertype;
      this.pwdForm.userbasic_uid = data.userbasic_uid;
    }
  }
});
</script>
