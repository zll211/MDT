<template>
  <div class="report-content">
    <div class="report-container">
      <el-row class="patient-info report-section">
        <el-col :span="5">
          <span>患者姓名：</span><span>{{patientInfo.patient_name}}</span>
        </el-col>
        <el-col :span="4">
          <span>性别：</span><span>{{patientInfo.gender}}</span>
        </el-col>
        <el-col :span="4">
          <span>年龄：</span><span>{{patientInfo.age}}</span>
        </el-col>
        <el-col :span="5">
          <span>民族：</span><span>{{patientInfo.nation}}</span>
        </el-col>
        <el-col :span="6">
          <span>联系电话：</span><span>{{patientInfo.phone}}</span>
        </el-col>
        <el-col :span="24" style="margin-top: 20px;">
          <span>病情摘要：</span><span>{{patientInfo.ext.summary}}</span>
        </el-col>
      </el-row>
      <el-row class="report-section">
        <el-col :span="24">
          <span style="margin-right: 15px;">会诊目的</span><span>{{consultationInfo.objective}}</span>
        </el-col>
      </el-row>
      <el-row class="report-section">
        <el-col :span="8">
          <span>申请科室：</span><span>{{consultationInfo.user.organization?consultationInfo.user.organization.name:''}}</span>
        </el-col>
        <el-col :span="8">
          <span>申请医生：</span><span>{{consultationInfo.user.realname}}</span>
        </el-col>
        <el-col :span="8">
          <span>申请时间：</span><span>{{consultationInfo.application_at}}</span>
        </el-col>
      </el-row>
      <el-row class="report-section">
        <el-col :span="8">
          <span>会诊开始时间：</span><span>{{consultationInfo.reservation_at}}</span>
        </el-col>
        <el-col :span="8">
          <span>会诊结束时间：</span><span>{{consultationInfo.finish_at}}</span>
        </el-col>
      </el-row>
      <el-row class="report-section">
        <el-col :span="3">
          <span>报告附图</span>
        </el-col>
        <el-col :span="21">
          <el-upload
            action="/api/upload_image"
            list-type="picture-card"
            :headers="uploadHeaders"
            :file-list="imgList"
            :disabled="readonly"
            :on-success="uploadImgSuccess"
            :on-preview="handlePictureCardPreview"
            :on-remove="handleRemove">
            <i class="el-icon-plus"></i>
          </el-upload>
          <el-dialog :visible.sync="dialogVisible">
            <img width="100%" :src="dialogImageUrl" alt="">
          </el-dialog>
        </el-col>
      </el-row>
      <el-row class="report-section">
        <el-col :span="3">
          <span>会诊描述</span>
        </el-col>
        <el-col :span="21">
          <editable-div v-model="description" :contenteditable="!readonly"></editable-div>
        </el-col>
      </el-row>
      <el-row class="report-section">
        <el-col :span="3">
          <span>会诊结论</span>
        </el-col>
        <el-col :span="21">
          <editable-div v-model="reportContent" :contenteditable="!readonly"></editable-div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
  import {recordService} from '../record.service';
  import editableDiv from '../../../../../common/components/mdtEditableDiv';

  export default {
    name: 'report',
    components: {
      editableDiv,
    },
    data() {
      return {
        patientInfo: {
          ext: {
            attachment: [],
          },
        },
        consultationInfo: {
          user: {
            organization: {},
          },
          invitee: [],
        },
        reportContent: '',
        description: '',
        dialogImageUrl: '',
        dialogVisible: false,
        uploadAction: '',
        imgList: [],
        uploadHeaders: {'Authorization': `bearer ${window.sessionStorage.getItem('accessToken')}`},
      };
    },
    props: {
      readonly: false,
    },
    watch: {
      reportContent() {
        this.$emit('reportChange', this.reportContent, this.description, this.imgList);
      },
      description() {
        this.$emit('reportChange', this.reportContent, this.description, this.imgList);
      },
      imgList() {
        this.$emit('reportChange', this.reportContent, this.description, this.imgList);
      },
    },
    computed: {
      userInfo() {
        return this.$store.state.user;
      },
    },
    created() {
      this.getReport(this.$route.params.id);
    },
    mounted() {
    },
    methods: {
      getReport(id) {
        recordService.report(id).then(({body}) => {
          this.patientInfo = body.case;
          this.consultationInfo.user = body.user;
          this.consultationInfo.application_at = body.application_at;
          this.consultationInfo.reservation_at = body.reservation_at;
          this.consultationInfo.finish_at = body.finish_at;
          this.consultationInfo.objective = body.objective;
          this.consultationInfo.invitee = body.invitee;
          this.consultationInfo.invitee.forEach((user) => {
            if (user.user_id === window.sessionStorage.getItem('userId')) {
              this.consultationOpinion = user.consultation_option?user.consultation_option.content:'';
            }
          });
          this.reportContent = body.consultation_report?body.consultation_report.content:'';
          this.description = body.consultation_report?body.consultation_report.description:'';
          this.imgList = body.consultation_report?body.consultation_report.report_img?body.consultation_report.report_img.map((img) => {
            return {
              name: img.filename,
              url: img.path,
            };
          }):[]:[];
        });
      },
      handleRemove(file, fileList) {
        this.imgList = fileList;
      },
      handlePictureCardPreview(file) {
        this.dialogImageUrl = file.url;
        this.dialogVisible = true;
      },
      uploadImgSuccess(response, file, fileList) {
        this.imgList = fileList;
        this.imgList[this.imgList?this.imgList.length-1:0].url = response.data.path;
      },
    },
  };
</script>

<style scoped lang="scss">
  @import "../../../../../style/variables";

  .report-content {
    border-radius: 5px;
    width: 100%;
    min-width: 1200px;
    max-width: 1200px;
    overflow: hidden;
    @include respond-to(lg) {
      max-width: 1000px;
      min-width: 1000px;
    }
    @include respond-to(md) {
      max-width: 900px;
      min-width: 900px;
    }
    @include respond-to(sm) {
      max-width: 800px;
      min-width: 800px;
    }
    background-color: #ffffff;
    margin: 0 auto;
    padding: 10px 0;

    .report-container {
      width: 746px;
      margin: 0 auto;

      .report-section {
        color: #515151;
        padding: 30px 0;
        border-bottom: 1px solid rgba(235, 238, 243, 1);
        &:last-child{
          border-bottom: none;
        }
      }
    }
  }
</style>
