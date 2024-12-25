<template>
  <div style="height: 100%; overflow-y: auto">
    <el-tree :data="treeData" default-expand-all highlight-current :expand-on-click-node="false"
      @node-click="selTreeNode" node-key="auto_inc_id">
      <template #default="{ data }">
        <span class="custom-tree-node">
          <span :title="data.name"
            :class="[!data.departid ? 'bolder span-ellipsis' : 'span-ellipsis', data.departid === currentId ? 'active' : '']">{{
              data.name
            }}</span>
        </span>
      </template>
    </el-tree>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, unref, nextTick, toRefs, onMounted } from 'vue';
import { getOrgReq, getDepartReq, getDepartList } from '@/api/department';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'EmUserManagePop',
  emits: ['checkNode', 'finish'],
  props: {
    deptType: {
      type: String,
      required: true,
      default: 'dept'
    },
    deptId: {
      type: String,
      required: false,
      default: ''
    },
    showAll: {
      type: Boolean,
      default: true
    }
  },

  setup(props, { emit }) {
    const stores = useStore();
    const dataMap = reactive({
      treeData: [],
      org: [],
      depart: [],
      currentId: ''
    });

    const getOrg = async () => {
      let org = stores.state.user.userOrg;
      if (stores.state.user.roles[0] === 'admin') {
        org = 'all';
      }
      let res = await getOrgReq(org);
      if (res.iRet === 0) {
        dataMap.org = res.data;
      }
      getDepart();
    };

    const getDepart = async () => {
      let res = await getDepartList({
        orgid: stores.state.user.userOrg,
        departid: stores.state.user.userDept
      }, stores.state.user.userMgrType);
      if (res.iRet === 0) {
        dataMap.depart = res.data;
        createTree();
      }
    };

    const createTree = (): void => {
      let arr: any = [];
      //添加查询全部节点
      if (props.showAll) {
        arr.push({
          name: '全部',
          id: -1
        });
      }
      for (let item of dataMap.org) {
        (item as any).children = [];
        for (let e of dataMap.depart) {
          if ((e as any).orgid === (item as any).orgid) {
            (item as any).children.push(e);
          }
        }
        arr.push(item);
      }

      dataMap.treeData = arr;
      let nodeData; 
      if (props.showAll) {
        nodeData = arr[1].children[0]
      }else{
        nodeData =  arr[0].children[0]
      }

      const ctype = 'dept';
      const val = nodeData.departid;
      dataMap.currentId = val
      emit('finish', ctype, val)
      // console.log(' treeData ====> ',treeData, proxy.deptType);
    };

    /**
     * 根据返回的类型检查部门下的相关信息
     * */
    const selTreeNode = (nodeData: any, node: any) => {
      if (props.deptType === 'user') {
        // 通过机构或者部门查用户
        const orgId = nodeData.orgid;
        const ctype = node.level === 1 ? 'org' : 'dept';
        const val = node.level === 1 ? nodeData.orgid : nodeData.departid;
        dataMap.currentId = val
        emit('checkNode', ctype, val, orgId, nodeData);
      }
    };

    const fillBaseInfo = () => {
      return {
        olist: dataMap.org,
        dlist: dataMap.depart
      };
    };

    return {
      ...toRefs(dataMap),
      getOrg,
      selTreeNode,
      fillBaseInfo
    };
  }
});
</script>
<style scoped>
.night .custom-tree-node {
  font-size: 12px;
  color: #eee;
}

.bolder {
  font-weight: bold;
  font-size: 14px;
  color: #d6b26d;
}

.span-ellipsis {
  width: 200px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  display: block;
}

.active {
  color: #ffc107;
}
</style>
