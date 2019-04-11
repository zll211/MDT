import Vue from 'vue';

import {baseUrl} from '@/config/utils';

/**
 * 登录模块的服务
 * @class
 */
class LoginService {
  /**
   * @constructor
   */
  constructor() {
  }

  /**
   * 登录接口
   * @param {Object} params 登录所需的信息
   * @param {string} params.username - 登录用户名
   * @param {string} params.password - 登录密码
   * @param {number} type - 登录类型，1是密码登录，2短信登录
   * @return {Promise}
   */
  login(params, type) {
    if (type === '1') {
      return Vue.http.post(`${baseUrl}/login`, params);
    }
    if (type === '2') {
      return Vue.http.post(`${baseUrl}/sms_login`, params);
    }
  }

  /**
   * 登出
   * @return {Promise}
   */
  logout() {
    return Vue.http.post(`${baseUrl}/logout`);
  }

  permission() {
    return Vue.http.get(`${baseUrl}/user/permissions`);
  }

  smsCode(data) {
    return Vue.http.post(`${baseUrl}/sms_code`, data);
  }
}

const loginService = new LoginService();

export {loginService};
