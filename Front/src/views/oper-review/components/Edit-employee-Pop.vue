<template>
  <!-- 回测参数弹窗 -->
  <div>
    <el-dialog
      :title="editType == 'add' ? '新增主播' : '编辑主播'"
      @close="clearForm"
      custom-class="up-pop  "
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
                      :label="item.label"
                      :value="item.value"
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
                  <el-select
                    v-model="employeeForm.live_platform"
                    disabled
                    placeholder="请选择直播平台"
                  >
                    <el-option
                      :label="item.label"
                      :value="item.value"
                      v-for="(item, index) in plateformList"
                      :key="index"
                    ></el-option>
                  </el-select>
                </el-form-item>
                <div
                  v-show="editType == 'add' && employeeForm.live_platform == 2"
                  class="dy-content"
                >
                  <div class="row-content">
                    ①
                    请先用微信扫码，按步骤提示,完成抖音账号授权确认。二维码永久有效。<span
                      class="copy-btn"
                      @click="copy"
                      >复制图片</span
                    >
                  </div>
                  <img :src="dyImg" alt="" />
                  <div class="row-content">
                    ② 完成抖音账号授权后，请联系平台管理员发送直播间授权邀请。
                  </div>
                  <div class="row-content">
                    ③
                    在微信策影小程序中收到直播间授权通知，按步骤提示，完成抖音号直播间授权确认。
                  </div>
                </div>
                <div v-show="editType == 'edit' || employeeForm.live_platform !== 2">
                  <el-form-item label="昵称" prop="nickname">
                    <el-input
                      v-model="employeeForm.nickname"
                      placeholder="请输入昵称"
                      :disabled="
                        editType == 'edit' &&
                        !Object.keys(plateformDictAdd).includes(
                          String(employeeForm.live_platform)
                        )
                      "
                    ></el-input>
                  </el-form-item>
                  <el-form-item label="头像" prop="avatar_url">
                    <img
                      :src="employeeForm.avatar_url"
                      alt=""
                      width="80"
                      height="80"
                      v-if="
                        editType == 'edit' &&
                        !Object.keys(plateformDictAdd).includes(
                          String(employeeForm.live_platform)
                        )
                      "
                    />
                    <el-upload
                      :action="actionUrl"
                      list-type="picture-card"
                      :limit="1"
                      :file-list="fileList"
                      :on-change="handleChange"
                      :disabled="fileList.length === 1"
                      :class="{ hasUpload: fileList.length > 0 ? true : false }"
                      :on-success="upload"
                      :on-error="uploadError"
                      :before-upload="fillForm"
                      :data="uploadForm"
                      name="tplfile"
                      v-else
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
                          <!-- <span class="upload-img-name">{{ file.name }}</span> -->
                          <span class="el-upload-list__item-actions">
                            <span
                              class="el-upload-list__item-preview"
                              @click="handlePictureCardPreview(file)"
                            >
                              <el-icon><zoom-in /></el-icon>
                            </span>
                            <span
                              class="el-upload-list__item-delete"
                              @click="handleDownload(file.url, file.name)"
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
                  </el-form-item>
                  <el-form-item label="类别" prop="live_type">
                    <el-input
                      v-model="employeeForm.live_type"
                      placeholder="请输入类别"
                    ></el-input>
                  </el-form-item>
                  <el-form-item label="姓名" prop="name">
                    <el-input
                      v-model="employeeForm.name"
                      placeholder="请输入姓名"
                    ></el-input>
                  </el-form-item>
                  <el-form-item label="执业编号" prop="identity_id">
                    <el-input
                      v-model="employeeForm.identity_id"
                      placeholder="请输入执业编号"
                    ></el-input>
                  </el-form-item>

                  <el-form-item label="简介" prop="intro">
                    <el-input
                      v-model="employeeForm.intro"
                      type="textarea"
                      placeholder="请输入简介"
                    ></el-input>
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
                    <el-cascader
                      v-model="employeeForm.dept_id"
                      :options="cascaderOptions"
                      @change="changeOrg"
                      :props="cascaderProps"
                      ref="cascaderRef"
                      placeholder="请选择所属部门"
                    >
                    </el-cascader>
                  </el-form-item>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="openDialog = false" color="#343A4E" class="cancel-btn"
            >取消</el-button
          >
          <el-button type="primary" @click="save" :loading="btnLoad">确认</el-button>
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
import { plateformList, plateformListAdd, plateformDictAdd } from "@/utils/dict";
import { ElMessage } from "element-plus";
import { Delete, Download, Plus, ZoomIn } from "@element-plus/icons";
import { useStore } from "vuex";
import { getDeptList } from "@/api/user";
import dyImg from "@/assets/images/dy.png";
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
      dataMap.employeeForm.avatar_url = "";
    };

    const handlePictureCardPreview = (file: any) => {
      dialogImageUrl.value = file.url;
      dialogVisible.value = true;
      console.log("preview", file, dialogVisible.value);
    };

    const handleDownload = (url: any, name: any) => {
      // 创建一个隐藏的 a 元素
      const link = document.createElement("a");
      link.href = url;
      link.download = name; // 设置下载文件的名称，可选
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    let dataMap = reactive({
      dyImg,
      userInfo: store.state.user, // 当前用户信息
      plateformList,
      plateformListAdd,
      plateformDictAdd,
      fileList: [],
      actionUrl: "",
      allowedFileTypes: ["png", "image/png", "jpg", "jpeg", "image/jpeg"],
      uploading: false, // 宣传页上传状态
      uploadForm: {
        businessName: "任务文件",
        userId: "",
        method: 0,
      } as any, // 上传参数
      openDialog: false,
      btnLoad: false,
      employeeForm: {
        dept_id: 0,
        employee_id: "", //主播编号
        nickname: "",
        avatar_url: "", // 头像
        name: "",
        intro: "",
        sqrq_start: "",
        sqrq_end: "",
        live_url: "",
        live_platform: 1,
        identity_id: "",
        live_type: "",
      } as any,
      editType: "add",
      employeeList: [],
      employeeRules: {
        nickname: [
          { required: true, message: "请输入昵称", trigger: "blur" },
          { min: 2, max: 10, message: "长度在 2 到 10 个字符", trigger: "blur" },
        ],
        name: [
          { required: true, message: "请输入姓名", trigger: "blur" },
          { min: 2, max: 10, message: "长度在 2 到 10 个字符", trigger: "blur" },
        ],
        identity_id: [{ required: true, message: "请输入执业编号", trigger: "blur" }],
        avatar_url: [{ required: true, message: "请上传头像", trigger: "blur" }],
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
          if (dataMap.uploading) {
            ElMessage.error("请等待头像上传完成后再提交");
            return;
          }

          let params: any = {};
          dataMap.btnLoad = true;
          try {
            if (dataMap.editType == "add") {
              params = {
                nickname: dataMap.employeeForm.nickname,
                avatar_url: dataMap.employeeForm.avatar_url,
                name: dataMap.employeeForm.name,
                live_platform: dataMap.employeeForm.live_platform,
                live_type: dataMap.employeeForm.live_type,
                dept_id: Number(dataMap.employeeForm.dept_id) || 0,
                intro: dataMap.employeeForm.intro,
                identity_id: dataMap.employeeForm.identity_id,
              };
              console.log("新增员工参数", params);
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
                nickname: dataMap.employeeForm.nickname,
                avatar_url: dataMap.employeeForm.avatar_url,
                name: dataMap.employeeForm.name,
                live_platform: dataMap.employeeForm.live_platform,
                live_url: dataMap.employeeForm.live_url,
                live_type: dataMap.employeeForm.live_type,
                dept_id: Number(dataMap.employeeForm.dept_id) || 0,
                intro: dataMap.employeeForm.intro,
                identity_id: dataMap.employeeForm.identity_id,
              };
              console.log("修改员工参数", params);
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
      dataMap.employeeForm = {
        dept_id: 0,
        employee_id: "", //主播编号
        nickname: "",
        avatar_url: "", // 头像
        name: "",
        intro: "",
        sqrq_start: "",
        sqrq_end: "",
        live_url: "",
        live_platform: 1,
        identity_id: "",
        live_type: "",
      };
      dataMap.fileList = [];
      dataMap.btnLoad = false;
      dataMap.uploading = false;
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

        dataMap.fileList.push({
          name: "头像.png",
          url: dataMap.employeeForm.avatar_url || "",
        });
      }

      await togetDeptList();
    };

    const togetDeptList = async () => {
      let res: any = await getDeptList();
      if (res.iRet === 0) {
        tofillCascader(res);
      }
    };
    const tofillCascader = (res: any) => {
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
    const changeOrg = (val) => {
      cascaderRef.value.togglePopperVisible();
    };
    const handleChange = (file, fileList) => {
      //   dataMap.fileList = fileList;
    };
    const fillForm = (file) => {
      const isAllowed = dataMap.allowedFileTypes.includes(file.type);
      if (!isAllowed) {
        ElMessage.error(
          "只允许上传 " + dataMap.allowedFileTypes.join(" ") + "格式的文件"
        );
        return false; // 返回 false 以阻止上传
      }
      if (file.size > dataMap.maxFileSize) {
        ElMessage.error(
          "上传文件大小超过限制 " + dataMap.maxFileSize / 1024 / 1024 + "MB"
        );
        return false; // 返回 false 以阻止上传
      }

      dataMap.uploadForm["name"] = file.name;
      dataMap.uploading = true; // 宣传页开始上传
      return true; // 返回 false 以阻止上传
    };
    // 上传文件
    const upload = (res, file, fileList) => {
      if (res.iRet === 0) {
        dataMap.fileList = fileList;
        // 头像地址
        dataMap.employeeForm.avatar_url = res.data.filePath;
        ElMessage.success("上传成功");
      } else {
        dataMap.fileList = fileList.filter((item) => item.response.iRet == 0);
        ElMessage.error("server error");
      }
      dataMap.uploading = false;
    };
    const uploadError = () => {
      ElMessage.error("上传失败");
      dataMap.uploading = false;
    };

    onMounted(() => {
      dataMap.actionUrl = import.meta.env.VITE_APP_BASE_API + "api-file/upload";
    });

    const copy = () => {
      const input = document.createElement("input");
      input.value = "//cdn.upchinaproduct.com/algo/CompliancePcWebServer/images/dy.png";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      ElMessage.success("复制成功");
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
      fillForm,
      upload,
      uploadError,
      copy,
    };
  },
});
</script>
<style lang="scss">
.dy-content > * {
  margin-bottom: 16px;
}
.row-content {
  line-height: 20px;
  padding: 8px 0;
  .copy-btn {
    color: #3a62f7;
    cursor: pointer;
    margin-left: 10px;
    text-decoration: underline;
  }
}
</style>
