<template>
  <svg :class="svgClass" aria-hidden="true">
    <use :xlink:href="iconName" />
  </svg>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
export default defineComponent({
  props: {
    iconClass: {
      type: String,
      required: true
    },
    className: {
      type: String,
      default: ''
    }
    // color: {
    //   type: String,
    //   default: '#889aa4',
    // },
  },
  setup(props) {
    return {
      iconName: computed(() => `#icon-${props.iconClass}`),
      svgClass: computed(() => {
        if (props.className) {
          return `svg-icon ${props.className}`;
        }
        return 'svg-icon';
      })
    };
  }
});
</script>

<style scope>
.sub-el-icon,
.nav-icon {
  display: inline-block;
  font-size: 15px;
  margin-right: 8px;
  position: relative;
}

.svg-icon {
  position: relative;
  top: -0.07em;
  width: 1em;
  height: 1em;
  fill: currentColor;
  vertical-align: middle;
}
</style>
