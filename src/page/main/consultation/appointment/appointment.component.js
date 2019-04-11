import mdtFormHeader from '../../../../common/components/mdtFormHeader';
import mdtFormFooter from '../../../../common/components/mdtFormFooter';
// import SparkMD5 from 'spark-md5';
import {appointmentService} from './appointment.service';
import {userService} from '../../user/user.service';
import {formatDateTime, debounce} from '../../../../config/utils';
import {informationService} from '../../case/information/information.service';

export default {
  name: 'appointment',
  data() {
    return {
      appointmentForm: {
        user_id: parseInt(window.sessionStorage.getItem('userId')),
      },
      rules: {
        user_id: [
          {required: true, message: '请选择申请人'},
        ],
        objective: [
          {required: true, message: '请填写申请目的', trigger: 'blur'},
        ],
      },
      fileList: [],
      mainContainHeight: -60,
      chunkSize: 1024 * 1024 * 10,
      progress: '',
      uploadData: {},
      userList: [],
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
   /* userList() {
      return this.$store.state.userList;
    },*/
   user() {
     return this.$store.state.user;
   },
  },
  created() {
    this.getUserList();
    this.getCaseList();
    this.getImportData();
  },
  mounted() {
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
      this.appointmentForm = {};
      this.caseTableSelection = [];
      this.caseId = '';
      this.casePatientName = '';
     // this.application_data = [];
     // this.fileList = [];
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (this.caseId) {
            let params = {
              type: '预约会诊',
              user_id: this.appointmentForm.user_id,
              case_id: this.caseId,
              objective: this.appointmentForm.objective,
              application_at: formatDateTime(new Date()),
              // application_data: this.application_data,
            };
            appointmentService.appointment(params).then((res) => {
              if (res.status === 201) {
                this.$message.success('预约会诊申请单已提交。');
                this.resetForm('appointmentForm');
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
   /* uploadHttpRequest({file, data}) {
      const totalNum = Math.floor(file.size / this.chunkSize) + 1;
      const md5 = new SparkMD5();
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        md5.appendBinary(e.target.result);
        this.uploadChunkFile(file, file.name, data, 1, totalNum, md5.end());
      };
      fileReader.readAsBinaryString(file);
    },*/
   /* uploadChunkFile(blob, fileName, data, num, totalNum, totalMd5) {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        let fd = new FormData();
        const md5 = new SparkMD5();
        md5.appendBinary(e.target.result);
        const chunkSize = num === totalNum ? blob.slice((num - 1) * this.chunkSize) : blob.slice((num - 1) * this.chunkSize, num * this.chunkSize);
        fd.append('blob', chunkSize);
        fd.append('filename', fileName);
        fd.append('num', num);
        fd.append('total_num', totalNum);
        fd.append('md5', md5.end());
        fd.append('total_md5', totalMd5);
        appointmentService.uploadFile(fd)
          .then(({body}) => {
            if (body.status_code === 200) {
              this.$set(data, 'progress', body.progress * 100);
              if (body.lack?.length > 0) {
                num = body.lack[0];
              } else {
                this.$set(data, 'progress', 0);
                return;
              }
              if (num > totalNum) {
                this.$set(data, 'progress', 0);
                return;
              }
              uploadFile();
            } else if (body.status_code === 0) {
              this.$set(data, 'progress', 0);
              this.$message.success('上传成功');
              this.application_data.push({filename: body.data.filename, path: body.data.path});
            } else {
              num++;
              uploadFile();
            }
          }).catch(() => {
          num++;
          uploadFile();
        });
      };

      const uploadFile = () => {
        if (num > totalNum) {
          this.$set(data, 'progress', 0);
          return;
        }
        const chunkSize = num === totalNum ? blob.slice((num - 1) * this.chunkSize) : blob.slice((num - 1) * this.chunkSize, num * this.chunkSize);
        fileReader.readAsBinaryString(chunkSize);
      };
      this.$set(data, 'progress', 1);
      uploadFile();
    },*/
  },
};
