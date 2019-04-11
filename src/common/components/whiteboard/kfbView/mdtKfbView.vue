<template>
  <div class="pis-slide-view">
    <label-info :info-list="infoList"></label-info>
    <file-change :file-index='fileIndex' :file-name-list="fileNameList"
                 @last-file="lastFile" @next-file="nextFile"></file-change>
    <toolbox v-if="!readonly" class="pis-toolbox" @switch-method="switchMethod"></toolbox>
  </div>
</template>

<script>
  import {mdtKfbViewService} from './mdtKfbView.service';
  import {mapState} from 'vuex';
  import {encodeQueryData, baseUrl, unsubscribe} from '../../../../config/utils';
  import KfbView from 'kfb-view';
  import LabelInfo from './labelInfo';
  import FileChange from './fileChange';
  import Toolbox from './toolbox';


  export default {
    name: 'kfbView',
    components: {Toolbox, FileChange, LabelInfo},
    data() {
      return {
        kfbView: {},
        labelForm: {width: 2, color: '#0000FF', pin: '1', description: ''},
        fileName: '',
        imageCapRes: 1,
        infoList: [],
        page: 1,
        innerLabelList: [],
        kfbStomp: {},
        userId: window.sessionStorage.getItem('userId') && window.sessionStorage.getItem('userId') / 1,
      };
    },
    props: {
      fileNameList: {
        type: Array,
        default: () => [],
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
    created() {
    },
    async mounted() {
      this.init();
      if (this.stomp?.message$) {
        this.kfbStomp = this.stomp.message$.subscribe(msg => {
          // 如果用户选择跟随模式，则判断文件名否是同一个，如果不是则先加载对应的文件

          // console.log(this.fileName, msg.fileName);
          if (msg.fileName && msg.fileName !== this.fileName && this.isFollow && msg.from !== this.userId) {
            const fileIndex = this.fileNameList.findIndex((name) => name === msg.fileName);
            this.$emit('update:fileIndex', fileIndex);
            this.fileName = msg.fileName;
            this.viewDestroy();
            setTimeout(() => {
              this.init();
            }, 100);
            return;
          }
          switch (msg.type) {
            case 'add_annotation': {
              this.innerLabelList.push(msg.data);
              if (this.kfbView?.change) {
                this.initLabelList([...this.kfbView.labelList, ...this.innerLabelList]);
                this.innerLabelList = [];
                this.kfbView.change();
              }
            }
              break;
            case 'delete_annotation': {
              if (this.kfbView?.change) {
                const index = this.kfbView.labelList.findIndex((item) => item.id === msg.data.id);
                if (index > -1) {
                  this.kfbView.labelList.splice(index, 1);
                  this.initLabelList([...this.kfbView.labelList, ...this.innerLabelList]);
                  this.innerLabelList = [];
                  this.kfbView.change();
                }
              }
            }
              break;
            case 'edit_annotation': {
              const index = this.innerLabelList.findIndex((label) => label.id === msg.data.id);
              if (index > -1) {
                this.innerLabelList.splice(index, 1, msg.data);
              } else {
                this.innerLabelList.push(msg.data);
              }
              if (this.kfbView?.change) {
                const list = this.kfbView.labelList.map((item) => {
                  if (item.id === msg.data?.id) {
                    return msg.data;
                  }
                  return item;
                });
                this.initLabelList([...list, ...this.innerLabelList]);
                this.innerLabelList = [];
                this.kfbView.change();
              }
            }
              break;
            case 'select_annotation': {
              if (this.kfbView?.change) {
                const label = this.kfbView.labelList.find((item) => item.id === msg.data);
                if (label) {
                  label.select = true;
                  this.kfbView.change();
                }
              }
            }
              break;
            case 'zoom': {
              // 如果消息来自自己，则不做处理
              if (msg.from === this.userId) return;
              if (this.kfbView?.change) {
                if (this.isFollow) {
                  this.moveAndPan(msg.data.scale / this.kfbView.scale, msg.data.point);
                }
              }
            }
              break;
            default:
            // console.log('consultation stomp', msg);
          }
        });
      }
    },
    methods: {
      lastFile() {
        this.$emit('update:fileIndex', this.fileIndex - 1);
        this.viewDestroy();
        setTimeout(() => {
          this.init();
        }, 100);
      },
      nextFile() {
        this.$emit('update:fileIndex', this.fileIndex + 1);
        this.viewDestroy();
        setTimeout(() => {
          this.init();
        }, 100);
      },
      async init() {
        if (this.fileNameList.length === 0) {
          this.$message.error('暂无kfb图像');
          return;
        }
        try {
          // console.log(this.fileIndex);
          // console.log(this.fileName);
          this.fileName = this.fileNameList[this.fileIndex];
          await this.initKfbView();
          // this.animas
          this.drawLabelList({
            file: this.fileName,
            page: this.page,
            page_size: 100,
          });
          this.labelChange();
          this.onSelectLabel();
          this.onMeasureChange();
          this.$root.$on('resize', this.resize);
          setTimeout(() => {
            this.resize();
          }, 0);
        } catch (e) {
          // console.error(e);
          this.$message.error('读取图像信息失败');
        }
      },
      viewDestroy() {
        this.$root.$off('resize', this.resize);
        if (!this.kfbView || !this.kfbView.destroy) return;
        this.page = 1;
        this.infoList = [];
        this.kfbView.destroy();
        this.kfbView = null;
      },
      resize() {
        if (this.kfbView) {
          this.kfbView.resizeViewContainer({
            width: window.innerWidth,
            height: window.innerHeight,
          });
        }
      },
      async initKfbView() {
        const {body} = await mdtKfbViewService.getImageInfo(this.fileName);
        this.imageCapRes = body.imageCapRes;
        let params = {};
        params.file = this.fileName;
        this.kfbView = new KfbView({
          el: this.$el,
          fileName: this.fileName,
          thumbnail: `${baseUrl}/kfb/get_image?file=${this.fileName}&type=thumbnail`,
          // width: window.innerWidth - 181,
          width: window.innerWidth,
          height: window.innerHeight,
          scale: body.scanScale,
          toolbox: {show: false},
          // navigator: {show: !this.readonly},
          viewerScale: {
            show: true,
            imageCapRes: body.imageCapRes,
            style: 'bottom: 10px;left: 250px;',
          },
          openSeadragonOptions: {
            maxZoomLevel: body.scanScale * 2,
            tileSources: {
              height: body.height,
              width: body.width,
              tileSize: 256,
              minLevel: 10,
              getTileUrl(level, x, y) {
                params.x = x;
                params.y = y;
                if (body.fileNum == level) {
                  level = body.scanScale;
                  params.scale = level.toFixed(6);
                } else {
                  level = body.scanScale / Math.pow(2, body.fileNum - level);
                  params.scale = level.toFixed(6);
                  level = body.ratiomap[level.toFixed(6)];
                  if (level === undefined) {
                    level = 0;
                  }
                }
                params.level = level;
                // return 'http://192.168.1.29:8011/api/slide/view?'+ encodeQueryData(params) ;
                return `/image.php?${encodeQueryData(params)}`;
              },
            },
          },
        });
        this.kfbView.viewer.addHandler('animation', (res) => {
          if (this.requestId === this.userId) {
            this.stomp.sendDirectJson({
              type: 'zoom',
              from: this.userId,
              id: this.consultationId,
              data: {
                scale: this.kfbView.viewer.viewport.getZoom(true),
                point: this.kfbView.viewer.viewport.getCenter(true),
                fileName: this.fileName,
              },
            });
          }
        });
      },
      drawLabelList(params) {
        return mdtKfbViewService.labelList(params)
          .then(({body}) => {
            if (body.meta?.pagination && this.kfbView) {
              // eslint-disable-next-line camelcase
              const {total_pages, current_page} = body.meta.pagination;
              // eslint-disable-next-line camelcase
              if (current_page < total_pages) {
                this.drawLabelList({
                  file: this.fileName,
                  page: this.page++,
                  page_size: 100,
                });
              }
            }
            this.initLabelList([...this.kfbView.labelList, ...body.data.map((item) => JSON.parse(item.annotation))]);
          });
      },
      labelChange() {
        this.kfbView.$on('label-change', (e) => {
          this.labelType = e.detail.type;
          switch (e.detail.type) {
            case 'edit': {
              const label = e.detail.label || this.kfbView.labelList[0];
              if (!label) {
                return;
              }
              this.labelForm = Object.assign({}, label);
            }
              break;
            case 'delete': {
              if (!e.detail.label) {
                this.$message.warning('请选择删除的标签');
                return;
              }
              this.stomp.sendJson({
                type: 'delete_annotation',
                from: this.userId,
                id: this.consultationId,
                data: {
                  id: e.detail.label.id,
                },
                fileName: this.fileName,
              });
              // this.deleteLabel(e.detail.label.id);
            }
              break;
            case 'add': {
              this.stomp.sendJson({
                type: 'add_annotation',
                from: this.userId,
                id: this.consultationId,
                data: this.getShapeParams({
                  ...e.detail.label,
                  name: '图型' + this.kfbView.labelList.length + 1,
                }),
                fileName: this.fileName,
              });
              this.clearBrush();
            }
              break;
            case 'move': {
              /* const label = e.detail.label;
                 mdtKfbViewService.modifyLabel(label.id, this.getShapeParams(label), this.fileName)
                .then(({body}) => {
                });*/
              this.stomp.sendJson({
                type: 'edit_annotation',
                from: this.userId,
                id: this.consultationId,
                data: this.getShapeParams(e.detail.label),
                fileName: this.fileName,
              });
            }
          }
        });
      },
      moveAndPan(scale, point) {
        this.kfbView.area.moveCenterPoint({scale, point});
      },
      onSelectLabel() {
        this.kfbView.$on('select-label', (e) => {
          const label = e.detail;
          if (!label) {
            this.infoList = [];
          } else if (label.type && label.type !== 'Mask') {
            this.setMeasureInfo(label);
          } else {
            this.infoList = [];
          }
        });
      },
      onMeasureChange() {
        this.kfbView.$on('measure-range', (e) => {
          const result = e.detail;
          if (!result) {
            this.infoList = [];
          } else {
            result.type = 'Measure';
            const item = this.kfbView.convertNoteForm(result, this.imageCapRes);
            this.infoList = [`长度: ${item.perimeter.toFixed(2)}微米`];
          }
        });
      },
      setMeasureInfo(draw) {
        draw = this.kfbView.convertNoteForm(draw, this.imageCapRes);
        if (draw.type === 'Line' || draw.type === 'Arrow') {
          this.infoList = [`长度: ${draw.perimeter.toFixed(2)}微米`];
        }
        if (draw.type === 'Measure') {
          this.infoList = [`长度: ${draw.perimeter.toFixed(2)}微米`];
        } else if (draw.type === 'Rectangle' || draw.type === 'Ellipse') {
          this.infoList = [`宽: ${Math.abs(draw.width).toFixed(2)}微米`,
            `高: ${Math.abs(draw.height).toFixed(2)}微米`,
            `面积: ${draw.acreage.toFixed(2)}平方微米`,
            `周长: ${draw.perimeter.toFixed(2)}微米`];
        } else if (draw.type === 'Position' || draw.type === 'Curve') {
          this.infoList = [];
        }
      },
      getShapeParams(params) {
        return {
          id: params.id,
          width: params.width,
          description: params.description,
          name: params.name,
          startPoint: params.startPoint,
          endPoint: params.endPoint,
          color: KfbView.convertColorToInt(params.color),
          type: params.type,
          pin: params.pin,
          points: params.points,
          scale: params.scale,
          region: params.region,
          imageData: params.imageData,
        };
      },
      clearBrush() {
        if (this.labelType === 'add') {
          const board = this.kfbView.board;
          if (board.canDraw) {
            board[`${board.type}`].clearCanvas();
            board.type = undefined;
            board.canDraw = false;
          }
        }
        this.infoList = [];
      },
      initLabelList(data) {
        let list = [];
        data.filter((item) => item.id).forEach((item) => {
          if (list.find((_item) => _item.id === item.id)) {
            // return;
          } else {
            list.push(item);
          }
        });
        this.kfbView.setLabelList((list || []).map((item) => ({
          ...item,
          imageData: item.imageData && {
            data: new Uint8ClampedArray(item.imageData.data),
            width: item.imageData.width,
            height: item.imageData.height,
          },
        })));
      },
      switchMethod(type, params) {
        if (type === 'brush') {
          if (this.kfbView.board && this.kfbView.board.setDrawContent) {
            this.kfbView.board.setDrawContent(params);
          }
        }
      },
    },
    beforeDestroy() {
      if (this.kfbStomp) {
        unsubscribe(this.kfbStomp);
      }
      this.viewDestroy();
    },
    destroyed() {
    },
  };

</script>

<style lang="scss" scoped>
  .pis-slide-view {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    .pin-img {
      height: 37px;
      width: 31px;
    }
    .pis-toolbox {
      top: 0;
      left: 0;
      z-index: 10;
    }
  }

  .image-info {
    .preview-img {
      height: 180px;
      max-width: 360px;
      img {
        height: 100%;
      }
    }
    .el-form-item {
      word-break: break-all;
      &.el-form-item {
        margin-bottom: 0;
      }
    }
  }
</style>
