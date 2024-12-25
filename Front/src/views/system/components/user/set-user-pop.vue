<template>
  <!-- 设置编辑用户 -->
  <div v-dialogdrag>
    <el-dialog
      custom-class="up-pop user-pop"
      v-model="openUserPop"
      width="500px"
      :title="`${setType === 'add' ? '创建' : '编辑'}用户`"
      ref="userform"
      :close-on-click-modal="false"
      @close="clearForm"
    >
      <el-form
        :model="userForm"
        ref="userformRef"
        size="mini"
        :rules="rules"
        label-width="100px"
        class="over-error-form"
      >
        <el-form-item label="用户账号" prop="uid">
          <el-input
            v-model="userForm.uid"
            maxlength="16"
            :disabled="setType === 'edit'"
            placeholder="请输入用户账号"
          ></el-input>
        </el-form-item>
        <el-form-item label="用户名称" prop="realName">
          <el-input
            v-model="userForm.realName"
            autocomplete="off"
            maxlength="16"
            placeholder="请输入用户名称"
          ></el-input>
        </el-form-item>
        <div v-if="setType === 'add'">
          <el-form-item label="用户密码" maxlength="10" prop="password">
            <el-input
              v-model="userForm.password"
              type="password"
              placeholder="请输入密码"
              autocomplete="new-password"
              :show-password="true"
            ></el-input>
            <!-- <span style="color: #909399; font-size: 12px; margin-left: 10px"
              >(密码默认888888)</span
            > -->
          </el-form-item>
          <el-form-item label="确认密码" maxlength="10" prop="secondPwd">
            <el-input
              v-model="userForm.secondPwd"
              type="password"
              placeholder="请确认密码"
              autocomplete="new-password"
              :show-password="true"
            ></el-input>
          </el-form-item>
        </div>

        <el-form-item label="用户角色" prop="rIds">
          <el-select
            v-model="userForm.rIds"
            placeholder="请选择角色"
            @change="changeRole"
          >
            <el-option
              v-for="item of roleList"
              :key="item.value"
              :value="item.value"
              :label="item.label"
            ></el-option>
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="账户类型">
          <el-radio v-model="userForm.mgrtype" label="A">管理员</el-radio>
          <el-radio v-model="userForm.mgrtype" label="C">普通</el-radio>
        </el-form-item> -->
        <el-form-item label="所属部门" prop="departId" width="100%">
          <!-- <el-select v-model="userForm.departId" placeholder="请选择所属部门">
            <el-option v-for="item of departList" :key="item.value" :value="item.value" :label="item.label"></el-option>
          </el-select> -->
          <el-cascader
            v-model="userForm.departId"
            :options="cascaderOptions"
            @change="changeOrg"
            :props="cascaderProps"
          >
          </el-cascader>
        </el-form-item>
        <el-form-item label="数据权限">
          <el-select
            v-model="selectedOptions"
            multiple
            collapse-tags
            collapse-tags-tooltip
            :max-collapse-tags="3"
            placeholder="请选择"
            popper-class="custom-header"
            filterable
            @remove-tag="removeOption"
          >
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
              <template #default>
                <el-checkbox
                  :label="item.label"
                  v-model="checkedMap[item.value]"
                  @change="handleCheckboxChange(item.value, $event)"
                >
                  <!-- {{ item.label }}{{ checkedMap[item.value] ? '(已选)' : '' }} -->
                  {{ item.label }}
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
import { defineComponent, nextTick, reactive, ref, toRefs, watch, computed } from "vue";
import { ElMessage } from "element-plus";
import { Md5 } from "md5-typescript";
import { addUserReq, setUserReq, getRoleReq, getDeptList } from "@/api/user";
import { useStore } from "vuex";
import { queryEmployee } from "@/api/runCheck";
import dayjs from "dayjs";
import { findChildrenDept } from "@/utils/validate.js";
export default defineComponent({
  name: "EmUserManagePop",

  emits: ["getUserList"],
  props: {
    setType: {
      type: String,
      required: true,
      default: "add",
    },

    roleList: {
      type: Array,
      required: true,
      default: () => {
        return [];
      },
    } as any,
  },

  setup(props, { emit }) {
    const userformRef = ref();
    const store = useStore();
    const validateName = (rule: any, value: any, callback: any) => {
      let flag = new RegExp(
        "[`~!@#$^&*()=|{}':;',\\[\\].<>《》/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？ ]"
      );
      if (value === "") {
        callback(new Error("请输入用户名称"));
      } else if (flag.test(value)) {
        callback(new Error("存在特殊字符"));
      }
      // else if (value.length < 2) {
      //   callback(new Error('长度不能小于2'));
      // }
      else {
        callback();
      }
    };
    const validateUid = (rule: any, value: any, callback: any) => {
      let flag = new RegExp(
        "[`~!@#$^&*()=|{}':;',\\[\\].<>《》/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？ ]"
      );
      var reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");
      if (value === "") {
        callback(new Error("请输入账号"));
      } else if (flag.test(value) || reg.test(value)) {
        callback(new Error("存在特殊字符/中文"));
      } else if (value.length < 3) {
        callback(new Error("长度不能小于3"));
      } else {
        callback();
      }
    };
    const validatePass = (rule: any, value: any, callback: any) => {
      // let flag = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>《》/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？ ]");
      let flag = new RegExp("[\\[\\]《》！￥……&（）——【】‘；：”“'。，、？ ]");
      var reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");
      if (value === "") {
        callback(new Error("请输入密码"));
      } else if (flag.test(value) || reg.test(value)) {
        callback(new Error("存在特殊字符/中文"));
      } else if (value.length < 3) {
        callback(new Error("长度不能小于3"));
      } else {
        callback();
      }
    };
    const validateCPass = (rule: any, value: any, callback: any) => {
      if (props.setType === "add") {
        if (value === "") {
          callback(new Error("请输入确认密码"));
        } else {
          if (dataMap.userForm.secondPwd !== dataMap.userForm.password) {
            callback(new Error("两次密码不一致"));
          }
          callback();
        }
      } else {
        callback();
      }
    };

    let mgrtype = store.state.user.userMgrType;
    const dataMap = reactive({
      userInfo: store.state.user, // 当前用户信息
      currentUid: store.state.user.userid,
      departList: [],
      cascaderOptions: [], // 部门选择器数据
      cascaderProps: {
        checkStrictly: true, // 允许选择任意一级的选项
      },
      userForm: {
        uid: "",
        password: "",
        secondPwd: "",
        rIds: "",
        departId: "",
        orgId: "",
        realName: "",
        stopMoney: 0,
        phone: "",
        mgrtype: "M",
        userbasic_usertype: "",
        userList: [],
      },
      preOrg: "",
      // hasZcb: true,
      orgList: [] as any,
      openUserPop: false,

      rules: {
        // orgId: { required: true, message: '请选择机构', trigger: 'change' },
        departId: { required: true, message: "请选择所属部门", trigger: "change" },
        rIds: { required: true, message: "请选择角色", trigger: "change" },
        realName: { required: true, validator: validateName, trigger: "blur" },
        uid: [{ required: true, validator: validateUid, trigger: "blur" }],
        password: [
          { required: true, trigger: "blur", message: "请输入密码" },
          {
            pattern: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{}|;':",.<>?]).{8,20}$/,
            message:
              "密码必须包含大写字母、小写字母、数字和特殊字符，并且长度为 8 到 20 位",
            trigger: "blur",
          },
        ],
        // phone: { required: true, message: '请输入手机号', trigger: 'blur' },
        secondPwd: { required: true, validator: validateCPass, trigger: "blur" },
      },
      selectedOptions: [],
      options: [],
      checkedMap: {}, // 多选框选中状态
      employeeList: [], // 员工列表
    });
    watch(
      () => dataMap.userForm.departId,
      (val: any) => {
        // 根据部门展示可选数据权限
        tofilterEmployee();
      },
      { deep: true }
    );
    watch(
      () => dataMap.openUserPop,
      (val: any) => {
        if (!val) {
          dataMap.selectedOptions = [];
          dataMap.options.forEach((item, index) => {
            dataMap.checkedMap[item.value] = false;
          });
          //   console.log("弹窗关闭时 checkedMap", dataMap.checkedMap);
        } else {
          //   console.log("弹窗打开时，checkedMap", dataMap.checkedMap);
        }
      }
    );
    // 全选的不确定属性
    const isIndeterminate: any = computed(() => {
      return (
        dataMap.selectedOptions.length > 0 &&
        dataMap.selectedOptions.length < dataMap.options.length
      );
    });

    const isAllSelected: any = computed(() => {
      return (
        dataMap.selectedOptions.length === dataMap.options.length &&
        dataMap.selectedOptions.length > 0
      );
    });
    const handleAllSelectChange = (checked: boolean) => {
      if (checked) {
        dataMap.selectedOptions = dataMap.options.map((option) => option.value);
        dataMap.selectedOptions.forEach((item, index) => {
          dataMap.checkedMap[item] = true;
        });
      } else {
        dataMap.selectedOptions = [];
        dataMap.options.forEach((item, index) => {
          dataMap.checkedMap[item.value] = false;
        });
      }
    };
    // 控制多选框的选中状态  value 选项值 true/false是否选中
    const handleCheckboxChange = (value: any, checked: any) => {
      dataMap.checkedMap[value] = checked; // 解决bug  比如checkedMap   {1:true,2:true,3:true,4:true }  selectedOptions  [1,3,4]  此时需要把2:true 改为false
      if (checked) {
        let hasChecked = false;
        dataMap.selectedOptions.forEach((option) => {
          if (option == value) {
            hasChecked = true;
          }
        });
        !hasChecked && dataMap.selectedOptions.push(value);
        dataMap.selectedOptions.forEach((item, index) => {
          dataMap.checkedMap[item] = true;
        });
      } else {
        dataMap.selectedOptions = dataMap.selectedOptions.filter(
          (option) => option !== value
        );
        dataMap.selectedOptions.forEach((item, index) => {
          dataMap.checkedMap[item] = true;
        });
      }
    };
    const removeOption = (value: any) => {
      handleCheckboxChange(value, false);
    };
    const clearForm = () => {
      userformRef.value.resetFields();
      dataMap.userForm = {
        uid: "",
        password: "",
        secondPwd: "",
        rIds: "",
        departId: "",
        orgId: "",
        realName: "",
        stopMoney: 0,
        phone: "",
        mgrtype: "M",
        userbasic_usertype: "",
        userList: [],
      };

      dataMap.openUserPop = false;
    };

    const save = () => {
      let currentDeptId = Array.isArray(dataMap.userForm.departId)
        ? dataMap.userForm.departId[dataMap.userForm.departId.length - 1]
        : dataMap.userForm.departId || 0;
      userformRef.value.validate(async (valid: any) => {
        if (valid) {
          let pwd = Md5.init(Md5.init(dataMap.userForm.uid + dataMap.userForm.password));

          let param: any = {
            userbasic_uid: dataMap.userForm.uid, // 用户账号
            userbasic_password: pwd, // 用户密码
            userbasic_userstatus: 0,
            userbasic_usertype: `${dataMap.userForm.userbasic_usertype}`, // 编辑权限  （目前编辑权限只在角色设置内设置，用户设置里暂时不做）
            userbasic_rids: `${dataMap.userForm.rIds}`, // 角色ID（控制菜单权限 目前只做单角色菜单 即rIds一般为['n'] n为角色ID）
            departid: currentDeptId, // 公司ID
            // orgid: dataMap.userForm.orgId, // 机构ID
            realname: dataMap.userForm.realName, // 用户名称
            // stopmoney: dataMap.userForm.stopMoney,
            // userbasic_exinfo_telno: dataMap.userForm.phone,
            mgrtype: dataMap.userForm.mgrtype, // 账号类型 （管理员/普通用户 控制登录权限等，暂时不做）
            userList: JSON.stringify(dataMap.selectedOptions), // 数据权限
          };
          let retData = null;
          console.log("param", param);
          //   return;
          if (props.setType === "add") {
            retData = await addUserReq(param);
          } else {
            // param.userbasic_usertype = dataMap.userForm.userbasic_usertype;
            delete param.userbasic_password;
            retData = await setUserReq(param, "update");
          }

          if (retData.iRet === 0) {
            emit("getUserList", "dept", currentDeptId);
            ElMessage.success(
              `${props.setType === "add" ? "添加" : "编辑"} ${
                dataMap.userForm.realName
              } 用户成功`
            );
            clearForm();
          } else {
            ElMessage.error({ message: retData.msg });
          }
        } else {
          return;
        }
      });
    };
    // 角色选择
    const changeRole = (val: any) => {
      //   console.log("props.roleList", props.roleList);
      // 根据角色ID查询角色权限
      props.roleList.forEach((item: any) => {
        if (item.value === val) {
          dataMap.userForm.userbasic_usertype = item.type;
        }
      });
    };
    const buildTree = (data, pid = "0") => {
      const result = [];
      for (const item of data) {
        if (item.pid == pid) {
          const children = buildTree(data, item.auto_inc_id);
          if (children.length) {
            item.children = children;
          } else {
            item.children = [];
          }
          // result.push(item);
          result.push({
            value: item.auto_inc_id,
            label: item.deptName,
            children: item.children,
          });
        }
      }
      return result;
    };
    const togetDeptList = async () => {
      //   console.log("当前部门", dataMap.userInfo.departId);
      let res: any = await getDeptList();
      if (res.iRet === 0) {
        let userDeptId = dataMap.userInfo.departId;
        let userDeptName = res.data.find((item: any) => item.auto_inc_id == userDeptId)
          ? res.data.find((item: any) => item.auto_inc_id == userDeptId).deptName
          : "未知";
        // console.log("当前账户所属部门", userDeptId);
        // 只展示所属部门以及下面子部门
        if (!userDeptId || userDeptId == 0) {
          dataMap.cascaderOptions = [{ value: 0, label: "无", children: [] }].concat(
            buildTree(res.data)
          );
        } else {
          dataMap.cascaderOptions = [
            {
              value: userDeptId,
              label: userDeptName,
              children: buildTree(res.data, userDeptId),
            },
          ];
        }
      }
    };

    const tofilterEmployee = () => {
      let pid =
        typeof dataMap.userForm.departId === "number"
          ? dataMap.userForm.departId
          : dataMap.userForm.departId[dataMap.userForm.departId.length - 1];
      //   console.log("重置数据权限列表", pid);
      let childrenDept = findChildrenDept(dataMap.cascaderOptions, pid);
      //   console.log("childrenDept====>", childrenDept);
      // 重置数据权限列表
      dataMap.options = [];
      dataMap.checkedMap = {};
      dataMap.selectedOptions = [];
      let currentDeptId = dataMap.userForm.departId || "";
      // console.log('currentDeptId', currentDeptId);
      let _options = []; // 可供选择的数据权限
      dataMap.employeeList.forEach((item) => {
        childrenDept.forEach((dept) => {
          if (item.dept_id == dept) {
            _options.push({
              value: item.employee_id,
              label: item.nickname,
            });
          }
        });
      });
      dataMap.options = _options;
    };
    const togetEmployee = async () => {
      let resData = await queryEmployee();
      if (resData.ret == 0) {
        dataMap.employeeList = resData.data.employees.map((item) => {
          return {
            ...item,
            rzsj: dayjs(item.rzsj).format("YYYY/MM/DD"),
          };
        });

        // 请求到员工列表后，根据部门ID筛选部门下员工列表
        tofilterEmployee();
      }
    };
    const init = async () => {
      await togetDeptList();
      await togetEmployee();

      // 数据权限
      if (props.setType === "edit") {
        // console.log('list===>', dataMap.userForm.userList);
        //  如果数据权限内userid不属于该员工所属部门，则清空数据权限
        let deptId: any = dataMap.userForm.departId;
        let userList = dataMap.userForm.userList;
        let employeeList = dataMap.employeeList;

        // 部门选择无时，不用筛选，否则筛选出同部门的user
        deptId != 0 &&
          userList.forEach((item) => {
            let user = employeeList.find((user) => user.employee_id == item);
            if ((user && user.dept_id != deptId) || user == undefined) {
              userList.splice(userList.indexOf(item), 1);
            }
          });

        console.log("userList===>", userList);
        dataMap.selectedOptions = userList;
        dataMap.selectedOptions.forEach((item, index) => {
          dataMap.checkedMap[item] = true;
        });
      }
    };
    const changeOrg = (val) => {
      //   console.log(val);
    };
    return {
      clearForm,
      save,
      validatePass,
      userformRef,
      mgrtype,
      ...toRefs(dataMap),
      changeRole,
      isIndeterminate,
      isAllSelected,
      handleAllSelectChange,
      handleCheckboxChange,
      init,
      changeOrg,
      removeOption,
    };
  },
});
</script>
