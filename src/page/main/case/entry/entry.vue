<template>
  <div class="entry-page fill-contain flex column justify-content-between" v-height>
    <!--:style="{height: mainContainHeight}"-->
    <div class="main-contain" v-height="mainContainHeight" >
      <mdt-form-header :form-name="'病人信息录入表'" @resetForm="resetForm('entryForm')"></mdt-form-header>
      <div class="entry-form">
        <el-form :model="entryForm" :rules="rules" ref="entryForm" label-width="80px">
          <div class="info-block bottom-line relative">
            <div class="info-header">
              <span class="info-header-icon info-header-icon1"></span><span>个人信息</span>
            </div>
            <p style="position: absolute;right: 10px;top: 10px;color: #F56C6C;font-size: 14px">带 * 为必填选项</p>
            <el-row >
              <el-col :span="8">
                <el-form-item label="姓名" prop="patient_name">
                  <el-input v-model="entryForm.patient_name" size="small">
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="性别" prop="gender">
                  <el-radio-group v-model="entryForm.gender" size="small" clearable>
                    <el-radio label="男"></el-radio>
                    <el-radio label="女"></el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="年龄" prop="age">
                  <el-input v-model.number="entryForm.age" style="width: 55%" size="small" clearable></el-input>
                  <el-select v-model="entryForm.age_unit" style="width: 40%" size="small">
                    <el-option label="岁" value="岁"></el-option>
                    <el-option label="月" value="月"></el-option>
                    <el-option label="天" value="天"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-form-item label="婚否" prop="marital_status" class="my-radio">
                  <el-radio-group v-model="entryForm.marital_status" size="small" clearable>
                    <el-radio label="已婚"></el-radio>
                    <el-radio label="未婚"></el-radio>
                    <el-radio label="其他"></el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="民族" prop="nation">
                  <el-select v-model="entryForm.nation" filterable clearable placeholder="请选择民族" size="small">
                    <el-option
                      v-for="item in nationOptions"
                      :key="item"
                      :label="item"
                      :value="item">
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="籍贯" prop="native_place">
                  <el-cascader
                    class="origin-cascader"
                    placeholder="请选择籍贯"
                    :options="area"
                    change-on-select
                    filterable
                    v-model="entryForm.native_place"
                    expand-trigger="click"
                    separator=""
                    clearable
                    size="small"
                    @change="handleChange"
                  >
                  </el-cascader>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-form-item label="职业" prop="career">
                  <el-input v-model="entryForm.career" size="small" clearable></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="联系电话" prop="phone">
                  <el-input v-model="entryForm.phone" size="small" clearable ></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item prop="papers_type" class="my-papers-number">
                  <el-input placeholder="证件号"  v-model="entryForm.papers_number" class="input-with-select" size="small">
                    <el-select style="width: 100px" v-model="entryForm.papers_type" slot="prepend" placeholder="请选择"  size="small">
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
                <el-form-item label="病历号" prop="case_no">
                  <el-input v-model="entryForm.case_no" size="small" clearable></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="就诊医院" prop="hospital">
                  <el-input v-model="entryForm.hospital" size="small" clearable ></el-input>
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item label="主治医生" prop="doctor">
                  <el-input v-model="entryForm.doctor" size="small" clearable ></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-form-item label="就诊科室" prop="department">
                  <el-input v-model="entryForm.section" size="small" clearable ></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="就诊类别" prop="categories">
                  <el-select v-model="entryForm.visiting_cate" filterable clearable placeholder="请选择" size="small">
                    <el-option
                      v-for="(item,index) in cateList"
                      :label="item"
                      :value="item"
                      :key="index">
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="就诊时间" prop="date">
                  <el-date-picker
                    v-model="entryForm.visiting_time"
                    type="datetime"
                    value-format="yyyy-MM-dd  HH:mm:ss"
                    placeholder="就诊时间"
                    size="small">
                  </el-date-picker>
                </el-form-item>
              </el-col>

            </el-row>
            <el-row>
              <el-col :span="8">
                <el-form-item label="门诊号" prop="outpatient_no">
                  <el-input v-model="entryForm.outpatient_no" size="small" clearable></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="住院号" prop="inpatient_no">
                  <el-input v-model="entryForm.inpatient_no" size="small" clearable></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="床号" prop="bed_no">
                  <el-input v-model="entryForm.bed_no" size="small" clearable></el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
          <div class="info-block bottom-line">
            <div class="flex justify-content-between align-items-center pad-b-20">
              <div class="info-header mar-b-0">
                <span class="info-header-icon info-header-icon3"></span>
                <span>附件资料</span>
                <span class="file-count" v-if="this.fileCount>0">共{{fileCount}}个</span>
              </div>
              <div><el-button size="medium" round  @click="openUploadDialog"><i class="el-icon-plus"></i>添加附件</el-button></div>
            </div>
            <div class="upload-list">
              <mdt-file-list :file-type-list="fileNameArr"
                             :delete-icon="true"
                             :file-list="showFileList"
                             @viewFile="viewFile"
                             @deleteFile="deleteFile">
              </mdt-file-list>
            </div>
          </div>
          <div class="info-block">
            <el-form-item label="病情摘要" prop="summary">
              <el-input type="textarea"
                        :autosize="{ minRows: 4, maxRows: 6}"
                        v-model="entryForm.summary"
                        style="width: 660px"
                        size="small"
                        clearable>
              </el-input>
            </el-form-item>
            <el-form-item label="检验结果" prop="test_result">
              <el-input type="textarea"
                        :autosize="{ minRows: 4, maxRows: 6}"
                        v-model="entryForm.test_result"
                        style="width: 660px"
                        size="small"
                        clearable>
              </el-input>
            </el-form-item>
            <el-form-item label="检查报告" prop="check_report">
              <el-input type="textarea"
                        :autosize="{ minRows: 4, maxRows: 6}"
                        v-model="entryForm.check_report"
                        style="width: 660px"
                        size="small"
                        clearable>
              </el-input>
            </el-form-item>
          </div>
        </el-form>
      </div>
    </div>
    <mdt-form-footer @submitForm="submitForm('entryForm', '/case/information')"
                     v-if="!isOnlyOwner&&!this.$route.query.readonly"
                     :extraBtn="this.$route.query.id?'':'提交并导入'"
                     @extraBtnClick="importBtn()"></mdt-form-footer>
    <el-dialog
      :visible.sync="uploadDialogVisible"
      width="370px"
      center>
      <div style="line-height: 30px;">
        <p class="text-center">支持CR、DR、CT、MRI、DSA、RF、US格式附件</p>
        <p class="text-center" style="color: #E6A23C;">文件大小不超过200M</p>
        <div class="flex justify-content-between">
          <el-select v-model="fileType" size="small" placeholder="请选择影像格式" @change="onSelectChange" :disabled="fileTypeDisabled">
            <el-option
              v-for="item in fileTypeOptions"
              :key="item"
              :label="item"
              :value="item">
            </el-option>
          </el-select>
          <el-upload
            class="upload-demo"
            action="/api/upload_file"
            multiple
            :accept="accept"
            :show-file-list="false"
            :http-request="uploadHttpRequest"
            :disabled="!this.fileType">
            <el-button size="small" type="primary" :disabled="!this.fileType">上传附件</el-button>
          </el-upload>
        </div>
        <div class="file-list"
             v-for="(item, index) in fileList"
             :key="index">
          <div class="flex align-items-center justify-content-between" style="border-bottom: 1px solid #EBEEF3;width: 100%;padding: 5px 0;">
            <div class="flex align-items-center">
              <i class="el-icon-document"></i>
              <p class="file-name ellipsis">{{item.filename}}</p>
            </div>
            <i class="el-icon-delete" @click="deleteFileList(index)"></i>
          </div>
          <el-progress v-if="item.progress>0 && item.progress<100" :percentage="item.progress"></el-progress>
        </div>
      </div>
      <div slot="footer" class="dialog-footer flex justify-content-center">
        <el-button @click="uploadDialogVisible = false" size="small" >取 消</el-button>
        <el-button type="primary" @click="ensureUpload" size="small" >确 定</el-button>
      </div>
    </el-dialog>
    <mdt-file-view-dialog :file-view-visible="fileViewVisible"
                          :view-file-type="viewFileType"
                          :dialog-title="dialogTitle"
                          :hack-reset="hackReset"
                          :file-url-list="fileUrlList"
                          @dialogClose="closeViewFileDialog"></mdt-file-view-dialog>
    <el-dialog
      :visible.sync="consultationWayVisible"
      class="consultation-way"
      :show-close="false"
      width="300px">
      <div class="flex justify-content-around">
        <el-button type="primary"  size="small" style="width: 100px" @click="submitForm('entryForm', '/consultation/appointment')">预约会诊</el-button>
        <el-button type="primary"  size="small" style="width: 100px" width="100px" @click="submitForm('entryForm', '/consultation/instant')">即时会诊</el-button>
      </div>
    </el-dialog>
  </div>

