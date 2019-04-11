<template>
  <div class="opinion-content">
    <div class="opinion-container">
      <el-row class="patient-info opinion-section">
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
      <el-row class="opinion-section">
        <el-col :span="24">
          <span style="margin-right: 15px;">会诊目的</span><span>{{consultationInfo.objective}}</span>
        </el-col>
      </el-row>
      <el-row class="opinion-section">
        <el-col :span="3" class="flex">
          <span style="margin-right: 15px;">会诊资料</span>
        </el-col>
        <el-col :span="17">
          <mdt-file-list :file-type-list="fileTypeList"
                         :file-list="patientInfo.attachment"
                         @viewFile="viewFile">
          </mdt-file-list>
        </el-col>
        <el-col :span="4" class="flex justify-content-center">
          <span>共{{fileTypeList.length}}个</span>
        </el-col>
      </el-row>
      <el-row class="opinion-section">
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
      <el-row class="opinion-section">
        <el-col :span="8">
          <span>会诊开始时间：</span><span>{{consultationInfo.reservation_at}}</span>
        </el-col>
        <el-col :span="8">
          <span>会诊结束时间：</span><span>{{consultationInfo.finish_at}}</span>
        </el-col>
      </el-row>
      <el-row class="opinion-section doctor-opinion">
        <el-col :span="3">
          <span>会诊意见</span>
        </el-col>
        <el-col :span="21">
          <div v-for="(item, index) in consultationInfo.invitee" :key="index">
            <div class="doctor-list">
                <span class="department-name">
                  {{item.user.organization?item.user.organization.name:'未知科室'}}
                </span><span class="doctor-name">{{item.user.realname}}</span>
            </div>
            <div class="doctor-opinion-content">
              <el-input v-if="userInfo.id === item.user.id"
                        type="textarea"
                        :autosize="{ minRows: 4, maxRows: 6}"
                        :readonly="readonly"
                        size="small"
                        clearable
                        placeholder="请输入会诊意见"
                        v-model="consultationOpinion"></el-input>
              <p v-if="userInfo.id !== item.user.id">
                {{item.consultation_option?item.consultation_option.content:'暂未填写'}}</p>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
    <mdt-file-view-dialog :file-view-visible="fileViewVisible"
                          :view-file-type="viewFileType"
                          :hack-reset="hackReset"
                          :dialog-title="dialogTitle"
                          :file-url-list="fileUrlList"
                          @dialogClose="closeViewFileDialog"></mdt-file-view-dialog>
  </div>
</template>

<script>
  import {recordService} from '../record.service';
  import MdtDicomView from '@/common/components/mdtDicomView/mdtDicomView';
  import mdtFileList from '@/common/components/mdtFileList';
  import mdtFileViewDialog from '@/common/components/mdtFileViewDialog';
  export default {
    name: 'opinion',
    components: {
      MdtDicomView,
      mdtFileList,
      mdtFileViewDialog,
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
        consultationOpinion: '',
        fileTypeList: [],
        fileViewVisible: false,
        fileUrlList: [],
        dialogTitle: '',
        viewFileType: 'DCM',
        hackReset: true,
      };
    },
    watch: {
      consultationOpinion() {
        this.$emit('opinionChange', this.consultationOpinion);
      },
    },
    props: {
      readonly: false,
    },
    computed: {
      userInfo() {
        return this.$store.state.user;
      },
    },
    created() {
      this.getInfo(this.$route.params.id);
    },
    mounted() {
    },
    methods: {
      getInfo(id) {
        recordService.opinion(id, {include: 'case'}).then(({body}) => {
          this.patientInfo = body.case;
          this.consultationInfo.user = body.user;
          this.consultationInfo.application_at = body.application_at;
          this.consultationInfo.reservation_at = body.reservation_at;
          this.consultationInfo.finish_at = body.finish_at;
          this.consultationInfo.objective = body.objective;
          this.consultationInfo.invitee = body.invitee;
          this.consultationInfo.invitee.forEach((user) => {
            if (user.user_id === window.sessionStorage.getItem('userId')) {
              this.consultationOpinion = user.consultation_option ? user.consultation_option.content : '';
            }
          });
          this.fileTypeList = Object.keys(body.case.attachment);
        });
      },
      viewFile(type) {
        if (type === '病理'||type === '超声'||type === '内镜'||type === '其他') {
          this.viewFileType = type;
        } else {
          this.viewFileType = 'DCM';
        }
        this.dialogTitle = type;
        this.fileUrlList = this.patientInfo.attachment[type].map((file) => {
          return file.path;
        });
        this.fileViewVisible = true;
        this.hackReset = true;
      },
      closeViewFileDialog() {
        this.hackReset = false;
        this.fileViewVisible = false;
        this.fileUrlList = [];
      },
    },
  };
</script>

<style lang="scss">
  @import "../../../../../style/variables";

  .opinion-content {
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

    .opinion-container {
      width: 746px;
      margin: 0 auto;

      .opinion-section {
        color: #515151;
        padding: 30px 0;
        border-bottom: 1px solid rgba(235, 238, 243, 1);

        &:last-child {
          border-bottom: none;
        }
      }

      .doctor-opinion {
        .doctor-list {
          .department-name {
            font-weight: bold;
            padding-right: 10px;
            border-right: 1px solid rgba(235, 238, 243, 1);
          }

          .doctor-name {
            padding-left: 10px;
            font-weight: bold;
          }
        }

        .doctor-opinion-content {
          min-height: 50px;
          padding: 10px 0;
          word-break: break-all;
          margin-bottom: 15px;
          border-bottom: 1px solid rgba(235, 238, 243, 1);
        }
      }
    }
  }
</style>
