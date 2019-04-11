import mdtFormHeader from '../../../../common/components/mdtFormHeader';
import mdtFormFooter from '../../../../common/components/mdtFormFooter';
// import SparkMD5 from 'spark-md5';
import {recordService} from './record.service';
import opinion from './content/opinion';
import report from './content/report';

export default {
  name: 'record',
  data() {
    return {
      recordForm: {},
      tabList: [
        {
          name: '会诊意见',
          active: true,
        },
        {
          name: '会诊报告',
          active: false,
        },
      ],
      mainContainHeight: -60,
      consultationOpinion: '',
      reportContent: '',
      description: '',
      imgList: [],
      readonly: false,
      pdfViewVisible: false,
      pdf: '',
    };
  },
  components: {
    mdtFormHeader,
    mdtFormFooter,
    opinion,
    report,
  },
  created() {
    this.readonly = this.$route.query.readonly === 'true';
  },
  mounted() {
  },
  methods: {
    tabChange(tabName) {
      this.tabList.forEach((tab) =>{
        tab.active = tab.name === tabName;
      });
    },
    submitForm() {
      if (this.tabList[0].active) {
        let params = {
          id: this.$route.params.id,
          option_content: this.consultationOpinion,
        };
       recordService.setOpinion(params).then((res) => {
         if (res.status === 201) {
           this.$message.success('会诊意见已提交。');
         }
       });
      } else {
        let params = {
          id: this.$route.params.id,
          report_content: this.reportContent,
          description: this.description,
          report_img: this.imgList.map((img) => {
            return {
              filename: img.name,
              path: img.url,
            };
          }),
        };
        recordService.saveReport(params).then((res) => {
          if (res.status === 201) {
            this.$message.success('会诊报告已保存。');
          }
        }).catch((err) => {
          if (err.status === 403) {
            this.$message.error(err.body.message);
          }
        });
      }
    },
    opinionChange(val) {
      this.consultationOpinion = val;
    },
    reportChange(reportContent, description, imgList) {
      this.reportContent = reportContent;
      this.description = description;
      this.imgList = imgList;
    },
    reportCheck() {
      let params = {
        id: this.$route.params.id,
        report_content: this.reportContent,
        description: this.description,
        action: 'submit',
        report_img: this.imgList.map((img) => {
          return {
            filename: img.name,
            path: img.url,
          };
        }),
      };
      recordService.saveReport(params).then((res) => {
        if (res.status === 201) {
          this.$message.success('会诊报告已提交审核。');
          setTimeout(() => {
            this.$router.push('/consultation/report');
          }, 1500);
        }
      }).catch((err) => {
        if (err.status === 403) {
          this.$message.error(err.body.message);
        }
      });
    },
    reportView() {
      let params = {
        id: this.$route.params.id,
      };
      recordService.reportPrint(params).then((res) => {
        // 预览报告pdf
        this.pdf = URL.createObjectURL(res.data);
      }).finally(()=>{
        this.pdfViewVisible = true;
      });
    },
    closePdfDialog() {
      this.pdfViewVisible = false;
      this.pdf = '';
    },
  },
};
