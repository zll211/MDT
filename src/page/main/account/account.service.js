import Vue from 'vue';
import {baseUrl} from '../../../config/utils';

class AccountService {
  /**
   * 编辑用户个人信息
   * @param {int} id 用户的id
   * @param {Object} params 用户个人信息
   * @return {Promise}
   */
  patchUser(id, params) {
    return Vue.http.put(`${baseUrl}/users/${id}`, params);
  }

  smsCode(data) {
    return Vue.http.post(`${baseUrl}/sms_code`, data);
  }

  changeMobile(data) {
    return Vue.http.patch(`${baseUrl}/user/mobile`, data);
  }
}

const accountService = new AccountService();

export {accountService};
