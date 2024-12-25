<template>
  <!-- 设置柜台信息 -->
  <div v-dialogdrag>
    <el-dialog
      custom-class="up-pop"
      v-model="openCounterNodePop"
      width="870px"
      top="3%"
      :title="`${setType === 'add' ? '创建柜台' : '编辑柜台'}`"
      :close-on-click-modal="false"
      @close="clearForm"
    >
      <el-form
        ref="counternodeformRef"
        :inline="true"
        :model="counterNodeForm"
        :rules="rules"
        label-width="120px"
        size="mini"
      >
        <div class="create-bt-pop">
          <el-row :gutter="10">
            <el-col :span="12">
              <div class="grid-content bg-purple-dark">
                <el-row>
                  <el-col :span="24">
                    <div class="grid-content bg-purple-dark">
                      <el-form-item label="节点Id" prop="nodeid">
                        <el-input
                          v-model.trim="counterNodeForm.nodeid"
                          clearable
                          :disabled="true"
                          placeholder="自动生成柜台id"
                          style="width: 280px"
                        />
                      </el-form-item>
                    </div>
                  </el-col>
                </el-row>

                <el-row>
                  <el-col :span="24">
                    <div class="grid-content bg-purple-dark">
                      <el-form-item label="节点名称" prop="nodename">
                        <el-input
                          v-model.trim="counterNodeForm.nodename"
                          clearable
                          maxlength="50"
                          style="width: 280px"
                        ></el-input>
                      </el-form-item>
                    </div>
                  </el-col>
                </el-row>

                <el-row>
                  <el-col :span="24">
                    <div class="grid-content bg-purple-dark">
                      <el-form-item label="柜台协议类型" prop="ctype">
                        <el-select
                          v-model="counterNodeForm.ctype"
                          :disabled="setType === 'add' ? false : true"
                          style="width: 280px"
                        >
                          <el-option
                            v-for="item in counterTypeOption"
                            :key="item"
                            :label="item"
                            :value="item"
                          ></el-option>
                        </el-select>
                      </el-form-item>
                    </div>
                  </el-col>
                </el-row>

                <el-row>
                  <el-col :span="24">
                    <div class="grid-content bg-purple-dark">
                      <el-form-item label="主机TCP" prop="masterep">
                        <el-input
                          v-model="counterNodeForm.masterep"
                          clearable
                          maxlength="100"
                          style="width: 280px"
                        ></el-input>
                      </el-form-item>
                    </div>
                  </el-col>
                </el-row>

                <el-row>
                  <el-col :span="24">
                    <div class="grid-content bg-purple-dark">
                      <el-form-item label="备机TCP" prop="slaveep">
                        <el-input
                          v-model="counterNodeForm.slaveep"
                          clearable
                          maxlength="100"
                          style="width: 280px"
                        ></el-input>
                      </el-form-item>
                    </div>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="24">
                    <div class="grid-content bg-purple-dark">
                      <el-form-item label="是否启用">
                        <el-radio-group v-model="counterNodeForm.enable">
                          <el-radio :label="1">启用</el-radio>
                          <el-radio :label="0">禁用</el-radio>
                        </el-radio-group>
                      </el-form-item>
                    </div>
                  </el-col>
                </el-row>
              </div>
            </el-col>

            <el-col :span="12">
              <div class="grid-content bg-purple-dark">
                <el-row>
                  <el-col :span="24">
                    <el-form-item label-width="0" prop="riskDefineId">
                      <div>主机参数</div>
                      <el-input
                        v-model.trim="masterParamObj.key"
                        clearable
                        placeholder="key"
                        size="mini"
                        style="margin-bottom: 10px; width: 355px"
                      ></el-input>
                      <el-input
                        v-model.trim="masterParamObj.value"
                        clearable
                        placeholder="value"
                        size="mini"
                        style="width: 355px"
                      ></el-input>

                      <el-button size="mini" type="primary" :icon="Plus" @click="addParamTag('master')"></el-button>
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row>
                  <el-col :span="24">
                    <div class="grid-content bg-purple up-table-td">
                      <el-table :data="masterParamTag" border size="mini" height="200px">
                        <el-table-column label="KEY" prop="key"></el-table-column>
                        <el-table-column label="VALUE" prop="val"></el-table-column>
                        <el-table-column label="操作" width="60px" #default="scope">
                          <el-button type="text" class="delete-btn" @click="handleCloseTag(scope.row, 'master')">
                            删除
                          </el-button>
                        </el-table-column>
                      </el-table>
                    </div>

                    <!-- <div
                    class="grid-content bg-purple-dark"
                    style="border: 1px solid #e5e5e5; overflow: auto;width:325px; height: 120px; padding: 10px"
                  >
                    <el-tag
                      v-for="item in masterParamTag"
                      :key="item.key"
                      closable
                      size="mini"
                      style="margin-bottom: 5px; margin-right: 10px"
                      @close="handleCloseTag(item, 'master')"
                    >{{ item.key }} ：{{ item.val }}</el-tag>
                    
                    </div>-->
                  </el-col>
                </el-row>

                <el-row>
                  <el-col :span="24">
                    <el-form-item label-width="0" prop="riskDefineId">
                      <div>备机参数</div>
                      <el-input
                        v-model.trim="slaveParamObj.key"
                        clearable
                        placeholder="key"
                        size="mini"
                        style="width: 355px; margin-bottom: 10px"
                      ></el-input>
                      <el-input
                        v-model.trim="slaveParamObj.value"
                        clearable
                        placeholder="value"
                        size="mini"
                        style="width: 355px"
                      ></el-input>

                      <el-button size="mini" type="primary" :icon="Plus" @click="addParamTag('slave')"></el-button>
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row>
                  <el-col :span="24">
                    <el-table :data="slaveParamTag" border size="mini" height="200px">
                      <el-table-column label="KEY" prop="key"></el-table-column>
                      <el-table-column label="VALUE" prop="val"></el-table-column>
                      <el-table-column label="操作" width="60px" #default="scope">
                        <el-button type="text" class="delete-btn" @click="handleCloseTag(scope.row, 'slave')">
                          删除
                        </el-button>
                      </el-table-column>
                    </el-table>
                    <!-- <div
                    class="grid-content bg-purple-dark"
                    style="border: 1px solid #e5e5e5; overflow: auto;width:325px; height: 120px; padding: 10px"
                  >
                    <el-tag
                      v-for="item in slaveParamTag"
                      :key="item.key"
                      closable
                      size="mini"
                      style="margin-bottom: 5px; margin-right: 10px"
                      @close="handleCloseTag(item, 'slave')"
                    >{{ item.key }} ：{{ item.val }}</el-tag>
                    </div>-->
                  </el-col>
                </el-row>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="clearForm">取消</el-button>
          <el-button type="primary" :loading="sbtLoading" @click="setCounterNodeParams">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, nextTick, toRefs } from 'vue';
