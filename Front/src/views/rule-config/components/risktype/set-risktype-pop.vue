<template>
  <div v-dialogdrag>
    <el-dialog
      :close-on-click-modal="false"
      :title="`风险类别${setType === 'add' ? '添加' : '编辑'} `"
      custom-class="up-pop risktype-pop"
      v-model="dialogVisible"
      @close="dialogVisible = false"
    >
      <p class="tip">(待分配标签个数：{{ count }})</p>
      <el-collapse v-model="activeNames" @change="handleChange">
        <el-collapse-item :title="item.label" :name="item.id" v-for="(item, index) in labelTypeList" :key="index">
          <!-- <div>类别名称：{{ item.label }}</div> -->
          <div class="check-box-list">
            <el-checkbox
              :id="items.label_id"
              v-model="items.checked"
              v-for="(items, ind) in item.children"
              :key="ind"
              :disabled="items.disabled"
            >
              <div class="label" :class="{ isDisabled: items.disabled }">{{ items.label_name }}</div>
            </el-checkbox>
          </div>
        </el-collapse-item>
      </el-collapse>
      <div v-for="(item, index) in typeListData" :key="index" class="risk-type-item">
        <div class="label normal-input">
          <el-input v-model="item.label_name" placeholder="请输入类别名称"></el-input>
        </div>
        <div class="tag-list">
          <span class="tag-item" v-for="(label, index) in item.original_lables" :key="index">
            {{ label.label_name }}
            <span class="close" @click="removeLabelFromType(item.index, label.label_id, label.label_type)">
              <el-icon>
                <Close />
              </el-icon>
            </span>
          </span>
        </div>

        <el-button color="#FF2323" class="add-btn" @click="delLabelToType(item.index)">删除</el-button>
        <el-button color="#3A62F7" class="add-btn" @click="addLabelToType(item.index)">添加已勾选</el-button>
      </div>
      <el-button color="#343d5c" @click="addFlag = true" v-if="!addFlag" style="margin-left: 0px !important">
        新增类别
        <el-icon>
          <CirclePlusFilled />
        </el-icon>
      </el-button>
      <div class="add-list" v-if="addFlag" style="width: 200px">
        <div style="margin-right: 8px">
          <el-input v-model="addInput" placeholder="请输入新词">
            <template #suffix>
              <el-button color="#3a62f7" @click="validInput" size="small" class="add-btn">添加</el-button>
            </template>
          </el-input>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false" color="#343A4E" class="cancel-btn">取消</el-button>
          <el-button type="primary" @click="save">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { queryOriginalLabelInfo, updateCustomizeLabelInfo } from '@/api/runCheck';
import { ElMessage } from 'element-plus';
import { Search, CirclePlusFilled, Close } from '@element-plus/icons';
import { labelTypeList } from '@/utils/dict.ts';

