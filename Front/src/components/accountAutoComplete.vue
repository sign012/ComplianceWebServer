<template>
    <div>
        <el-autocomplete
            v-model="accountId"
            :fetch-suggestions="querySearch"
            class="inline-input"
            placeholder="请输入"
            clearable
            @change="handleChange"
            @clear="handleClear"
            @select="handleSelect"
            ref="accountAutoComplete"
        ></el-autocomplete>
    </div>
</template>
<script lang="ts">
import { getAssetAccount } from '@/api/asset'
import { defineComponent, reactive, ref, toRefs } from 'vue'
import { useStore } from 'vuex'

export default defineComponent({
    setup(prop,{emit}) {
        let dataMap = reactive({
            accountId: '',
        })
        let accountAutoComplete = ref()
        let req: any = { isdel: 0 }
        let store = useStore()
        let userInfo = store.state.user
        if (userInfo.userMgrType === 'O') {
            req.orgid = userInfo.userOrg
        }
        const querySearch = async (queryString: string, cb: any) => {
            req.name = {
                $like:`%${queryString}%`
            }
            let { tradeAccount } = await getAssetAccount(req, 'all')
            let result = tradeAccount.map((item:any)=>{
                return {
                    value:`${item.name}`,
                    accountId:item.accountid
                }
            })
            cb(result)
        }
        const handleChange = (el:any)=>{
            emit('hasAccountId',el)
        }
        const handleSelect = (el:any)=>{
            emit('hasAccountId',el.accountId)
        }
        const handleClear = ()=>{
            accountAutoComplete.value.activated = true
            emit('hasAccountId','')
        }
        return {
            querySearch,
            handleSelect,
            handleClear,
            handleChange,
            accountAutoComplete,
            ...toRefs(dataMap)
        }
    },
})
</script>
