<template>
  <div class="file-change flex column" v-if="fileNameList.length>1">
    <el-button type="primary" size="small" class="last-btn" :disabled="fileIndex===0" @click="lastFile">上一例
    </el-button>
    <el-button type="primary" size="small" class="next-btn" :disabled="fileIndex===fileNameList.length-1"
               @click="nextFile">下一例
    </el-button>
  </div>
</template>

<script>
  export default {
    name: 'fileChange',
    props: {
      fileNameList: {
        type: Array,
        default: () => [],
      },
      fileIndex: {
        type: Number,
        default: 0,
      },
    },
    methods: {
      lastFile() {
        this.$emit('last-file');
      },
      nextFile() {
        this.$emit('next-file');
      },
    },
  };
</script>

<style scoped lang="scss">
  .file-change {
    position: absolute;
    right: 10px;
    top: 280px;
    z-index: 999;
    .next-btn {
      margin-left: 0;
      margin-top: 10px;
    }
  }
</style>
