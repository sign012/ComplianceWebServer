<template>
  <div>
    <el-select
      v-model="assetId"
      filterable
      remote
      :remote-method="remoteMethod"
      @change="handleSelect"
      @focus="getAllAssetBase"
      clearable
      placeholder="请输入"
    >
      <el-option v-for="item of options" :key="item.assetid" :value="item.assetid" :label="item.name"></el-option>
    </el-select>
  </div>
</template>
<script lang="ts">
import { getAssetBase } from '@/api/asset';
import { defineComponent, onMounted, reactive, ref, toRefs } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
  props: {
    disabled: {
      type: Boolean,
      default: false
    }
  },
  setup(prop, { emit }) {
    let dataMap = reactive({
      assetId: '',
      options: [] as any
    });
    let req: any = { isdel: 0 };
    let store = useStore();
    let userInfo = store.state.user;
    if (userInfo.userMgrType === 'O') {
      req.userMgrType = 'O';
      req.orgid = userInfo.userOrg;
    }
    if (userInfo.userMgrType === 'M') {
      req.userMgrType = 'M';
      req.departid = userInfo.userDept;
      req.userid = userInfo.userid;
    }
    const remoteMethod = async (queryString: string) => {
      if (queryString) {
        req.name = `%${queryString}%`;
      } else {
        req.name = `%%`;
      }
      let { data } = await getAssetBase(req);
      dataMap.options = data;
    };
    const getAllAssetBase = async () => {
      req.name = `%%`;
      let { data } = await getAssetBase(req);
      dataMap.options = data;
    };
    onMounted(async () => {
      getAllAssetBase();
    });
    const handleSelect = (el: any) => {
      emit('hasAssetId', el);
    };
    const clearVal = () => {
      dataMap.assetId = '';
    };
    return {
      handleSelect,
      getAllAssetBase,
      remoteMethod,
      clearVal,
      ...toRefs(dataMap)
    };
  }
});
</script>
