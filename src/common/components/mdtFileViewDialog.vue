<template>
  <el-dialog
    class="view-file-dialog"
    :title="dialogTitle+'资料预览'"
    :visible.sync="viewVisible"
    :fullscreen="true"
    @close="closeViewFileDialog">
    <mdt-dicom-view v-if="viewFileType !== '病理' && hackReset" :type="viewFileType" :file-url-list="fileUrlList" :readonly="readonly"></mdt-dicom-view>
    <mdt-kfb-view v-if="viewFileType === '病理' && hackReset" :file-name-list="fileUrlList" :file-index.sync="fileIndex" :readonly="readonly"></mdt-kfb-view>
    <!--<kfb-view v-if="viewFileType === '病理' && hackReset" :file-name-list="fileUrlList" :file-index.sync="fileIndex"></kfb-view>-->
  </el-dialog>
</template>

<script>
  import mdtDicomView from './mdtDicomView/mdtDicomView';
  import mdtKfbView from './mdtKfbView/mdtKfbView';
  import KfbView from './whiteboard/kfbView/mdtKfbView';
  export default {
    name: 'mdtDicomViewDialog',
    data() {
      return {
        fileIndex: 0,
      };
    },
    created() {
    },
    components: {
      KfbView,
      mdtDicomView,
      mdtKfbView,
    },
    computed: {
      viewVisible: {
        get() {
          return this.fileViewVisible;
        },
        set() {},
      },
    },
    props: {
      fileViewVisible: false,
      viewFileType: {
        type: String,
        default: 'DCM',
      },
      fileUrlList: {
        type: Array,
        default: null,
      },
      dialogTitle: {
        type: String,
        default: '',
      },
      hackReset: {
        type: Boolean,
        default: true,
      },
      readonly: false,
    },
    methods: {
      closeViewFileDialog() {
        this.$emit('dialogClose');
      },
    },
  };
</script>

<style lang="scss">
  .view-file-dialog {
    .el-dialog {
      display: flex;
      flex-direction: column;

      .el-dialog__header {
        padding-bottom: 10px;
        padding-top: 10px;
      }

      .el-dialog__headerbtn {
        top: 15px;
      }

      .el-dialog__body {
        flex: 1;
        padding: 0 20px;

        .el-form-item {
          margin-bottom: 0;
        }
      }
    }
  }
</style>
