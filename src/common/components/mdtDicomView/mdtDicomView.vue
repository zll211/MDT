<template>
  <div class="dicom-view" oncontextmenu='return false' onmousedown='return false;' unselectable='on'
       onselectstart='return false;'>
    <dicom-toolbox v-if="!readonly" @switch-method="switchMethod" @change-colormap="changeColormap"
                   @play-clip="playClip" @stop-clip="stopClip"
                   @scroll-clip="stackScroll" @scroll-zoom="zoomMouseWheel"
                   :file-url-list="fileUrlList"></dicom-toolbox>
    <div class="dicom-info">
      <div class="dicom-patient-info">
        <p>病人姓名: {{imageInfo.patientName}}</p>
        <p>病人性别: {{imageInfo.patientSex}}</p>
        <p>病人ID: {{imageInfo.patientId}}</p>
        <p>医院名称: {{imageInfo.institutionName}}
        <p>检查时间: {{imageInfo.seriesDateTime}}</p>
        <p>检查模式: {{imageInfo.modality}}</p>
        <p>窗宽: {{windowWidth}}</p>
        <p>窗位: {{windowCenter}}</p>
      </div>
    </div>
    <dicom-control :scale="scale" @zoom-to="zoomTo"></dicom-control>
    <div class="dicom-image"></div>
    <el-dialog class="image-info" width="400px" append-to-body :visible.sync="showImageInfo">
      <el-card class="box-card">
        <div class="item text">
          <el-button type="text">病人姓名: {{imageInfo.patientName}}</el-button>
        </div>
        <div class="item text">
          <el-button type="text">病人性别: {{imageInfo.patientSex}}</el-button>
        </div>
        <div class="item text">
          <el-button type="text">病人ID: {{imageInfo.patientId}}</el-button>
        </div>
        <div class="item text">
          <el-button type="text">医院名称: {{imageInfo.institutionName}}</el-button>
        </div>
        <div class="item text">
          <el-button type="text">检查时间: {{imageInfo.seriesDateTime}}</el-button>
        </div>
        <div class="item text">
          <el-button type="text">检查模式: {{imageInfo.modality}}</el-button>
        </div>
        <div class="item text">
          <el-button type="text">窗宽: {{windowWidth}}</el-button>
        </div>
        <div class="item text">
          <el-button type="text">窗位: {{windowCenter}}</el-button>
        </div>
        <!--<div class="item text">
          <el-button type="text">图像方位: {{imageInfo.imageOrientation}}</el-button>
        </div>-->
        <div class="item text">
          <el-button type="text">层厚: {{imageInfo.sliceThickness}}mm</el-button>
        </div>
        <div class="item text">
          <el-button type="text">行分辨率: {{imageInfo.rows}}</el-button>
        </div>
        <div class="item text">
          <el-button type="text">列分辨率: {{imageInfo.columns}}</el-button>
        </div>
        <div class="item text">
          <el-button type="text">像素间距(行/列): {{imageInfo.pixelSpacing}}</el-button>
        </div>
      </el-card>
    </el-dialog>
  </div>
</template>

