<template>
  <div v-dialogdrag>
    <el-dialog
      title="查看日志"
      custom-class="up-pop"
      :close-on-click-modal="false"
      width="90%"
      top="2%"
      @close="clear"
      v-model="show"
    >
      <el-form :model="searchForm" inline>
        <el-form-item label="日期">
          <el-date-picker
            v-model="searchForm.date"
            type="daterange"
            placeholder
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="状态" v-if="userType === 'T'">
          <el-select v-model="searchForm.level" clearable placeholder>
            <el-option
              v-for="item of status"
              :key="item.val"
              :label="item.label"
              :value="item.val"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label label-width="0">
          <el-button type="primary" @click="getLogs">查询</el-button>
        </el-form-item>
        <el-form-item label label-width="0">
          <el-input v-model="searchForm.cnt" placeholder="请输入要匹配的文字" clearable />
        </el-form-item>
        <el-form-item label label-width="0">
          <el-button type="primary" @click="getLogs">匹配</el-button>
        </el-form-item>
        <el-form-item label label-width="0">
          <el-button type="success" @click="reSearch">
            <el-icon>
              <refresh />
            </el-icon>
          </el-button>
        </el-form-item>
      </el-form>
      <div class="cnt" v-if="userType === 'A'">
        <el-table border :height="650" :data="tableData">
          <el-table-column label="用户名" prop="userId" width="60"></el-table-column>
          <el-table-column label="真实姓名" width="70" prop="realName"></el-table-column>
          <el-table-column label="操作类型" width="70">
            <template #default="scope">{{ logDict[scope.row.logType] }}</template>
          </el-table-column>
          <el-table-column
            label="操作内容"
            prop="cnt"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column label="操作时间" width="90">
            <template #default="scope">{{
              dayjs(scope.row.auto_create_time).format("YYYY/MM/DD HH:mm:ss")
            }}</template>
          </el-table-column>
          <el-table-column label="备注" width="90" prop></el-table-column>
        </el-table>
      </div>
      <div class="cnt" v-else>
        <el-table border :height="650" :data="tableData">
          <el-table-column label="序号" prop="auto_inc_id"></el-table-column>
          <el-table-column label="时间">
            <template #default="scope">{{
              dayjs(scope.row.ctime).format("HH:mm:ss")
            }}</template>
          </el-table-column>
          <el-table-column label="类型">
            <template #default="scope">{{ typeDict[scope.row?.type] }}</template>
          </el-table-column>
          <el-table-column label="日志" show-overflow-tooltip>
            <template #default="scope">{{ scope.row?.msg }}</template>
          </el-table-column>
          <el-table-column label="交易员姓名" prop="realName"></el-table-column>
          <el-table-column label="日期">
            <template #default="scope">{{
              dayjs(scope.row.auto_create_time).format("YYYY-MM-DD")
            }}</template>
          </el-table-column>
        </el-table>
      </div>
      <div style="text-align: right">
        <el-pagination
          layout="sizes, prev, pager, next"
          :page-sizes="[20, 50, 100]"
          :page-size="searchForm.pageSize"
          :total="total"
          @current-change="pageChange"
          @size-change="sizeChange"
          :current-page="searchForm.pageIndex"
        ></el-pagination>
      </div>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { getOperLogList, getUserLogReq } from "@/api/log";
import { Refresh } from "@element-plus/icons";
import dayjs from "dayjs";
import { defineComponent, reactive, ref, toRefs } from "vue";

export default defineComponent({
  components: { Refresh },
  setup() {
    let show = ref(false);
    let dataMap = reactive({
      userType: "",
      tableData: [],
      searchForm: {
        userId: "",
        cnt: "",
        logType: "",
        auto_create_time: [],
        pageSize: 20,
        pageIndex: 1,
      } as any,
      total: 0,
      word: "",
      status: [
        { label: "Error", val: 1 },
        { label: "Info", val: 3 },
        { label: "Debug", val: 4 },
      ],
      logDict: {
        1: "管理",
        2: "登录",
        3: "错误",
      } as any,
      typeDict: {
        1: "登录",
        2: "交易",
        3: "锁券还券",
      },
    });
    let getLogs = async () => {};
    let clear = () => {
      dataMap.tableData = [];
      dataMap.searchForm = {
        userId: "",
        cnt: "",
        logType: "",
        auto_create_time: [],
        pageSize: 20,
        pageIndex: 1,
      };
    };
    let pageChange = (e: any) => {
      dataMap.searchForm.pageIndex = e;
      getLogs();
    };
    let sizeChange = (e: any) => {
      dataMap.searchForm.pageSize = e;
      dataMap.searchForm.pageIndex = 1;
      getLogs();
    };
    let reSearch = () => {
      dataMap.searchForm.cnt = "";
      dataMap.searchForm.auto_create_time = [];
      dataMap.searchForm.date = [];
      getLogs();
    };
    return {
      ...toRefs(dataMap),
      show,
      dayjs,
      getLogs,
      pageChange,
      clear,
      reSearch,
      sizeChange,
    };
  },
});
</script>
<style lang="scss">
.cnt {
  height: 700px;
  overflow-y: auto;
}
</style>
