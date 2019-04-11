<template>
  <div v-height>
    <kfb-view
      v-if="isKfb"
      :consultation-id="consultationId"
      :request-id="requestId"
      :stomp="stomp"
      :file-name-list="fileUrlList"
      :file-index.sync="fileIndex"
      :is-follow="isFollow"
    ></kfb-view>
    <mdt-dicom-view
      v-if="!isKfb"
      :type="dcmType"
      :file-url-list="fileUrlList"
      :file-index.sync="fileIndex"
      :consultation-id="consultationId"
      :request-id="requestId"
      :stomp="stomp"
      :is-follow="isFollow"
    ></mdt-dicom-view>
  </div>
</template>

<script>
  import KfbView from '../../../common/components/whiteboard/kfbView/mdtKfbView';
  import MdtDicomView from '../../../common/components/mdtDicomView/mdtDicomView';
  import {ConsultationStomp} from '../../../common/service/stomp.service';

  export default {
    name: 'fileview',
    components: {MdtDicomView, KfbView},
    data() {
      let file = {};
      if (window.sessionStorage.getItem('openFile')) {
        file = JSON.parse(window.sessionStorage.getItem('openFile'));
      }
      return {
        fileIndex: file.index,
        dcmType: file.dcmType,
        consultationId: file.consultationId,
        fileUrlList: file.fileUrlList,
        requestId: file.requestId,
        isKfb: file.isKfb,
        isFollow: true,
        stomp: file.consultationId && new ConsultationStomp(file.consultationId),
      };
    },
    mounted() {
      if (!window.sessionStorage.getItem('openFile')) {
        this.$router.push('/home');
      }
    },
    beforeDestroy() {
      window.sessionStorage.removeItem('openFile');
    },
  };
</script>

<style scoped>

</style>
