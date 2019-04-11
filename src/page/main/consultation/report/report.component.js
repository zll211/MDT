import {applyService} from '../apply/apply.service';
import {debounce} from '../../../../config/utils';
import {reportService} from '@/page/main/consultation/report/report.service';
import {recordService} from '@/page/main/consultation/record/record.service';
import mdtTableTab from '../../../../common/components/mdtTableTab';

export default {
  name: 'report',
  data() {
    return {
      mainContainHeight: -100,
      pagination: {},
      loading: false,
      reportLoading: true,
      tableData: [],
      searchInput: '',
      multipleSelection: [],
      activeName: '待提交',
      pdfViewVisible: false,
      pdf: '',
      checkId: '',
      uncheckedDialog: false,
      uncheckedReason: '',
      readonly: false,
      tableStatusSelect: '',
      printPdf: '',
      mdtTabList: [{
        label: '待提交',
        name: '待提交',
        show: true,
        count: 0,
      }, {
        label: '待审核',
        name: '待审核',
        show: true,
        count: 0,
      }, {
        label: '已审核',
        name: '已审核',
        show: true,
        count: 0,
      }, {
        label: '全部',
        name: '全部',
        show: true,
        count: 0,
      }],
      checker: '',
      check_at: '',
    };
  },
  computed: {
    status() {
      switch (this.activeName) {
        case '待提交':
          return ['已结束'];
        case '待审核':
          return ['报告待审核'];
        case '已审核':
          return ['报告已审核', '报告未通过'];
        case '全部':
          return ['已结束', '报告待审核', '报告已审核', '报告未通过'];
      }
    },
  },
  watch: {
    role() {
      if (!this.isOwner && !this.isNormalDoctor) {
        if (Object.keys(this.$route.query).length > 0) {
          this.activeName = this.$route.query?.activeName;
        } else {
          this.activeName = '待审核';
        }
      } else {
        if (Object.keys(this.$route.query).length > 0) {
          this.activeName = this.$route.query?.activeName;
        } else {
          this.activeName = '待提交';
        }
      }
      // this.getTable();
    },
  },
  components: {
    mdtTableTab,
  },
  created() {
  },
  mounted() {
    if (this.role.length > 0 && !this.isOwner && !this.isNormalDoctor) {
      this.activeName = '待审核';
    }
    if (Object.keys(this.$route.query).length > 0) {
      this.activeName = this.$route.query?.activeName;
      this.getTable({page: parseInt(this.$route.query?.page), page_size: parseInt(this.$route.query?.pageSize)});
    } else {
      this.getTable();
    }
    this.$watch('searchInput', debounce(() => {
      this.getTable({search: this.searchInput});
    }, 1000));
  },
  methods: {
    getTopCount() {
      reportService.getApplyCount().then((res) => {
        if (res.status === 200) {
          let countList = res.body.data;
          this.mdtTabList = [{
            label: '待提交',
            name: '待提交',
            show: this.isOwner || this.isNormalDoctor,
            count: countList.submit,
          }, {
            label: '待审核',
            name: '待审核',
            show: true,
            count: countList.checking,
          }, {
            label: '已审核',
            name: '已审核',
            show: true,
            count: countList.checked,
          }, {
            label: '全部',
            name: '全部',
            show: true,
            count: countList.total,
          }];
        }
      }).finally(() => {
        setTimeout(()=>{
          this.reportLoading = false;
        }, 200);
      });
    },
    handleCurrentChange(val) {
      this.$router.replace({path: '/consultation/report', query: {page: val, pageSize: this.pagination.per_page, activeName: this.activeName}});
      this.getTable({page: val, pageSize: this.pagination.per_page});
    },
    handleSizeChange(val) {
      this.$router.replace({path: '/consultation/report', query: {page: this.pagination.current_page, pageSize: val, activeName: this.activeName}});
      this.getTable({page: this.pagination.current_page, pageSize: val});
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    rowClick(row) {
      this.$refs.reportTable.toggleRowSelection(row);
    },
    handleClick(tab) {
      this.$router.replace({
        path: '/consultation/report',
        query: {page: this.pagination.current_page, pageSize: this.pagination.per_page, activeName: tab.name},
      });
      this.getTable();
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
        interface_type: 'report',
        order: [
          ['finish_at', 'asc'],
        ],
        status: this.status,
      }, rest)).then((res) => {
        this.pagination = res.body.meta.pagination;
        this.tableData = res.body.data.map((item) => {
          return {
            id: item.id,
            consultation_number: item.consultation_number,
            application_at: item.application_at,
            case_id: item.case_id,
            finish_at: item.finish_at,
            reservation_at: item.reservation_at,
            objective: item.objective,
            patient_name: item.case ? item.case.patient_name : '',
            userName: item.user?.realname,
            type: item.type,
            status: item.status,
            invitee: item.invitee ? this.formatterInvitee(item.invitee) : '',
          };
        });
      }).finally(() => {
        this.loading = false;
        this.getTopCount();
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
      this.$router.push(`/consultation/record/${id}?readonly=true`);
    },
    editReport(id) {
      this.$router.push(`/consultation/record/${id}`);
    },
    submitReport(id) {
      this.$router.push(`/consultation/record/${id}`);
    },
    closePdfDialog() {
      this.pdf = '';
      this.pdfViewVisible = false;
      this.readonly = false;
    },
    reportCheckedFail() {
      this.uncheckedDialog = true;
      this.uncheckedReason = '';
    },
    reportChecked() {
      reportService.reportCheck(this.checkId, {
        status: '通过',
      }).then((res) => {
        if (res.status === 201) {
          this.$message.success('审核通过');
          setTimeout(() => {
            this.refreshTable();
            this.pdfViewVisible = false;
          }, 1000);
        }
      });
    },
    uncheckedDialogCancel() {
      this.uncheckedDialog = false;
    },
    uncheckedDialogConfirm() {
      if (this.uncheckedReason) {
        let params = {
          status: '不通过',
          reason: this.uncheckedReason,
        };
        reportService.reportCheck(this.checkId, params).then((res) => {
          this.$message.success('审核未通过,已通知申请医生。');
          this.uncheckedDialog = false;
          this.refreshTable();
          this.pdfViewVisible = false;
        });
      } else {
        this.$message.warning('请输入审核不通过原因。');
      }
    },
    viewReport(id) {
      this.pdfViewVisible = true;
      this.readonly = true;
      reportService.reportPrint({
        id: id,
      }).then((res) => {
        this.pdf = URL.createObjectURL(res.data);
      }).finally(() => {
        this.pdfViewVisible = true;
      });
    },
    closeUncheckedDialog() {
      this.uncheckedDialog = false;
      setTimeout(() => {
        this.readonly = false;
      }, 200);
    },
    viewReason(id) {
      recordService.report(id).then(({body}) => {
        if (body.consultation_report.reason) {
          this.uncheckedDialog = true;
          this.uncheckedReason = body.consultation_report.reason;
          this.readonly = true;
          this.checker = body.reportFail.user.realname;
          this.check_at = body.reportFail.operate_at;
        }
      });
    },
    tableStatusChange(val) {
      if (val) {
        this.getTable({status: [val]});
      } else {
        this.getTable({status: ['报告未通过', '报告已审核']});
      }
    },
    /**
     * 报告预览
     * @param {Array} id 报告id数组
     */
    async checkReport(id) {
      this.checkId = id;
      this.pdfViewVisible = true;
      this.readonly = false;
      reportService.reportPrint({
        id: id,
      }).then((res) => {
        this.pdf = URL.createObjectURL(res.data);
      }).finally(() => {
        this.pdfViewVisible = true;
      });
    },
    /**
     * 报告打印
     * @param {Array} id 报告id数组
     * @return {Promise} 返回报告地址
     */
    async reportPrint() {
      if (this.multipleSelection.length === 0) {
        this.$message.warning('请选择需要打印的报告。');
        return false;
      }
      let idArr = [];
      this.multipleSelection.forEach((item) => {
        idArr.push(item.id);
      });
      await reportService.reportPrint({id: idArr}).then((res) => {
        return this.printPdf = URL.createObjectURL(res.data);
      });
      this.$el.getElementsByClassName('printIfr')[0].onload = () => {
        setTimeout(() => {
          this.$el.getElementsByClassName('printIfr')[0].contentWindow.print();
        }, 100);
      };
    },
    /**
     * 报告下载
     * @param {Array} id 报告id数组
     * @return {boolean}
     */
    reportDownload() {
      if (this.multipleSelection.length === 0) {
        this.$message.warning('请选择需要下载的报告。');
        return false;
      }
      let idArr = [];
      this.multipleSelection.forEach((item) => {
        idArr.push(item.id);
      });
      recordService.reportPrint({id: idArr, download: 1}).then((res) => {
        let anchor = document.createElement('a');
        let objectUrl = URL.createObjectURL(res.data);
        anchor.setAttribute('href', objectUrl);
        anchor.setAttribute('target', '_blank');
        anchor.setAttribute('download', '病理报告.pdf');
        anchor.click();
        URL.revokeObjectURL(objectUrl);
      });
    },
  },
};
