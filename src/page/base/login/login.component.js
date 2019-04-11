import {httpHelperProvider} from '../../../config/http';
import {loginService} from './login.service';
import {baseRoutes, flatteningURLArray, formatDateTime} from '../../../config/utils';
import menus from '../../main/main.route';

export default {
  data() {
    const validatePassword = (rule, value, callback) => {
      if (this.activeName === '1' && value === '') {
        callback(new Error('请输入密码'));
      } else {
        callback();
      }
    };
    const validateCode = (rule, value, callback) => {
      if (this.activeName === '2' && value === '') {
        callback(new Error('请输入验证码'));
      } else {
        callback();
      }
    };
    return {
      showLeft: true,
      minWidth: '960px',
      message: '获取验证码',
      version: 'v1.0.0',
      activeName: '1',
      loginForm: {
        username: '',
        password: '',
        code: '',
        mobile: '',
        sms_key: undefined,
      },
      loginRules: {
        username: [
          {required: true, message: '请输入手机号/用户名', trigger: 'blur'}],
        mobile: [
          {required: true, message: '请输入手机号/用户名', trigger: 'blur'},
          {pattern: /^1[34578]\d{9}$/, message: '请填写正确手机号', trigger: ['blur', 'change']}],
        password: [{validator: validatePassword, trigger: 'blur'}],
        code: [{validator: validateCode, trigger: 'blur'}],
      },
    };
  },
  created() {
  },
  mounted() {
    this.isShowLeftImg();
    window.onresize = () => {
      this.isShowLeftImg();
    };
  },
  beforeDestroy() {
    window.onresize = null;
  },
  methods: {
    handleClick(tab) {
      this.activeName = tab;
    },
    isShowLeftImg() {
      const width = window.innerWidth;
      if (width < 960) {
        this.showLeft = false;
        this.minWidth = '480px';
      } else {
        this.showLeft = true;
        this.minWidth = '960px';
      }
    },
    getVerificationCode() {
      if (this.message !== '获取验证码') return;
      this.$refs.loginForm.validateField('mobile', (validError) => {
        if (!validError) {
          loginService.smsCode({mobile: this.loginForm.mobile})
            .then(({body}) => {
              this.loginForm.sms_key = body.sms_key;
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
            }).catch(() => {
            this.$message.error('获取验证码失败`');
          });
        }
      });
      // loginService.smsCode({mobile})
    },
    login(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          // login
          loginService.login(this.loginForm, this.activeName)
            .then(({body}) => {
              window.sessionStorage.setItem('accessToken',
                body.access_token);
              window.sessionStorage.setItem('userId',
                body.user.id);
              window.sessionStorage.setItem('loginTime',
                formatDateTime(new Date()));
              httpHelperProvider.setHeaders([{
                'Authorization':
                  `bearer ${body.access_token}`,
              }]);
              loginService.permission().then(({body}) => {
                this.$store.commit('setPermissions', body.data);
                this.$store.commit('setURL', [...baseRoutes, ...flatteningURLArray(menus, body.data)]);
                this.$store.commit('isLogin', true);
                this.$router.push('/main');
              });
            }).catch((e) => {
            this.$message.error(e.body?.message || '登录失败');
          });
        } else {
          return false;
        }
      });
    },
  },
};
