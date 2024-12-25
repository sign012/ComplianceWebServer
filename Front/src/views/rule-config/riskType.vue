<template>
  <div>
    <!-- 角色管理 -->

    <div class="account-manage">
      <div class="table-top" style="display: block !important" v-if="isEditor">
        <el-button
          type="primary"
          @click="openDialog('add', {})"
          size="mini"
          color="#3A62F7"
          class="com-btn ml0"
        >
          配置风险类别
        </el-button>
        <span class="time" style="float: right">最后更新时间：{{ updateTime }}</span>
      </div>
      <div class="account-main">
        <el-table size="small" :data="tableData" height="calc(100vh - 255px)">
          <!-- <el-table-column label="部门编号" prop="auto_inc_id"></el-table-column> -->
          <el-table-column label="风险类别名称" prop="label_name"></el-table-column>
          <el-table-column label="视频风险" prop="spfx">
            <template #default="scope">
              <div>
                <span v-for="(item, index) in scope.row.original_lables" :key="index">
                  {{ item.label_type == 1 ? item.label_name + ";" : "" }}
                </span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="音频风险" prop="ypfx">
            <template #default="scope">
              <div>
                <span v-for="(item, index) in scope.row.original_lables" :key="index">
                  {{ item.label_type == 2 ? item.label_name + ";" : "" }}
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="图文风险" prop="twfx">
            <template #default="scope">
              <div>
                <span v-for="(item, index) in scope.row.original_lables" :key="index">
                  {{ item.label_type == 3 ? item.label_name + ";" : "" }}
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="自定义违规" prop="mgcfx">
            <template #default="scope">
              <div>
                <span v-for="(item, index) in scope.row.original_lables" :key="index">
                  {{ item.label_type == 4 ? item.label_name + ";" : "" }}
                </span>
              </div>
            </template>
          </el-table-column>
          <!-- <el-table-column label="其他风险" prop="qtfx">
            <template #default="scope">
              <div>
                <span v-for="(item, index) in scope.row.original_lables" :key="index">
                  {{ item.label_type == -1 ? item.label_name + ';' : '' }}
                </span>
              </div>
            </template>
          </el-table-column> -->
          <!-- <el-table-column label="操作" v-if="isEditor">
            <template #default="scope">
            
              <el-button type="text" style="color: red" @click="delWord(scope.row)">
                <el-icon>
                  <delete />
                </el-icon>
                删除
              </el-button>
            </template>
          </el-table-column> -->
        </el-table>
      </div>
    </div>

    <RiskTypePop ref="riskTypePop" @finish="getCustomize" />
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { Delete, Edit } from "@element-plus/icons";
import { ElMessageBox, ElMessage } from "element-plus";
import RiskTypePop from "./components/risktype/set-risktype-pop.vue";
import { queryCustomizeLabelInfo, deleteSensitiveWords } from "@/api/runCheck";
import dayjs from "dayjs";
export default defineComponent({
  data() {
    return {
      setType: "add",
      tableData: [],
      updateTime: "2024-07-19 15:30:00", // 类别最后更新时间
      employeeList: [], // 主播列表
    };
  },
  created() {
    this.getCustomize();
  },
  computed: {
    isEditor() {
      return this.$store.state.user.isEditor;
    },
  },
  methods: {
    async getCustomize() {
      // let res = {
      //   data: {
      //     updated_at: 1626691400,
      //     info_list: [
      //       {
      //         index: 1,
      //         label_name: '分类1',
      //         original_lables: [
      //           {
      //             label_id: '001',
      //             label_name: '违规标签1',
      //             label_type: 1 // -1 其他 1 视频 2 音频 3 图文 4 敏感词
      //           },

      //           {
      //             label_id: '003',
      //             label_name: '违规标签3',
      //             label_type: 2 // -1 其他 1 视频 2 音频 3 图文 4 敏感词
      //           },

      //           {
      //             label_id: '005',
      //             label_name: '违规标签5',
      //             label_type: 3 // -1 其他 1 视频 2 音频 3 图文 4 敏感词
      //           },
      //           {
      //             label_id: '006',
      //             label_name: '违规标签6',
      //             label_type: 3 // -1 其他 1 视频 2 音频 3 图文 4 敏感词
      //           }
      //         ]
      //       },
      //       {
      //         index: 2,
      //         label_name: '分类2',
      //         original_lables: [
      //           {
      //             label_id: '101',
      //             label_name: '违规标签11',
      //             label_type: 1 // -1 其他 1 视频 2 音频 3 图文 4 敏感词
      //           },

      //           {
      //             label_id: '103',
      //             label_name: '违规标签13',
      //             label_type: 2 // -1 其他 1 视频 2 音频 3 图文 4 敏感词
      //           },

      //           {
      //             label_id: '105',
      //             label_name: '违规标签15',
      //             label_type: 3 // -1 其他 1 视频 2 音频 3 图文 4 敏感词
      //           },

      //           {
      //             label_id: '107',
      //             label_name: '违规标签17',
      //             label_type: -1 // -1 其他 1 视频 2 音频 3 图文 4 敏感词
      //           }
      //         ]
      //       }
      //     ]
      //   }
      // };
      let res = await queryCustomizeLabelInfo();
      if (res.ret == 0) {
        this.updateTime = dayjs(res.data.updated_at * 1000).format("YYYY-MM-DD HH:mm:ss"); // 类别最后更新时间
        this.tableData = res.data.info_list;
      }
    },

    openDialog(type: any, data: any) {
      (this.$refs["riskTypePop"] as any).dialogVisible = true;
      (this.$refs["riskTypePop"] as any).setType = type;
      (this.$refs["riskTypePop"] as any).riskTypeData = JSON.parse(
        JSON.stringify(this.tableData)
      );
      (this.$refs["riskTypePop"] as any).init();
      this.$nextTick(() => {
        (this.$refs["riskTypePop"] as any).riskTypeData = JSON.parse(
          JSON.stringify(this.tableData)
        );
      });
    },
    delWord(data: any) {
      return;
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
            this.getCustomize();
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
    RiskTypePop,
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
</style>
