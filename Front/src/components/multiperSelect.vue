<template>
  <div>
    <el-select
      v-model="selectedOptions"
      multiple
      collapse-tags
      collapse-tags-tooltip
      :max-collapse-tags="3"
      placeholder="请选择"
      style="width: 240px"
      popper-class="custom-header"
    >
      <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
        <template #default>
          <el-checkbox
            :label="item.label"
            v-model="checkedMap[item.value]"
            @change="handleCheckboxChange(item.value, $event)"
          >
            {{ item.label }}
          </el-checkbox>
        </template>
      </el-option>

      <el-checkbox
        :indeterminate="isIndeterminate"
        :checked="isAllSelected"
        @change="handleAllSelectChange"
        style="padding: 0 12px; border-top: 1px solid #343b52"
      >
        全选
        <span style="position: absolute; right: 12px; top: 12px; color: #838ba1">
          已选({{ selectedOptions.length }})
        </span>
      </el-checkbox>
    </el-select>
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, reactive, ref, toRefs, computed, watch } from 'vue';

export default defineComponent({
  emits: ['checkMapChange'],
  props: {
    options: {
      type: Array,
      default: () => []
    },
    selectedOptions: {
      type: Array,
      default: () => []
    },

    checkedMap: {
      type: Object,
      default: () => ({})
    }
  },
  setup(prop, { emit }) {
    let dataMap = reactive({
      selectedOptions: props.selectedOptions, // 选中的选项
      checkedMap: props.checkedMap, // 多选框选中状态
      options: props.options // 选项列表
    });
    // 全选的不确定属性
    const isIndeterminate: any = computed(() => {
      return dataMap.selectedOptions.length > 0 && dataMap.selectedOptions.length < dataMap.options.length;
    });

    const isAllSelected: any = computed(() => {
      return dataMap.selectedOptions.length === dataMap.options.length;
    });

    const handleAllSelectChange = (checked) => {
      if (checked) {
        dataMap.selectedOptions = dataMap.options.map((option) => option.value);
        dataMap.selectedOptions.forEach((item, index) => {
          dataMap.checkedMap[item] = true;
        });
      } else {
        dataMap.selectedOptions = [];
        dataMap.checkedMap = {
          1: false,
          2: false,
          3: false
        };
      }
    };
    // 控制多选框的选中状态  value 选项值 true/false是否选中
    const handleCheckboxChange = (value, checked) => {
      if (checked) {
        let hasChecked = false;
        dataMap.selectedOptions.forEach((option) => {
          if (option.value == value) {
            hasChecked = true;
          }
        });
        !hasChecked && dataMap.selectedOptions.push(value);
        dataMap.selectedOptions.forEach((item, index) => {
          dataMap.checkedMap[item] = true;
        });
      } else {
        dataMap.selectedOptions = dataMap.selectedOptions.filter((option) => option !== value);
        dataMap.selectedOptions.forEach((item, index) => {
          dataMap.checkedMap[item] = true;
        });
      }
    };
    onMounted(async () => {});
    // 监听主播变化
    watch(
      () => dataMap.checkedMap,
      (val) => {
        emit('checkMapChange', val, dataMap.selectedOptions);
      },
      { deep: true }
    );
    return {
      ...toRefs(dataMap),
      isIndeterminate,
      isAllSelected,
      handleAllSelectChange,
      handleCheckboxChange
    };
  }
});
</script>
