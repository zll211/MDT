<template>
  <div class="pis-slide-view">
    <label-info :info-list="infoList"></label-info>
    <el-dialog width="500px" :title="title" :visible.sync="labelChangeView"
               :before-close="closeLabelDialog" :append-to-body="true">
      <el-form :model="labelForm" ref="labelForm" label-position="left">
        <el-row>
          <el-col :span="24">
            <el-form-item label="名称" label-width="40px" prop="name">
              <el-select v-if="labelType === 'edit'" size="small"
                         v-model="labelForm.name"
                         placeholder="请选择名称" style="width: 100%"
                         @change="selectLabelChange">
                <el-option
                  v-for="(name,index) in labelNameList"
                  :key="index"
                  :label="name"
                  :value="name">
                </el-option>
              </el-select>
              <el-input v-if="labelType === 'add'" size="small"
                        v-model="labelForm.name"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="14">
            <el-form-item label="线宽" label-width="40px">
              <el-select style="width: 150px" size="small"
                         v-model="labelForm.width"
                         placeholder="请选择线宽"
                         filterable
                         allow-create
                         default-first-option>
                <el-option
                  v-for="(lineWidth,index) in lineWidthList"
                  :key="index"
                  :label="lineWidth"
                  :value="lineWidth">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item class="flex justify-content-between" label="颜色"
                          label-width="40px">
              <div class="flex align-items-center">
                <span style="margin-right: 10px">{{labelForm.color}}</span>
                <el-color-picker v-model="labelForm.color"
                                 size="small"></el-color-picker>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="描述" label-width="40px">
              <el-input size="small" type="textarea" v-model="labelForm.description"
                        :autosize="{ minRows: 3, maxRows: 4}"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="labelType==='edit'&&labelForm.type!=='Mask'">
            <el-form-item label="测量信息" label-width="80px">
              <div v-for="(info,index) in infoList" :key="index" class="text item">
                <span>{{info}}</span>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeLabelDialog" size="small">取 消</el-button>
        <el-button type="primary" @click="saveLabelChange()" size="small">确 定
        </el-button>
      </div>
    </el-dialog>

    <el-dialog class="image-info" width="600px" title="图像信息"
               :visible.sync="imageInfoView" :append-to-body="true">
      <el-form label-position="left" label-width="100px">
        <el-form-item label="文件名">
          <span class="flex-1">{{imageInfo.fileName}}</span>
        </el-form-item>
        <el-form-item label="图像像素">
          <span class="flex-1">{{imageInfo.width}}Pixel - {{imageInfo.height}}Pixel</span>
        </el-form-item>
        <el-form-item label="扫描倍率">
          <span class="flex-1">{{imageInfo.scanScale|| '无'}}</span>
        </el-form-item>
        <el-form-item label="扫描时刻">
          <span class="flex-1">{{imageInfo.scanTime}}</span>
        </el-form-item>
        <el-form-item label="扫描时间">
          <span class="flex-1">{{imageInfo.scanDuration||0}}ms</span>
        </el-form-item>
        <el-form-item label="预览图" label-position="top">
        </el-form-item>
        <el-form-item class="flex" label-width="0px">
          <img class="preview-img flex-1" style="width: 180px" alt="预览图图片"
               :src="imageInfo.labelImg">
          <img class="preview-img flex-1" alt="预览图图片"
               :src="imageInfo.previewImg">
        </el-form-item>
      </el-form>
    </el-dialog>

    <file-change :file-index='fileIndex' :file-name-list="fileNameList"
                 @last-file="lastFile" @next-file="nextFile"></file-change>
    <!--:image-list="labelImage" @switch-picture="switchPicture"-->
    <image-label-list ref="imageLabelList" :image-list="imageList" @switch-picture="switchPicture"></image-label-list>
  </div>
</template>

