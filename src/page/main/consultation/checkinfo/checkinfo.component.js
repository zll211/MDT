import mdtFormHeader from '@/common/components/mdtFormHeader';
import mdtFormFooter from '@/common/components/mdtFormFooter';
import mdtFileList from '@/common/components/mdtFileList';
import mdtFileViewDialog from '@/common/components/mdtFileViewDialog';
import {entryService} from '../../case/entry/entry.service';
import {checkService} from '../check/check.service';
import {areaArrToString} from '../../../../config/utils';
import {informationService} from '../../case/information/information.service';

export default {
  name: 'checkInfo',
  data() {
    return {
      mainContainHeight: -60,
      entryForm: {
        case_hospital: {},
        ext: {},
      },
      select: '',
      area: [],
      uncheckedDialog: false,
      uncheckedReason: '',
      checkedDialog: false,
      fileList: {},
      checkedForm: {
        invitee: [],
      },
      checkedFormRules: {
        reservation_at: [
          {required: true, message: '请选择会诊时间'},
        ],
        invitee: [
          {required: true, message: '请选择会诊医生'},
        ],
      },
      fileTypeList: [],
      fileUrlList: [],
      fileViewVisible: false,
      dialogTitle: '',
      viewFileType: 'DCM',
      hackReset: true,
      readonly: false,
      timestampDialog: false,
      activities: [],
      reportTimestampDialog: false,
      reportActivities: [],
    };
  },
  components: {
    mdtFormHeader,
    mdtFormFooter,
    mdtFileList,
    mdtFileViewDialog,
  },
 async created() {
    if (this.$route.query.readonly === 'true') {
      this.readonly = true;
    }
    await this.getArea();
  },
  mounted() {
    this.getEntryData();
    setTimeout(() => {
      this.getConsultationHistory(this.$route.query.id, {action: 'apply'});
      this.getReportHistory(this.$route.query.id, {action: 'report'});
    }, 100);
  },
  computed: {
    userList() {
      return this.$store.state.userList;
    },
  },
  methods: {
   async getArea() {
      entryService.getArea().then(({body}) => {
        return this.area = body.data;
      });
    },
    getEntryData() {
      if (this.$route.params.id) {
        let params = {
          include: ['ext', 'case_hospital'],
        };
        entryService.readCase(this.$route.params.id, params)
          .then((res) => {
            this.entryForm = res.body;
            this.entryForm.case_hospital = res.body.case_hospital ? res.body.case_hospital : {};
            this.entryForm.ext = res.body.ext ? res.body.ext : {};
            this.fileList = res.body.attachment;
            if (this.entryForm.native_place) {
              this.entryForm.native_place = areaArrToString(this.entryForm.native_place, this.area);
            }
            this.fileTypeList = Object.keys(res.body.attachment);
          });
      }
    },
    resetCheckForm() {
      this.$refs.checkedForm.resetFields();
      this.checkedForm = {
        invitee: [],
      };
    },
    submitForm() {
      this.checkedDialog = true;
    },
    cancelBtnClick() {
      this.uncheckedDialog = true;
      this.uncheckedReason = '';
    },
    uncheckedDialogCancel() {
      this.uncheckedDialog = false;
    },
    uncheckedDialogConfirm() {
      if (this.uncheckedReason) {
        let params = {
          id: this.$route.query.id,
          status: '不通过',
          reason: this.uncheckedReason,
        };
        checkService.ckecked(params).then((res) => {
          this.$message.success('审核未通过,已通知申请医生。');
          this.uncheckedDialog = false;
        });
      } else {
        this.$message.warning('请输入审核不通过原因。');
      }
    },
    checkedDialogCancel() {
      this.checkedDialog = false;
      this.resetCheckForm();
    },
    checkedDialogConfirm() {
      this.$refs.checkedForm.validate((valid) => {
        if (valid) {
          let params = Object.assign({
            id: this.$route.query.id,
            status: '通过',
          }, this.checkedForm);
          checkService.ckecked(params).then((res) => {
            this.$message.success('审核已通过,已通知会诊医生。');
            this.checkedDialog = false;
            this.$router.push('/consultation/check');
          });
        } else {
          return false;
        }
      });
    },
    viewFile(type) {
      if (type === '病理' || type === '超声' || type === '内镜' || type === '其他') {
        this.viewFileType = type;
      } else {
        this.viewFileType = 'DCM';
      }
      this.dialogTitle = type;
      this.fileUrlList = this.fileList[type].map((file) => {
        return file.path;
      });
      this.fileViewVisible = true;
      this.hackReset = true;
    },
    closeViewFileDialog() {
      this.fileViewVisible = false;
      this.hackReset = false;
      this.fileUrlList = [];
    },
    getConsultationHistory(id, {...rest}) {
      informationService.consultationAction(id, Object.assign({
        include: 'user',
      }, rest)).then(({body}) => {
        if (body.data.length > 2 && ['审核中', '未通过'].indexOf(this.entryForm.consultation_status) > -1) {
          this.$notify({
            title: '会诊审核',
            message: '点击查看会诊审核情况',
            duration: 10000,
            onClick: this.showHistory,
          });
        }
        this.activities = body.data.map((item) => {
          return {
            content: item.action,
            timestamp: item.operate_at,
            desc: item.desc,
            size: 'large',
            type: item.action === '会诊审核不通过'?'danger':'primary',
            user: item.user.realname,
          };
        });
      });
    },
    getReportHistory(id, {...rest}) {
      informationService.consultationAction(id, Object.assign({
        include: 'user',
      }, rest)).then(({body}) => {
        if (body.data.length > 2 && this.entryForm.consultation_status === '报告待审核') {
          this.$notify({
            title: '报告审核',
            message: '点击查看报告审核情况',
            duration: 10000,
            onClick: this.showReportHistory,
          });
        }
        this.reportActivities = body.data.map((item) => {
          return {
            content: item.action,
            timestamp: item.operate_at,
            desc: item.desc,
            size: 'large',
            type: item.action === '报告审核不通过'?'danger':'primary',
            user: item.user.realname,
          };
        });
      });
    },
    showHistory() {
      this.timestampDialog = true;
    },
    showReportHistory() {
      this.reportTimestampDialog = true;
    },
  },
  beforeDestroy() {
    this.$notify.closeAll();
  },
};