</template>

<script>
  import mdtFormHeader from '../../../../common/components/mdtFormHeader';
  import mdtFormFooter from '../../../../common/components/mdtFormFooter';
  import {entryService} from './entry.service';
  import SparkMD5 from 'spark-md5';
  import MdtFileList from '../../../../common/components/mdtFileList';
  import mdtFileViewDialog from '../../../../common/components/mdtFileViewDialog';
  export default {
    name: 'entry',
    data() {
      return {
        accept: '',
        mainContainHeight: -60,
        entryForm: {
          age_unit: '岁',
          papers_type: '身份证',
        },
        input5: '',
        select: '',
        cateList: ['住院', '外科'],
        rules: {
          patient_name: [
            {required: true, message: '请输入姓名', trigger: 'blur'},
          ],
          gender: [
            {required: true, message: '请输入性别', trigger: 'blur'},
          ],
          age: [
            {type: 'number', message: '年龄必须为数字值', trigger: 'blur'},
          ],
          phone: [
            {pattern: /^1[34578]\d{9}$/, message: '请填写正确手机号', trigger: 'blur'},
          ],
          case_no: [
            {required: true, message: '请输入病历号', trigger: 'blur'},
          ],
        },
        area: [],
        nationOptions: ['汉族', '蒙古族', '回族', '藏族', '维吾尔族', '苗族', '彝族', '壮族', '布依族', '朝鲜族', '满族', '侗族', '瑶族', '白族', '土家族',
          '哈尼族', '哈萨克族', '傣族', '黎族', '傈僳族', '佤族', '畲族', '高山族', '拉祜族', '水族', '东乡族', '纳西族', '景颇族', '柯尔克孜族',
          '土族', '达斡尔族', '仫佬族', '羌族', '布朗族', '撒拉族', '毛南族', '仡佬族', '锡伯族', '阿昌族', '普米族', '塔吉克族', '怒族', '乌孜别克族',
          '俄罗斯族', '鄂温克族', '德昂族', '保安族', '裕固族', '京族', '塔塔尔族', '独龙族', '鄂伦春族', '赫哲族', '门巴族', '珞巴族', '基诺族'],
        uploadDialogVisible: false,
        fileList: [],
        fileNameArr: [],
        showFileList: {},
        chunkSize: 1024 * 1024 * 5, // 5M
        progress: '',
        fileCount: 0,
        fileType: '',
        fileTypeOptions: ['CT', 'MRI', 'CR', 'DR', 'DSA', 'RF', 'US', '超声', '内镜', '病理', '心电图', '其他'],
        fileTypeDisabled: false,
        viewFileType: 'DCM',
        dialogTitle: '',
        hackReset: true,
        fileViewVisible: false,
        fileUrlList: [],
        consultationWayVisible: false,
      };
    },
    components: {
      MdtFileList,
      mdtFormHeader,
      mdtFormFooter,
      mdtFileViewDialog,
    },
    created() {
      this.mainContainHeight = -60;
      this.getEntryData();
      this.getArea();
    },
    mounted() {
    },
    methods: {
      // 上传附件格式限制
      onSelectChange(val) {
        let list = {
          'CT': '.dcm',
          'MRI': '.dcm',
          'CR': '.dcm',
          'DR': '.dcm',
          'DSA': '.dcm',
          'RF': '.dcm',
          'US': '.dcm',
          '超声': '.jpg, .png, .gif, .jpeg',
          '内镜': '.jpg, .png, .gif, .jpeg',
          '病理': '.kfb ',
          '心电图': '',
          '其他': '',
        };
        this.accept = list[val];
      },
      // 查看单个病例
      getEntryData() {// 判断是否是编辑病例，是的话读取病例信息
        if (this.$route.query.id) {
          let params = {
            include: 'ext,case_hospital',
          };
          entryService.readCase(this.$route.query.id, params)
            .then(({body}) => {
              let {ext, ...items} = body;
              this.entryForm = {...this.entryForm, ...items, ...ext};
              delete this.entryForm.case_hospital;
              if (items.case_hospital && items.case_hospital.id) {
                this.entryForm = {...this.entryForm, ...items.case_hospital};
              }
              if (body.native_place) {
                if (typeof (body.native_place) === 'string') {
                  this.entryForm.native_place = JSON.parse(body.native_place).length ? JSON.parse(body.native_place) : [];
                } else {
                  this.entryForm.native_place = body.native_place;
                }
              } else {
                this.entryForm.native_place = [];
              }
              if (body.attachment) {
                this.showFileList = body.attachment;
                this.getFileCount();
              }
              this.entryForm.age = this.entryForm.age ? this.entryForm.age *1 : null;
            });
        }
      },
      // 提交录入表
      submitForm(formName, path) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            // let params = this.entryForm;
            // 过滤空字段
            let {ext, ...entryForm} = this.entryForm;
            let params = {};
            let attachment = [];
            for (let index in entryForm) {
              if (entryForm[index]) {
                params[index] = entryForm[index];
              }
            }
            for (let index in ext) {
              if (ext[index]) {
                params[index] = ext[index];
              }
            }
            for (let key in this.showFileList) {
              if (this.showFileList[key] && this.showFileList[key].length) {
                this.showFileList[key].map((item)=>{
                  attachment.push({
                    filename: item.filename,
                    path: item.path,
                    type: item.type,
                  });
                });
              }
            }
            params.attachment = attachment;
            if (this.$route.query.id) {// 判断是修改病例还是新增病例
              entryService.editCase(this.$route.query.id, params).then((res) => {
                if (res.status === 201) {
                  this.$message.success('提交成功');
                  if (path === '/case/information') {
                    this.$router.push({path: path});
                  } else {
                     this.$router.push({path: path, query: {id: res.body.id, patient_name: res.body.patient_name}});
                  }
                }
              }).catch(() => {
                this.$message.error('提交失败');
              });
            } else {
              entryService.addCase(params).then((res) => {
                if (res.status === 201) {
                  this.$message.success('提交成功');
                  if (path === '/case/information') {
                    this.$router.push({path: path});
                  } else {
                     this.$router.push({path: path, query: {id: res.body.id, patient_name: res.body.patient_name}});
                  }
                }
              }).catch(() => {
                this.$message.error('提交失败');
              });
            }
          }
        });
      },
      // 提交并导入
      importBtn() {
        this.consultationWayVisible = true;
      },
      // 重置录入表
      resetForm(formName) {
        this.$refs[formName].resetFields();
        this.entryForm = {};
        this.showFileList = {};
        this.getFileCount();
      },
      // 上传附件模态框里的删除文件
      deleteFileList(index) {
        this.fileList.splice(index, 1);
      },
      // 预览文件
      viewFile(type) {
        if (type === '病理'||type === '超声'||type === '内镜'||type === '其他') {
          this.viewFileType = type;
        } else {
          this.viewFileType = 'DCM';
        }
        this.dialogTitle = type;
        this.fileUrlList = this.showFileList[type].map((file) => {
          return file.path;
        });
        this.fileViewVisible = true;
        this.hackReset = true;
      },
      // 关闭预览
      closeViewFileDialog() {
        this.fileViewVisible = false;
        this.hackReset = false;
        this.fileUrlList = [];
      },
      // 覆盖默认上传
      uploadHttpRequest({file, data}) {
        const totalNum = Math.floor(file.size / this.chunkSize) + 1;
        const md5 = new SparkMD5();
        const fileReader = new FileReader();
        fileReader.onload = (e) => {
          md5.appendBinary(e.target.result);
          this.fileList.push({filename: file.name, progress: 0, path: '', type: this.fileType});
          this.uploadChunkFile(file, file.name, data, 1, totalNum, md5.end(), this.fileList.length - 1);
        };
        fileReader.readAsBinaryString(file);
      },
      uploadChunkFile(blob, fileName, data, num, totalNum, totalMd5, fileListIndex) {
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
          entryService.uploadFile(fd)
            .then(({body}) => {
              this.fileList[fileListIndex].progress = body.progress * 100;
              if (body.status_code === 200) {
                // this.$set(data, 'progress', body.progress * 100);
                if (body.lack?.length > 0) {
                  num = body.lack[0];
                } else {
                  // this.$set(data, 'progress', 0);
                  return;
                }
                if (num > totalNum) {
                  // this.$set(data, 'progress', 0);
                  return;
                }
                uploadFile();
              } else if (body.status_code === 0) {
                // this.$set(data, 'progress', 0);
                this.fileList[fileListIndex].path = body.data.path;
                this.fileTypeDisabled = true;
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
            // this.$set(data, 'progress', 0);
            return;
          }
          const chunkSize = num === totalNum ? blob.slice((num - 1) * this.chunkSize) : blob.slice((num - 1) * this.chunkSize, num * this.chunkSize);
          fileReader.readAsBinaryString(chunkSize);
        };
        // this.$set(data, 'progress', 1);
        uploadFile();
      },
      // 获取已上传文件总数
      getFileCount() {
        this.fileCount = 0;
        if (this.showFileList) {
          let showFileList = {};
          for (let key in this.showFileList) {
            // 过滤没有文件的类别
            if (this.showFileList[key] && this.showFileList[key].length) {
              this.fileCount = this.fileCount + this.showFileList[key].length;
              showFileList[key] = this.showFileList[key];
            }
          }
          this.showFileList = showFileList;
          this.fileNameArr = Object.keys(showFileList);
        }
      },
      // 上传文件模态框里的确认
      ensureUpload() {
        if (this.fileList.length) {
          let unSuccess = this.fileList.filter((item) => item.progress !== 100);
          if (unSuccess.length) {
            return this.$message('请等待文件上传完成');
          }
          this.fileList = this.fileList.map(({progress, ...item}) => ({...item}));
          this.fileList.map((item)=>{
            if (this.showFileList[item.type]) {
              this.showFileList[item.type] = [...this.showFileList[item.type], {...item}];
            } else {
              this.showFileList[item.type] = [{...item}];
            }
          });
          this.getFileCount();
          this.fileList = [];
          this.fileType = '';
          this.uploadDialogVisible = false;
        } else {
          this.$message('请上传文件');
        }
      },
      deleteFile(type, index) {
        this.showFileList[type].splice(index, 1);
        this.getFileCount();
      },
      getArea() {
        entryService.getArea().then(({body}) => {
          this.area = body.data;
        });
      },
      handleChange(value) {
        this.entryForm.native_place = value;
      },
      openUploadDialog() {
        this.fileTypeDisabled = false;
        this.uploadDialogVisible = true;
        this.fileList = [];
        this.fileType = '';
      },
    },
  };
