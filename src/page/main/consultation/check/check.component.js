import {checkService} from './check.service';
import {debounce} from '../../../../config/utils';
// import {userService} from '../../user/user.service';
import mdtTableTab from '../../../../common/components/mdtTableTab';

export default {
  name: 'check',
  data() {
    return {
      pagination: {},
      loading: false,
      tableData: [],
      searchInput: '',
      userList: [],
      multipleSelection: [],
      activeName: '待审核',
      tableStatusSelect: '',
      mdtTabList: [{
        label: '待审核',
        name: '待审核',
        show: true,
        count: 0,
      }, {
        label: '已审核',
        name: '已审核',
        show: true,
        count: 0,
      }],
      uncheckedDialog: false,
      uncheckedReason: '',
      checker: '',
      check_at: '',
    };
  },
  computed: {
    status() {
      switch (this.activeName) {
        case '待审核':
          return ['审核中'];
        case '已审核':
          return ['未通过', '已通过', '已结束', '报告待审核', '报告已审核', '报告未通过'];
      }
    },
  },
  created() {
    if (Object.keys(this.$route.query).length>0) {
      this.activeName = this.$route.query?.activeName;
      this.getTable({page: parseInt(this.$route.query?.page), page_size: parseInt(this.$route.query?.pageSize)});
    } else {
      this.getTable();
    }
  },
  components: {
    mdtTableTab,
  },
  mounted() {
    this.$watch('searchInput', debounce(() => {
      this.getTable({search: this.searchInput});
    }, 1000));
  },
  methods: {
    getTopCount() {
      checkService.getApplyCount().then((res) => {
        if (res.status === 200) {
          let countList = res.body.data;
          this.mdtTabList = [{
            label: '待审核',
            name: '待审核',
            show: true,
            count: countList.checking,
          }, {
            label: '已审核',
            name: '已审核',
            show: true,
            count: countList.checked,
          }];
        }
      });
    },
    handleCurrentChange(val) {
      this.$router.replace({path: '/consultation/check', query: {page: val, pageSize: this.pagination.per_page, activeName: this.activeName}});
      this.getTable({page: val, pageSize: this.pagination.per_page});
    },
    handleSizeChange(val) {
      this.$router.replace({path: '/consultation/check', query: {page: this.pagination.current_page, pageSize: val, activeName: this.activeName}});
      this.getTable({page: this.pagination.current_page, pageSize: val});
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    rowClick(row) {
      this.$refs.checkTable.toggleRowSelection(row);
    },
    handleClick(tab) {
      this.$router.replace({
        path: '/consultation/check',
        query: {page: this.pagination.current_page, pageSize: this.pagination.per_page, activeName: tab.name},
      });
      this.getTable();
    },
    appointmentConsultation() {
      this.$router.push('/consultation/appointment');
    },
    instantConsultation() {
    },
    getTable({page = 1, pageSize = 10, ...rest} = {
      page: 1,
      page_size: 10,
    }) {
      this.loading = true;
      checkService.consultation(Object.assign({
        page: page,
        page_size: pageSize,
        data: 1,
        interface_type: 'verify',
        status: this.status,
        type: '预约会诊',
      }, rest)).then((res) => {
        this.pagination = res.body.meta.pagination;
        this.tableData = res.body.data.map((item) => {
          return {
            id: item.id,
            consultation_number: item.consultation_number,
            application_at: item.application_at,
            objective: item.objective,
            userName: item.user?.realname,
            case_id: item.case_id,
            patient_name: item.case ? item.case.patient_name : '',
            type: item.type,
            status: item.status,
            // application_data: item.application_data,
          };
        });
      }).finally(() => {
        this.getTopCount();
        this.loading = false;
      });
    },
    deleteConsultation() {
      let id = [];
      this.multipleSelection.forEach((item) => {
        id.push(item.id);
      });
      this.$confirm('确定要删除所选会诊申请吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        checkService.deleteConsultation({id: id}).then((res) => {
          if (res.status === 201) {
            this.refreshTable();
            this.$message.success('删除成功');
          }
        });
      });
    },
    refreshTable() {
      this.getTable();
    },
    checkInfo(caseId, id) {
      if (this.activeName === '待审核') {
        this.$router.push(`/consultation/checkinfo/${caseId}?id=${id}&readonly=false`);
      } else {
        this.$router.push(`/consultation/checkinfo/${caseId}?id=${id}&readonly=true`);
      }
    },
    viewReason(row) {
      checkService.result(row.id).then((res) => {
        this.uncheckedDialog = true;
        this.uncheckedReason = res.body.reason;
        this.checker = res.body.applyFail?.user.realname;
        this.check_at = res.body.applyFail ? res.body.applyFail.operate_at : '';
      });
    },
    tableStatusChange(val) {
      if (val) {
        if (val === '未通过') {
          this.getTable({status: ['未通过']});
        } else {
          this.getTable({status: ['已通过', '已结束', '报告待审核', '报告已审核', '报告未通过']});
        }
      } else {
        this.getTable();
      }
    },
  },
};
