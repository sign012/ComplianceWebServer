<template>
  <!-- 柜台编辑 -->
  <div>
    <!-- <el-form
      :model="orgForm"
      ref="form"
      label-width="130px"
      style="margin-top: 20px; width: 400px; margin: 40px auto"
    >-->
    <el-form :model="searchForm" inline>
      <el-form-item label>
        <el-input v-model="searchForm.masterep" placeholder="请输入节点地址"></el-input>
      </el-form-item>
      <el-form-item label>
        <el-button type="primary" @click="getNodeList">查询</el-button>
      </el-form-item>
    </el-form>
    <div>
      <div v-for="(item, index) of nodelist" :key="index">
        <h4>服务器{{ item.server }}</h4>
        <div class="node-list">
          <div
            class="item"
            v-for="(element, index1) of item.children"
            :key="index1"
            :class="[activeNode.includes(element.nodeid) ? 'active' : '']"
          >
            <div @click="choose(element)">
              <p>{{ element.nodename }}</p>
              <p>主:{{ element.masterep }}</p>
              <p>备:{{ element.slaveep }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- <el-form-item label="关联柜台节点">
        <el-select v-model="orgForm.nodeid" placeholder style="width:270px">
          <el-option
            v-for="(item,index) of nodelist"
            :key="index"
            :value="item.nodeid"
            :label="item.nodename"
          ></el-option>
        </el-select>
    </el-form-item>-->
    <!-- </el-form> -->
    <div style="text-align: right">
      <el-button v-show="setType === 'add'" type @click="close">
        {{ setType === 'add' ? '暂时跳过' : '取消' }}
      </el-button>
      <el-button type="primary" v-if="setType === 'add'" @click="next">确认</el-button>
      <el-button type="primary" v-else @click="save">确认</el-button>
    </div>
  </div>
</template>
<script lang="ts">
import { getCounterAndOrgLine, setCounterOrgLine } from '@/api/department';
import { ElMessage } from 'element-plus';
import { defineComponent } from 'vue';
export default defineComponent({
  emits: ['finish', 'close', 'prev'],
  props: ['setType'],
  data() {
    return {
      countForm: {},
      searchForm: { masterep: '' },
      nodelist: [] as any,
      orgForm: {
        orgid: '',
        nodeid: ''
      },
      activeNode: []
    };
  },
  methods: {
    init(data: any) {
      this.activeNode = data.nodeIds;
      this.orgForm.orgid = data.orgid;
      this.searchForm.masterep = '';
      this.getNodeList();
    },
    async getNodeList() {
      let res = await getCounterAndOrgLine('node', {
        whereObj: { masterep: { $like: `%${this.searchForm.masterep}%` } }
      });

      let tempArr: any = {};
      res.data.forEach((e: any) => {
        let result = e.masterep.match(/h (\S*)/);
        if (result) {
          let server = result[1];
          if (!tempArr[server]) {
            tempArr[server] = { server, children: [] };
          }
          tempArr[server].children.push(e);
        }
      });
      let _arr = [];
      for (let key in tempArr) {
        _arr.push(tempArr[key]);
      }
      this.nodelist = _arr;
    },
    async save() {
      // let res = await setCounterOrgLine(this.orgForm, 'add')
      this.$emit('finish');
    },
    async choose(e: any) {
      let index = this.activeNode.indexOf(e.nodeid);
      this.orgForm.nodeid = e.nodeid;
      if (index > -1) {
        let res = await setCounterOrgLine(this.orgForm, 'del');
        if (res.iRet === 0) {
          ElMessage.success('取消关联');
          this.activeNode.splice(index, 1);
        }
      } else {
        let res = await setCounterOrgLine(this.orgForm, 'add');
        if (res.iRet === 0) {
          ElMessage.success('关联成功');
          (this.activeNode as any).push(e.nodeid);
        } else {
          if (res.iRet === 90006) {
            let updata = await setCounterOrgLine(this.orgForm, 'recover');
            if (updata.iRet === 0) {
              ElMessage.success('关联成功');
              (this.activeNode as any).push(e.nodeid);
              return;
            }
          }
          ElMessage.error('关联失败');
        }
      }
    },
    prev() {
      this.$emit('prev');
    },
    async next() {
      let res = await setCounterOrgLine(this.orgForm, 'add');
      if (res.iRet === 0) {
        ElMessage.success('关联柜台成功');
        this.orgForm.orgid = '';
        this.orgForm.nodeid = '';
      } else {
        ElMessage.error(res.msg);
      }
      this.$emit('finish');
    },
    close() {
      this.$emit('close');
    },
    clearForm() {}
  },
  mounted() {
    this.getNodeList();
  }
});
</script>
<style lang="scss" scoped>
.node-list {
  display: flex;
  margin-top: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  .item {
    cursor: pointer;
    font-size: 12px;
    color: #999;
    width: 31%;
    padding: 8px;
    border: 1px solid #999;
    border-radius: 12px;
    margin-right: 10px;
  }
  .active {
    color: #fff;
    background: linear-gradient(269deg, rgba(232, 205, 150, 0.3) 0%, rgba(208, 169, 95, 0.6) 100%);
    border-color: #24272a;
  }
}
</style>
