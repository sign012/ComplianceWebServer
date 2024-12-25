<template>
  <!-- 管理员信息编辑 -->
  <div>
    <el-form
      :model="adminForm"
      ref="form"
      :rules="rules"
      label-width="130px"
      style="margin-top: 20px; width: 400px; margin: 40px auto"
    >
      <el-form-item label="机构管理员姓名" prop="realname">
        <el-input v-model="adminForm.realname" placeholder></el-input>
      </el-form-item>
      <el-form-item label="机构管理员账号" prop="userbasic_uid">
        <el-input
          v-model="adminForm.userbasic_uid"
          :disabled="setType === 'edit' && adminForm.userbasic_uid != null"
          placeholder
        ></el-input>
      </el-form-item>
      <div v-if="setType === 'add' || setType === 'exAdd'">
        <el-form-item :label="`用户${setType === 'add' ? '' : '新'}密码`" prop="password">
          <el-input v-model="adminForm.password" type="password" placeholder></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirm">
          <el-input v-model="adminForm.confirm" type="password" placeholder></el-input>
        </el-form-item>
      </div>
      <el-form-item label="管理员手机号码" prop="userbasic_exinfo_telno">
        <el-input v-model="adminForm.userbasic_exinfo_telno" placeholder></el-input>
      </el-form-item>
    </el-form>
    <div style="text-align: right">
      <el-button type @click="close">取消</el-button>
      <!-- <el-button type="primary" v-if="setType === 'add'" @click="prev">上一步</el-button> -->
      <el-button type="primary" v-if="setType === 'add'" @click="next">下一步</el-button>
      <el-button type="primary" v-else @click="save">保存</el-button>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { checkUser, addUserReq, setUserReq } from '@/api/user';
import { ElMessage } from 'element-plus';
import { Md5 } from 'md5-typescript';
type admin = {
  [key: string]: string;
};
export default defineComponent({
  emits: ['finish', 'close', 'prev'],
  props: ['setType'],
  data() {
    let validatePass = (rule: any, value: any, callback: any) => {
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
    let validateCPass = (rule: any, value: any, callback: any) => {
      if (value === '') {
        callback(new Error('请输入确认密码'));
      } else if (value !== (this.adminForm as any).password) {
        callback(new Error('两次密码不一致'));
      } else {
        callback();
      }
    };
    const validateUid = (rule: any, value: any, callback: any) => {
      let flag = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>《》/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？ ]");
      var reg = new RegExp('[\\u4E00-\\u9FFF]+', 'g');
      if (value === '') {
        callback(new Error('请输入账号'));
      } else if (flag.test(value) || reg.test(value)) {
        callback(new Error('存在特殊字符/中文'));
      } else if (value.length < 3) {
        callback(new Error('长度不能小于3'));
      } else {
        callback();
      }
    };
    let validateName = (rule: any, value: any, callback: any) => {
      let flag = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>《》/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？ ]");
      if (value === '') {
        callback(new Error('请输入机构管理员姓名'));
      } else if (flag.test(value)) {
        callback(new Error('存在特殊字符'));
      } 
      // else if (value.length < 2) {
      //   callback(new Error('长度不能小于2'));
      // } 
      else {
        callback();
      }
    };
    return {
      dialogVisible: false,
      adminForm: {
        orgid: '',
        realname: '',
        userbasic_uid: '',
        password: '',
        confirm: '',
        userbasic_exinfo_telno: ''
      },
      rules: {
        realname: [
          {
            required: true,
            validator: validateName,
            trigger: 'blur'
          }
        ],
        userbasic_uid: [
          { required: true, validator: validateUid, trigger: 'blur' },
        ],
        password: [{ required: true, validator: validatePass, trigger: 'blur' }],
        userbasic_exinfo_telno: [
          {
            min: 11,
            message: '请输入正确的手机号'
          }
        ],
        confirm: [{ required: true, validator: validateCPass, trigger: 'blur' }]
      }
    };
  },
  created() {
    console.log(this.setType);
  },
  methods: {
    async save() {
      (this.$refs['form'] as any).validate(async (err: any) => {
        if (err) {
          let req: any = {
            userbasic_uid: this.adminForm.userbasic_uid,
            realname: this.adminForm.realname,
            userbasic_exinfo_telno: this.adminForm.userbasic_exinfo_telno || '',
            userbasic_usertype: 'A',
            userbasic_userstatus: 0,
            mgrtype: 'O',
            userbasic_rids: '1' //机构管理员权限
          };
          let resData;
          if (this.setType === 'exAdd') {
            req.orgid = this.adminForm.orgid;
            req.userbasic_password = Md5.init(Md5.init(this.adminForm.userbasic_uid + this.adminForm.password));
            resData = await addUserReq(req);
          } else {
            resData = await setUserReq(req, 'update');
          }
          if (resData.iRet === 0) {
            this.$emit('finish');
            ElMessage.success('编辑成功');
          } else {
            ElMessage.error(resData.msg);
          }
        }
      });
    },
    prev() {
      this.$emit('prev');
    },
    next() {
      (this.$refs['form'] as any).validate(async (err: any) => {
        if (err) {
          let res = await checkUser(this.adminForm);
          if (res.iRet === 0) {
            (this.adminForm as admin).userbasic_usertype = 'A';
            (this.adminForm as admin).mgrtype = 'O';
            (this.adminForm as admin).userbasic_rids = '1';
            (this.adminForm as admin).userbasic_password = Md5.init(
              Md5.init(this.adminForm.userbasic_uid + this.adminForm.password)
            );
            let param = {
              ...this.adminForm,
              userbasic_userstatus: 0
            };
            let resData = await addUserReq(param);
            if (resData.iRet === 0) {
              this.$emit('finish', { adminForm: { orgid: this.adminForm.orgid } });
              ElMessage.success('管理员添加成功');
            } else {
              ElMessage.error(res.msg);
            }
          } else {
            ElMessage.error(res.msg);
          }
        } else {
          return;
        }
        // this.$emit('finish', { adminForm: { orgid: '123456' } }); //测试路径
      });
    },
    close() {
      this.$emit('close');
    },
    clearForm() {
      (this.$refs['form'] as any).clearValidate();
      for (let key in this.adminForm) {
        (this.adminForm as admin)[key] = '';
      }
    }
  }
});
</script>
