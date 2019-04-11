<template>
  <div class="record-page fill-contain flex column justify-content-between">
    <div class="main-contain" v-height="mainContainHeight">
      <mdt-form-header :tab-list="tabList"
                       @resetForm="reportView"
                       @tabChange="tabChange"
                       :resetShow="false"
                       :otherBtn="tabList[1].active?'预览报告':' '"></mdt-form-header>
      <opinion v-if="tabList[0].active"
               :readonly="readonly"
               @opinionChange="opinionChange"></opinion>
      <report v-if="tabList[1].active"
              :readonly="readonly"
              @reportChange="reportChange"></report>
    </div>
    <mdt-form-footer @submitForm="submitForm"
                     v-if="!isOnlyOwner"
                     :lastBtn="'保存'"
                     :readonly="readonly"
                     :extraBtn="tabList[1].active?'提交审核':''"
                     @extraBtnClick="reportCheck"></mdt-form-footer>
    <el-dialog
      class="pdf-dialog"
      title="报告预览"
      :visible.sync="pdfViewVisible"
      :fullscreen="true"
      @close="closePdfDialog">
      <iframe :src="pdf" style="width: 100%;height: 100%" frameborder="0"
              marginheight="0" marginwidth="0"></iframe>
    </el-dialog>
  </div>
</template>

<script src="./record.component.js"></script>
<style src="./record.scss" lang="scss"></style>