<script>
  import {mdtKfbViewService} from './mdtKfbView.service';
  import {mapState} from 'vuex';
  import {formatDateTime, encodeQueryData, baseUrl} from '../../../config/utils';
  import KfbView from 'kfb-view';
  import ImageLabelList from './imageLabelList';
  import LabelInfo from './labelInfo';
  import FileChange from './fileChange';


  export default {
    name: 'mdtKfbView',
    components: {ImageLabelList, FileChange, LabelInfo},
    data() {
      return {
        kfbView: {},
        labelChangeView: false,
        imageInfoView: false,
        title: '',
        labelForm: {width: 2, color: '#0000FF', pin: '1', description: ''},
        labelNameList: [],
        lineWidthList: [1, 2, 5, 8, 10],
        labelType: 'add',
        imageInfo: {},
        showAllLabel: true,
        fileName: '',
        imageCapRes: 1,
        infoList: [],
        page: 1,
        imageList: [],
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
      readonly: false,
    },
    computed: {
      ...mapState([
        'collapse',
      ]),
    },
    created() {
    },
    async mounted() {
      this.init();
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
          this.fileName = this.fileNameList[this.fileIndex];
          await this.initKfbView();
          this.drawPointList();
          this.drawLabelList({
            file: this.fileName,
            page: this.page,
            page_size: 100,
          });
          this.pointListChange();
          this.labelChange();
          this.onSelectLabel();
          this.onMeasureChange();
          this.screenShotImageChange();
          this.showImageInfo();
          /* setTimeout(() => {
             this.resize();
           }, 100);*/
          this.$root.$on('resize', this.resize);
        } catch (e) {
          // console.error(e);
          this.$message.error('读取图像信息失败');
        }
      },
      viewDestroy() {
        this.$root.$off('resize', this.resize);
        if (!this.kfbView || !this.kfbView.destroy) return;
        this.imageList = [];
        this.page = 1;
        this.labelNameList = [];
        this.infoList = [];
        this.kfbView.destroy();
        this.kfbView = null;
      },
      resize() {
        if (this.kfbView) {
          this.kfbView.resizeViewContainer({
            width: window.innerWidth - 40,
            height: window.innerHeight - this.$el.getBoundingClientRect().top - 1,
          });
        }
      },
      async initKfbView() {
        const {body} = await mdtKfbViewService.getImageInfo(this.fileName);
        this.imageInfo = body;
        this.imageInfo.scanTime = body.scanTime && formatDateTime(new Date(body.scanTime * 1000));
        this.imageInfo.fileName = this.fileName;
        this.imageInfo.previewImg = `/api/kfb/get_image?file=${this.fileName}&type=preview`;
        this.imageInfo.labelImg = `/api/kfb/get_image?file=${this.fileName}&type=label`;
        this.imageCapRes = body.imageCapRes;
        let params = {};
        params.file = this.fileName;
        this.kfbView = new KfbView({
          el: this.$el,
          fileName: this.fileName,
          thumbnail: `${baseUrl}/kfb/get_image?file=${this.fileName}&type=thumbnail`,
          // width: window.innerWidth - 181,
          width: window.innerWidth - 40,
          height: window.innerHeight - 44,
          scale: body.scanScale,
          toolbox: {show: !this.readonly},
          viewerScale: {
            show: true,
            imageCapRes: body.imageCapRes,
            style: 'bottom: 10px;left: 250px;',
          },
          showBoard: !this.readonly,
          showMenu: !this.readonly,
          showPaint: !this.readonly,
          showArea: !this.readonly,
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
      },
      drawPointList() {
        return mdtKfbViewService.navigatorPointList(this.fileName)
          .then((res) => {
            this.kfbView.navigator.drawPointList(res.data.data);
          }).finally(() => {
          });
      },
      pointListChange() {
        this.kfbView.$on('point-list-change', (e) => {
          mdtKfbViewService.navigatorPoint(this.kfbView.navigator.pointList, this.fileName)
            .then((res) => {
              this.kfbView.navigator.drawPointList(res.data.data);
            });
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
            this.getLabelImageList(params);
            this.initLabelList([...this.kfbView.labelList, ...body.data.map((item) => JSON.parse(item.annotation))]);
          });
      },
      getLabelImageList(params) {
        if (params.page === 1) this.imageList = [];
        mdtKfbViewService.labelImageList(params)
          .then(({body}) => {
            let list = [];
            [...this.imageList, ...body].forEach((item) => {
              if (list.find((_item) => _item.id === item.id)) {
                // return;
              } else {
                list.push(item);
              }
            });
            this.imageList = list;
          });
      },
      labelChange() {
        this.kfbView.$on('label-change', (e) => {
          this.labelType = e.detail.type;
          switch (e.detail.type) {
            case 'edit': {
              this.title = '编辑注释';
              this.labelChangeView = true;
              const label = e.detail.label || this.kfbView.labelList[0];
              if (!label) {
                return;
              }
              if (this.$refs.labelForm) this.$refs.labelForm.resetFields();
              this.labelForm = Object.assign({}, label);
            }
              break;
            case 'delete': {
              if (!e.detail.label) {
                this.$message.warning('请选择删除的标签');
                return;
              }
              this.deleteLabel(e.detail.label.id);
            }
              break;
            case 'add': {
              this.title = '添加注释';
              this.labelChangeView = true;
              if (this.$refs.labelForm) this.$refs.labelForm.resetFields();
              this.labelForm = Object.assign({}, e.detail.label, {
                width: 2,
                color: '#0000FF',
                pin: '1',
                name: '图型' + this.kfbView.labelList.length,
                description: '',
              });
            }
              break;
            case 'move': {
              const label = e.detail.label;
              mdtKfbViewService.modifyLabel(label.id, this.getShapeParams(label), this.fileName)
                .then(({body}) => {
                });
            }
          }
        });
      },
      selectLabelChange(name) {
        if (this.$refs.labelForm) this.$refs.labelForm.resetFields();
        const labelList = this.kfbView.labelList.map((item) => {
          item.select = false;
          return item;
        });
        const label = labelList.find((item) => item.name === name);
        label.select = true;
        this.labelForm = Object.assign({}, label);
        this.kfbView.area.moveCenterPoint(this.labelForm);
      },
      saveLabelChange() {
        if (this.labelType === 'add') {
          if (!this.labelForm.name) {
            this.$message.warning('请输入标签名称');
            return;
          }
          if (this.kfbView.labelList.find((label) => label.name === this.labelForm.name)) {
            this.$message.warning('标签名称重复');
            return;
          }
          mdtKfbViewService.saveLabel(this.getShapeParams(this.labelForm), this.fileName)
            .then(({body}) => {
              this.kfbView.labelList.push(body.data);
              this.kfbView.setLabelList(this.kfbView.labelList);
              // this.initLabelList(body.data);
              this.getLabelImageList({
                file: this.fileName,
                page: this.page,
                page_size: 100,
              });
              this.$message.success('新增成功');
              this.closeLabelDialog();
              this.kfbView.change();
            }).catch(() => {
            this.$message.error('新增失败');
          });
        } else {
          mdtKfbViewService.modifyLabel(this.labelForm.id, this.getShapeParams(this.labelForm), this.fileName)
            .then(({body}) => {
              const list = this.kfbView.labelList.map((item) => {
                if (item.id === body?.data?.id) {
                  return body.data;
                }
                return item;
              });
              this.initLabelList(list);
              this.$message.success('修改成功');
              this.labelChangeView = false;
              this.kfbView.change();
            }).catch(() => {
            this.$message.error('修改失败');
          });
        }
      },
      deleteLabel(id) {
        mdtKfbViewService.deleteLabel(id, this.fileName)
          .then(({body}) => {
            this.kfbView.labelList.splice(this.kfbView.labelList.findIndex((item) => item.id === id), 1);
            this.imageList.splice(this.imageList.findIndex((item) => item.id === id), 1);
            this.labelChangeView = false;
            this.$message.success('删除成功');
            this.kfbView.setLabelList(this.kfbView.labelList);
            this.kfbView.change();
          }).catch(() => {
          this.$message.error('删除失败');
        });
      },
      screenShotImageChange() {
        this.kfbView.$on('screen-image-change', (e) => {
          if (e.detail.type === 'done') {
            this.$message.success('截图成功');
            this.$emit('screen-shot', e.detail.dataUrl);
          }
        });
      },
      onSelectLabel() {
        this.kfbView.$on('select-label', (e) => {
          const label = e.detail;
          this.imageList.forEach((item, index) => {
            item.select = false;
            this.$set(this.imageList, index, item);
          });
          if (!label) {
            this.infoList = [];
          } else if (label.type !== 'Mask') {
            this.setMeasureInfo(label);
            this.imageList.forEach((item, index) => {
              item.select = item.id === label.id;
              this.$set(this.imageList, index, item);
            });
            this.$refs.imageLabelList.setImageItem(label.id);
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
      switchPicture(id) {
        if (!this.kfbView?.labelList) return;
        this.kfbView.labelList.forEach((item) => item.select = item.id === id);
        const label = this.kfbView.labelList.find((item) => item.id === id);
        if (!label) return;
        this.kfbView.area.moveCenterPoint(label);
        this.kfbView.change();
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
      closeLabelDialog() {
        if (this.labelType === 'add') {
          const board = this.kfbView.board;
          if (board.canDraw) {
            board[`${board.type}`].clearCanvas();
            board.type = undefined;
            board.canDraw = false;
          }
        }
        this.infoList = [];
        this.labelChangeView = false;
      },
      showImageInfo() {
        this.kfbView.$on('image-info', (e) => {
          this.imageInfoView = true;
        });
      },
      initLabelList(data) {
        let list = [];
        data.forEach((item) => {
          if (list.find((_item) => _item.id === item.id)) {
            // return;
          } else {
            list.push(item);
          }
        });
        this.labelNameList = (list || []).map((item) => item.name || item.id);
        this.kfbView.setLabelList((list || []).map((item) => ({
          ...item,
          imageData: item.imageData && {
            data: new Uint8ClampedArray(item.imageData.data),
            width: item.imageData.width,
            height: item.imageData.height,
          },
        })));
      },
    },
    beforeDestroy() {
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
    .pis-icon {
      margin-right: 20px;
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
