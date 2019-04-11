<template>
  <div>
    <p class="title">颜色</p>
    <ul class="colors">
      <li
        class="color"
        v-for="color in colors"
        :key="color"
        :class="{'acitve': strokeColor === color}"
        @click="chooseColor(color)"
      >
        <div class="color-inner" :style="{'backgroundColor': color}"></div>
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  data() {
    return {
      colors: [
        'rgb(236, 52, 85)',
        'rgb(0, 91, 246)',
        'rgb(245, 173, 70)',
        'rgb(104, 171, 93)',
        'rgb(158, 81, 182)',
        'rgb(30, 32, 35)'
      ]
    };
  },
  props: ['strokeColor'],
  methods: {
    chooseColor(value) {
      this.$emit('update:strokeColor', value);
    }
  }
};
</script>

<style lang="scss" scoped rel="stylesheet/scss">
.colors {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  justify-content: space-around;
}
.color {
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background-color: #fff;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  &.active {
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
  }
}
.color-inner {
  width: 20px;
  height: 20px;
  border-radius: 10px;
  box-shadow: inset 0 1px 3px 0 rgba(0, 0, 0, 0.18);
}
</style>
