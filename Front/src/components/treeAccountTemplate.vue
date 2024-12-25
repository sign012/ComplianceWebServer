<template>
  <!-- 部门交易员账号列表 -->
  <div style="height: 100%; overflow-y: auto">
    <el-tree
      :data="treeData"
      highlight-current
      default-expand-all
      :expand-on-click-node="false"
      @node-click="selTreeNode"
      node-key="id"
    >
      <template #default="{ data }">
        <span class="custom-tree-node">
          <span
            :class="[!data.userbasic_uid || (mode === 'zcTree' && !data.assetid) ? 'bolder' : '']"
          >{{ `${data.name}` }}{{ !data.userbasic_uid || (mode === 'zcTree' && !data.assetid) ? '' : `(${data.userbasic_uid})` }}</span>
        </span>
      </template>
    </el-tree>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue';
import { getUserTree } from '@/api/user';
import { useStore } from 'vuex';

export default defineComponent({
  emits: ['checkNode'],
  props: {
    mode: {
      type: String,
      default: 'tree'
    }
  },
  setup(props, { emit }) {
    let treeData = ref([]);

    async function init() {
      const store = useStore();
      let userInfo = store.state.user;
      //获取交易员列表
      let res = await getUserTree({ rIds: userInfo.roles[0], orgid: userInfo.userOrg, userbasic_usertype: 'T',departid:userInfo.userDept });
      if (res.iRet === 0) {
        let org = res.data.orgList;
        let depart = res.data.partList;
        let user = res.data.userList;
        let assetPackage = res.data.assetPackage;
        let index = 0;
        if (props.mode === 'zcTree') {
          for (let parent of user) {
            parent.id = index++;
            parent.children = [];
            for (let child of assetPackage) {
              if (child.userbasic_uid === parent.userbasic_uid) {
                child.id = index++;
                child.username = parent.realname;
                parent.children.push(child);
              }
            }
          }
        }

        for (let parent of depart) {
          parent.id = index++;
          parent.children = [];
          for (let child of user) {
            if (child.departid === parent.departid) {
              child.id = index++;
              child.name = child.realname;
              delete child.realname;
              parent.children.push(child);
            }
          }
        }
        for (let parent of org) {
          parent.id = index++;
          parent.children = [];
          for (let child of depart) {
            if (child.orgid === parent.orgid) {
              child.id = index++;
              parent.children.push(child);
            }
          }
        }
        treeData.value = org;
      }
    }
    // 选中当前账号
    function selTreeNode(e: any) {
      if (props.mode === 'zcTree') {
        //抛出当前用户信息
        if (e.assetid) {
          emit('checkNode', e);
        }
        return;
      }
      if (props.mode === 'org') {
        emit('checkNode', e);
        return
      }
      //抛出当前用户信息
      if (e.userbasic_uid) {
        emit('checkNode', e);
      }
    }

    init();
    return {
      treeData,
      selTreeNode
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
</style>
