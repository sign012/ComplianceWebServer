<template>
  <!-- 设置柜台信息 -->
  <div v-dialogdrag>
    <el-dialog
      custom-class="up-pop"
      v-model="openCounterOrgPop"
      width="500px"
      title="创建柜台机构关联关系"
      :close-on-click-modal="false"
      @close="clearForm"
    >
      <el-form
        ref="counterorgformRef"
        :inline="true"
        :model="counterOrgForm"
        :rules="rules"
        label-width="80px"
        size="mini"
      >
        <div class="create-bt-pop">
          <el-row>
            <el-col :span="24">
              <div class="grid-content bg-purple-dark">
                <el-form-item label="柜台节点" prop="nodeid">
                  <el-select v-model="counterOrgForm.nodeid" style="width: 280px">
                    <el-option
                      v-for="(label, key) in counterNodeObj"
                      :key="key"
                      :label="label"
                      :value="key"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </div>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="24">
              <div class="grid-content bg-purple-dark">
                <el-form-item label="机构" prop="orgid">
                  <el-select v-model="counterOrgForm.orgid" style="width: 280px">
                    <el-option v-for="(label, key) in orgObj" :key="key" :label="label" :value="key"></el-option>
                  </el-select>
                </el-form-item>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="clearForm">取消</el-button>
          <el-button type="primary" :loading="sbtLoading" @click="setCounterOrgParams">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, toRefs } from 'vue';
import { ElMessage } from 'element-plus';
import { setCounterOrgLine } from '@/api/department';

export default defineComponent({
  name: 'EmCounterOrgManagePop',

  emits: ['queryAllCounterOrg'],
  props: {
    counterNodeObj: {
      type: Object,
      required: true,
      default: () => {
        return {};
      }
    },
    orgObj: {
      type: Object,
      required: true,
      default: () => {
        return {};
      }
    }
  },

  setup(props, { emit }) {
    const counterorgformRef = ref();

    // type obj = {
    //   [key:string]:string
    // }

    const dataMap = reactive({
      counterOrgForm: {
        nodeid: '',
        orgid: ''
      },

      openCounterOrgPop: false,
      sbtLoading: false,

      rules: {
        nodeid: { required: true, message: '请选择柜台节点', trigger: 'change' },
        orgid: { required: true, message: '请选择机构', trigger: 'change' }
      }
    });

    const clearForm = () => {
      counterorgformRef.value.resetFields();
      dataMap.openCounterOrgPop = false;
    };

    /**
     * 提交设置柜台节点配置
     * */
    const setCounterOrgParams = () => {
      counterorgformRef.value.validate(async (valid: any) => {
        if (valid) {
          dataMap.sbtLoading = true;
          //
          // let _nodeObj: any = props.counterNodeList.filter((item: any) => item.key === dataMap.counterOrgForm.nodeid);
          // let _orgObj: any = props.counterNodeList.filter((item: any) => item.key === dataMap.counterOrgForm.orgid);

          let params = {
            nodeid: dataMap.counterOrgForm.nodeid,
            nodename: props.counterNodeObj[dataMap.counterOrgForm.nodeid],
            orgid: dataMap.counterOrgForm.orgid,
            orgname: props.orgObj[dataMap.counterOrgForm.orgid]
          };

          const retData: any = await setCounterOrgLine(params, 'add');
          dataMap.sbtLoading = false;

          if (retData.iRet === 0) {
            emit('queryAllCounterOrg');
            ElMessage.success(`添加${params.nodename}/${params.orgname} 关联关系成功`);
            clearForm();
          } else {
            ElMessage.error({ message: retData.msg });
          }
        } else {
          return false;
        }
      });
    };

    return {
      clearForm,
      setCounterOrgParams,
      counterorgformRef,
      ...toRefs(dataMap)
    };
  }
});
</script>
