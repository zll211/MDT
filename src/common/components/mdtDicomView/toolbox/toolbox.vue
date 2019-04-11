<template>
  <main class="dicom-toolbox-main">
    <ul class="method-list" @click="selectTool" @mouseover="mouseover" @mouseout="mouseout">
      <li data-tool="Length"></li>
      <li data-tool="FreehandMouse"></li>
      <li data-tool="RectangleRoi"></li>
      <li data-tool="EllipticalRoi"></li>
      <li data-tool="ArrowAnnotate"></li>
      <li data-tool="Angle"></li>
      <!--<li data-tool="screenshot"></li>
      <li data-tool="fixed"></li>-->
      <li data-tool="clearToolState"></li>
      <!--<li data-tool="break"></li>-->
      <li data-tool="saveToolState"></li>
      <!--<li data-tool="edit"></li>-->
      <li data-tool="Eraser"></li>
      <li data-tool="info"></li>
      <!--<li data-tool="max"></li>
      <li data-tool="break"></li>
      <li data-tool="unfold"></li>-->
    </ul>
    <el-select size="mini" v-model="colormap" @change="changeColormap">
      <el-option label="正常" value="none"></el-option>
      <el-option label="彩虹色（Spectral）" value="spectral"></el-option>
      <el-option label="火红（hot）" value="hot"></el-option>
      <el-option label="金属红（hotIron）" value="hotIron"></el-option>
      <el-option label="混合色（PET）" value="pet"></el-option>
      <el-option label="热金属蓝（Hot Metal Blue）" value="hotMetalBlue"></el-option>
      <el-option label="步幅20混合色（PET 20 Step）" value="pet20Step"></el-option>
      <el-option label="Gray" value="gray"></el-option>
      <el-option label="HSV" value="hsv"></el-option>
      <el-option label="Cool" value="cool"></el-option>
      <el-option label="Spring" value="spring"></el-option>
      <el-option label="Summer" value="summer"></el-option>
      <el-option label="Autumn" value="autumn"></el-option>
      <el-option label="Winter" value="winter"></el-option>
      <el-option label="Bone" value="bone"></el-option>
      <el-option label="Copper" value="copper"></el-option>
      <el-option label="CoolWarm" value="coolwarm"></el-option>
      <el-option label="Blues" value="blues"></el-option>
    </el-select>
    <div style="margin:0 15px">
      <el-button type="primary" size="mini" @click="playClip" v-if="fileUrlList.length>1&&!playing">play</el-button>
      <el-button type="primary" size="mini" @click="stopClip" v-if="fileUrlList.length>1&&playing">stop</el-button>
    </div>
    <div style="margin:0 15px 0 0" v-if="fileUrlList.length>1">
      <el-button type="primary" size="mini" @click="scrollClip" v-if="scrollType==='zoom'">滚动浏览</el-button>
      <el-button type="primary" size="mini" @click="scrollZoom" v-if="scrollType==='clip'">滚动缩放</el-button>
    </div>
    <div class="toolbox-tips" :style="toolboxTipsStyle">{{tips}}</div>
  </main>
</template>

