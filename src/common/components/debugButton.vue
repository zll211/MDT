<template>
  <button @click="toggleDebug" style="margin-right: 16px;">测试</button>
</template>

<script>
import {FaceTimeType} from 'src/common/components/rtn/status';
export default {
  methods: {
    toggleDebug() {
      // 测试Facetime
      // this.$store.commit('setConsultationInfo', {
      //   type: 'friend',
      //   roomName: 1551329537,
      //   toUser: 'fhtest3',
      //   fromUser: 'yuming',
      // });
      this.$store.commit('setConsultationInfo', {
        type: FaceTimeType.meeting,
        roomName: 'meeting',
        id: 15,
      });
      // this.$store.commit('setMeetingDialog', true);
      // this.$store.commit('setWhiteboardStatus', true);
    },
  },
};
</script>
