<template>
  <div>
    <el-select
      v-model="userId"
      filterable
      remote
      :remote-method="remoteMethod"
      @change="handleSelect"
      @focus="getAllUsers"
      clearable
      placeholder="请输入"
    >
      <el-option
        v-for="item of options"
        :key="item.userbasic_uid"
        :value="item.userbasic_uid"
        :label="item.realname"
      ></el-option>
    </el-select>
  </div>
</template>
<script lang="ts">
import { getUserReq } from '@/api/user';
import { defineComponent, onMounted, reactive, ref, toRefs } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
  setup(prop, { emit }) {
    let dataMap = reactive({
      userId: '',
      options: [] as any
    });
    let req: any = { isdel: 0, userbasic_usertype: 'T' };
    let store = useStore();
    let userInfo = store.state.user;
    if (userInfo.userMgrType === 'O') {
      req.orgid = userInfo.userOrg;
    }
    if (userInfo.userMgrType === 'M') {
      req.departid = userInfo.userDept;
    }
    const remoteMethod = async (queryString: string) => {
      if (queryString) {
        req.realname = {
          $like: `%${queryString}%`
        };
      } else {
        req.realname = {
          $like: `%%`
        };
      }
      let { data } = await getUserReq(req);
      dataMap.options = data;
    };
    const getAllUsers = async () => {
      req.realname = {
        $like: `%%`
      };
      let { data } = await getUserReq(req);
      dataMap.options = data;
    };
    onMounted(async () => {
      getAllUsers();
    });
    const handleSelect = (el: any) => {
      emit('hasUserId', el);
    };
    const handleClear = () => {
      emit('hasUserId', '');
    };
    const clearVal = () => {
      dataMap.userId = '';
    };
    return {
      handleSelect,
      handleClear,
      remoteMethod,
      getAllUsers,
      clearVal,
      ...toRefs(dataMap)
    };
  }
});
</script>
