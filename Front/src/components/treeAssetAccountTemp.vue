<template>
  <!-- 分组资金账号列表 -->
  <div style="height: 100%; overflow-y: auto">
    <el-tree
      :data="treeData"
      highlight-current
      default-expand-all
      :expand-on-click-node="false"
      @node-click="selTreeNode"
      node-key="id"
      :render-after-expand="false"
    >
      <template #default="{ data }">
        <span class="custom-tree-node">
          <span
            :class="[
              !data.accountid || (mode === 'zcTree' && !data.assetid) ? 'bolder' : '',
              currentId === data.assetid ? 'active' : '',
              currentId == data.accountid ? 'active' : ''
            ]"
          >
            {{ `${data.name}${data.accountid && mode != 'zcTree' ? `(${data.accountid})` : ''}` }}
          </span>
          <el-badge
            v-if="mode === 'zcTree' && data.assetid && data.num > 0"
            :value="data.num"
            :max="10"
            class="item"
          ></el-badge>
        </span>
      </template>
    </el-tree>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue';
import { getAssetAccount, getAuditNum } from '@/api/asset';
import { useStore } from 'vuex';

export default defineComponent({
  emits: ['checkNode', 'finish'],
  props: {
    mode: {
      type: String,
      default: 'all' // zcTree
    },
    audit: {
      type: Boolean,
      default: false
    },
    isAll: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {
    let treeData: any = ref([]);
    let groupDict: any = reactive({});
    let store = useStore();
    let orgid = store.state.user.userOrg;
    let currentId = ref('');
    async function init(lockCoupon?: any);
    // 选中当前账号
    function selTreeNode(e: any) {
      if (e.isAll) {
        emit('checkNode', e);
        console.log(e);
      }
      if (e.accountid && e.assetid) {
        currentId.value = e.assetid;
        //抛出当前资产包信息
        emit('checkNode', e);
      } else if (e.accountid) {
        currentId.value = e.accountid;
        //抛出当前用户信息
        emit('checkNode', e);
        console.log(e);
      }
    }
    function getGroup() {}
    getGroup();
    return {
      treeData,
      selTreeNode,
      getGroup,
      currentId
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

.active {
  /* color: red; */
}
</style>