export default defineComponent({
  components: {
    Search,
    CirclePlusFilled,
    Close
  },
  emits: ['finish'],
  data() {
    return {
      dialogVisible: false,
      loading: false,
      setType: 'add',
      activeNames: ['1', '2', '3', '4'],
      labelTypeList: [] as any, // 分类标签列表
      riskTypeData: [], // 风险分类数据
      typeListData: [], // 已分类数据
      count: 0, // 待分配标签
      addFlag: false,
      addInput: '' // 新增大类名称
    };
  },

  watch: {
    dialogVisible: {
      handler(val) {
        if (!val) {
          this.riskTypeData = [];
          this.typeListData = [];
          this.labelTypeList = [];
        }
      }
    },
    labelTypeList: {
      handler(val) {
        let count = 0;
        val.forEach((item) => {
          item.children.forEach((child) => {
            if (child.disabled == false) {
              count++;
            }
          });
        });
        this.count = count;
      },
      deep: true
    }
  },
  computed: {
    isAdmin() {
      return this.$store.state.user.userMgrType === 'S';
    }
  },
  methods: {
    async save() {
      if (this.count > 0) {
        this.$message.error('请分配所有标签');
        return;
      }
      console.log('this.typeListData====>', this.typeListData);
      if (this.typeListData.some((item) => item.label_name == '')) {
        this.$message.error('类别名称不能为空');
        return;
      }
      // return;
      let params = {
        info_list: this.typeListData
      };
      let res = await updateCustomizeLabelInfo(params);
      if (res.ret === 0) {
        this.$emit('finish');
        this.dialogVisible = false;
        ElMessage.success('保存成功');
      } else {
        ElMessage.error('保存失败');
      }
    },
    async getAllLabels() {
      this.labelTypeList = JSON.parse(JSON.stringify(labelTypeList));
      let res = await queryOriginalLabelInfo();
      if (res.ret === 0) {
        this.allLabels = res.data.original_lables;
      }

      let hasSetLabelList = []; // 已归类的标签
      this.allLabels.forEach((item) => {
        this.riskTypeData.forEach((risk) => {
          if (risk.original_lables.some((label) => label.label_id == item.label_id)) {
            hasSetLabelList.push(item.label_id);
          }
        });
      });
      this.count = 0;
      this.allLabels.forEach((item) => {
        this.labelTypeList.forEach((label) => {
          if (item.label_type == label.id) {
            // 没归类的才push到children里
            // if (!hasSetLabelList.includes(item.label_id)) {
            label['children'].push({
              label_id: item.label_id,
              label_name: item.label_name,
              label_type: item.label_type,
              checked: false, // 默认未选中
              disabled: hasSetLabelList.includes(item.label_id) // 已归类的标签禁用
            });
            // } else {
            // }
          } else {
          }
        });
      });
      this.labelTypeList.forEach((item) => {
        item.children.forEach((child) => {
          if (child.disabled == false) {
            this.count++;
          }
        });
      });
      // return;
    },
    async init() {
      // 格式化分类标签
      this.typeListData = this.riskTypeData;
      await this.getAllLabels();
      if (this.setType === 'edit') {
      } else {
      }
    },
    handleChange(val) {
      console.log(val);
    },
    /**
     * @tid 大类ID
     */
    addLabelToType(tid) {
      // 将已勾选标签添加到该分类
      let selectLabels = [];
      this.labelTypeList.forEach((item) => {
        item.children.forEach((child) => {
          if (child.checked) {
            selectLabels.push({
              label_id: child.label_id,
              label_name: child.label_name,
              label_type: child.label_type
            });
            child.checked = false;
            child.disabled = true;
          }
        });
      });
      console.log('当前勾选标签', selectLabels);

      this.typeListData.forEach((item) => {
        if (item.index == tid) {
          item.original_lables.push(...selectLabels);
        }
      });
    },
    /**
     * @index 分类ID
     */
    delLabelToType(index) {
      // 先删子类 再删父类
      this.typeListData.forEach((item) => {
        if (item.index == index) {
          item.original_lables.forEach((label) => {
            this.removeLabelFromType(index, label.label_id, label.label_type);
          });
        }
      });
      this.typeListData = this.typeListData.filter((item) => item.index != index);
    },
    removeLabelFromType(pid, cid, tid) {
      // 移除某个分类的标签
      // 先往总池里加，再从分类列表里删

      let label = this.allLabels.find((item) => item.label_id == cid);
      if (label) {
        this.labelTypeList.forEach((item) => {
          if (item.id == tid) {
            // item.children.push({ ...label, checked: false });
            item.children.forEach((child) => {
              if (child.label_id == cid) {
                child.checked = false;
                child.disabled = false;
              }
            });
          }
        });
        this.typeListData.forEach((item) => {
          if (item.index == pid) {
            item.original_lables = item.original_lables.filter((label) => label.label_id != cid);
          }
        });
      }
    },
    validInput() {
      if (this.addInput.trim() == '') {
        this.$message.error('输入为空');
        return;
      }
      if (this.typeListData.some((item) => item.label_name.trim() === this.addInput.trim())) {
        this.$message.error('该类别已存在');
        return;
      }
      let maxIndex = this.typeListData.reduce((acc, cur) => Math.max(acc, cur.index), 0);
      console.log('maxIndex====>', maxIndex);
      this.typeListData.push({
        index: maxIndex + 1,
        label_name: this.addInput.trim(),
        original_lables: []
      });
      this.addInput = '';
      this.addFlag = false;
    }
  }
});
</script>
<style lang="scss" scoped>
.risk-type-item {
  .el-button--mini {
    width: auto !important;
    height: 26px !important;
    line-height: 26px !important;
  }
}
</style>