</script>

<style lang="scss">
  @import "../../../../style/variables";
  .entry-page{
    position: relative;
    width: 100%;

    .main-contain {
      overflow-y: auto;
      overflow-x: hidden;
      padding: 50px 0;
      margin: 0 auto;
      width: 100%;
    }
    .my-radio{
      .el-radio{
        margin-right: 8px;
        .el-radio__label{
          padding-left: 4px;
        }
      }
    }

    .entry-form{
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
      position: relative;
      .el-form{
        padding: 40px 45px;
        margin: 0 auto;
        .info-header{
          display: flex;
          align-items: center;
          margin-bottom: 20px;
          .file-count{
            color: #A2A7AF;
            padding-left: 10px;
          }
          .info-header-icon{
            display:inline-block;
            width:20px;
            height:20px;
            background-size:cover;
            margin-right:6px;
          }
          .info-header-icon1{
            background: url("../../../../assets/images/entry-personal.png");
          }
          .info-header-icon2{
            background: url("../../../../assets/images/entry-hospital.png");
          }
          .info-header-icon3{
            background: url("../../../../assets/images/entry-data.png");
          }
        }
        .el-select,.el-date-editor,.el-cascader{
          width: 100%;
        }
        .my-papers-number{
          .el-form-item__content{
            margin-left: 40px !important;
          }
        }
        .mar-b-0{
          margin-bottom: 0;
        }
        .pad-b-20{
          padding-bottom: 20px;
        }
      }
      .upload-list{
        margin-bottom: 20px;
      }
      .bottom-line{
        border-bottom: 1px solid #EBEEF3;
        margin-bottom: 20px;
      }
    }
    .file-list{
      margin-bottom: 10px;
      .file-name{
        width: 260px;
        line-height: 20px;
      }
      .el-icon-document{
        color: #A2A7AF;
        padding-right: 6px;
      }
      .el-icon-delete{
        cursor: pointer;
        color: #A2A7AF;
      }
    }
    .consultation-way{
      .el-dialog__header{
        padding: 0;
      }
    }
  }
</style>
