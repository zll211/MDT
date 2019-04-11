/* eslint-disable no-console */
export default {
  name: 'app',
  data() {
    return {
      width: 60,
      height: 60,
      top: 96,
      left: document.body.clientWidth - 96,
      lastClickTime: 0,
    };
  },

  mounted() {},

  computed: {
    parentW() {
      return this.$store.state.width;
    },
    meetingHover() {
      return this.$store.state.meeting.meetingHover;
    },
    parentH() {
      return this.$store.state.height;
    },
  },
  methods: {
    openMeeting() {
      const time = Date.now();
      if (time - this.lastClickTime < 200) {
        this.$store.commit('setMeetingHover', false);
        this.$store.commit('setMeetingDialog', true);
      }
      this.lastClickTime = time;
    },
  },
};
