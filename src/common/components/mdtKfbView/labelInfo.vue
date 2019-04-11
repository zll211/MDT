<template>
  <div class="mask-info" v-if="infoList.length>0">
    <el-card class="box-card">
      <div v-for="(info,index) in infoList" :key="index" class="text item">
        <el-button class="mask-info-title" type="text" size="mini">{{info}}</el-button>
        <!--<span v-show="index>0">{{info}}</span>-->
      </div>
    </el-card>
  </div>
</template>

<script>
  export default {
    name: 'labelInfo',
    props: {
      infoList: {
        type: Array,
        default: () => [],
      },
    },
  };
</script>

<style scoped lang="scss">
  .mask-info {
    position: absolute;
    top: 10px;
    right: 80px;
    z-index: 10;
    .mask-info-title {
      font-size: 18px;
      font-weight: bold;
    }
  }
</style>
