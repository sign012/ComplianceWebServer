<template>
  <div v-dialogdrag>
    <el-dialog
      :close-on-click-modal="false"
      :title="`发送任务${setType === 'add' ? '添加' : '编辑'}`"
      custom-class="up-pop email-pop"
      v-model="dialogVisible"
      @close="dialogVisible = false"
    >
      <el-form
        :model="formData"
        inline
        size="mini"
        label-width="120px"
        label-position="left"
        ref="formData"
        :rules="rules"
      >
        <!-- <el-form-item label="部门编号" v-if="setType === 'edit'">
          <el-input v-model="formData.auto_inc_id" placeholder disabled></el-input>
        </el-form-item> -->
        <el-form-item label="发送任务名称" prop="name">
          <el-input v-model="formData.name" placeholder="输入任务名称"></el-input>
        </el-form-item>

        <el-form-item label="收件人" prop="to_addrs" class="to_addrs">
          <div class="tag-list">
            <span class="item" v-for="(item, index) in formData.to_addrs" :key="index">
              {{ item }}
              <span class="close" title="删除" @click="del(item, 'to_addrs')">×</span>
            </span>
          </div>
          <el-input
            v-model="emailPrefix"
            @input="handleInput"
            @blur="hideDropdown"
            placeholder="请输入邮箱地址"
            clearable
          >
            <template #suffix>
              <el-button
                color="#3a62f7"
                @click="validInput('to_addrs', emailPrefix)"
                size="small"
                class="add-btn"
              >
                添加
              </el-button>
            </template>
          </el-input>
          <div v-if="showDropdown" class="dropdown">
            <div
              v-for="(domain, index) in filteredDomains"
              :key="index"
              @mousedown="selectDomain(domain)"
              class="dropdown-item"
            >
              {{ emailPrefix + domain }}
            </div>
          </div>
        </el-form-item>
        <el-form-item label="抄送人" prop="cc_addrs" class="cc_addrs">
          <div class="tag-list">
            <span class="item" v-for="(item, index) in formData.cc_addrs" :key="index">
              {{ item }}
              <span class="close" title="删除" @click="del(item, 'cc_addrs')">×</span>
            </span>
          </div>
          <el-input
            v-model="emailPrefix2"
            @input="handleInput2"
            @blur="hideDropdown2"
            placeholder="请输入邮箱地址"
            clearable
          >
            <template #suffix>
              <el-button
                color="#3a62f7"
                @click="validInput('cc_addrs', emailPrefix2)"
                size="small"
                class="add-btn"
              >
                添加
              </el-button>
            </template>
          </el-input>
          <div v-if="showDropdown2" class="dropdown">
            <div
              v-for="(domain, index) in filteredDomains"
              :key="index"
              @mousedown="selectDomain2(domain)"
              class="dropdown-item"
            >
              {{ emailPrefix2 + domain }}
            </div>
          </div>
        </el-form-item>
        <el-form-item label="关注主播" prop="name">
          <el-select
            v-model="selectedOptions"
            multiple
            collapse-tags
            collapse-tags-tooltip
            :max-collapse-tags="3"
            placeholder="请选择"
            popper-class="custom-header "
            class="hidden-tag-select"
            filterable
            @remove-tag="removeOption"
          >
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label_with_platform"
              :value="item.value"
            >
              <template #default>
                <el-checkbox
                  :label="item.label"
                  v-model="checkedMap[item.value]"
                  @change="handleCheckboxChange(item.value, $event)"
                >
                  <!-- {{ item.label }}{{ checkedMap[item.value] ? '(已选)' : '' }} -->
                  {{ item.label_with_platform }}
                </el-checkbox>
              </template>
            </el-option>

            <el-checkbox
              :indeterminate="isIndeterminate"
              v-model="isAllSelected"
              @change="handleAllSelectChange"
              style="
                padding: 0 12px;
                border-top: 1px solid #343b52;
                width: 100%;
                height: 38px;
              "
            >
              全选
              <span style="position: absolute; right: 12px; top: 12px; color: #838ba1">
                已选({{ selectedOptions.length }})
              </span>
            </el-checkbox>
          </el-select>
          <!-- <div class="employee-list">
            <span class="item" v-for="(item, index) in selectedOptions" :key="index">
              {{ employeeList.find((employee) => employee.employee_id === item).nickname }}
            </span>
          </div> -->
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false" color="#343A4E" class="cancel-btn"
            >取消</el-button
          >
          <el-button type="primary" @click="save">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import {
  queryEmployee,
  createEmailAlertTask,
  updateEmailAlertTask,
} from "@/api/runCheck";
import { ElMessage } from "element-plus";
import { Search, CirclePlusFilled } from "@element-plus/icons";
import dayjs from "dayjs";
import { plateformDict } from "@/utils/dict";
type MenuMap = {
  [key: string]: Array<any>;
};
export default defineComponent({
  components: {
    Search,
    CirclePlusFilled,
  },
  emits: ["finish"],
  data() {
    return {
      dialogVisible: false,
      setType: "add",
      formData: {
        id: "",
        name: "",
        to_addrs: [],
        cc_addrs: [],
        employee_ids: ["UP00001", "UP00002"],
      } as any,
      rules: {
        name: [
          { required: true, message: "请输入任务名称", trigger: "blur" },
          { min: 1, max: 20, message: "长度在 1 到 20 个字符", trigger: "blur" },
        ],
        to_addrs: [{ required: true, message: "请输入收件人", trigger: "blur" }],
        // words: [
        //   { type: 'array', required: true, validator: this.validateCPass, message: '请至少添加一个词', trigger: 'blur' }
        // ]
      },
      selectedOptions: [],
      options: [],
      checkedMap: {}, // 多选框选中状态
      employeeList: [], // 员工列表
      emailPrefix: "",
      emailPrefix2: "",
      showDropdown: false,
      showDropdown2: false,
      domains: ["qq.com", "163.com", "gmail.com", "outlook.com"],
      plateformDict,
    };
  },

  watch: {
    dialogVisible: {
      handler(val) {
        if (!val) {
          this.emailPrefix = "";
          this.emailPrefix2 = "";
          this.showDropdown = false;
          this.showDropdown2 = false;
          this.$refs.formData.resetFields();
          this.selectedOptions = [];
          this.options.forEach((item, index) => {
            this.checkedMap[item.value] = false;
          });
        }
      },
    },
  },
  computed: {
    isAdmin() {
      return this.$store.state.user.userMgrType === "S";
    },
    isIndeterminate() {
      return (
        this.selectedOptions.length > 0 &&
        this.selectedOptions.length < this.options.length
      );
    },
    isAllSelected() {
      return (
        this.selectedOptions.length === this.options.length &&
        this.selectedOptions.length > 0
      );
    },
    filteredDomains() {
      // return this.domains.filter((domain) => domain.startsWith(this.emailPrefix));
      return this.domains;
    },
  },
  methods: {
    async save() {
      this.$refs.formData.validate(async (valid) => {
        if (valid) {
          this.formData.employee_ids = this.selectedOptions;
          console.log("保存任务", this.formData);
          let params = {
            name: this.formData.name,
            to_addrs: this.formData.to_addrs,
            cc_addrs: this.formData.cc_addrs,
            employee_ids: this.formData.employee_ids,
          } as any;
          if (this.setType === "add") {
            let res = await createEmailAlertTask(params);
            if (res.ret === 0) {
              ElMessage.success("添加成功");
              this.dialogVisible = false;
              this.$emit("finish");
            } else {
              ElMessage.error(res.msg);
            }
          } else {
            params.id = this.formData.id;
            let res = await updateEmailAlertTask(params);
            if (res.ret === 0) {
              ElMessage.success("编辑成功");
              this.dialogVisible = false;
              this.$emit("finish");
            } else {
              ElMessage.error(res.msg);
            }
          }
        } else {
          // this.$message.error('请检查输入项');
          return;
        }
      });
    },
    validInput(type, data) {
      if (!data) return;
      if (type == "to_addrs") {
        if (this.formData.to_addrs.includes(data)) {
          this.$message.error("收件人已存在");
          return;
        } else {
          this.formData.to_addrs.push(data);
          this.emailPrefix = "";
        }
      } else {
        if (this.formData.cc_addrs.includes(data)) {
          this.$message.error("抄送人已存在");
          return;
        } else {
          this.formData.cc_addrs.push(data);
          this.emailPrefix2 = "";
        }
      }
    },
    del(item, type) {
      if (type == "to_addrs") {
        this.formData.to_addrs.splice(this.formData.to_addrs.indexOf(item), 1);
      } else {
        this.formData.cc_addrs.splice(this.formData.cc_addrs.indexOf(item), 1);
      }
    },
    async init() {
      await this.togetEmployee();
      // 数据权限
      if (this.setType === "edit") {
        this.selectedOptions = this.formData.employee_ids;
        this.selectedOptions.forEach((item, index) => {
          this.checkedMap[item] = true;
        });
      }
    },
    async togetEmployee() {
      let resData = await queryEmployee();
      if (resData.ret == 0) {
        this.employeeList = resData.data.employees.map((item) => {
          return {
            ...item,
            rzsj: dayjs(item.rzsj).format("YYYY/MM/DD"),
          };
        });
        this.options = [];
        this.checkedMap = {};
        this.selectedOptions = [];
        let _options = []; // 可供选择的数据权限
        this.employeeList.forEach((item) => {
          _options.push({
            value: item.employee_id,
            label: item.nickname,
            label_with_platform:
              item.nickname + "(" + this.plateformDict[item.live_platform] + ")",
          });
        });
        this.options = _options;
      }
    },
    handleAllSelectChange(checked: boolean) {
      if (checked) {
        this.selectedOptions = this.options.map((option) => option.value);
        this.selectedOptions.forEach((item, index) => {
          this.checkedMap[item] = true;
        });
      } else {
        this.selectedOptions = [];
        this.options.forEach((item, index) => {
          this.checkedMap[item.value] = false;
        });
      }

      console.log("选择全选框的时候selectedOptions", this.selectedOptions);
    },
    // 控制多选框的选中状态  value 选项值 true/false是否选中
    handleCheckboxChange(value: any, checked: any) {
      this.checkedMap[value] = checked; // 解决bug  比如checkedMap   {1:true,2:true,3:true,4:true }  selectedOptions  [1,3,4]  此时需要把2:true 改为false
      if (checked) {
        let hasChecked = false;
        this.selectedOptions.forEach((option) => {
          if (option == value) {
            hasChecked = true;
          }
        });
        !hasChecked && this.selectedOptions.push(value);
        this.selectedOptions.forEach((item, index) => {
          this.checkedMap[item] = true;
        });
      } else {
        this.selectedOptions = this.selectedOptions.filter((option) => option !== value);
        this.selectedOptions.forEach((item, index) => {
          this.checkedMap[item] = true;
        });
      }

      console.log("选择多选框的时候selectedOptions", this.selectedOptions);
    },
    removeOption(value: any) {
      this.handleCheckboxChange(value, false);
    },
    handleInput() {
      if (this.emailPrefix.slice(-1) == "@") {
        this.showDropdown = true;
      } else {
        this.showDropdown = false;
      }
    },
    hideDropdown() {
      setTimeout(() => {
        this.showDropdown = false;
      }, 200);
    },
    selectDomain(domain) {
      this.emailPrefix += domain;
      this.showDropdown = false;
    },
    handleInput2() {
      if (this.emailPrefix2.slice(-1) == "@") {
        this.showDropdown2 = true;
      } else {
        this.showDropdown2 = false;
      }
    },
    hideDropdown2() {
      setTimeout(() => {
        this.showDropdown2 = false;
      }, 200);
    },
    selectDomain2(domain) {
      this.emailPrefix2 += domain;
      this.showDropdown2 = false;
    },
  },
});
</script>
<style lang="scss" scoped>
.dropdown {
  position: absolute;
  min-width: 100px;
  min-height: 100px;
  border: 1px solid #3b4a5d;
  border-radius: 4px;
  z-index: 1000;
  background: #2b3452;
}

.dropdown-item {
  padding: 8px 12px;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: #191f33;
}
</style>
