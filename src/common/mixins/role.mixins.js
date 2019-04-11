import {mapState} from 'vuex';

export default {
  data() {
    return {
    };
  },
  computed: {
    ...mapState(['role']),
    isOwner() {
      return !!~this.role.indexOf('管理员');
    },
    isReportCheckDoctor() {
      return !!~this.role.indexOf('报告审核');
    },
    isNormalDoctor() {
      return !!~this.role.indexOf('专家医生');
    },
    isCheckDoctor() {
      return !!~this.role.indexOf('会诊审核');
    },
    isOnlyOwner() {
      return this.isOwner && !this.isReportCheckDoctor && !this.isNormalDoctor && !this.isCheckDoctor;
    },
  },
  watch: {
  },
  components: {
  },
  created() {
  },
  mounted() {
  },
  methods: {},
};
