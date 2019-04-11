<template>
  <main class="toolbox-main">
    <ul class="method-list" @click="switchType" @mouseover="mouseover" @mouseout="mouseout">
      <li data-method="Line"></li>
      <li data-method="Curve"></li>
      <li data-method="Rectangle"></li>
      <li data-method="Ellipse"></li>
      <li data-method="Arrow"></li>
      <li data-method="Position"></li>
      <li data-method="break"></li>
      <li data-method="unfold"></li>
    </ul>
    <div class="toolbox-tips" :style="toolboxTipsStyle">{{tips}}</div>
  </main>
</template>

<script>
  import up from './img/up.png';
  import down from './img/down.png';

  export default {
    name: 'toolbox',
    data() {
      return {
        tips: '',
        toolboxTipsStyle: '',
        typeList: [{
          name: 'Line',
          label: '直线',
        }, {
          name: 'Curve',
          label: '曲线',
        }, {
          name: 'Rectangle',
          label: '矩形',
        }, {
          name: 'Ellipse',
          label: '椭圆',
        }, {
          name: 'Arrow',
          label: '箭头',
        }, {
          name: 'Position',
          label: '标注',
        }, {
          name: 'fixed',
          label: '固定截图',
        }, {
          name: 'screenshot',
          label: '自定义截图',
        }, {
          name: 'clear',
          label: '轨迹清扫',
        }, {
          name: 'navigator',
          label: '导航图',
        }, {
          name: 'info',
          label: '图像信息',
        }, {
          name: 'save',
          label: '保存',
        }, {
          name: 'edit',
          label: '编辑',
        }, {
          name: 'delete',
          label: '删除',
        }, {
          name: 'max',
          label: '图像最大化',
        }],
      };
    },
    methods: {
      switchType(e) {
        const li = e.target;
        if (li.nodeName !== 'LI') return;
        const type = li.getAttribute('data-method');
        switch (type) {
          case 'Line':
          case 'Arrow':
          case 'Rectangle':
          case 'Curve':
          case 'Ellipse':
          case 'Position':
            this.$emit('switch-method', 'brush', type);
            break;
          case 'screenshot':
            this.$emit('switch-method', 'screenshot', 'default');
            break;
          case 'fixed':
            this.$emit('switch-method', 'screenshot', 'fixed');
            break;
          case 'clear':
            this.$emit('switch-method', 'clear-navigator');
            break;
          case 'navigator':
            this.$emit('switch-method', 'toggle-navigator');
            break;
          case 'info':
            this.$emit('switch-method', 'image-info');
            break;
          case 'save':
            this.$emit('switch-method', 'save-label');
            break;
          case 'edit':
            this.$emit('switch-method', 'edit-label');
            break;
          case 'delete':
            this.$emit('switch-method', 'switch-method', 'delete-label');
            break;
          case 'max':
            this.$emit('switch-method', 'image-max');
            break;
          case 'unfold':
            this.unfold(li);
            break;
        }
      },
      mouseover(e) {
        const li = e.target;
        if (li.nodeName !== 'LI') return;
        let type = li.getAttribute('data-method');
        const tip = this.typeList.find((item) => item.name === type);
        if (tip) {
          let {top} = li.getBoundingClientRect();
          let parentTop = li.parentElement.getBoundingClientRect().top;
          this.tips = tip.label;
          this.toolboxTipsStyle = {
            top: (top - parentTop) + 'px',
            display: 'block',
          };
        }
      },
      mouseout(e) {
        this.toolboxTipsStyle = {
          display: 'none',
        };
        this.tips = '';
      },
      unfold(li) {
        const liParent = li.parentElement;
        let {height} = liParent.getBoundingClientRect();
        const liList = li.parentElement.children;
        if (height !== 18) {
          // liParent.style.top = `${-height + 18}px`;
          li.style.backgroundImage = `url(${down})`;
          Array.prototype.forEach.call(liList, (li) => li.style.display = 'none');
          li.style.display = 'block';
        } else {
          li.style.backgroundImage = `url(${up})`;
          Array.prototype.forEach.call(liList, (li) => li.style.display = 'block');
        }
      },
    },
  };
</script>

<style scoped lang="scss">
  .toolbox-main {
    position: relative;
    display: flex;
    flex-direction: column;
    top: 0;
    left: 0;
    width: 45px;
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.11);
    .method-list {
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: center;
      top: 0;
      left: 0;
      width: 45px;
      background: rgba(255, 255, 255, 1);
      li {
        width: 100%;
        height: 30px;
        margin: 15px 0 0;
        background-position: center center;
        background-repeat: no-repeat;
        background-size: 21px 21px;
        cursor: pointer;
        &:hover {
          background-color: #f4f4f5;
        }
        &[data-method='Line'] {
          background-image: url(./img/line.png);
        }
        &[data-method='Curve'] {
          background-image: url(./img/curve.png);
        }
        &[data-method='Rectangle'] {
          background-image: url(./img/rect.png);
        }
        &[data-method='Ellipse'] {
          background-image: url(./img/oval.png);
        }
        &[data-method='Arrow'] {
          background-image: url(./img/arrow.png);
        }
        &[data-method='Position'] {
          background-image: url(./img/pin.png);
          height: 30px;
          background-size: 19px 22px;
        }
        &[data-method='break'] {
          height: 2px;
          background-color: #EDEDED;
          margin: 16px 0 0;
        }
        &[data-method='unfold'] {
          position: relative;
          height: 18px;
          background-color: #01D0B0;
          margin: 0;
          background-image: url(./img/up.png);
        }
      }
    }
    .toolbox-tips{
      display: none;
      position: absolute;
      top: 0;
      left: 55px;
      padding: 5px 20px;
      background:rgba(0,0,0,0.6);
      border-radius:3px;
      font-size:14px;
      line-height: 20px;
      color: #fff;
      white-space: nowrap;
      &:after{
        content: '';
        position: absolute;
        left: -10px;
        top: 50%;
        margin-top: -5px;
        border-width: 5px;
        border-color: transparent rgba(0,0,0,0.6) transparent transparent;
        border-style: solid;
      }
    }
  }

</style>
