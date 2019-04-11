import {applyService} from '@/page/main/consultation/apply/apply.service';
import {parseDate} from '@/config/utils';
import consultationedIcon from '@/assets/images/consultationed-icon.png';
import unconsultationIcon from '@/assets/images/unconsultation-icom.png';
import reportIcon from '@/assets/images/report-icon.png';
import uncheckIcon from '@/assets/images/uncheck-icon.png';
import {homeService} from './home.service';
import {FaceTimeType} from '@/common/components/rtn/status';
export default {
  name: 'home',
  data() {
    return {
      loginTime: window.sessionStorage.getItem('loginTime'),
      tableData: [],
      loading: false,
      screenWidth: document.body.clientWidth,
      status: [],
      interfaceType: '',
    };
  },
  computed: {
    user() {
      return this.$store.state.user;
    },
    tipList() {
      return [
        {
          iconPath: unconsultationIcon,
          name: '会诊安排',
          number: 0,
          show: this.isNormalDoctor || this.isOwner,
        },
        {
          iconPath: uncheckIcon,
          name: '会诊审核',
          number: 0,
          show: this.isCheckDoctor || this.isOwner,
        },
        {
          iconPath: consultationedIcon,
          name: '会诊报告',
          number: 0,
          show: this.isNormalDoctor || this.isOwner,
        },
        {
          iconPath: reportIcon,
          name: '报告审核',
          number: 0,
          show: this.isReportCheckDoctor || this.isOwner,
        },
      ];
    },
  },
  watch: {
    role() {
      if (this.isNormalDoctor) {
        this.status = ['已通过'];
        this.interfaceType = 'plan';
        this.getTable();
        return;
      }
      if (this.isCheckDoctor) {
        this.status = ['审核中'];
        this.interfaceType = 'verify';
        this.getTable({type: '预约会诊'});
        return;
      }
      if (this.isReportCheckDoctor) {
        this.status = ['报告待审核'];
        this.interfaceType = 'report';
        this.getTable();
        return;
      }
      this.status = ['报告已审核'];
      this.interfaceType = 'report';
      this.getTable();
    },
  },
  created() {
    this.consultationCount();
  },
  mounted() {
    this.$root.$on('resize', this.resize);
    if (this.isNormalDoctor) {
      this.status = ['已通过'];
      this.interfaceType = 'plan';
      this.getTable();
      return;
    }
    if (this.isCheckDoctor) {
      this.status = ['审核中'];
      this.interfaceType = 'verify';
      this.getTable({type: '预约会诊'});
      return;
    }
    if (this.isReportCheckDoctor) {
      this.status = ['报告待审核'];
      this.interfaceType = 'report';
      this.getTable();
      return;
    }
    this.status = ['报告已审核'];
    this.interfaceType = 'report';
    this.getTable();
  },
  methods: {
    resize() {
      this.screenWidth = document.body.clientWidth;
    },
    toEditUser() {
      this.$router.push('/account');
    },
    getTable({page = 1, pageSize = 3, ...rest} = {
      page: 1,
      page_size: 3,
    }) {
      this.loading = true;
      applyService.consultation(Object.assign({
        page: page,
        page_size: pageSize,
        data: 1,
        invitee: 1,
        status: this.status,
        interface_type: this.interfaceType,
        order: [
          ['reservation_at', 'asc'],
        ],
      }, rest)).then((res) => {
        this.pagination = res.body.meta.pagination;
        this.tableData = res.body.data.map((item) => {
          return {
            id: item.id,
            consultation_number: item.consultation_number,
            reservation_at: item.reservation_at,
            application_at: item.application_at,
            objective: item.objective,
            patient_name: item.case ? item.case.patient_name : '',
            userName: item.user?.realname,
            type: item.type,
            case: item.case,
            status: item.status,
            room_id: item.room?.name,
            invitee: item.invitee ? this.formatterInvitee(item.invitee) : '',
            action: item.reservation_at?(parseDate(item.reservation_at, 'yyyy-MM-dd HH:mm:ss') - new Date() > 0 ? '等待会诊' : '进入会诊'):'查看资料',
          };
        });
      }).finally(() => {
        this.loading = false;
      });
    },
    formatterInvitee(data) {
      let userArr = [];
      let userStr = '';
      data.map((item) => {
        if (item.user && item.user.realname) userArr.push(item.user.realname);
      });
      userStr = userArr.join('、');
      return userStr;
    },
    toMeeting(row) {
      if (this.$store.state.meeting.meetingDialog || this.$store.state.meeting.meetingHover) {
        if (this.$store.state.meeting.consultationInfo.id === row.id) {
          this.$store.commit('setMeetingHover', false);
          this.$store.commit('setMeetingDialog', true);
        } else {
          this.$message.warning('当前您正在会诊中，请稍后再试。');
        }
      } else {
        this.$store.commit('setConsultationInfo', {
          id: row.id, // 会诊id
          roomName: row.room_id, // 房间号
          type: FaceTimeType.meeting,
        });
      }
    },
    consultationCount() {
      homeService.consultationCount().then(({body})=>{
        this.tipList.forEach((tip) => {
         switch (tip.name) {
           case '会诊安排':
             tip.number = parseInt(body.data['会诊安排']?body.data['会诊安排']:'0');
             break;
           case '会诊审核':
             tip.number = parseInt(body.data['会诊审核']?body.data['会诊审核']:'0');
             break;
           case '会诊报告':
             tip.number = parseInt(body.data['会诊报告']?body.data['会诊报告']:'0');
             break;
           case '报告审核':
             tip.number = parseInt(body.data['报告审核']?body.data['报告审核']:'0');
             break;
           default: return 0;
         }
        });
      });
    },
    review(row) {
      if (row.status === '审核中') {
        this.$router.push(`/consultation/checkinfo/${row.case.id}?id=${row.id}`);
      } else if (row.status === '报告待审核') {
        this.$router.push('/consultation/report');
      } else if (row.status === '报告已审核') {
        this.$router.push(`/consultation/record/${row.id}?readonly=true`);
      }
    },
  },
  destroyed() {
    this.$root.$off('resize', this.resize);
  },
};