import { ElMessage } from 'element-plus';
import { CounterNodeTy, OrgTy } from '@/types/common';
import { setCounterNode } from '@/api/department';
import { Plus } from '@element-plus/icons';

export default defineComponent({
  name: 'EmCounterManagePop',

  emits: ['queryAllCounter'],
  props: {
    setType: {
      type: String,
      required: true,
      default: 'add'
    }
  },

  setup(props, { emit }) {
    const counternodeformRef = ref();

    // type obj = {
    //   [key:string]:string
    // }
    const checkTcp = (rule: any, value: any, callback: any) => {
      if (value === '') {
        callback(new Error('请输入tcp'));
      } else {
        let rule = /tcp\s-h\s\S*\s-p\s[1-9][0-9]*\s-t\s[1-9][0-9]*/;
        if (!rule.test(value)) {
          callback(new Error('格式:tcp -h 地址 -p 端口 -t xx '));
        }
        callback();
      }
    };
    const dataMap = reactive({
      counterNodeForm: {
        nodeid: '',
        nodename: '',
        ctype: '',
        masterep: '',
        slaveep: '',
        masterparam: {},
        slaveparam: {},
        extraparams: '',
        enable: 1
      },

      counterTypeOption: ['Fix', 'Event', 'Taf', 'Socket', 'http'],
      userExtraParams: {}, // 用户默认扩展字段

      masterParamObj: { key: '', value: '' },
      masterParamTag: [],
      slaveParamObj: { key: '', value: '' },
      slaveParamTag: [],

      openCounterNodePop: false,
      sbtLoading: false,

      rules: {
        // nodeid: { required: true, message: '请输入柜台ID', trigger: 'blur' },
        nodename: { required: true, message: '请输入柜台名称', trigger: 'blur' },
        ctype: { required: true, message: '请选择柜台环境类型', trigger: 'change' },
        masterep: { required: true, validator: checkTcp, trigger: 'blur' },
        slaveep: { required: true, validator: checkTcp, trigger: 'blur' }
      }
    });

    const clearForm = () => {
      counternodeformRef.value.resetFields();
      dataMap.openCounterNodePop = false;
    };

    /**
     * 提交设置柜台节点配置
     * */
    const setCounterNodeParams = () => {
      counternodeformRef.value.validate(async (valid: any) => {
        if (valid) {
          dataMap.sbtLoading = true;
          let _tempMaster: any = {},
            _tempSlave: any = {};

          // 组织参数集合
          dataMap.masterParamTag.length > 0 &&
            dataMap.masterParamTag.forEach((item: any) => {
              _tempMaster[`${item.key}`] = item.val;
            });

          dataMap.slaveParamTag.length > 0 &&
            dataMap.slaveParamTag.forEach((item: any) => {
              _tempSlave[`${item.key}`] = item.val;
            });

          let params = {
            nodeid: `${props.setType === 'add' ? 'CTI_' + new Date().getTime() : dataMap.counterNodeForm.nodeid}`,
            nodename: dataMap.counterNodeForm.nodename,
            ctype: dataMap.counterNodeForm.ctype,
            masterep: dataMap.counterNodeForm.masterep,
            slaveep: dataMap.counterNodeForm.slaveep,
            enable: dataMap.counterNodeForm.enable,
            masterparam: _tempMaster,
            slaveparam: _tempSlave
          };
          // console.log(' params ====> ', params);
          //
          // return;

          const retData: any = await setCounterNode(params, props.setType);
          dataMap.sbtLoading = false;

          if (retData.iRet === 0) {
            emit('queryAllCounter');
            ElMessage.success(
              `${props.setType === 'add' ? '添加' : '编辑'} ${dataMap.counterNodeForm.nodename} 节点成功`
            );
            clearForm();
          } else {
            ElMessage.error({ message: retData.msg });
          }
        } else {
          return false;
        }
      });
    };

    /**
     * 根据类型添加参数TAG
     * @param type master 主机参数   slave 备机参数
     * */
    const addParamTag = (type: string) => {
      if (type === 'master') {
        if (dataMap.masterParamObj.key === '' || dataMap.masterParamObj.value === '') return;

        let result: boolean = dataMap.masterParamTag.some((item: any) => {
          if (item.key == dataMap.masterParamObj.key) {
            return true;
          }
        });

        if (result) return;
        (dataMap.masterParamTag as any).push({
          key: dataMap.masterParamObj.key,
          val: dataMap.masterParamObj.value
        });
        dataMap.masterParamObj = { key: '', value: '' };
      } else if (type === 'slave') {
        if (dataMap.slaveParamObj.key === '' || dataMap.slaveParamObj.value === '') return;

        let result: boolean = dataMap.slaveParamTag.some((item: any) => {
          if (item.key == dataMap.masterParamObj.key) {
            return true;
          }
        });

        if (result) return;

        (dataMap.slaveParamTag as any).push({
          key: dataMap.slaveParamObj.key,
          val: dataMap.slaveParamObj.value
        });
        dataMap.slaveParamObj = { key: '', value: '' };
      }
    };

    /**
     * 删除tag
     * */
    const handleCloseTag = (data: any, type: string) => {
      if (type === 'master') {
        let _index = dataMap.masterParamTag.findIndex((ret: any) => ret.key === data.key && ret.val === data.val);
        dataMap.masterParamTag.splice(_index, 1);
      } else if (type === 'slave') {
        let _index = dataMap.slaveParamTag.findIndex((ret: any) => ret.key === data.key && ret.val === data.val);
        dataMap.slaveParamTag.splice(_index, 1);
      }
    };

    return {
      addParamTag,
      handleCloseTag,
      clearForm,
      setCounterNodeParams,
      counternodeformRef,
      Plus,
      ...toRefs(dataMap)
    };
  }
});
</script>
