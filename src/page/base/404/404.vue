<template>
  <div class="notfound-page" v-height>
    <div class="notFound">
      <img src="@/assets/images/404.png" class="notFoundPic">
      <p class="error-tips">404</p>
    </div>
    <p class="flex justify-content-center"><span v-on:click="back()"><i class="el-icon-back"></i> 返回</span></p>
  </div>
</template>

<script>
  export default {
    create() {
    },
    data() {
      return {};
    },
    methods: {
      refresh() { // 刷新本页
        window.location.reload();
      },
      back() { // 返回上一页
        window.history.go(-1);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .notfound-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background-color: rgb(251, 251, 251);
  }

  .notFound {
    position: relative;
    width: 100%;
    text-align: center;
    .error-tips {
      position: absolute;
      color: #A2A7AF;
      font-size: 18px;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      line-height:25px;
    }
  }

  p {
    line-height: 64px;
    color: #949494;
  }

  p span {
    cursor: pointer;
    &:hover {
      color: #609EFE;
    }
  }

</style>
