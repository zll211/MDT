<template>
  <div id="app" class="fill-contain">
    <router-view></router-view>
  </div>
</template>

<script>

  export default {
    async created() {
    },
    mounted() {
      window.onresize = () => {
        this.$root.$emit('resize');
        this.$store.commit('resize', {
          width: document.body.clientWidth,
          height: document.body.clientHeight,
        });
      };
    },
    beforeDestroy() {
      window.onresize = null;
    },
  };
</script>

<style lang="scss">
  @import "style/common";
</style>
