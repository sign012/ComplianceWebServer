<template>
  <!-- 回测参数弹窗 -->
  <div v-dialogdrag>
    <el-dialog
      :title="editType == 'add' ? '新增直播' : '编辑直播'"
      @close="clearForm"
      custom-class="up-pop  big-pop"
      v-model="openDialog"
    >
      <div>
        <el-form :model="liveForm" ref="livePopRef" :rules="liveRules">
          <el-row>
            <el-col :span="24">
              <div class="grid-content bg-purple">
                <el-form-item label="主播" prop="employee_id" class="show-prefix">
                  <el-select
                    v-model="liveForm.employee_id"
                    :disabled="editType == 'edit'"
                    @change="changeEmployee"
                    filterable
                    placeholder="请选择主播"
                  >
                    <el-option
                      :label="item.label_with_platform"
                      :value="item.value"
                      v-for="item in employeeList"
                      :key="item.id"
                    >
                      <template #default>
                        <img
                          :src="item.avatar_url"
                          alt=""
                          style="
                            width: 22px;
                            height: 22px;
                            margin-right: 5px;
                            border-radius: 50%;
                            vertical-align: middle;
                          "
                        />
                        <!-- {{ item.label }}({{ plateformList[item.live_platform] }}) -->
                        {{ item.label_with_platform }}
                      </template>
                    </el-option>
                    <template #prefix v-if="currentAvatarUrl">
                      <div>
                        <img
                          :src="currentAvatarUrl"
                          alt=""
                          style="
                            width: 22px;
                            height: 22px;
                            border-radius: 50%;
                            vertical-align: middle;
                          "
                        />
                        <!-- <span style="margin-left: 140px"
                          >({{ plateformList[liveForm.live_platform] }})</span
                        > -->
                      </div>
                    </template>
                  </el-select>
                </el-form-item>

                <el-form-item label="计划开始时间" prop="kssj">
                  <el-date-picker
                    v-model="liveForm.kssj"
                    type="datetime"
                    format="YYYY-MM-DD HH:mm"
                    value-format="YYYY-MM-DD HH:mm"
                    placeholder="请选择开始时间"
                    :disabled-date="disabledDate"
                    :disabled="isPass"
                    @change="changeDate"
                  />
                </el-form-item>
                <el-form-item label="计划结束时间" prop="jssj">
                  <el-date-picker
                    v-model="liveForm.jssj"
                    type="datetime"
                    format="YYYY-MM-DD HH:mm"
                    value-format="YYYY-MM-DD HH:mm"
                    placeholder="请选择结束时间"
                    :disabled-date="disabledDate"
                    :disabled="isPass"
                  />
                </el-form-item>
                <el-form-item label="直播标题" prop="live_title">
                  <el-input
                    v-model="liveForm.live_title"
                    placeholder="请输入直播标题"
                  ></el-input>
                </el-form-item>
                <el-form-item label="直播内容" prop="live_content">
                  <el-input
                    v-model="liveForm.live_content"
                    type="textarea"
                    placeholder="请输入直播内容"
                  ></el-input>
                </el-form-item>
                <el-form-item label="直播材料" prop="">
                  <el-upload
                    ref="uploadRef"
                    :action="actionUrl"
                    :limit="5"
                    v-model:file-list="fileList"
                    :on-success="upload"
                    :before-upload="fillForm"
                    :data="uploadForm"
                    :on-preview="handlePreview"
                    name="tplfile"
                  >
                    <el-button
                      size="mini"
                      :loading="upStatus"
                      type="primary"
                      style="margin-left: 0 !important"
                      >上传文件</el-button
                    >
                    <el-button
                      size="mini"
                      type="danger"
                      @click.stop="delAll"
                      v-if="fileList.length > 0"
                    >
                      一键删除
                    </el-button>

                    <template #file="{ file }">
                      <div>
                        <div @click="downloadFile(file.uid, file.name)">
                          {{ file.name }}
                          <span
                            class="del-file"
                            title="移除"
                            @click.stop="removeFile(file.uid)"
                            v-if="newOperFlag"
                          >
                            <!-- <el-icon>
                              <Delete />
                            </el-icon> -->
                            <img :src="closeCircleImg" alt="" />
                          </span>
                        </div>
                      </div>
                    </template>
                  </el-upload>
                </el-form-item>
                <!-- <div v-if="showPush"> -->
                <div>
                  <el-form-item
                    class="tip-form-item"
                    label="转推地址"
                    prop="third_push_addr"
                  >
                    <div class="upload-tip">
                      <el-popover
                        placement="right"
                        trigger="hover"
                        popper-class="upload-tip-pop"
                      >
                        <template #reference>
                          <div title="提示" class="tip-icon">
                            <!-- <el-icon>
                              <QuestionFilled />
                            </el-icon> -->
                            <img :src="questionImg" alt="" />
                          </div>
                        </template>
                        <template #default>
                          <div class="content">
                            <!-- <div class="title">上传的敏感词文件数据参考如下图模板排列</div> -->

                            <img :src="tipImg" alt="" style="width: 130%" />
                            <!-- <div>(仅支持csv、xls、xlsx格式)</div> -->
                          </div>
                        </template>
                      </el-popover>
                    </div>
                    <el-input
                      v-model="liveForm.third_push_addr"
                      type="textarea"
                      @input="handleInput"
                      @focus="handleInput"
                      @blur="hideDropdown"
                      placeholder="请输入转推地址"
                    ></el-input>
                    <div v-if="showDropdown && hasPushListFilter" class="dropdown">
                      <div
                        v-for="(item, index) in pushListFilter"
                        :key="index"
                        @mousedown="liveForm.third_push_addr = item.third_push_addr"
                        class="dropdown-item"
                      >
                        {{ item.third_push_addr }}
                      </div>
                    </div>
                  </el-form-item>
                  <el-form-item label="转推密钥" prop="third_push_code">
                    <el-input
                      v-model="liveForm.third_push_code"
                      type="textarea"
                      @input="handleInput_code"
                      @focus="handleInput_code"
                      @blur="hideDropdown2"
                      placeholder="请输入转推密钥"
                    ></el-input>
                    <div v-if="showDropdown_code && hasPushListFilter" class="dropdown">
                      <div
                        v-for="(item, index) in pushListFilter"
                        :key="index"
                        @mousedown="liveForm.third_push_code = item.third_push_code"
                        class="dropdown-item"
                      >
                        {{ item.third_push_code }}
                      </div>
                    </div>
                  </el-form-item>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancel" color="#343A4E" class="cancel-btn">取消</el-button>
          <el-button type="primary" @click="save" :loading="btnLoad">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
  nextTick,
  reactive,
  toRefs,
  ref,
  onMounted,
  watch,
  getCurrentInstance,
  computed,
} from "vue";
import { queryEmployee, createLiveReport, updateLiveReportInfo } from "@/api/runCheck";
import { plateformDict, plateformDictAdd } from "@/utils/dict";
import { ElMessage, ElMessageBox } from "element-plus";
import { Delete, QuestionFilled } from "@element-plus/icons";
import JSZip from "jszip";
import { toRaw } from "vue";
import axios from "axios";
import tipImg from "@/assets/images/push-tip.png";
import questionImg from "@/assets/images/question-circle.png";
import closeCircleImg from "@/assets/images/close-circle.png";
import dayjs from "dayjs";
export default defineComponent({
  emits: ["renderList"],
  components: {
    Delete,
    QuestionFilled,
  },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance() as any;
    const livePopRef = ref();
    let dataMap = reactive({
      tipImg,
      questionImg,
      closeCircleImg,
      allowedFileTypes: [".zip", ".py", ".gz", ".bz", ".tar", ".tgz"],
      maxFileSize: 1024 * 1024 * 2, // 2MB
      actionUrl: "",
      uploadForm: {
        businessName: "任务文件",
        userId: "",
        method: 0,
      } as any, // 上传参数

      fileList: [] as any,
      fileListOld: [] as any, // 列表压缩包
      upStatus: false,
      currentAvatarUrl: "",
      openDialog: false,
      btnLoad: false,
      liveForm: {
        employee_id: "", //主播编号
        live_title: "",
        live_content: "",
        live_script_url: "",
        live_script_files: [],
        live_platform: 2,
        start_time: "",
        end_time: "",
        kssj: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        jssj: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        id: "", // 直播编号
        third_push_addr: "", //转推地址
        third_push_code: "", //转推码
      } as any,
      editType: "add",
      newOperFlag: true, // false意味着有老文件，并且未修改过
      employeeList: [],
      liveReportList: [], // 所有直播计划
      plateformDict,
      plateformList: Object.values(plateformDict),
      plateformDictAdd,
      liveRules: {
        employee_id: [{ required: true, message: "请选择主播", trigger: "blur" }],
        live_title: [
          { required: true, message: "请输入直播标题", trigger: "blur" },
          { min: 1, max: 50, message: "长度在 1 到 50 个字符", trigger: "blur" },
        ],
        // live_content: [{ required: true, message: '请输入直播内容', trigger: 'blur' }],
        // live_platform: [{ required: true, message: '请选择直播平台', trigger: 'blur' }],
        kssj: [{ required: true, message: "请选择计划开始时间", trigger: "blur" }],
        jssj: [{ required: true, message: "请选择计划结束时间", trigger: "blur" }],
      },
      showDropdown: false, // 转推地址下拉框
      showDropdown_code: false, // 转推密钥下拉框
      pushList: [], // 转推地址过滤后的列表
      isPass: false, // 是否已通过审核
    });
    const disabledDate = (time: Date) => {
      return time.getTime() < Date.now() - 86400000;
    };
    watch(
      () => dataMap.liveForm.employee_id,
      () => {
        dataMap.currentAvatarUrl = dataMap.employeeList.find(
          (item) => item.value == dataMap.liveForm.employee_id
        )?.avatar_url;
      }
    );
    // 显示转推码/转推密钥
    const showPush = computed(() => {
      //   return Object.keys(dataMap.plateformDictAdd).includes(
      //     String(dataMap.liveForm.live_platform)
      //   );
      return dataMap.liveForm.live_platform == 1;
    });

    const hasPushListFilter = computed(() => {
      return (
        dataMap.pushList.filter(
          (item) => item.employee_id == dataMap.liveForm.employee_id
        )?.length > 0
      );
    });
    const pushListFilter = computed(() => {
      return dataMap.pushList.filter(
        (item) => item.employee_id == dataMap.liveForm.employee_id
      );
    });
    // 1小时内不能重复    开始结束之间不超过24小时
    const checkStartTime = () => {
      let _start = new Date(dataMap.liveForm.kssj).getTime() / 1000;
      let _end = new Date(dataMap.liveForm.jssj).getTime() / 1000;
      let flag = true;
      let tip = "";
      dataMap.liveReportList
        .filter((item) => item.employee_id == dataMap.liveForm.employee_id)
        .forEach((item) => {
          if (
            Math.abs(item.start_time - _start) < 3600 &&
            item.id != dataMap.liveForm.id
          ) {
            flag = false;
            tip = "邻近1小时内已有直播计划 ";
            return;
          }
        });

      if (_end < _start) {
        flag = false;
        tip = "计划结束时间早于计划开始时间 ";
      }
      if (_end - _start > 14400) {
        flag = false;
        tip = "计划时间超过4小时 ";
      }
      if (!flag) {
        ElMessage.warning(tip);
      }
      return flag;
    };
    const confirm = () => {
      livePopRef.value.validate(async (valid: any, fields: any) => {
        if (valid) {
          //   console.log("通过了");
          if (checkStartTime() === false) {
            return;
          }
          //   console.log("时间校验通过");
          let params: any = {};
          dataMap.btnLoad = true;
          if (dataMap.editType == "add") {
            params = {
              employee_id: dataMap.liveForm.employee_id,
              live_title: dataMap.liveForm.live_title,
              live_content: dataMap.liveForm.live_content,
              live_script_url: dataMap.liveForm.live_script_url,
              live_script_files: dataMap.liveForm.live_script_files,
              start_time: new Date(dataMap.liveForm.kssj).getTime() / 1000,
              end_time: new Date(dataMap.liveForm.jssj).getTime() / 1000,
              third_push_addr: dataMap.liveForm.third_push_addr, //转推地址
              third_push_code: dataMap.liveForm.third_push_code, //转推码
            };
            let res = await createLiveReport(params);
            if (res.ret == 0) {
              ElMessage.success("新增成功");
              emit("renderList");
              dataMap.btnLoad = false;
              setLocalPush();
            } else {
              ElMessage.error("code:" + res.ret + ";" + res.msg);
              //   setLocalPush(); // 调试代码 需注释
            }

            dataMap.openDialog = false;

            delAll();
          } else {
            params = {
              id: dataMap.liveForm.id,
              live_title: dataMap.liveForm.live_title,
              live_content: dataMap.liveForm.live_content,
              live_script_url: dataMap.liveForm.live_script_url || "",
              live_script_files: dataMap.liveForm.live_script_files || [],
              start_time: new Date(dataMap.liveForm.kssj).getTime() / 1000,
              end_time: new Date(dataMap.liveForm.jssj).getTime() / 1000,
            };
            let res = await updateLiveReportInfo(params);
            if (res.ret == 0) {
              emit("renderList");
              setLocalPush();
            } else {
              ElMessage.error("code:" + res.ret + ";" + res.msg);
              //   setLocalPush(); // 调试代码 需注释
            }
            dataMap.btnLoad = false;
            dataMap.openDialog = false;

            delAll();
          }
        } else {
          ElMessage.error("请检查输入项");
          return;
        }
      });
    };
    //保存
    const save = async () => {
      if (dataMap.fileList.length > 0 && dataMap.newOperFlag) {
        // 打包文件到压缩包
        const zip = new JSZip();
        const rawFileList = dataMap.fileList.map(toRaw);
        rawFileList.forEach((file) => {
          zip.file(file.name, file.raw, {
            binary: true, // 将内容视为二进制数据
          });
        });
        zip.generateAsync({ type: "blob" }).then((content) => {
          const file = new File([content], "myZipFile.zip", {
            type: "application/x-zip-compressed",
          });
          // 现在你可以使用 file 对象进行上传或其他操作
          const formData = new FormData();
          formData.append("tplfile", file); // file 是一个 File 对象
          // 注意：这里的请求头 Content-Type 必须设置为 multipart/form-data
          // 添加自定义参数
          formData.append("businessName", "直播材料文件夹");
          formData.append("userId", "");
          formData.append("method", "0");
          formData.append("name", "myZipFile.zip");

          axios
            .post(dataMap.actionUrl, formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            })
            .then((res) => {
              const jsonData = res.data.data;
              dataMap.liveForm.live_script_url = jsonData.filePath;
              dataMap.liveForm.live_script_files = dataMap.fileList.map(
                (item) => item.name
              );
            })
            .catch((error) => {
              ElMessage.error("脚本上传失败");
              console.error("Upload failed", error);
            })
            .finally(() => {
              confirm();
            });
        });
      } else {
        confirm();
      }
    };

    //清空form
    const clearForm = () => {
      //重置文件列表
      dataMap.liveForm = {
        employee_id: "", //主播编号
        live_title: "",
        live_content: "",
        live_script_url: "",
        live_script_files: [],
        live_platform: 2,
        start_time: "",
        end_time: "",
        kssj: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        jssj: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        id: "", // 直播编号
        third_push_addr: "", //转推地址
        third_push_code: "", //转推码
      };
      dataMap.fileList = [];
      dataMap.btnLoad = false;
      livePopRef.value.resetFields();
      dataMap.isPass = false;
    };
    // 获取主播列表
    const getEmployeeList = async () => {
      let res = await queryEmployee();
      if (res.ret == 0) {
        dataMap.employeeList = res.data.employees.map((item) => {
          return {
            label: item.nickname,
            value: item.employee_id,
            avatar_url: item.avatar_url,
            live_platform: item.live_platform,
            label_with_platform:
              item.nickname + "(" + dataMap.plateformDict[item.live_platform] + ")",
          };
        });
      }
    };
    // 初始化弹窗
    const initPop = async (type: string, data: any) => {
      dataMap.openDialog = true;
      dataMap.editType = type;
      if (dataMap.editType == "edit") {
        dataMap.liveForm.live_script_url = data.live_script_url;
        dataMap.liveForm.live_script_files = data.live_script_files;
        dataMap.fileList = data.live_script_files.map((item) => {
          return {
            name: item,
            url: data.live_script_url,
            uid: item,
          };
        });
        if (dataMap.fileList.length > 0) {
          dataMap.newOperFlag = false;
        }
        try {
          await getEmployeeList();
          dataMap.liveForm = data;
          dataMap.employeeList.forEach((item) => {
            if (item.value == dataMap.liveForm.employee_id) {
              dataMap.liveForm.live_platform = item.live_platform;
            }
          });
        } catch (error) {
          ElMessage.error("获取主播列表失败");
          // 解决接口请求主播列表错误时，编辑框无内容bug
          dataMap.liveForm = data;
        }

        // 已通过的不能改时间
        if (dataMap.liveForm.review_status === 3) {
          dataMap.isPass = true;
        }
      } else {
        dataMap.newOperFlag = true;
        //重置文件列表
        dataMap.liveForm = {
          employee_id: "", //主播编号
          live_title: "",
          live_content: "",
          live_script_url: "",
          live_script_files: [],
          live_platform: 2,
          start_time: "",
          end_time: "",
          kssj: dayjs().format("YYYY-MM-DD HH:mm:ss"),
          jssj: dayjs().format("YYYY-MM-DD HH:mm:ss"),
          id: "", // 直播编号
        };
      }
    };
    const uploadRef: any = ref();
    const fillForm = (file) => {
      if (!dataMap.newOperFlag) {
        ElMessage.warning("先删除旧脚本再上传新脚本");
        return false;
      }
      const isAllowed = dataMap.allowedFileTypes.includes(file.type);
      // if (!isAllowed) {
      //   ElMessage.error('只允许上传 ' + dataMap.allowedFileTypes.join(' ') + '格式的文件');
      //   return false; // 返回 false 以阻止上传
      // }
      if (file.size > dataMap.maxFileSize) {
        ElMessage.error(
          "上传文件大小超过限制 " + dataMap.maxFileSize / 1024 / 1024 + "MB"
        );
        return false; // 返回 false 以阻止上传
      }

      dataMap.upStatus = true;
      dataMap.uploadForm["name"] = file.name;
    };

    // 上传文件
    const upload = (res, file, fileList) => {
      if (res.iRet === 0) {
        dataMap.fileList = fileList;
        // 存脚本cdn地址
        dataMap.liveForm.live_script_url = res.data.filePath; // 存某一条脚本地址（避免压缩包整个上传失败，优化体验，兜底代码）
      } else {
        dataMap.fileList = fileList.filter((item) => item.response.iRet == 0);
        ElMessage.error(res.message);
      }
      dataMap.upStatus = false;
      uploadRef.value.clearFiles();
    };
    const handlePreview = (file) => {};
    onMounted(() => {
      dataMap.actionUrl = import.meta.env.VITE_APP_BASE_API + "api-file/upload";
      getLocalPush();
    });
    const downloadFile = (uid, fileName) => {
      // 创建一个隐藏的 a 元素
      const link = document.createElement("a");
      link.href = dataMap.liveForm.live_script_url;
      link.download = fileName || ""; // 设置下载文件的名称，可选
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    const removeFile = (fileUid) => {
      dataMap.fileList = dataMap.fileList.filter((item) => item.uid !== fileUid);
    };
    const delAll = () => {
      dataMap.fileList = [];
      dataMap.liveForm.live_script_files = [];
      dataMap.liveForm.live_script_url = "";
      dataMap.newOperFlag = true;
    };
    const cancel = () => {
      dataMap.openDialog = false;
      delAll();
    };
    const changeEmployee = () => {
      dataMap.liveForm.live_platform = dataMap.employeeList.find(
        (item) => item.value == dataMap.liveForm.employee_id
      )?.live_platform;
    };
    // 记录转推信息   [{employee_id:1, third_push_addr: 'rtmp://192.168.127.12:1935/live/stream1', third_push_code: '123456'},
    //                {employee_id:2, third_push_addr: 'rtmp://192.168.127.12:1935/live/stream2', third_push_code: '123456'} ...]
    const setLocalPush = () => {
      if (dataMap.liveForm.third_push_addr || dataMap.liveForm.third_push_code) {
        // 找到对应employee_id的对象，更新其值
        let index = dataMap.pushList.findIndex(
          (item) => item.employee_id == dataMap.liveForm.employee_id
        );
        if (index != -1) {
          dataMap.pushList[index].third_push_addr =
            dataMap.liveForm.third_push_addr || dataMap.pushList[index].third_push_addr;
          dataMap.pushList[index].third_push_code =
            dataMap.liveForm.third_push_code || dataMap.pushList[index].third_push_code;
        } else {
          dataMap.pushList.push({
            employee_id: dataMap.liveForm.employee_id,
            third_push_addr: dataMap.liveForm.third_push_addr,
            third_push_code: dataMap.liveForm.third_push_code,
          });
        }

        localStorage.setItem("push_list", JSON.stringify(dataMap.pushList));
      }
    };
    const getLocalPush = () => {
      dataMap.pushList = localStorage.getItem("push_list")
        ? JSON.parse(localStorage.getItem("push_list"))
        : [];
      //   dataMap.pushList = [
      //     {
      //       employee_id: "UP00140",
      //       third_push_addr: "rtmp://192.168.127.12:1935/live/stream1",
      //       third_push_code: "123456",
      //     },
      //   ];
    };

    // 值为空时， 且 有历史数据时  展开下拉框
    const handleInput = () => {
      if (!dataMap.liveForm.third_push_addr) {
        dataMap.showDropdown = true;
      } else {
        dataMap.showDropdown = false;
      }
    };
    const hideDropdown = () => {
      //   setTimeout(() => {
      dataMap.showDropdown = false;
      //   }, 200);
    };
    const handleInput_code = () => {
      if (!dataMap.liveForm.third_push_code) {
        dataMap.showDropdown_code = true;
      } else {
        dataMap.showDropdown_code = false;
      }
    };
    const hideDropdown2 = () => {
      //   setTimeout(() => {
      dataMap.showDropdown_code = false;
      //   }, 200);
    };
    const changeDate = () => {
      let time = dataMap.liveForm.kssj;
      console.log("选择开始时间", time);
    };
    return {
      ...toRefs(dataMap),
      clearForm,
      save,
      livePopRef,
      initPop,
      upload,
      fillForm,
      uploadRef,
      handlePreview,
      downloadFile,
      removeFile,
      delAll,
      cancel,
      changeEmployee,
      disabledDate,
      showPush,
      pushListFilter,
      hasPushListFilter,
      handleInput,
      handleInput_code,
      hideDropdown,
      hideDropdown2,
      changeDate,
    };
  },
});
</script>
<style lang="scss">
.live-config .up-pop {
  .el-form-item--mini .el-form-item__label {
    min-width: 106px !important;
  }
}
i.el-icon.el-input__icon.el-input__validateIcon {
  display: none !important;
}
.el-upload-list__item:hover {
  background-color: #191f33;
}
.el-upload-list__item {
  padding: 0 10px;
  background: #191f33;
  color: #fff;
  cursor: pointer;
  .el-icon {
    // vertical-align: text-top !important;
  }
}
.tip-form-item .el-form-item__content {
  position: relative;
  .upload-tip {
    position: absolute;
    left: -87px;
    top: 2px;
    .tip-icon {
      cursor: pointer;
    }
  }
}
.el-popover.upload-tip-pop .content {
  padding: 0 !important;
}

.dropdown {
  position: absolute;
  min-width: 100px;
  min-height: 32px;
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
