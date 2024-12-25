<template>
  <div>
    <!-- 角色管理 -->

    <div class="account-manage">
      <div class="table-top" v-if="isEditor">
        <el-button
          type="primary"
          @click="openDialog('add', {})"
          size="mini"
          color="#3A62F7"
          class="com-btn ml0"
        >
          新增敏感词库
        </el-button>
      </div>
      <div class="account-main">
        <el-table
          size="small"
          :data="tableData"
          @cell-click="openDialog"
          height="calc(100vh - 255px)"
          class="system-table"
        >
          <!-- <el-table-column label="部门编号" prop="auto_inc_id"></el-table-column> -->
          <el-table-column label="敏感词库名称" prop="name"></el-table-column>
          <el-table-column label="词库说明" prop="description"></el-table-column>

          <el-table-column
            label="所含词"
            prop="preview_words"
            class-name="pointer-column"
          />
          <el-table-column label="所含词数量" prop="nums"></el-table-column>
          <el-table-column label="修改时间" prop="updated_time"></el-table-column>
          <el-table-column label="创建时间" prop="created_time"></el-table-column>
          <el-table-column
            label="操作"
            v-if="isEditor"
            fixed="right"
            align="center"
            width="160"
          >
            <template #default="scope">
              <el-button
                type="text"
                title="修改"
                @click.stop="openDialog('edit', scope.row)"
                :disabled="systemIds.includes(scope.row.id)"
                :class="{
                  disabled: systemIds.includes(scope.row.id),
                  'update-btn': true,
                }"
              >
                修改
              </el-button>
              <el-button
                type="text"
                title="删除"
                @click.stop="delWord(scope.row)"
                :disabled="systemIds.includes(scope.row.id)"
                :class="{
                  disabled: systemIds.includes(scope.row.id),
                  'delete-btn': true,
                }"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <WordsPop ref="wordPop" @finish="getwordList" />
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { Delete, Edit } from "@element-plus/icons";
import { ElMessageBox, ElMessage } from "element-plus";
import WordsPop from "./components/words/set-words-pop.vue";
import { querySensitiveWordsList, deleteSensitiveWords } from "@/api/runCheck";
import dayjs from "dayjs";
import { set } from "lodash";
export default defineComponent({
  data() {
    return {
      setType: "add",
      tableData: [],
      employeeList: [], // 主播列表
      systemIds: [1, 2, 3], // 系统词库id
    };
  },
  created() {
    this.getwordList();
  },
  computed: {
    isEditor() {
      return this.$store.state.user.isEditor;
    },
  },
  methods: {
    async getwordList() {
      let res = await querySensitiveWordsList();
      if (res.ret == 0) {
        this.tableData = res.data.info_list.map((item) => {
          return {
            ...item,
            updated_time: dayjs(item.updated_at * 1000).format("YYYY-MM-DD HH:mm:ss"),
            created_time: dayjs(item.created_at * 1000).format("YYYY-MM-DD HH:mm:ss"),
          };
        });
      }
    },

    openDialog(type: any, data: any, column: any, row: any) {
      let setType = "";
      let rowData = {} as any;
      if (typeof type === "object" && data.property !== "preview_words") {
        return;
      } else if (typeof type === "object" && data.property === "preview_words") {
        // 查看所含词 第一参数是data
        setType = "view";
        rowData = type;
      } else {
        setType = type;
        rowData = data;
      }

      (this.$refs["wordPop"] as any).dialogVisible = true;
      (this.$refs["wordPop"] as any).setType = setType;
      if (setType === "edit" || setType === "view") {
        (this.$refs["wordPop"] as any).formData = JSON.parse(JSON.stringify(rowData));
        (this.$refs["wordPop"] as any).init();
        this.$nextTick(() => {
          (this.$refs["wordPop"] as any).formData = JSON.parse(JSON.stringify(rowData));
        });
      } else {
        (this.$refs["wordPop"] as any).init();
      }
    },
    delWord(data: any) {
      ElMessageBox.confirm(`确认删除【${data.name}】敏感词库吗？`, "提示", {
        dangerouslyUseHTMLString: true,
        customClass: "messageBox_class",
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          let res = await deleteSensitiveWords({ id: data.id });
          if (res.ret === 0) {
            ElMessage.success("删除成功");
            this.getwordList();
          }
        })
        .catch(() => {
          // catch error
        });
    },
  },
  components: {
    Delete,
    Edit,
    WordsPop,
  },
});
</script>
<style lang="scss" scoped>
.table-top {
  height: 32px;
  margin-bottom: 20px;
  line-height: 32px;
}
.account-manage {
  min-height: calc(100vh - 100px);
}
.disabled {
  color: #636873 !important;
}
.el-button.is-disabled:hover {
  background: transparent !important;
}
</style>
