import {applyService} from '../apply/apply.service';
import {debounce, parseDate} from '../../../../config/utils';
import {checkService} from '@/page/main/consultation/check/check.service';
import {FaceTimeType} from 'src/common/components/rtn/status';

export default {
  name: 'arrange',
  data() {
    return {
      pagination: {},
      loading: false,
      tableData: [],
      searchInput: '',
      multipleSelection: [],
      editArrangeDialog: false,
      checkedForm: {
        invitee: [],
      },
    };
  },
  async created() {
    if (Object.keys(this.$route.query).length>0) {
      this.getTable({page: parseInt(this.$route.query?.page), page_size: parseInt(this.$route.query?.pageSize)});
    } else {
      this.getTable();
    }
  },
  mounted() {
    this.$watch('searchInput', debounce(() => {
      this.getTable({search: this.searchInput});
    }, 1000));
  },
  computed: {
    userList() {
      return this.$store.state.userList;
    },
  },
  methods: {
    handleCurrentChange(val) {
      this.$router.replace({path: '/consultation/arrange', query: {page: val, pageSize: this.pagination.per_page}});
      this.getTable({page: val, pageSize: this.pagination.per_page});
    },
    handleSizeChange(val) {
      this.$router.replace({path: '/consultation/arrange', query: {page: this.pagination.current_page, pageSize: val}});
      this.getTable({page: this.pagination.current_page, pageSize: val});
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    rowClick(row) {
      this.$refs.arrangeTable.toggleRowSelection(row);
    },
    getTable({page = 1, pageSize = 10, ...rest} = {
      page: 1,
      page_size: 10,
    }) {
      this.loading = true;
      applyService.consultation(Object.assign({
        page: page,
        page_size: pageSize,
        data: 1,
        interface_type: 'plan',
        invitee: 1,
        status: ['已通过'],
        order: [
          ['reservation_at', 'asc'],
        ],
        include: ['room'],
      }, rest)).then((res) => {
        this.pagination = res.body.meta.pagination;
        this.tableData = res.body.data.map((item) => {
          return {
            id: item.id,
            consultation_number: item.consultation_number,
            reservation_at: item.reservation_at,
            objective: item.objective,
            patient_name: item.case ? item.case.patient_name : '',
            userName: item.user?.realname,
            type: item.type,
            case_id: item.case_id,
            status: item.status,
            inviteeId: item.invitee?item.invitee.map((item) => {
              return parseInt(item.user_id);
            }) : [],
            room_id: item.room?.name,
            invitee: item.invitee ? this.formatterInvitee(item.invitee) : '',
            action: parseDate(item.reservation_at, 'yyyy-MM-dd HH:mm:ss') - new Date() > 0 ? '等待会诊' : '进入会诊',
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
    refreshTable() {
      this.getTable();
    },
    toMeeting(row) {
      if (this.isOwner) {
        return false;
      }
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
    editArrange(row) {
      this.checkedForm = {
        id: row.id,
        reservation_at: row.reservation_at,
        invitee: row.inviteeId,
        status: '通过',
      };
      this.editArrangeDialog = true;
    },
    editArrangeDialogConfirm() {
      checkService.ckecked(this.checkedForm).then((res) => {
        if (res.status === 201) {
          this.$message.success('修改成功。');
          this.editArrangeDialog = false;
          this.refreshTable();
          this.checkedForm = {
            invitee: [],
          };
        }
      });
    },
  },
};
