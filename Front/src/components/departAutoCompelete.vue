<template>
  <div>
    <el-select
      v-model="departid"
      filterable
      remote
      :remote-method="remoteMethod"
      @change="handleSelect"
      @focus="getAllDepart"
      clearable
      placeholder="请输入"
    >
      <el-option
        v-for="item of options"
        :key="item.departid"
        :value="item.departid"
        :label="item.name"
      ></el-option>
    </el-select>
  </div>
</template>
<script lang="ts">
import {getDepart } from '@/api/department';
import { defineComponent, onMounted, reactive, ref, toRefs } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
  setup(prop, { emit }) {
    let dataMap = reactive({
      departid: '',
      options: [] as any
    });
    let req: any = { isdel: 0 };
    let store = useStore();
    let userInfo = store.state.user;
    if (userInfo.userMgrType === 'O') {
      req.orgid = userInfo.userOrg;
    }
    if (userInfo.userMgrType === 'M') {
      req.departId = userInfo.userDept;
    }
    const remoteMethod = async (queryString: string) => {
      if (queryString) {
        req.name = {
          $like: `%${queryString}%`
        };
      } else {
        req.name = {
          $like: `%%`
        };
      }
      let { data } = await getDepart(req);
      dataMap.options = data;
    };
    const getAllDepart = async () => {
      req.name = {
        $like: `%%`
      };
      let { data } = await getDepart(req);
      dataMap.options = data;
    };
    onMounted(async () => {
      getAllDepart();
    });
    const handleSelect = (el: any) => {
      emit('hasDeptId', el);
    };
    const handleClear = () => {
      emit('hasDeptId', '');
    };
    const clearVal = () => {
      dataMap.departid = '';
    };
    return {
      handleSelect,
      handleClear,
      remoteMethod,
      getAllDepart,
      clearVal,
      ...toRefs(dataMap)
    };
  }
});
</script>
