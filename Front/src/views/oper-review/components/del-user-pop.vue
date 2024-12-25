<template>
  <!-- 删除报备信息 -->
  <div v-dialogdrag>
    <el-dialog
      custom-class="up-pop del-pop"
      v-model="openUserPop"
      width="700px"
      title="提示"
      :close-on-click-modal="false"
      @close="clearForm"
    >
      <div style="font-size: 16px; height: 40px; line-height: 40px; box-sizing: border-box">
        <!-- <warning style="width: 2em; height: 2em; margin-right: 8px" color="#e6a23c" /> -->
        {{ delPopTitle }}
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
import { deleteLiveReportInfo } from '@/api/runCheck';

export default defineComponent({
  name: 'EmDelUserPop',
  components: {
    Warning
  },

  emits: ['renderList'],
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
        id: '',
        nickname: '',
        live_title: ''
      },
      openUserPop: false
    });

    const clearForm = () => {
      dataMap.openUserPop = false;
    };

    const save = async () => {
      let params = {
        id: dataMap.userDelForm.id
      };
      let res = await deleteLiveReportInfo(params);
      if (res.ret == 0) {
        ElMessage.success('删除成功');
        // dataMap.tableData = dataMap.tableData.filter((item) => item.id !== row.id);
        // dataMap.tableDataFilter = dataMap.tableDataFilter.filter((item) => item.id !== row.id);
        emit('renderList');
        clearForm();
      } else {
        ElMessage.error('删除失败');
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
