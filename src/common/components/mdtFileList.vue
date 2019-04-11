<template>
  <div class="file-list-component">
    <el-collapse>
      <el-collapse-item v-for="(item, index) in fileTypeList" :key="index" :name="item">
        <template slot="title">
          {{item}} <a @click.stop="viewFile(item)" v-if="item !== '其他'" class="view-btn"><i class="el-icon-view"></i> 预览</a>
        </template>
        <div class="flex align-items-center" v-for="(file, i) in fileList[item]" :key="i">
          <i class="el-icon-document"></i>
          <div class="flex align-items-center">
            <a class="file ellipsis">{{file.filename}}</a>
            <a :href="originHref+file.path" v-if="item === '其他'" class="view-btn" target="_blank"><i class="el-icon-view"></i> 预览 </a>
          </div>
          <i class="el-icon-delete view-btn" v-if="deleteIcon" @click="deleteFile(item, i)">删除</i>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
  export default {
    name: 'mdtFileList',
    data() {
      return {
        originHref: window.location.origin,
      };
    },
    props: {
      fileTypeList: {
        type: Array,
        default: null,
      },
      fileList: {
        type: Object,
        default: null,
      },
      deleteIcon: {
        type: Boolean,
        default: false,
      },
    },
    methods: {
      viewFile(type) {
        this.$emit('viewFile', type);
      },
      deleteFile(type, index) {
        this.$emit('deleteFile', type, index);
      },
    },
  };
</script>

<style lang="scss">
  .file-list-component {
    .el-icon-document {
      margin-right: 10px;
    }
    .view-btn{
      cursor: pointer;
      margin-left: 15px;
      color: #515151;
      font-weight: 400;
      font-size: 12px;
      &:hover{
        color: #609EFE;
      }
    }
    .el-icon-delete{
      cursor: pointer;
    }
    .el-collapse-item:last-child{
      .el-collapse-item__header,.el-collapse-item__wrap {
        border-bottom: none;
      }
    }
  }
</style>
