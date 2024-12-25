<template>
  <div>
    <!-- 邮件设置 -->

    <div class="account-manage">
      <div class="table-top" v-if="isEditor">
        <el-button
          type="primary"
          @click="openDialog('add', {})"
          size="mini"
          color="#3A62F7"
          class="com-btn ml0"
        >
          新增发送任务
        </el-button>
      </div>
      <div class="account-main">
        <el-table size="small" :data="tableData" height="calc(100vh - 255px)">
          <!-- <el-table-column label="部门编号" prop="auto_inc_id"></el-table-column> -->
          <el-table-column label="发送任务名称" prop="name"></el-table-column>
          <el-table-column label="收件人" prop="to_addrs">
            <template #default="scope">
              <div v-if="scope.row.to_addrs.length > 0">
                <div v-for="(item, index) in scope.row.to_addrs" :key="index">
                  {{ item }};
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="抄送" prop="cc_addrs">
            <template #default="scope">
              <div v-if="scope.row.cc_addrs.length > 0" class="flex-wrap">
                <div v-for="(item, index) in scope.row.cc_addrs" :key="index">
                  {{ item }};
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="关注主播" prop="employee_ids" width="300">
            <template #default="scope">
              <div v-if="scope.row.employee_ids.length > 0" class="flex-div">
                <div v-for="(item, index) in scope.row.employee_ids" :key="index">
                  {{ employeeMap[item] + ";" }}
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" prop="created_time"></el-table-column>
          <el-table-column label="操作" v-if="isEditor" align="center" width="160">
            <template #default="scope">
              <el-button
                class="update-btn"
                type="text"
                @click="openDialog('edit', scope.row)"
                >修改</el-button
              >
              <el-button class="delete-btn" type="text" @click="delWord(scope.row)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <EmailPop ref="emailPop" @finish="getemailList" />
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { Delete, Edit } from "@element-plus/icons";
import { ElMessageBox, ElMessage } from "element-plus";
import EmailPop from "./components/email/set-email-pop.vue";
import { queryEmployee, queryEmailAlertTask, deleteEmailAlertTask } from "@/api/runCheck";
import dayjs from "dayjs";
export default defineComponent({
  data() {
    return {
      setType: "add",
      tableData: [],
      employeeList: [], // 主播列表
      employeeMap: {}, // 主播map
    };
  },
  async created() {
    await this.getEmployee();
    await this.getemailList();
  },
  computed: {
    isEditor() {
      return this.$store.state.user.isEditor;
    },
  },
  methods: {
    async getEmployee() {
      let resEmployee = await queryEmployee();
      if (resEmployee.ret == 0) {
        this.employeeList = resEmployee.data.employees.map((item) => {
          this.employeeMap[item.employee_id] = item.nickname;
          return {
            label: item.nickname,
            value: item.employee_id,
          };
        });
      }
    },
    async getemailList() {
      // this.tableData = [
      //   {
      //     id: 1,
      //     name: '测试任务',
      //     to_addrs: ['<EMAIL>', '123@qq.com', '456@qq.com'],
      //     cc_addrs: ['<EMAIL>', '123@qq.com', '456@qq.com'],
      //     employee_ids: ['UP00001', 'UP00005'],
      //     created_time: '2021-11-11 11:11:11'
      //   },
      //   {
      //     id: 2,
      //     name: '测试任务2',
      //     to_addrs: ['<EMAIL>', '123@qq.com', '456@qq.com'],
      //     cc_addrs: ['<EMAIL>', '123@qq.com', '456@qq.com'],
      //     employee_ids: ['UP00001', 'UP00005'],
      //     created_time: '2021-11-11 11:11:11'
      //   },
      //   {
      //     id: 3,
      //     name: '测试任务3',
      //     to_addrs: ['<EMAIL>', '123@qq.com', '456@qq.com'],
      //     cc_addrs: ['<EMAIL>', '123@qq.com', '456@qq.com'],
      //     employee_ids: ['UP00001', 'UP00005'],
      //     created_time: '2021-11-11 11:11:11'
      //   }
      // ];
      // return;
      let res = await queryEmailAlertTask();
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

    openDialog(type: any, data: any) {
      (this.$refs["emailPop"] as any).dialogVisible = true;
      (this.$refs["emailPop"] as any).setType = type;
      if (type === "edit") {
        (this.$refs["emailPop"] as any).formData = JSON.parse(
          JSON.stringify({ ...data, words: data.preview_words })
        );
        (this.$refs["emailPop"] as any).init();
        this.$nextTick(() => {
          (this.$refs["emailPop"] as any).formData = JSON.parse(
            JSON.stringify({ ...data, words: data.preview_words })
          );
        });
      } else {
        (this.$refs["emailPop"] as any).init();
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
          let res = await deleteEmailAlertTask({ id: data.id });
          if (res.ret === 0) {
            ElMessage.success("删除成功");
            this.getemailList();
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
    EmailPop,
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
