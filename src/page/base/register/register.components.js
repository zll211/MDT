export default {
  data() {
    const validatePassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'));
      } else {
        if (value !== this.registerForm.password) {
          callback(new Error('两次密码不一致'));
        }
        callback();
      }
    };
    return {
      showLeft: true,
      minWidth: '960px',
      message: '获取验证码',
      registerForm: {
        phone: '',
        password: '',
        code: '',
        confirm_password: '',
      },
      registerRules: {
        phone: [{required: true, message: '请输入手机号', trigger: 'blur'},
          {pattern: /^1[34578]\d{9}$/, message: '请填写正确手机号', trigger: ['blur', 'change']}],
        password: [{required: true, message: '请输入密码', trigger: 'blur'}],
        code: [{required: true, message: '请输入验证码', trigger: 'blur'}],
        confirm_password: [{validator: validatePassword, trigger: 'blur'}],
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
    },
    register(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          // login
        } else {
          return false;
        }
      });
    },
  },
};
