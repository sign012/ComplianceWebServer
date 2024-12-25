<template>
  <div v-dialogdrag>
    <el-dialog
      :close-on-click-modal="false"
      :title="`敏感词组${setType === 'add' ? '添加' : setType === 'edit' ? '编辑' : '查看'}`"
      custom-class="up-pop sensword-pop"
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
        <el-form-item label="敏感词组名称" prop="name" v-if="setType !== 'view'">
          <el-input v-model="formData.name" placeholder></el-input>
        </el-form-item>
        <el-form-item label="词库说明" prop="description" v-if="setType !== 'view'">
          <el-input v-model="formData.description" placeholder type="textarea"></el-input>
        </el-form-item>

        <el-form-item label="" prop="words" class="show-prefix">
          <div class="word-table">
            <div class="title">
              <span>敏感词表</span>
              <!-- <span>(拖动可排序，右键可删除)</span> -->
            </div>
            <div class="contain">
              <el-input v-model="searchInput" placeholder="Search" @input="search">
                <template #prefix>
                  <el-icon>
                    <Search />
                  </el-icon>
                </template>
              </el-input>
              <div class="word-list">
                <div
                  class="has-list"
                  v-loading="loading"
                  element-loading-text="拼命加载中..."
                  element-loading-spinner="el-icon-loading"
                  element-loading-background="transparent"
                >
                  <span
                    v-if="!loading && filterWords.length === 0 && words.length > 0"
                    style="margin: 8px auto; width: 100%; text-align: center; color: #8c93a1"
                  >
                    无搜索结果
                  </span>
                  <span
                    v-if="!loading && words.length === 0"
                    style="margin: 8px auto; width: 100%; text-align: center; color: #8c93a1"
                  >
                    暂无数据
                  </span>
                  <div class="word-item" v-for="(item, index) in filterWords" :key="index">
                    {{ item }}

                    <span class="close" @click="deleteWord(item)" title="删除" v-if="setType !== 'view'">×</span>
                  </div>
                </div>
                <el-button color="#343d5c" @click="addFlag = true" v-if="!addFlag && setType !== 'view'">
                  创建新词
                  <el-icon>
                    <CirclePlusFilled />
                  </el-icon>
                </el-button>
                <div v-else style="color: transparent">占位格</div>
                <div class="add-list" v-if="addFlag">
                  <div style="margin-right: 8px">
                    <el-input v-model="addInput" placeholder="请输入新词">
                      <template #suffix>
                        <el-button color="#3a62f7" @click="validInput" size="small" class="add-btn">添加</el-button>
                      </template>
                    </el-input>
                  </div>

                  <!-- <span
                    class="word-item"
                    v-for="(item, index) in addList"
                    :key="index"
                    @contextmenu="deleteWord($event, item, )"
                  >
                    {{ item }}
                  </span> -->
                </div>
                <div style="position: absolute; right: 33px; bottom: 10px">共 {{ words.length }} 条</div>
              </div>
            </div>
          </div>
        </el-form-item>
        <div class="oper" v-if="setType !== 'view'">
          <!-- <div class="download" @click="download">xlsx模板下载</div> -->
          <!-- <a target="_blank" href="http://127.0.0.1:3001/compliance/templates/example.xlsx">
            <el-button style="float: left" size="mini" type="primary">
              <i class="el-icon-download" />
              下载空表格模版
            </el-button>
          </a> -->
          <el-upload
            ref="importIndExcel"
            style="float: left"
            class="upload-demo"
            action="#"
            :multiple="false"
            :show-file-list="false"
            accept=".csv,.xls,.xlsx,.txt"
            :http-request="uploadCSVFile"
          >
            <div class="upload">批量上传词表</div>
          </el-upload>
          <div class="upload-tip">
            <el-popover placement="right" title="" :width="200" trigger="hover" popper-class="upload-tip-pop">
              <template #reference>
                <div>
                  <el-icon>
                    <QuestionFilled />
                  </el-icon>
                </div>
              </template>
              <template #default>
                <div class="content">
                  <div class="title">上传的敏感词文件数据参考如下图模板排列</div>

                  <img src="../../../../assets/images/upload-tip.png" alt="" />
                  <div>(仅支持csv、xls、xlsx格式)</div>
                </div>
              </template>
            </el-popover>
          </div>
        </div>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false" color="#343A4E" class="cancel-btn" v-if="setType !== 'view'">
            取消
          </el-button>
          <el-button type="primary" @click="save" v-if="setType !== 'view'">确认</el-button>
          <el-button type="primary" @click="dialogVisible = false" v-else>关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import xlsx from 'xlsx';