<script>
  import {mapState} from 'vuex';
  import {unsubscribe} from '../../../config/utils';
  import * as cornerstone from 'cornerstone-core';
  import * as dicomParser from 'dicom-parser';
  import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
  import * as cornerstoneWebImageLoader from 'cornerstone-web-image-loader';
  import 'hammerjs';
  import * as cornerstoneMath from 'cornerstone-math';
  import * as cornerstoneTools from 'cornerstone-tools';
  import DicomControl from './control/control';
  import DicomToolbox from './toolbox/toolbox';

  cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
  cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
  cornerstoneTools.external.cornerstone = cornerstone;
  cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
  cornerstoneWebImageLoader.external.cornerstone = cornerstone;
  /*
  *配置 webWorker (必须配置)
  *
  *注意这里的路径问题  如果路径不对 cornerstoneWADOImageLoaderWebWorker 会报错:
  *        'index.html Uncaught SyntaxError: Unexpected token <'
  *
  */
  const config = {
    webWorkerPath: '../../../plugins/WADO/dist/cornerstoneWADOImageLoaderWebWorker.min.js',
    taskConfiguration: {
      decodeTask: {
        codecsPath: '../../../plugins/WADO/dist/cornerstoneWADOImageLoaderCodecs.min.js',
      },
    },
  };
  cornerstoneWADOImageLoader.webWorkerManager.initialize(config);
  cornerstoneTools.init();
  export default {
    name: 'mdtDicomView',
    components: {DicomToolbox, DicomControl},
    data() {
      return {
        dicomElement: null,
        scale: 1,
        baseTools: ['Pan', 'ZoomMouseWheel', 'Wwwc', 'StackScrollMouseWheel'],
        AnnotateTools: ['Length', 'Angle', 'ArrowAnnotate', 'EllipticalRoi', 'RectangleRoi', 'FreehandMouse', 'Eraser'],
        windowCenter: 0, // 窗位
        windowWidth: 0, // 窗宽
        annotateType: '',
        annotateToolStates: [],
        showImageInfo: false,
        imageInfo: {},
        dcmStomp: undefined,
        userId: window.sessionStorage.getItem('userId')&&window.sessionStorage.getItem('userId')/1,
      };
    },
    props: {
      fileUrlList: {
        type: Array,
        default: () => ['dicom/FILE1.dcm', 'dicom/FILE2.dcm', 'dicom/FILE3.dcm', 'dicom/FILE4.dcm', 'dicom/FILE5.dcm', 'dicom/FILE6.dcm'],
      },
      type: {
        type: String,
        default: 'DCM',
      },
      fileIndex: {
        type: Number,
        default: 0,
      },
      stomp: undefined,
      consultationId: 0,
      requestId: 0,
      isFollow: true,
      readonly: false,
    },
    computed: {
      ...mapState([
        'collapse',
        'user',
      ]),
    },
    /* watch: {
       fileUrlList() {
         if (this.fileUrlList.length === 0) {
           return;
         }
         if (cornerstone.getEnabledElements().length === 0) {
           cornerstone.enable(this.dicomElement);
           [...this.baseTools, ...this.AnnotateTools].forEach((toolName) => {
             cornerstoneTools.addTool(cornerstoneTools[`${toolName}Tool`]);
           });
         }
         if (this.type === 'DCM') {
           this.loadAndViewImage(this.fileUrlList.map((url) => `wadouri:${url}`), 0);
         } else {
           this.loadAndViewImage(this.fileUrlList.map((url) => `${window.location.protocol}${url}`), 0);
         }
       },
     },*/
    methods: {
      resize() {
        this.$el.style.height = Math.floor(window.innerHeight - this.$el.getBoundingClientRect().top) + 'px';
        if (cornerstone.getEnabledElements().length === 0) return;
        cornerstone.resize(this.dicomElement, true);
      },
      changeAnnotateType(toolName) {
        cornerstoneTools.setToolActive(toolName, {mouseButtonMask: 1});
      },
      changeColormap(colormap) {
        if (cornerstone.getEnabledElements().length === 0) return;
        const layer = cornerstone.getActiveLayer(this.dicomElement);
        if (layer) {
          if (colormap === 'none') {
            cornerstone.removeLayer(this.dicomElement, layer.layerId);
            layer.viewport.colormap = undefined;
          } else {
            layer.viewport.colormap = colormap;
          }
        } else {
          if (colormap !== 'none') {
            const image = cornerstone.getImage(this.dicomElement);
            const layerId = cornerstone.addLayer(this.dicomElement, image, {viewport: {colormap}});
            cornerstone.setActiveLayer(this.dicomElement, layerId);
          }
        }
        cornerstone.updateImage(this.dicomElement);
        /* const viewport = cornerstone.getViewport(this.dicomElement);
         viewport.invert = !viewport.invert;
         cornerstone.setViewport(this.dicomElement, viewport);*/
      },
      switchMethod(type, toolName) {
        if (cornerstone.getEnabledElements().length === 0) return;
        if (type === 'annotate') {
          this.passiveAnnotateTool();
          cornerstoneTools.setToolActive(toolName, {mouseButtonMask: 1});
        }
        if (type === 'clear-tool-state') {
          if (this.annotateToolStates.length !== 0) return;
          this.annotateToolStates = this.AnnotateTools.map((toolName) => ({
            name: toolName,
            state: JSON.stringify(cornerstoneTools.getToolState(this.dicomElement, toolName)),
          }));
          this.AnnotateTools.forEach((toolName) => {
            cornerstoneTools.clearToolState(this.dicomElement, toolName);
          });
          cornerstone.updateImage(this.dicomElement);
        }
        if (type === 'save-tool-state') {
          if (this.annotateToolStates.length === 0) return;
          this.annotateToolStates.forEach((tool) => {
            if (tool?.state) {
              JSON.parse(tool.state).data.forEach((data) => {
                cornerstoneTools.addToolState(this.dicomElement, tool.name, data);
              });
            }
          });
          this.annotateToolStates = [];
          cornerstone.updateImage(this.dicomElement);
        }
        if (type === 'image-info') {
          this.showImageInfo = true;
        }
      },
      // 当点击加载图像时 调用 loadAndViewImage 加载 Dicom 图像
      loadAndViewImage(imageIds, currentImageIdIndex) {
        // 找到 要放置 Dicom Image 的元素
        const stack = {
          currentImageIdIndex,
          imageIds,
        };
        cornerstone.loadAndCacheImage(imageIds[currentImageIdIndex]).then((image) => {
          const element = this.dicomElement;
          cornerstoneTools.addStackStateManager(element, ['stack']);
          cornerstoneTools.addToolState(element, 'stack', stack);
          /* const viewport = cornerstone.getDefaultViewportForImage(element, image);
          cornerstone.displayImage(element, image, viewport);*/
          cornerstone.displayImage(element, image);
          this.zoomMouseWheel();
          this.windowLevel();
          this.pan();
          this.passiveAnnotateTool();
          // this.stackScroll();
        }, (err) => {
          cornerstone.disable(this.dicomElement);
        });
      },
      playClip() {
        if (cornerstone.getEnabledElements().length === 0) return;
        cornerstoneTools.playClip(this.dicomElement, 5);
      },
      stopClip() {
        if (cornerstone.getEnabledElements().length === 0) return;
        cornerstoneTools.stopClip(this.dicomElement);
      },
      stackScroll() {
        cornerstoneTools.setToolActive('StackScrollMouseWheel', {mouseButtonMask: 1});
      },
      pan(mask = 1) {
        cornerstoneTools.setToolActive('Pan', {mouseButtonMask: mask});
      },
      zoomMouseWheel() {
        cornerstoneTools.setToolActive('ZoomMouseWheel', {mouseButtonMask: 1});
      },
      windowLevel() {
        // this.disabledTool();
        cornerstoneTools.setToolActive('Wwwc', {mouseButtonMask: 2});
      },
      disabledTool() {
        this.tools.forEach((toolName) => {
          cornerstoneTools.setToolDisabled(toolName);
        });
      },
      passiveAnnotateTool() {
        this.AnnotateTools.forEach((toolName) => {
          cornerstoneTools.setToolPassive(toolName);
        });
      },
      zoomTo(scale) {
        if (cornerstone.getEnabledElements().length === 0) return;
        const viewport = cornerstone.getViewport(this.dicomElement);
        if (scale === '1') {
          cornerstone.fitToWindow(this.dicomElement);
        } else {
          viewport.scale = scale / 1;
          cornerstone.setViewport(this.dicomElement, viewport);
        }
      },
      setImageInfo(data) {
        this.imageInfo = {
          patientName: data.string('x00100010'), // 病人姓名
          patientId: data.string('x00100020'), // 病人性别
          patientSex: data.string('x00100040'), // 病人ID
          modality: data.string('x00080060'), // 检查模态
          seriesDateTime: data.string('x00080021') + ' ' + data.string('x00080031'), // 检查时间
          institutionName: data.string('x00080080'), // 医院名称
          studyDateTime: data.string('x00080020') + ' ' + data.string('x00080030'),
          imageOrientation: data.string('x00200037'), // 图像方位
          sliceThickness: data.string('x00180050'), // 层厚
          rows: data.uint16('x00280010'), // 行分辨率
          columns: data.uint16('x00280011'), // 列分辨率
          pixelSpacing: data.text('x00280030'), // 像素间距
        };
      },
    },
    mounted() {
      this.dicomElement = this.$el.getElementsByClassName('dicom-image')[0];
      if (!this.dicomElement) {
        return;
      }
      setTimeout(() => {
        this.resize();
      }, 1000);
      cornerstone.enable(this.dicomElement);
      [...this.baseTools, ...this.AnnotateTools].forEach((toolName) => {
        cornerstoneTools.addTool(cornerstoneTools[`${toolName}Tool`]);
      });
      if (this.type === 'DCM') {
        this.loadAndViewImage(this.fileUrlList.map((url) => `wadouri:${url}`), this.fileIndex);
      } else {
        this.loadAndViewImage(this.fileUrlList.map((url) => `${window.location.protocol}${url}`), this.fileIndex);
      }
      // console.log(cornerstone);
      // dicom rendered
      this.dicomElement.addEventListener(cornerstone.EVENTS.IMAGE_RENDERED, (e) => {
        const {viewport, image} = e.detail;
        // console.log(viewport, image);
        if (this.type === 'DCM') {
          this.setImageInfo(image.data);
        }
        this.windowCenter = viewport.voi.windowCenter.toFixed(2) / 1;
        this.windowWidth = viewport.voi.windowWidth.toFixed(2) / 1;
        this.scale = viewport.scale.toFixed(2) / 1;
        const stackState = cornerstoneTools.getToolState(this.dicomElement, 'stack');
        if (stackState?.data?.length > 0) {
          this.$emit('update:fileIndex', stackState.data[0].currentImageIdIndex);
        }
        if (this.requestId === this.userId) {
          if (this.stomp) {
            this.stomp.sendDirectJson({
              type: 'change',
              from: this.userId,
              id: this.consultationId,
              data: viewport,
              fileIndex: stackState.data?.[0]?.currentImageIdIndex || 0,
            });
          }
        }
        const currentActiveAnnotateTool = cornerstoneTools.store.state.tools.filter((tool) => tool.mode === 'active')
          .find((tool) => this.AnnotateTools.includes(tool.name));
        if (currentActiveAnnotateTool && this.AnnotateTools.includes(currentActiveAnnotateTool.name)) {
          // 获取当前激活工具的标注数据
          const toolStates = cornerstoneTools.getToolState(this.dicomElement, currentActiveAnnotateTool.name);
          if (toolStates?.data?.length > 0) {
            if (this.stomp) {
              this.stomp.sendDirectJson({
                type: 'add_annotation',
                from: this.userId,
                id: this.consultationId,
                data: toolStates.data,
                fileIndex: this.fileIndex,
                toolName: currentActiveAnnotateTool.name,
              });
            }
          }
        }
      });
      this.dicomElement.addEventListener(cornerstoneTools.EVENTS.MEASUREMENT_ADDED, (e) => {
        /* const {toolType, measurementData} = e.detail;
         if (toolType !== 'playClip' && toolType !== 'FreehandMouse') {
           this.passiveAnnotateTool();
           this.pan();
         }*/
        const {measurementData} = e.detail;
        measurementData.color = '#0f0';
      });
      this.dicomElement.addEventListener(cornerstoneTools.EVENTS.MOUSE_MOVE, (e) => {
        this.AnnotateTools.forEach((toolName) => {
          const toolStates = cornerstoneTools.getToolState(this.dicomElement, toolName);
          if (toolStates?.data?.length > 0) {
            toolStates.data.forEach((data) => {
              if (data.active || data?.handles?.textBox?.active) {
                data.color = '#f0f';
                if (this.stomp) {
                  this.stomp.sendDirectJson({
                    type: 'add_annotation',
                    from: this.userId,
                    id: this.consultationId,
                    data: toolStates.data,
                    fileIndex: this.fileIndex,
                    toolName: toolName,
                  });
                }
              } else {
                data.color = '#0f0';
              }
            });
          }
        });
      });
      /* this.dicomElement.addEventListener(cornerstoneTools.EVENTS.MEASUREMENT_MODIFIED, (e) => {
        // 查找当前激活的标注工具
        // FreehandMouse无法触发MEASUREMENT_MODIFIED
        const currentActiveAnnotateTool = cornerstoneTools.store.state.tools.filter((tool) => tool.mode === 'active')
           .find((tool) => this.AnnotateTools.includes(tool.name));
         if (currentActiveAnnotateTool && this.AnnotateTools.includes(currentActiveAnnotateTool.name)) {
           // 获取当前激活工具的标注数据
           const toolStates = cornerstoneTools.getToolState(this.dicomElement, currentActiveAnnotateTool.name);
           if (toolStates?.data?.length > 0) {
             this.stomp.sendJson({
               type: 'add_annotation',
               from: this.userId,
               id: this.consultationId,
               data: toolStates.data,
               fileIndex: this.fileIndex,
               toolName: currentActiveAnnotateTool.name,
             });
           }
         }
      });*/
      this.dicomElement.addEventListener(cornerstoneTools.EVENTS.MEASUREMENT_REMOVED, (e) => {
        // 查找当前激活的标注工具
        const toolStates = cornerstoneTools.getToolState(this.dicomElement, e.detail.toolType);
        if (this.stomp) {
          this.stomp.sendDirectJson({
            type: 'add_annotation',
            from: this.userId,
            id: this.consultationId,
            data: toolStates.data,
            fileIndex: this.fileIndex,
            toolName: e.detail.toolType,
          });
        }
        this.passiveAnnotateTool();
        this.pan();
      });
      this.dicomElement.addEventListener('mouseup', (e) => {
        // 查找当前激活的标注工具
        const currentActiveAnnotateTool = cornerstoneTools.store.state.tools.filter((tool) => tool.mode === 'active')
          .find((tool) => this.AnnotateTools.includes(tool.name));
        if (currentActiveAnnotateTool) {
          // 获取当前激活工具的标注数据
          const toolStates = cornerstoneTools.getToolState(this.dicomElement, currentActiveAnnotateTool.name);
          if (toolStates?.data?.length > 0) {
            setTimeout(() => {
              if (toolStates.data.every((label) => !label.active)) {
                this.passiveAnnotateTool();
                this.pan();
              }
            }, 100);
          }
        }
      });
      this.$root.$on('resize', this.resize);
      if (this.stomp?.message$) {
        this.dcmStomp = this.stomp.message$.subscribe(msg => {
          // 如果用户选择跟随模式，则判断文件名否是同一个，如果不是则先加载对应的文件
          if (!this.dicomElement) return;
          if ((msg.fileIndex || msg.fileIndex === 0) && msg.fileIndex !== this.fileIndex && this.isFollow && msg.from !== this.userId) {
            this.$emit('update:fileIndex', msg.fileIndex);
            const stackState = cornerstoneTools.getToolState(this.dicomElement, 'stack');
            if (stackState?.data?.length > 0) {
              stackState.data[0].currentImageIdIndex = msg.fileIndex;
            }
            let imageIds = [];
            if (this.type === 'DCM') {
              imageIds = this.fileUrlList.map((url) => `wadouri:${url}`);
            } else {
              imageIds = this.fileUrlList.map((url) => `${window.location.protocol}${url}`);
            }
            cornerstone.loadAndCacheImage(imageIds[msg.fileIndex])
              .then((image) => {
                cornerstone.displayImage(this.dicomElement, image);
              });
            return;
          }
          switch (msg.type) {
            case 'delete_annotation': {
              if (msg.from === this.userId) return;
              cornerstoneTools.removeToolState(this.dicomElement, msg.toolName, msg.data);
              cornerstone.updateImage(this.dicomElement);
            }
              break;
            case 'add_annotation': {
              if (msg.from === this.userId) return;
              cornerstoneTools.clearToolState(this.dicomElement, msg.toolName);
              msg.data.forEach((data) => {
                cornerstoneTools.addToolState(this.dicomElement, msg.toolName, data);
              });
              cornerstone.updateImage(this.dicomElement);
            }
              break;
            case 'change': {
              // 如果消息来自自己，则不做处理
              if (msg.from === this.userId) return;
              if (!this.isFollow) return;
              cornerstone.setViewport(this.dicomElement, msg.data);
              this.changeColormap(msg.data.colormap);
            }
              break;
            default:
            // console.log('consultation stomp', msg);
          }
        });
      }
      /* this.dicomElement.addEventListener(cornerstoneTools.EVENTS.MOUSE_WHEEL, (e) => {
         console.log(e);
       });*/
      /* document.getElementById('selectFile').addEventListener('change', (e) => {
        // Add the file to the cornerstoneFileImageLoader and get unique
        // number for that file
        const fileList = e.target.files;
        const {map} = Array.prototype;
        const _fileList = fileList::map((file) => file);
        _fileList.sort((a, b) => b.lastModified - a.lastModified);
        // const imageIds = _fileList.map((file) => cornerstoneWADOImageLoader.wadouri.fileManager.add(file));
        this.loadAndViewImage(imageIds, 0);
      });*/
    },
    beforeDestroy() {
      cornerstone.disable(this.dicomElement);
      [...this.baseTools, ...this.AnnotateTools].forEach((toolName) => {
        cornerstoneTools.removeTool(cornerstoneTools[`${toolName}Tool`]);
      });
      if (this.dcmStomp) {
        unsubscribe(this.dcmStomp);
      }
      this.$root.$off('resize', this.resize);
    },
  };
</script>

<style scoped lang="scss">
  .dicom-view {
    position: relative;
    height: 100%;
    width: 100%;
    .dicom-toolbox {
      position: absolute;
      left: 10px;
      top: 10px;
      z-index: 999;
    }
    .dicom-image {
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 100%;
    }
    .dicom-info {
      color: #fff;
      font-size: 14px;
      line-height: 17px;
      .dicom-patient-info {
        position: absolute;
        z-index: 999;
        bottom: 10px;
        left: 10px;
      }
      .dicom-window-level-info {
        position: absolute;
        z-index: 999;
        bottom: 10px;
        right: 10px;
      }
    }
  }
</style>
