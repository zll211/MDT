<template>
  <div class="form-footer-component">
    <div class="btn-container flex justify-content-end align-items-center" v-if="!readonly">
      <el-button type="info" size="small" @click="cancelBtnClick">{{firstBtn}}</el-button>
      <el-button size="small" type="primary" @click="submitForm">{{lastBtn}}</el-button>
      <el-button v-if="extraBtn" size="small" @click="extraBtnClick">{{extraBtn}}</el-button>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'mdtFormFooter',
    props: {
      firstBtn: {
        type: String,
        default: '取消',
      },
      lastBtn: {
        type: String,
        default: '提交',
      },
      extraBtn: '',
      readonly: false,
    },
    methods: {
      submitForm() {
        this.$emit('submitForm');
      },
      cancelBtnClick() {
        if (this.firstBtn === '取消') {
          return this.$router.back(-1);
        } else {
          this.$emit('cancelBtnClick');
        }
      },
      extraBtnClick() {
        this.$emit('extraBtnClick');
      },
    },
  };
</script>

<style scoped lang="scss">
  @import "../../style/variables";

  .form-footer-component {
    background-color: #ffffff;
    height: 60px;
    width: 100%;
    .btn-container {
      width: 1200px;
      @include respond-to(lg) {
        width: 1000px;
      }
      @include respond-to(md) {
        width: 900px;
      }
      @include respond-to(sm) {
        width: 800px;
      }
      .el-button {
        width: 110px;
      }
      height: 60px;
      margin: 0 auto;
    }
  }
</style>
