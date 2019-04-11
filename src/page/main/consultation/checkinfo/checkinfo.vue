<template>
  <div class="checkinfo-page fill-contain flex column justify-content-between" v-height>
    <div class="main-contain" v-height="mainContainHeight">
      <mdt-form-header :form-name="'病人信息表'" :resetShow="false"></mdt-form-header>
      <div class="entry-form">
        <el-form :model="entryForm" ref="entryForm" label-width="80px" disabled>
          <div class="info-block bottom-line relative">
            <div class="info-header">
              <span class="info-header-icon info-header-icon1"></span><span>个人信息</span>
            </div>
            <el-row >
              <el-col :span="8">
                <el-form-item label="姓名" prop="patient_name">
                  <el-input v-model="entryForm.patient_name" size="small"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="性别" prop="gender">
                  <el-input v-model="entryForm.gender" size="small"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="年龄" prop="age">
                  <el-input v-model.number="entryForm.age" size="small"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-form-item label="婚否" prop="is_married" class="my-radio">
                  <el-radio-group v-model="entryForm.is_married" size="small" clearable>
                    <el-radio label="已婚"></el-radio>
                    <el-radio label="未婚"></el-radio>
                    <el-radio label="其他"></el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="民族" prop="nation">
                  <el-input v-model.number="entryForm.nation" size="small"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="籍贯" prop="native_place">
                  <el-input v-model="entryForm.native_place" size="small"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-form-item label="职业" prop="career">
                  <el-input v-model="entryForm.career" size="small"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="联系电话" prop="phone">
                  <el-input v-model="entryForm.phone" size="small"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label=" " prop="papers_type" class="papers-type-item">
                  <el-input placeholder="证件号" v-model="entryForm.papers_number" class="input-with-select" size="small">
                    <el-select v-model="entryForm.papers_type" slot="prepend" placeholder="请选择"  size="small" style="width: 85px">
                      <el-option label="身份证" value="身份证"></el-option>
                      <el-option label="居住证" value="居住证"></el-option>
                      <el-option label="护照" value="护照"></el-option>
                      <el-option label="军人证" value="军人证"></el-option>
                    </el-select>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
          <div class="info-block bottom-line">
            <div class="info-header">
              <span class="info-header-icon info-header-icon2"></span><span>医院信息</span>
            </div>
            <el-row>
              <el-col :span="8">
                <el-form-item label="就诊医院">
                  <el-input v-model.number="entryForm.case_hospital.hospital" size="small"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="就诊科室" prop="section">
                  <el-input v-model.number="entryForm.case_hospital.section" size="small"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="主治医生" prop="doctor">
                  <el-input v-model.number="entryForm.case_hospital.doctor" size="small"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-form-item label="就诊类别" prop="visiting_cate">
                  <el-input v-model.number="entryForm.case_hospital.visiting_cate" size="small"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="就诊时间" prop="visiting_time">
                  <el-input v-model.number="entryForm.case_hospital.visiting_time" size="small"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="门诊号" prop="outpatient_no">
                  <el-input v-model="entryForm.case_hospital.outpatient_no" size="small"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-form-item label="病历号" prop="case_no">
                  <el-input v-model="entryForm.case_hospital.case_no" size="small"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="住院号" prop="inpatient_no">
                  <el-input v-model="entryForm.case_hospital.inpatient_no" size="small"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="床号" prop="bed_no">
                  <el-input v-model="entryForm.case_hospital.bed_no" size="small"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
          <div class="info-block bottom-line">
            <div class="flex justify-content-between align-items-center pad-b-20">
              <div class="info-header mar-b-0">
                <span class="info-header-icon info-header-icon3"></span>
                <span>附件资料</span>
                <span class="file-count" v-if="this.fileList.length>0">共{{fileList.length}}个</span>
              </div>
            </div>
            <mdt-file-list :file-type-list="fileTypeList"
                           :file-list="fileList"
                           style="padding: 0 25px;"
                           @viewFile="viewFile">
            </mdt-file-list>
          </div>
          <div class="info-block">
            <el-form-item label="病情摘要" prop="summary">
              <el-input type="textarea"
                        :autosize="{ minRows: 4, maxRows: 6}"
                        v-model="entryForm.ext.summary"
                        size="small"
                        clearable>
              </el-input>
            </el-form-item>
            <el-form-item label="检验结果" prop="test_result">
              <el-input type="textarea"
                        :autosize="{ minRows: 4, maxRows: 6}"
                        v-model="entryForm.ext.test_result"
                        size="small"
                        clearable>
              </el-input>
            </el-form-item>
            <el-form-item label="检查报告" prop="check_report">
              <el-input type="textarea"
                        :autosize="{ minRows: 4, maxRows: 6}"
                        v-model="entryForm.ext.check_report"
                        size="small"
                        clearable>
              </el-input>
            </el-form-item>
          </div>
        </el-form>
      </div>
    </div>
    <mdt-form-footer @submitForm="submitForm('entryForm')"
                     v-if="!readonly&&!isOnlyOwner"
                     @cancelBtnClick="cancelBtnClick"
                     :firstBtn = "'不予通过'"
                     :lastBtn = "'审核通过'">
    </mdt-form-footer>
    <el-dialog title="审核未通过原因" :visible.sync="uncheckedDialog" :center="false" width="500px">
      <el-input type="textarea"
                v-model="uncheckedReason"
                :autosize="{ minRows: 4, maxRows: 6}"
                clearable
                placeholder="请输入审核未通过原因"
      ></el-input>
      <div slot="footer" class="dialog-footer flex justify-content-center">
        <el-button type="info" @click="uncheckedDialogCancel" size="small" style="width: 110px">取消</el-button>
        <el-button type="primary" @click="uncheckedDialogConfirm" size="small" style="width: 110px">确定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="确定会诊时间与医生" :visible.sync="checkedDialog" :center="false" width="500px">
      <el-form :model="checkedForm"
               :rules="checkedFormRules"
               ref="checkedForm"
               label-width="100px"
               label-position="right">
        <el-form-item label="会诊时间" prop="reservation_at">
          <el-date-picker
            v-model="checkedForm.reservation_at"
            type="datetime"
            placeholder="请选择会诊时间"
            default-time="12:00:00"
            value-format="yyyy-MM-dd HH:mm:ss"
            align="right"
            style="width: 260px;"
            clearable>
          </el-date-picker>
        </el-form-item>
        <el-form-item label="会诊医生" prop="invitee">
          <el-select v-model="checkedForm.invitee"
                     multiple
                     clearable
                     filterable
                     style="width: 260px;"
                     placeholder="请选择会诊医生">
            <el-option v-for="user in userList" :label="user.realname" :value="user.id" :key="user.id"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer flex justify-content-center">
        <el-button type="info" @click="checkedDialogCancel" size="small" style="width: 110px">取消</el-button>
        <el-button type="primary" @click="checkedDialogConfirm" size="small" style="width: 110px">确定</el-button>
      </div>
    </el-dialog>
    <mdt-file-view-dialog :file-view-visible="fileViewVisible"
                          :view-file-type="viewFileType"
                          :dialog-title="dialogTitle"
                          :hack-reset="hackReset"
                          :file-url-list="fileUrlList"
                          :readonly="readonly"
                          @dialogClose="closeViewFileDialog"></mdt-file-view-dialog>
    <el-dialog title="会诊审核时间线" :visible.sync="timestampDialog" center width="500px" class="timestamp-dialog">
    <div class="block">
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in activities"
          :key="index"
          :icon="activity.icon"
          :type="activity.type"
          :color="activity.color"
          :size="activity.size"
          :timestamp="activity.timestamp">
          {{activity.content}} / {{activity.user}}
          <p v-if="activity.desc">原因：{{activity.desc}}</p>
        </el-timeline-item>
      </el-timeline>
    </div>
    </el-dialog>
    <el-dialog title="报告审核时间线" :visible.sync="reportTimestampDialog" center width="500px" class="timestamp-dialog">
      <div class="block">
        <el-timeline>
          <el-timeline-item
            v-for="(activity, index) in reportActivities"
            :key="index"
            :icon="activity.icon"
            :type="activity.type"
            :color="activity.color"
            :size="activity.size"
            :timestamp="activity.timestamp">
            {{activity.content}} / {{activity.user}}
            <p v-if="activity.desc">原因：{{activity.desc}}</p>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-dialog>
  </div>
</template>

<script src="./checkinfo.component.js"></script>
<style lang="scss" src="./checkinfo.scss"></style>
