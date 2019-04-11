<template>
  <div class="form-head-component flex justify-content-between align-items-center">
    <div class="back-btn flex justify-content-center align-items-center" @click="$router.back(-1)">
      <i class="el-icon-back"></i>
    </div>
    <div v-if="tabList !== null && tabList.length > 0" class="flex form-tab">
      <h3 v-for="(tab, index) in tabList"
          :key="index"
          :class="tab.active?'active-tab':''"
          @click="tabChange(tab.name)">{{tab.name}}</h3>
    </div>
    <h3 v-if="tabList === null || tabList.length === 0">{{formName}}</h3>
    <p @click="resetForm" style="color: #609EFE;cursor: pointer;">{{resetShow?'内容重置':otherBtn}}</p>
  </div>
</template>

<script>
  export default {
    name: 'mdtFormHead',
    data() {
      return {
      };
    },
    props: {
      formName: {
        type: String,
        default: '申请单',
      },
      resetShow: {
        type: Boolean,
        default: true,
      },
      tabList: {
        type: Array,
        default: null,
      },
      otherBtn: '',
    },
    methods: {
      resetForm() {
        this.$emit('resetForm');
      },
      tabChange(tabName) {
        this.$emit('tabChange', tabName);
      },
    },
  };
</script>

<style scoped lang="scss">
  @import "../../style/variables";
  .form-head-component {
    padding: 0 0 30px 0;
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
    margin: 0 auto;
    .back-btn{
      width: 18px;
      height: 18px;
      border: 2px solid #609EFE;
      border-radius: 50%;
      cursor: pointer;
      .el-icon-back{
        font-size: 14px;
        color: #609EFE;
        font-weight: bold;
      }
    }
    .form-tab{
      h3 {
        color: #999999;
        margin: 10px;
        cursor: pointer;
      }
      .active-tab{
        color: #515151;
      }
    }

  }
</style>
