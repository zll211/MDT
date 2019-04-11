<template>
  <div class="label-image-list" v-show="imageList.length>0">
    <div :class="{'down el-icon-arrow-left':!showBottom,'up el-icon-arrow-right':showBottom}" class="toggle"
         @click="handleShowBottom" :style="{'right': leftValue}"></div>
    <transition name="bounce">
      <div class="bottomList" ref="imgList" v-show="showBottom">
        <span class="left el-icon-arrow-left" @click="turnLeft"></span>
        <div style="width: 500px;overflow: hidden">
          <ul class="flex" :style="ulStyleObject">
            <li class="markListItem" v-for="(item,index) in imageList" :key="index"
                @click="labelClick(item.id)">
              <img :class="{'red-border': item.select}" :src="item.imageUrl">
              <p>{{index+1}}</p>
            </li>
          </ul>
        </div>
        <span class="right el-icon-arrow-right" @click="turnRight"></span>
      </div>
    </transition>
  </div>
</template>

<script>
  export default {
    name: 'imageLabelList',
    data() {
      return {
        showBottom: true,
        leftIndex: 0, // 记录最左边序号
      };
    },
    props: {
      imageList: {
        type: Array,
        default: () => [],
      },
    },
    computed: {
      ulStyleObject() {
        return {
          width: this.imageList.length * 98 + 'px',
          left: (-98) * this.leftIndex + 'px',
          transitionProperty: 'left',
        };
      },
      leftValue() {
        if (this.showBottom) {
          return 566 + 'px';
        } else {
          return '38px';
        }
      },
    },
    methods: {
      handleShowBottom() {
        this.showBottom = !this.showBottom;
      },
      turnLeft() {
        let redIndex = this.imageList.findIndex((item) => item.select);
        if (!~redIndex) {
          this.leftIndex -= 5;
        } else if (redIndex >= this.leftIndex && redIndex < this.leftIndex + 4) {
          this.leftIndex = redIndex - 4;
        } else {
          this.leftIndex -= 5;
        }

        if (this.leftIndex <= 0) {
          this.leftIndex = 0;
        }
      },
      turnRight() {
        let redIndex = this.imageList.findIndex((item) => item.select);
        if (!~redIndex) {
          this.leftIndex += 5;
        } else if (redIndex > this.leftIndex && redIndex <= this.leftIndex + 4) {
          this.leftIndex = redIndex;
        } else {
          this.leftIndex += 5;
        }
        if (this.leftIndex + 5 >= this.imageList.length) {
          this.leftIndex = redIndex + 5 > this.imageList.length ? redIndex === -1 ? 0 : redIndex : this.imageList.length - 5;
          this.$message.warning('没有更多数据了');
        }
      },
      setImageItem(id) {
        const index = this.imageList.findIndex((item) => item.id === id);
        if (index <= this.leftIndex) {
          this.turnLeft();
        } else if (index >= this.leftIndex + 5) {
          this.turnRight();
        }
      },
      labelClick(id) {
        this.$emit('switch-picture', id);
      },
      resetIndexData(index = 0) {
        if (index < 0) index = 0;
        if (index > this.imageList.length) index = this.imageList.length - 1;
        this.leftIndex = index;
      },
    },
  };
</script>

<style scoped lang="scss">
  .label-image-list {
    position: absolute;
    bottom: 0;
    right: 0;
    z-index: 10;
    .toggle {
      transition: right .7s;
    }
    .down {
      width: 19px;
      height: 46px;
      position: absolute;
      right: 38px;
      bottom: 16px;
      border-radius: 2px;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(44, 199, 175, 1);
    }
    .up {
      color: white;
      width: 19px;
      height: 46px;
      position: absolute;
      bottom: 16px;
      right: 566px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(44, 199, 175, 1);
    }
    .bottomList {
      position: absolute;
      bottom: 0;
      right: 20px;
      background: rgba(255, 255, 255, 0.82);
      overflow: hidden;
      display: flex;
      justify-content: space-between;

      ul {
        margin: 0;
        list-style: none;
        font-size: 0;
        height: 70px;
        background: rgba(255, 255, 255, 0.82);
        position: relative;
        padding: 10px 0 0 10px;
        overflow: hidden;
        left: 0;
        li {
          position: relative;
          font-size: 0;
          display: inline-block;
          margin-right: 10px;
          width: 88px;
          height: 62px;
          img {
            width: 88px;
            height: 60px;
            border: 1px solid rgba(153, 153, 153, .42);
            box-sizing: border-box;
            position: relative;
          }
          p {
            position: absolute;
            color: #faf9f9;
            font-size: 12px;
            top: 4px;
            left: 6px;
            opacity: 1;
            height: 15px;
            border-radius: 10px;
            padding: 0 8px 1px;
            background: #20c6ac;
          }
          .red-border {
            border: 2px solid red;
          }
        }
      }
      & > span {
        color: #fff;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(98, 98, 98, 1);
        border-radius: 2px 0 0 2px;
        height: 80px;
        width: 19px;
        font-size: 20px;
        &:before {
          width: 19px;
          height: 19px;
        }
      }

    }
    .bounce-enter-active {
      animation: bounce-in 0.59s linear;

    }

    .bounce-leave-active {
      animation: bounce-out 0.5s linear;
    }

    @keyframes bounce-in {
      0% {
        right: -539px;
      }
      50% {
        right: -170px;
      }
      75% {
        right: -40px;
      }
      100% {
        right: 20px;
      }
    }

    @keyframes bounce-out {
      0% {
        right: 20px;
      }
      50% {
        right: -300px;
      }
      100% {
        right: -539px;
      }
    }
  }
</style>