import { defineComponent } from 'vue';
import { createSensitiveWords, updateSensitiveWords, querySensitiveWordsDetail } from '@/api/runCheck';
import { ElMessage } from 'element-plus';
import { Search, CirclePlusFilled, QuestionFilled, Close } from '@element-plus/icons';
type MenuMap = {
  [key: string]: Array<any>;
};
export default defineComponent({
  components: {
    Search,
    CirclePlusFilled,
    QuestionFilled,
    Close
  },
  emits: ['finish'],
  data() {
    return {
      dialogVisible: false,
      loading: false,
      setType: 'add',
      searchInput: '',
      formData: { id: '', name: '', description: '', words: [] } as any,
      filterWords: [],
      words: [],
      addList: [],
      addFlag: false,
      addInput: '',
      rules: {
        name: [
          { required: true, message: '请输入敏感词组名称', trigger: 'blur' },
          { min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '请输入词库说明', trigger: 'blur' },
          { min: 1, max: 200, message: '长度在 1 到 200 个字符', trigger: 'blur' }
        ]
        // words: [
        //   { type: 'array', required: true, validator: this.validateCPass, message: '请至少添加一个词', trigger: 'blur' }
        // ]
      },
      fileList: [],
      progressStatus: null,
      percentage: 0,
      errorList: []
    };
  },

  watch: {
    dialogVisible: {
      handler(val) {
        if (!val) {
          this.words = [];
          this.filterWords = [];
          this.addList = [];
          this.searchInput = '';
          this.addFlag = false;
          this.addInput = '';
          this.$refs.formData.resetFields();
        }
      }
    }
  },
  computed: {
    isAdmin() {
      return this.$store.state.user.userMgrType === 'S';
    }
  },
  methods: {
    validateCPass(rule, value, callback) {
      if (this.words.length === 0) {
        callback(new Error('请至少添加一个词'));
      } else {
        callback();
      }
    },
    async save() {
      this.$refs.formData.validate(async (valid) => {
        if (valid) {
          // console.log('保存敏感词', this.formData);
          // this.dialogVisible = false;
          this.formData.words = this.words;
          let params = {
            name: this.formData.name,
            description: this.formData.description,
            words: this.formData.words
          } as any;
          if (this.setType === 'add') {
            let res = await createSensitiveWords(params);
            if (res.ret === 0) {
              ElMessage.success('添加成功');
              this.dialogVisible = false;
              this.$emit('finish');
            } else {
              ElMessage.error(res.msg);
            }
          } else {
            params.id = this.formData.id;
            let res = await updateSensitiveWords(params);
            if (res.ret === 0) {
              ElMessage.success('编辑成功');
              this.dialogVisible = false;
              this.$emit('finish');
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
    validInput() {
      if (this.addInput) {
        if (this.words.includes(this.addInput)) {
          this.$message.error('该词已存在');
          this.addInput = '';
          return;
        } else {
          this.words.unshift(this.addInput);
          this.filterWords = this.words;
          this.searchInput = '';
          this.addInput = '';
        }
      }
    },
    search() {
      this.filterWords = this.words.filter((item) => {
        return item.includes(this.searchInput);
      });
    },
    deleteWord(word: any) {
      this.words.splice(this.words.indexOf(word), 1);
      this.filterWords = this.words.filter((item) => {
        return item.includes(this.searchInput);
      });
    },
    async getWordsDetail() {
      this.loading = true;
      try {
        let res = await querySensitiveWordsDetail({ ids: [this.formData.id] });
        if (res.ret === 0) {
          this.loading = false;
          this.words = res.data.detail_list[0].words || [];
          this.filterWords = this.words;
        } else {
          this.$message.error(res.msg);
          this.loading = false;
        }
      } catch (error) {
        this.loading = false;
      }
    },
    async init() {
      if (this.setType === 'edit' || this.setType === 'view') {
        await this.getWordsDetail();
      } else {
        this.formData = {} as any;
        this.filterWords = [];
      }
    },
    // 下载模板
    download() {
      // 使用fetch API获取模板文件
      fetch('/templates/example.xlsx')
        .then((response) => response.blob())
        .then((blob) => {
          // 创建一个URL对象
          const url = window.URL.createObjectURL(blob);
          // 创建一个<a>元素
          const a = document.createElement('a');
          a.href = url;
          a.download = '敏感词模版.xlsx'; // 设置下载文件的名称
          document.body.appendChild(a);
          a.click(); // 触发点击事件
          a.remove(); // 移除<a>元素
          window.URL.revokeObjectURL(url); // 释放URL对象
        })
        .catch((error) => {
          console.error('下载模板失败:', error);
        });
    },
    /**
     * upload文件错误信息提示
     * @param uploadName 组件ref名称 如：reportXLS
     * @param msg 错误信息提示
     * */
    clearFile(uploadName, msg) {
      if (msg) {
        this.$message.warning(msg);
      }
      this.$refs[uploadName].clearFiles(); // 清除文件对象
    },
    // 上传文件
    uploadCSVFile(content) {
      let fileType = content.file.name.split('.').pop();
      if (fileType !== 'csv' && fileType !== 'xls' && fileType !== 'xlsx' && fileType !== 'txt') {
        this.$message.error('仅支持csv、xls、xlsx、txt格式');
        return;
      }
      let fileReader = new FileReader();
      fileReader.readAsBinaryString(content.file);
      fileReader.onload = async (ev) => {
        try {
          const target = ev.target;
          const data = target.result;
          const workbook = xlsx.read(data, {
            type: 'binary'
          });
          const wsBaseInfo = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
          // console.log(' ====> ', wsBaseInfo);

          // 手动添加属性名
          let arr = this.addKeys(wsBaseInfo);
          if (wsBaseInfo.length === 0) {
            this.$message.error('上传文件不能为空');
            return;
          } else if (wsBaseInfo.length > 5000) {
            this.$message.error('单词数量不能超过5000个');
            return;
          }
          let paramsList = this.formatExcelData(arr);
          this.fileList = [`因子文件_${Date.now()}`];

          let repeatList = [];
          let addList = [];
          let total = 0;
          let inValidTotal = 0;
          for (let i = 0; i < paramsList.length; i++) {
            let params = paramsList[i];
            if (this.words.includes(params)) {
              repeatList.push(params);
            } else if (params == '' || params == null || params == undefined || params.length > 50) {
              inValidTotal++;
            } else {
              addList.push(params);
              total++;
            }
          }
          let tip = `共${addList.length}个词新增，${repeatList.length}个词重复，${inValidTotal}个词为空或无效。`;
          this.words = [...addList, ...this.words];
          this.filterWords = this.words;
          this.$message.success(tip);
        } catch (e) {
          console.log(' uploadExcelFile ====> ', e);
        }

        this.clearFile('importIndExcel');
      };
    },
    /**
     * 手动添加属性名
     * */
    addKeys(data) {
      let arr = [];
      let firstData = Object.keys(data[0])[0];
      data.forEach((item) => {
        arr.push({
          name: Object.values(item)[0]
        });
      });
      arr.unshift({ name: firstData });
      return arr;
    },
    /**
     * 格式化表格数据
     * */
    formatExcelData(data) {
      let _tempList = [];
      for (let i = 0; i < data.length; i++) {
        _tempList.push(data[i].name);
      }

      return _tempList;
    }
  }
});
</script>
<style lang="scss" scoped></style>
