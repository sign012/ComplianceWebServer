<template>
  <!-- 回测参数弹窗 -->
  <div>
    <el-dialog
      :title="editType == 'add' ? '新增员工' : '编辑员工'"
      @close="clearForm"
      custom-class="up-pop  "
      width="500px"
      v-model="openDialog"
    >
      <div>
        <el-form
          :model="employeeForm"
          ref="livePopRef"
          :rules="employeeRules"
          class="emp-form"
        >
          <el-row>
            <el-col :span="24">
              <div class="grid-content bg-purple">
                <!-- <el-form-item label="编号" v-if="editType == 'edit'">
                  <el-input v-model="employeeForm.employee_id" disabled></el-input>
                </el-form-item> -->
                <el-form-item
                  label="直播平台"
                  prop="live_platform"
                  v-if="editType == 'add'"
                >
                  <el-select v-model="employeeForm.live_platform">
                    <el-option
                      :label="item"
                      :value="index"
                      v-for="(item, index) in plateformListAdd"
                      :key="index"
                    ></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item
                  label="直播平台"
                  prop="live_platform"
                  v-if="editType == 'edit'"
                >
                  <el-select v-model="employeeForm.live_platform" disabled>
                    <el-option
                      :label="item"
                      :value="index"
                      v-for="(item, index) in plateformList"
                      :key="index"
                    ></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="昵称" prop="nickname">
                  <el-input
                    v-model="employeeForm.nickname"
                    :disabled="editType == 'edit'"
                  ></el-input>
                </el-form-item>
                <el-form-item label="头像" prop="avatar">
                  <el-upload
                    action="#"
                    list-type="picture-card"
                    :auto-upload="false"
                    :limit="1"
                    :file-list="fileList"
                    :on-change="handleChange"
                    :disabled="fileList.length === 1"
                    v-if="editType == 'add'"
                    :class="{ hasUpload: fileList.length > 0 ? true : false }"
                  >
                    <el-icon><Plus /></el-icon>

                    <div slot="tip" class="el-upload__tip">添加图片</div>
                    <template #file="{ file }">
                      <div>
                        <img
                          class="el-upload-list__item-thumbnail"
                          :src="file.url"
                          alt=""
                        />
                        <span class="el-upload-list__item-actions">
                          <span
                            class="el-upload-list__item-preview"
                            @click="handlePictureCardPreview(file)"
                          >
                            <el-icon><zoom-in /></el-icon>
                          </span>
                          <span
                            class="el-upload-list__item-delete"
                            @click="handleDownload(file)"
                          >
                            <el-icon><Download /></el-icon>
                          </span>
                          <span
                            class="el-upload-list__item-delete"
                            @click="handleRemove(file)"
                          >
                            <el-icon><Delete /></el-icon>
                          </span>
                        </span>
                      </div>
                    </template>
                  </el-upload>
                  <img
                    :src="employeeForm.avatar_url"
                    alt=""
                    width="80"
                    height="80"
                    v-else
                  />
                </el-form-item>
                <el-form-item label="类别" prop="live_type">
                  <el-input v-model="employeeForm.live_type"></el-input>
                </el-form-item>
                <el-form-item label="姓名" prop="name">
                  <el-input v-model="employeeForm.name"></el-input>
                </el-form-item>
                <el-form-item label="执业编号" prop="identity_id">
                  <el-input v-model="employeeForm.identity_id"></el-input>
                </el-form-item>

                <el-form-item label="简介" prop="intro">
                  <el-input v-model="employeeForm.intro" type="textarea"></el-input>
                </el-form-item>

                <!-- <el-form-item label="直播间地址" prop="live_url">
                  <el-input v-model="employeeForm.live_url"></el-input>
                </el-form-item> -->
                <!-- <el-form-item label="授权开始日" prop="sqrq_start">
                  <el-date-picker
                    v-model="employeeForm.sqrq_start"
                    type="datetime"
                    placeholder="请选择时间"
                    :disabled="editType == 'edit'"
                  />
                </el-form-item>
                <el-form-item label="授权到期日" prop="sqrq_end">
                  <el-date-picker
                    v-model="employeeForm.sqrq_end"
                    type="datetime"
                    placeholder="请选择时间"
                    :disabled="editType == 'edit'"
                  />
                </el-form-item> -->
                <el-form-item label="所属部门" prop="dept_id">
                  <!-- <el-select v-model="employeeForm.dept_id" placeholder="请选择所属部门">
                    <el-option
                      v-for="item of departList"
                      :key="item.value"
                      :value="item.value"
                      :label="item.label"
                    ></el-option>
                  </el-select> -->
                  <el-cascader
                    v-model="employeeForm.dept_id"
                    :options="cascaderOptions"
                    @change="changeOrg"
                    :props="cascaderProps"
                    ref="cascaderRef"
                  >
                  </el-cascader>
                </el-form-item>
              </div>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="save" :loading="btnLoad">确认</el-button>
          <el-button @click="openDialog = false" color="#343A4E" class="cancel-btn"
            >取消</el-button
          >
        </span>
      </template>
    </el-dialog>
    <el-dialog v-model="dialogVisible">
      <img w-full :src="dialogImageUrl" alt="Preview Image" />
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { defineComponent, nextTick, reactive, toRefs, ref, onMounted } from "vue";
import { createEmployeeInfo, updateEmployeeInfo } from "@/api/runCheck";
import { plateformDict, plateformDictAdd } from "@/utils/dict";
import { ElMessage } from "element-plus";
import { Delete, Download, Plus, ZoomIn } from "@element-plus/icons";
import { useStore } from "vuex";
import { getDeptList } from "@/api/user";
export default defineComponent({
  props: {
    departList: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["renderList"],
  components: {
    Delete,
    Download,
    Plus,
    ZoomIn,
  },
  setup(props, { emit }) {
    const livePopRef = ref();
    const dialogImageUrl = ref("");
    const dialogVisible = ref(false);
    const cascaderRef = ref(null);

    const store = useStore();
    const handleRemove = (file: any) => {
      dataMap.fileList = [];
    };

    const handlePictureCardPreview = (file: any) => {
      dialogImageUrl.value = file.url;
      dialogVisible.value = true;
      console.log("preview", file, dialogVisible.value);
    };

    const handleDownload = (file: any) => {};

    let dataMap = reactive({
      userInfo: store.state.user, // 当前用户信息
      plateformList: Object.values(plateformDict),
      plateformListAdd: Object.values(plateformDictAdd),
      fileList: [],
      openDialog: false,
      btnLoad: false,
      employeeForm: {
        dept_id: "",
        employee_id: "", //主播编号
        nickname: "",
        avatar: {
          image_type: "", //图片数据  jpg png
          image_data: "", //图片数据  base64字符串
        }, // 头像
        name: "",
        position: 1,
        intro: "",
        sqrq_start: "",
        sqrq_end: "",
        status: 1,
        live_url: "",
        live_platform: 1,
      } as any,
      editType: "add",
      employeeList: [],
      employeeRules: {
        // nickname: [
        //   { required: true, message: '请输入昵称', trigger: 'blur' },
        //   { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        // ],
        name: [
          { required: true, message: "请输入姓名", trigger: "blur" },
          { min: 2, max: 10, message: "长度在 2 到 10 个字符", trigger: "blur" },
        ],
      },
      cascaderOptions: [], // 部门选择器数据
      cascaderProps: {
        checkStrictly: true, // 允许选择任意一级的选项
      },
      isVisible: false,
    });

    //保存
    const save = async () => {
      dataMap.employeeForm.dept_id = Array.isArray(dataMap.employeeForm.dept_id)
        ? dataMap.employeeForm.dept_id[dataMap.employeeForm.dept_id.length - 1]
        : dataMap.employeeForm.dept_id || 0;
      livePopRef.value.validate(async (valid: any, fields: any) => {
        if (valid) {
          let params: any = {};
          dataMap.btnLoad = true;
          try {
            if (dataMap.editType == "add") {
              params = {
                nickname: dataMap.employeeForm.nickname,
                avatar: dataMap.employeeForm.avatar,
                name: dataMap.employeeForm.name,
                intro: dataMap.employeeForm.intro,
                live_url: dataMap.employeeForm.live_url,
                dept_id: dataMap.employeeForm.dept_id,
              };
              let res = await createEmployeeInfo(params);
              if (res.ret == 0) {
                ElMessage.success("新增成功");
                emit("renderList");
              } else {
                ElMessage.error("新增失败");
              }
              dataMap.btnLoad = false;
              dataMap.openDialog = false;
            } else {
              params = {
                employee_id: dataMap.employeeForm.employee_id,
                intro: dataMap.employeeForm.intro,
                live_url: dataMap.employeeForm.live_url,
                identity_id: dataMap.employeeForm.identity_id,
                live_type: dataMap.employeeForm.live_type,
                dept_id: Number(dataMap.employeeForm.dept_id) || 0,
                name: dataMap.employeeForm.name,
              };

              let res = await updateEmployeeInfo(params);
              if (res.ret == 0) {
                ElMessage.success("修改成功");
                emit("renderList");
              } else {
                ElMessage.error("修改失败");
              }
              dataMap.btnLoad = false;
              dataMap.openDialog = false;
            }
          } catch (error) {
            ElMessage.error("network error");
            dataMap.btnLoad = false;
          }
        } else {
          ElMessage.error("请检查输入项");
          return;
        }
      });
    };

    //清空form
    const clearForm = () => {
      livePopRef.value.resetFields();
    };

    // 初始化弹窗
    const initPop = async (type: string, data: any) => {
      dataMap.openDialog = true;
      dataMap.editType = type;

      if (dataMap.editType == "edit") {
        dataMap.employeeForm = {
          ...data,
          sqrq_start: data.sqrq_start_hms,
          sqrq_end: data.sqrq_end_hms,
          dept_id: props.departList.find((item: any) => item.value == data.dept_id)
            ? data.dept_id
            : 0,
        };
      } else {
        dataMap.employeeForm = {
          employee_id: "", //主播编号
          nickname: "",
          avatar: {
            image_type: "", //图片数据  jpg png
            image_data: "", //图片数据  base64字符串
          }, // 头像
          name: "",
          position: 1,
          intro: "",
          sqrq_start: "",
          status: 1,
          live_url: "",
          live_platform: 1,
        };
      }

      await togetDeptList();
    };

    const togetDeptList = async () => {
      let res: any = await getDeptList();
      if (res.iRet === 0) {
        let userDeptId = dataMap.userInfo.departId;
        let userDeptName = res.data.find((item: any) => item.auto_inc_id == userDeptId)
          ? res.data.find((item: any) => item.auto_inc_id == userDeptId).deptName
          : "未知";
        console.log("当前账户所属部门", userDeptId);
        // 只展示所属部门以及下面子部门
        if (!userDeptId || userDeptId == 0) {
          dataMap.cascaderOptions = [{ value: 0, label: "无", children: [] }].concat(
            buildTree(res.data)
          );
        } else {
          dataMap.cascaderOptions = [
            {
              value: Number(userDeptId),
              label: userDeptName,
              children: buildTree(res.data, userDeptId),
            },
          ];
        }
        console.log("部门选择器数据", dataMap.cascaderOptions);
      }
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
    const handleChange = (file, fileList) => {
      dataMap.fileList = fileList;
      // blob转base64
      // 创建一个 FileReader 对象
      const reader = new FileReader();
      // 当读取操作完成时触发
      reader.onloadend = function (event) {
        if (event.target.readyState === FileReader.DONE) {
          // DONE 表示已完成
          let base64String: any = event.target.result;
          console.log("base64", base64String);
          const parts = base64String.split(",");
          base64String = base64String.split("base64,")[1];
          // 提取 MIME 类型
          const mimeType = parts[0].split(":")[1].split(";")[0].split("/")[1];
          console.log("mimeType", mimeType);
          dataMap.employeeForm.avatar = {
            image_type: mimeType,
            image_data: base64String,
          };
        }
      };

      // 读取 Blob 对象为 Data URL
      reader.readAsDataURL(file.raw);
    };
    const changeOrg = (val) => {
      console.log(val);
      // dataMap.isVisible = false;
      cascaderRef.value.togglePopperVisible();
    };

    return {
      ...toRefs(dataMap),
      clearForm,
      save,
      livePopRef,
      initPop,
      handleRemove,
      handlePictureCardPreview,
      handleDownload,
      dialogVisible,
      dialogImageUrl,
      handleChange,
      changeOrg,
      cascaderRef,
    };
  },
});
</script>
<style lang="scss">
/* 引入 Element Plus 的样式 */
</style>