<script>
  export default {
    name: 'dicomToolbox',
    data() {
      return {
        colormap: 'none',
        playing: false,
        scrollType: 'zoom',
        tips: '',
        toolboxTipsStyle: '',
        typeList: [{
          name: 'Length',
          label: '测量尺',
        }, {
          name: 'FreehandMouse',
          label: '手绘',
        }, {
          name: 'RectangleRoi',
          label: '矩形',
        }, {
          name: 'EllipticalRoi',
          label: '椭圆',
        }, {
          name: 'ArrowAnnotate',
          label: '箭头',
        }, {
          name: 'Angle',
          label: '量角尺',
        }, {
          name: 'fixed',
          label: '固定截图',
        }, {
          name: 'screenshot',
          label: '自定义截图',
        }, {
          name: 'clearToolState',
          label: '隐藏标注',
        }, {
          name: 'saveToolState',
          label: '显示标注',
        }, {
          name: 'navigator',
          label: '导航图',
        }, {
          name: 'info',
          label: '图像信息',
        }, {
          name: 'edit',
          label: '编辑',
        }, {
          name: 'Eraser',
          label: '删除',
        }, {
          name: 'max',
          label: '图像最大化',
        }],
      };
    },
    props: {
      fileUrlList: {
        type: Array,
        default: () => [],
      },
    },
    methods: {
      selectTool(e) {
        const li = e.target;
        if (li.nodeName !== 'LI') return;
        const tool = li.getAttribute('data-tool');
        switch (tool) {
          case 'Length':
          case 'ArrowAnnotate':
          case 'RectangleRoi':
          case 'FreehandMouse':
          case 'EllipticalRoi':
          case 'Angle':
          case 'Eraser':
            this.$emit('switch-method', 'annotate', tool);
            break;
          case 'screenshot':
            this.$emit('switch-method', 'screenshot', 'default');
            break;
          case 'fixed':
            this.$emit('switch-method', 'screenshot', 'fixed');
            break;
          case 'clearToolState':
            this.$emit('switch-method', 'clear-tool-state');
            break;
          case 'navigator':
            this.$emit('switch-method', 'toggle-navigator');
            break;
          case 'info':
            this.$emit('switch-method', 'image-info');
            break;
          case 'saveToolState':
            this.$emit('switch-method', 'save-tool-state');
            break;
          /* case 'edit':
            this.$emit('switch-method', 'edit-label');
            break;*/
          /* case 'delete':
            this.$emit('switch-method', 'switch-method', 'delete-label');
            break;*/
          case 'max':
            this.$emit('switch-method', 'image-max');
            break;
          case 'unfold':
            this.unfold(li);
            break;
        }
      },
      changeColormap(colormap) {
        this.$emit('change-colormap', colormap);
      },
      playClip() {
        this.playing = true;
        this.$emit('play-clip');
      },
      stopClip() {
        this.playing = false;
        this.$emit('stop-clip');
      },
      scrollClip() {
        this.scrollType = 'clip';
        this.$emit('scroll-clip');
      },
      scrollZoom() {
        this.scrollType = 'zoom';
        this.$emit('scroll-zoom');
      },
      mouseover(e) {
        const li = e.target;
        if (li.nodeName !== 'LI') return;
        let type = li.getAttribute('data-tool');
        const tip = this.typeList.find((item) => item.name === type);
        if (tip) {
          let {left} = li.getBoundingClientRect();
          let parentLeft = li.parentElement.getBoundingClientRect().left;
          this.tips = tip.label;
          this.toolboxTipsStyle = {
            left: (left - parentLeft - 2.5) + 'px',
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
    },
  };
</script>

<style scoped lang="scss">
  .dicom-toolbox-main {
    position: relative;
    display: flex;
    align-items: center;
    top: 0;
    left: 0;
    height: 45px;
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.11);
    z-index: 2;
    .method-list {
      display: flex;
      align-items: center;
      height: 45px;
      flex: 1;
      background: rgba(255, 255, 255, 1);
      li {
        width: 30px;
        height: 100%;
        margin: 0 10px;
        background-position: center center;
        background-repeat: no-repeat;
        background-size: 21px 21px;
        cursor: pointer;
        &:hover {
          background-color: #f4f4f5;
        }
        &[data-tool='Length'] {
          background-image: url(../img/line.png);
        }
        &[data-tool='FreehandMouse'] {
          background-image: url(../img/curve.png);
        }
        &[data-tool='RectangleRoi'] {
          background-image: url(../img/rect.png);
        }
        &[data-tool='EllipticalRoi'] {
          background-image: url(../img/oval.png);
        }
        &[data-tool='ArrowAnnotate'] {
          background-image: url(../img/arrow.png);
        }
        &[data-tool='Angle'] {
          background-image: url(../img/pin.png);
          height: 30px;
          background-size: 19px 22px;
        }
        &[data-tool='screenshot'] {
          background-image: url(../img/info.png);
        }
        &[data-tool='fixed'] {
          background-image: url(../img/fixed.png);
        }
        &[data-tool='clearToolState'] {
          background-image: url(../img/clear.png);
        }
        &[data-tool='navigator'] {
          background-image: url(../img/navigator.png);
        }
        &[data-tool='info'] {
          background-image: url(../img/info.png);
          background-size: 21px 18px;
        }
        &[data-tool='break'] {
          height: 2px;
          background-color: #EDEDED;
          margin: 16px 0 0;
        }
        &[data-tool='saveToolState'] {
          background-image: url(../img/save.png);
        }
        &[data-tool='edit'] {
          background-image: url(../img/edit.png);
        }
        &[data-tool='Eraser'] {
          background-image: url(../img/delete.png);
          background-size: 20px 22px;
        }
        &[data-tool='max'] {
          background-image: url(../img/max.png);
        }
        /* &[data-tool='unfold'] {
           position: relative;
           height: 18px;
           background-color: #01D0B0;
           margin: 0;
           background-image: url(../img/up.png);
         }*/
      }
    }
    .toolbox-tips {
      display: none;
      position: absolute;
      top: 55px;
      padding: 5px;
      background: rgba(0, 0, 0, 0.6);
      border-radius: 3px;
      font-size: 14px;
      line-height: 20px;
      color: #fff;
      white-space: nowrap;
      &:after {
        content: '';
        position: absolute;
        left: -10px;
        top: 50%;
        margin-top: -5px;
        border-width: 5px;
        border-color: transparent rgba(0, 0, 0, 0.6) transparent transparent;
        border-style: solid;
      }
    }
    .image-info{
      font-size: 18px;
      font-weight: bold;
    }
  }
</style>
