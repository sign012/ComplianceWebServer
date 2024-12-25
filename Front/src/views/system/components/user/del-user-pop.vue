<template>
  <!-- 删除用户 -->
  <div v-dialogdrag>
    <el-dialog
      custom-class="up-pop"
      v-model="openUserPop"
      width="400px"
      :title="delPopTitle"
      :close-on-click-modal="false"
      @close="clearForm"
    >
      <div style="font-size: 16px; height: 40px; line-height: 40px; box-sizing: border-box">
        <warning style="width: 2em; height: 2em; margin-right: 8px" color="#e6a23c" />
        注意：删除员工信息，数据将无法恢复！
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="clearForm" color="#343A4E" class="cancel-btn">取消</el-button>
          <el-button type="primary" @click="save">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, toRefs } from 'vue';
import { ElMessage } from 'element-plus';
import { setUserReq } from '@/api/user';
import { Warning } from '@element-plus/icons';

export default defineComponent({
  name: 'EmDelUserPop',
  components: {
    Warning
  },

  emits: ['getUserList'],
  props: {
    delPopTitle: {
      type: String,
      required: true,
      default: '删除用户'
    }
  },

  setup(props, { emit }) {
    const dataMap = reactive({
      userDelForm: {
        uid: '',
        realName: '',
        userType: '',
        mgrType: '',
        departId: ''
      },
      openUserPop: false
    });

    const clearForm = () => {
      dataMap.openUserPop = false;
    };

    const save = async () => {
      let retData: any = await setUserReq(
        {
          userbasic_uid: dataMap.userDelForm.uid,
          userbasic_usertype: dataMap.userDelForm.userType,
          mgrtype: dataMap.userDelForm.mgrType
        },
        'del'
      );

      if (retData.iRet === 0) {
        emit('getUserList', 'dept', dataMap.userDelForm.departId);
        ElMessage.success(`删除 ${dataMap.userDelForm.realName} 用户成功`);
        clearForm();
      } else {
        ElMessage.error({ message: retData.msg });
      }
    };

    return {
      clearForm,
      save,
      Warning,
      ...toRefs(dataMap)
    };
  }
});
</script>
