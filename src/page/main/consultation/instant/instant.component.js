import mdtFormHeader from '../../../../common/components/mdtFormHeader';
import mdtFormFooter from '../../../../common/components/mdtFormFooter';
// import SparkMD5 from 'spark-md5';
import {appointmentService} from '../appointment/appointment.service';
import {userService} from '../../user/user.service';
import {formatDateTime, debounce} from '../../../../config/utils';
import {informationService} from '../../case/information/information.service';

export default {
  name: 'instant',
  data() {
    return {
      instantForm: {
        invitee: [],
        user_id: parseInt(window.sessionStorage.getItem('userId')),
      },
      rules: {
        user_id: [
          {required: true, message: '请选择申请人'},
        ],
        objective: [
          {required: true, message: '请填写申请目的', trigger: 'blur'},
        ],
        invitee: [
          {required: true, message: '请选择会诊医生'},
        ],
      },
      fileList: [],
      mainContainHeight: '',
      chunkSize: 1024 * 1024 * 10, // 5M
      progress: '',
      userList: [],
      uploadData: {},
      application_data: [],
      importCaseDialog: false,
      caseTableLoading: false,
      caseTableData: [],
      caseList: [],
      pagination: {},
      searchInput: '',
      caseId: '',
      casePatientName: '',
      caseTableSelection: [],
    };
  },
  components: {
    mdtFormHeader,
    mdtFormFooter,
  },
  computed: {
    doctors() {
      return this.$store.state.userList;
    },
  },
  created() {
    this.mainContainHeight = window.innerHeight - 179 - 60 + 'px';
    this.getUserList();
    this.getCaseList();
    this.getImportData();
  },
  mounted() {
    window.onresize = () => {
      this.mainContainHeight = window.innerHeight - 179 - 60 + 'px';
    };
    this.$watch('searchInput', debounce(()=>{
      this.getCaseList({search: this.searchInput});
    }, 1000));
  },
  methods: {
    getImportData() {
      if (this.$route.query.id) {
        this.caseId = this.$route.query.id;
        this.casePatientName = this.$route.query.patient_name;
      }
    },
    getUserList() {
      userService.userList({page_size: 100}).then((res) => {
        if (res.status === 200) {
          this.userList = res.body.data;
        }
      });
    },
    getCaseList({page = 1, pageSize = 10, ...rest} = {
      page: 1,
      page_size: 10,
    }) {
      this.caseTableLoading = true;
      informationService.caseList(Object.assign({
        page: page,
        page_size: pageSize,
        filter: 1,
      }, rest)).then((res) => {
        this.pagination = res.body.meta.pagination;
        this.caseTableData = res.body.data.map((data) => {
          return {
            id: data.id,
            patient_name: data.patient_name,
            age: data.age + data.age_unit,
            gender: data.gender,
            papers_number: data.papers_number,
          };
        });
      }).finally(() => {
        this.caseTableLoading = false;
      });
    },
    handleCurrentChange(val) {
      this.getCaseList({page: val});
    },
    handleSelectionChange(val) {
      if (val.length > 1) {
        this.$message.error('只能选择一个会诊病人');
        return false;
      }
      this.caseTableSelection = val;
    },
    importInfo() {
      this.importCaseDialog = true;
      if (this.caseTableSelection.length === 0) this.getCaseList();
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
      this.instantForm = {
        invitee: [],
      };
      this.caseTableSelection = [];
      this.caseId = '';
      this.casePatientName = '';
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (this.caseId) {
            let params = {
              application_at: formatDateTime(new Date()),
              type: '即时会诊',
              user_id: this.instantForm.user_id,
              invitee: this.instantForm.invitee,
              case_id: this.caseId,
              objective: this.instantForm.objective,
              reservation_at: formatDateTime(new Date()),
            };
            appointmentService.appointment(params).then((res) => {
              if (res.status === 201) {
                this.$message.success('即时会诊申请单已提交。');
                this.resetForm('instantForm');
              }
            });
          } else {
            this.$message.error('请导入会诊病人资料。');
          }
        } else {
          return false;
        }
      });
    },
    caseTableRowClick(row) {
      this.$refs.caseTable.toggleRowSelection(row);
    },
    importCaseBtn() {
      if (this.caseTableSelection.length > 1) {
        this.$message.error('只能选择一个会诊病人。');
        return false;
      }
      if (this.caseTableSelection.length === 0) {
        this.$message.error('请选择一个会诊病人。');
        return false;
      }
      this.caseId = this.caseTableSelection[0].id;
      this.casePatientName = this.caseTableSelection[0].patient_name;
      this.importCaseDialog = false;
    },
    cancelImportCase() {
      this.importCaseDialog = false;
    },
    deleteCase() {
      this.caseTableSelection = [];
      this.caseId = '';
      this.casePatientName = '';
    },
  },
};
