<template>
  <div class="dicom-control">
    <div class="zoom-operate">
      <div class="zoomOut" @click="zoomOut"></div>
      <div class="zoomIn" @click="zoomIn"></div>
    </div>
    <p class="zoom-value">{{scale}}</p>
    <main class="control" @click="zoomTo">
      <a class="control-btn" data-index="1"></a>
      <a class="control-btn" data-index="2"></a>
      <a class="control-btn" data-index="4"></a>
      <a class="control-btn" data-index="10"></a>
      <a class="control-btn" data-index="20"></a>
      <!--<a class="control-btn" data-index="6"></a>-->
    </main>
  </div>
</template>

<script>
  export default {
    name: 'dicomControl',
    data() {
      return {
        zoom: 1,
      };
    },
    props: {
      scale: Number,
    },
    methods: {
      zoomTo(event) {
        const target = event.target;
        if (target.classList.contains('control-btn')) {
          this.$emit('zoom-to', target.getAttribute('data-index'));
        }
      },
      zoomOut() {
        const scale = this.scale + 1;
        this.$emit('zoom-to', scale > 20 ? 20 : scale);
      },
      zoomIn() {
        const scale = this.scale - 1;
        this.$emit('zoom-to', scale < 0 ? this.scale : scale);
      },
    },
  };
</script>

<style scoped lang="scss">

  .dicom-control {
    position: absolute;
    right: 10px;
    bottom: 60px;
    padding: 10px 0;
    z-index: 999;
    background-color: #faf7f5;
    opacity: 0.8;
    .zoom-value {
      font-size: 12px;
      width: 56px;
      height: 22px;
      margin: 0 auto;
      background: rgba(255, 255, 255, 1);
      border-radius: 2px;
      opacity: 0.4793;
      color: #222222;
      font-weight: bold;
      text-align: center;
      line-height: 22px;
    }

    .control {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    .control-btn {
      width: 40px;
      height: 18px;
      cursor: pointer;
      background-size: 40px 18px;
      margin: 13px 0 0;
      &:nth-child(1) {
        background-image: url(../img/home.png);
      }
      &:nth-child(2) {
        background-image: url(../img/2.png);
      }
      &:nth-child(3) {
        background-image: url(../img/4.png);
      }
      &:nth-child(4) {
        background-image: url(../img/10.png);
      }
      &:nth-child(5) {
        background-image: url(../img/20.png);
      }
      &:nth-child(6) {
        background-image: url(../img/40.png);
      }
    }

    .zoom-operate {
      display: flex;
      background-color: #faf7f5;
      opacity: 0.8;
    }

    .zoomOut {
      margin: 0 5px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      cursor: pointer;
      background-image: url(../img/plus.png);
      background-repeat: no-repeat;
      background-size: 20px 20px;
    }

    .zoomIn {
      @extend .zoomOut;
      background-image: url(../img/minus.png);
    }
  }

</style>
