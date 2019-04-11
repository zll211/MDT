import {applyService} from './apply.service';
import {debounce} from '../../../../config/utils';
import {checkService} from '../check/check.service';
import mdtTableTab from '../../../../common/components/mdtTableTab';

export default {
  name: 'apply',
  data() {
    return {
      pagination: {},
      loading: false,
      tableData: [],
      userList: [],
      searchInput: '',
      multipleSelection: [],
      uncheckedDialog: false,
      uncheckedReason: '',
      checker: '',
      check_at: '',
      recheckId: '',
      editCaseId: '',
      editCaseName: '',
      activeName: '待审核',
      mdtTabList: [{
        label: '待审核',
        name: '待审核',
        show: true,
        count: 0,
      }, {
        label: '审核未通过',
        name: '审核未通过',
        show: true,
        count: 0,
      }],
      countList: {},
    };
  },
  computed: {
    status() {
      switch (this.activeName) {
        case '待审核':
          return ['审核中'];
        case '审核未通过':
          return ['未通过'];
      }
    },
  },
  components: {
    mdtTableTab,
  },
  created() {
    if (Object.keys(this.$route.query).length>0) {
      this.activeName = this.$route.query?.activeName;
      this.getTable({page: parseInt(this.$route.query?.page), page_size: parseInt(this.$route.query?.pageSize)});
    } else {
      this.getTable({status: ['审核中']});
    }
  },
  mounted() {
    this.$watch('searchInput', debounce(() => {
      this.getTable({search: this.searchInput});
    }, 1000));
  },
  methods: {
    getTopCount() {
      applyService.getApplyCount().then((res) => {
        if (res.status === 200) {
          let countList = res.body.data;
          this.mdtTabList = [{
            label: '待审核',
            name: '待审核',
            show: true,
            count: countList.checking,
          }, {
            label: '审核未通过',
            name: '审核未通过',
            show: true,
            count: countList.notpass,
          }];
        }
      });
    },
    handleCurrentChange(val) {
      this.$router.replace({path: '/consultation/apply', query: {page: val, pageSize: this.pagination.per_page, activeName: this.activeName}});
      this.getTable({page: val, pageSize: this.pagination.per_page});
    },
    handleSizeChange(val) {
      this.$router.replace({path: '/consultation/apply', query: {page: this.pagination.current_page, pageSize: val, activeName: this.activeName}});
      this.getTable({page: this.pagination.current_page, pageSize: val});
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    handleClick(tab) {
      this.$router.replace({
        path: '/consultation/apply',
        query: {page: this.pagination.current_page, pageSize: this.pagination.per_page, activeName: tab.name},
      });
      this.getTable();
    },
    rowClick(row) {
      this.$refs.applyTable.toggleRowSelection(row);
    },
    appointmentConsultation() {
      this.$router.push('/consultation/appointment');
    },
    instantConsultation() {
      this.$router.push('/consultation/instant');
    },
    getTable({page = 1, pageSize = 10, ...rest} = {
      page: 1,
      page_size: 10,
    }) {
      this.loading = true;
      applyService.consultation(Object.assign({
        page: page,
        page_size: pageSize,
        interface_type: 'apply',
        data: 1,
        include: 'applyFail.user,applySuc.user',
        status: this.status,
      }, rest)).then((res) => {
        this.pagination = res.body.meta.pagination;
        this.tableData = res.body.data.map((item) => {
          return {
            id: item.id,
            consultation_number: item.consultation_number,
            application_at: item.application_at,
            objective: item.objective,
            case_id: item.case_id,
            patient_name: item.case ? item.case.patient_name : '',
            userName: item.user?.realname,
            type: item.type,
            status: item.status,
          };
        });
      }).finally(() => {
        this.loading = false;
        this.getTopCount();
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
        applyService.deleteConsultation({id: id}).then((res) => {
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
    viewReason(row) {
      this.recheckId = row.id;
      this.editCaseId = row.case_id;
      this.editCaseName = row.patient_name;
      checkService.result(row.id).then((res) => {
        this.uncheckedDialog = true;
        this.uncheckedReason = res.body.reason;
        this.checker = res.body.applyFail?.user.realname;
        this.check_at = res.body.applyFail ? res.body.applyFail.operate_at : '';
      });
    },
    uncheckedDialogRecheck() {
      this.$confirm('重新审核前请确定已修改该会诊病人资料?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        applyService.patchConsultation(this.recheckId).then((res) => {
          if (res.status === 201) {
            this.refreshTable();
            this.$message.success('已重新发起审核。');
            this.uncheckedDialog = false;
          }
        });
      });
    },
    editCase() {
      this.$router.push({path: '/case/entry', query: {id: this.editCaseId, patient_name: this.editCaseName}});
    },
  },
};
