import Vue from 'vue';
import VueResource from 'vue-resource';

Vue.use(VueResource);

/**
 * http服务
 * @class
 */
class HttpHelperProvider {
  /**
   * @constructor
   */
  constructor() {
  }

  /**
   * 设置http请求通用头
   * @param {Array} headers
   */
  setHeaders(headers) {
    const {hasOwnProperty} = Object.prototype;
    headers.forEach((params) => {
      for (let key in params) {
        if (params::hasOwnProperty(key)) {
          Vue.http.headers.common[key] = params[key];
        }
      }
    });
  }

  /**
   * 在http请求的时候进行拦截
   * @param {HttpHelperProvider~requestCallback} callback 处理回调函数
   */
  request(callback) {
    Vue.http.interceptors.push(callback);
  }

  /**
   * 在http响应的时候进行拦截
   * @param {HttpHelperProvider~requestCallback} callback 处理回调函数
   */
  response(callback) {
    Vue.http.interceptors.push(() => callback);
  }
}

const httpHelperProvider = new HttpHelperProvider();

if (window.sessionStorage.getItem('accessToken')) {
  httpHelperProvider.setHeaders([{
    'Authorization': `bearer ${window.sessionStorage.getItem('accessToken')}`,
  }]);
}

export {httpHelperProvider};

