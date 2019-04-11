import {mapState} from 'vuex';
import {accountService} from './account.service';

export default {
  data() {
    return {
      uploadHeaders: {'Authorization': `bearer ${window.sessionStorage.getItem('accessToken')}`},
      imgList: [],
      sexList: [{
        name: '男',
        value: '男',
        select: true,
      }, {
        name: '女',
        value: '女',
        select: false,
      }, {
        name: '保密',
        value: '保密',
        select: false,
      }],
      isEditRealName: false,
      lastRealName: '',
      mobileStep: 0,
      newMobile: undefined,
      code: undefined,
      message: '获取验证码',
      isModifyPwd: false,
      newPassword: undefined,
      confirmPassword: undefined,
    };
  },
  computed: {
    ...mapState(['user']),
    roles() {
      return this.user?.roles?.data || [];
    },
  },
  created() {
  },
  mounted() {
  },
  methods: {
    editRealName() {
      this.lastRealName = this.user.realname;
      this.isEditRealName = true;
    },
    cancelEditRealName() {
      this.lastRealName = undefined;
      this.isEditRealName = false;
    },
    confirmEditRealName() {
      this.saveUser({
        realname: this.lastRealName,
      }).then(({body}) => {
        if (body) {
          this.$message.success('修改名称成功');
          this.$store.commit('setUser', {...this.user, ...body});
          this.cancelEditRealName();
        }
      }).catch(() => {
        this.$message.error('修改名称失败');
      });
    },
    changeMobile() {
      this.mobileStep = 1;
      this.newMobile = undefined;
      this.message = '获取验证码';
      this.code = undefined;
      this.sms_key = undefined;
    },
    nextEditPhone() {
      if (!this.newMobile) {
        this.$message.error('请输入新的手机号');
        return;
      }
      if (!this.code) {
        this.$message.error('请输入验证码');
        return;
      }
      accountService.changeMobile({sms_key: this.sms_key, code: this.code})
        .then(({body}) => {
          this.$store.commit('setUser', {...this.user, ...body});
          this.mobileStep = 0;
        }).catch(({body}) => {
        this.$message.error(body?.message || '修改手机号失败`');
      });
    },
    cancelEditPhone() {
      this.mobileStep = 0;
      this.newMobile = undefined;
      this.message = '获取验证码';
      this.code = undefined;
      this.sms_key = undefined;
    },
    getVerificationCode() {
      if (this.message !== '获取验证码') return;
      if (!this.newMobile) {
        this.$message.error('请输入新的手机号');
        return;
      }
      if (!/^1[34578]\d{9}$/.test(this.newMobile)) {
        this.$message.error('手机号格式不正确');
        return;
      }
      accountService.smsCode({mobile: this.newMobile, type: 'modify'})
        .then(({body}) => {
          this.sms_key = body.sms_key;
          let time = 59;
          this.message = `${time}s 后重发`;
          const timerId = setInterval(() => {
            time--;
            if (time === 0) {
              this.message = '获取验证码';
              clearInterval(timerId);
            } else {
              this.message = `${time}s 后重发`;
            }
          }, 1000);
        }).catch(({body}) => {
        this.$message.error(body?.message || '获取验证码失败`');
      });
    },
    modifyPassword() {
      this.isModifyPwd = true;
    },
    cancelEditPwd() {
      this.isModifyPwd = false;
      this.newPassword = undefined;
      this.confirmPassword = undefined;
    },
    confirmEditPwd() {
      if (this.newPassword !== this.confirmPassword) {
        this.$message.error('两次密码输入不一致');
        return;
      }
      this.saveUser({
        password: this.newPassword,
      }).then(({body}) => {
        if (body) {
          this.$message.success('修改密码成功');
          this.cancelEditPwd();
        }
      }).catch(() => {
        this.$message.error('修改密码失败');
      });
    },
    handlePictureCardPreview(file) {
      // this.dialogImaccountServiceageUrl = file.url;
      // this.dialogVisible = true;
    },
    uploadImgSuccess(response, file, fileList) {
      this.saveUser({
        avatar: response.data.src,
      }).then(({body}) => {
        if (body) {
          this.$store.commit('setUser', {...this.user, ...body});
          this.$message.success('上传头像成功');
          this.cancelEditPwd();
        }
      }).catch(() => {
        this.$message.error('上传头像码失败');
      });
    },
    selectSex(sex) {
      this.saveUser({
        gender: sex.value,
      }).then(({body}) => {
        if (body) {
          this.$store.commit('setUser', {...this.user, ...body});
        }
      });
    },
    saveUser(params) {
      return accountService.patchUser(this.user.id, params);
    },
  },
};
