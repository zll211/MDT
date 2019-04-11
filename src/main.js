import './polyfill';
import ElementUI from 'element-ui';
import './style/element-variables.scss';
import Vue from 'vue';
import App from './App';
import {baseRoutes, flatteningURLArray} from './config/utils';
import {httpHelperProvider} from './config/http';
import {router} from './router/';
import store from './store/';
import {moveDirective, heightDirective} from './common/directive';
import menus from './page/main/main.route';
import {loginService} from './page/base/login/login.service';
import roleMixins from '@/common/mixins/role.mixins';

browserVersion().finally(() => {
  isLogin().finally(() => {
    // 加载路由页面
    baseRoutes.forEach(name => require(`./page/base${name}${name}.route`));
    require('./page/main/main.route');
    Vue.directive('move', moveDirective);
    Vue.directive('height', heightDirective);
    Vue.config.productionTip = false;
    Vue.use(ElementUI);
    Vue.mixin(roleMixins);
    // Vue.use(Viewer);
    new Vue({
      el: '#app',
      router,
      store,
      template: '<App/>',
      components: {App},
    });
    // 注册全局方法，便于在 im 中调用
    window.joinFaceTime = facetimeInfo => {
      store.commit('setConsultationInfo', facetimeInfo);
    };
  });
});

/**
 * 进行http request拦截，在请求之间做一些操作
 * @callback HttpHelperProvider~requestCallback
 */
httpHelperProvider.request((request) => {
});

/**
 * 进行http response拦截，在处理返回之前做通用的操作处理
 * @callback HttpHelperProvider~requestCallback
 */
httpHelperProvider.response((response) => {
  if (response.status === 401 && response.url !== '/api/login') {
    window.sessionStorage.clear();
    store.commit('isLogin', false);
    // router.push('/login');
    // 为了关闭LayIM
    window.location.href = '/';
  }
});

/**
 * 判断是否有权限进入特定的页面
 */
router.beforeEach((to, from, next) => {
  // console.log('toPath:' + to.path);
  // console.log('fromPath:' + from.path);
  // console.log(store.state.isLogin);
  // 不是登录状态
  if (!store.state.isLogin) {
    // 可去往基础页面
    if (baseRoutes.includes(to.path) || to.path === '/') {
      next(true);
    } else if (from.path === '/') {
      next('/login');
    } else {
      // 阻止前往主页面
      next(false);
    }
    // 登录状态
    // 阻止前往登录或注册页面
  } else if (to.path === '/login' || to.path === '/register') {
    // 如果是从基础页面跳转，则直接进入主页面
    if (baseRoutes.includes(from.path) || from.path === '/') {
      next('/main');
    } else {
      // 如果是从其他页面跳转，不做任何处理
      next(false);
    }
    // 如果是在url地址允许范围内，则前往，否则去到404页面
  } else if (store.state.urlList.find((uri) => ~to.path.indexOf(uri))) {
    next(true);
  } else {
    next('/404');
  }
  // next(true);
});

/**
 * 判断是否登录
 */
async function isLogin() {
  const _token = window.sessionStorage.getItem('accessToken');
  if (_token) {
    // Todo： 从服务器获取菜单权限
    await loginService.permission().then(({body}) => {
      store.commit('setPermissions', body.data);
      store.commit('setURL', [...baseRoutes, ...flatteningURLArray(menus, body.data)]);
      store.commit('isLogin', true);
    }).catch(() => {
      store.commit('setURL', baseRoutes);
      store.commit('isLogin', false);
      window.sessionStorage.clear();
    });
  } else {
    store.commit('setURL', baseRoutes);
    store.commit('isLogin', false);
    window.sessionStorage.clear();
    // router.push('/login');
  }
}

async function browserVersion() {
  const arr = navigator.userAgent.split(' ');
  let chromeVersion = '';
  for (let i = 0; i < arr.length; i++) {
    if (/chrome/i.test(arr[i])) {
      chromeVersion = arr[i];
    }
  }
  if (chromeVersion) {
    chromeVersion = Number(chromeVersion.split('/')[1].split('.')[0]);
    if (chromeVersion < 40) {
      window.location.replace('/static/browser/');
    }
  } else {
    window.location.replace('/static/browser/');
  }
}
