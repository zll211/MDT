import {applyService} from '../apply/apply.service';
import {debounce, parseDate} from '../../../../config/utils';
import {recordService} from '@/page/main/consultation/record/record.service';

export default {
  // name: 'summary',
  data() {
    return {
      pagination: {},
      loading: false,
      tableData: [],
      searchInput: '',
      multipleSelection: [],
      uncheckedDialog: false,
      uncheckedReason: '',
    };
  },
  created() {
    this.getTable();
  },
  mounted() {
    this.$watch('searchInput', debounce(() => {
      this.getTable({search: this.searchInput});
    }, 1000));
  },
  methods: {
    handleCurrentChange(val) {
      this.getTable({page: val, pageSize: this.pagination.per_page});
    },
    handleSizeChange(val) {
      this.getTable({page: this.pagination.current_page, pageSize: val});
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    rowClick(row) {
      this.$refs.summaryTable.toggleRowSelection(row);
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
        invitee: 1,
        status: ['已结束', '报告未通过'],
        order: [
          ['finish_at', 'asc'],
        ],
      }, rest)).then((res) => {
        this.pagination = res.body.meta.pagination;
        this.tableData = res.body.data.map((item) => {
          return {
            id: item.id,
            consultation_number: item.consultation_number,
            application_at: item.application_at,
            finish_at: item.finish_at,
            reservation_at: item.reservation_at,
            objective: item.objective,
            patient_name: item.case ? item.case.patient_name : '',
            userName: item.user?.realname,
            type: item.type,
            status: item.status,
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
    toRecord(id) {
      this.$router.push(`/consultation/record/${id}`);
    },
    viewReason(id) {
      recordService.report(id).then(({body})=>{
        if (body.consultation_report.reason) {
          this.uncheckedDialog = true;
          this.uncheckedReason = body.consultation_report.reason;
          this.readonly = true;
        }
      });
    },
  },
};
