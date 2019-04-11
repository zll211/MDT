import Vue from 'vue';
import {baseUrl} from '@/config/utils';

/**
 * 病例信息信息录入模块的服务
 * @class
 */
class EntryService {
  /**
   * @constructor
   */
  constructor() {}
  /**
   * 新增病例接口
   * @param {Object} data 新增病例所需信息
   * @return {Promise}
   */
  addCase(data) {
    return Vue.http.post(`${baseUrl}/case`, data);
  }
  /**
   * 查看单个病例信息
   * @param {number} id 所需id
   * @param {Object} params 所需信息
   * @return {Promise}
   */
  readCase(id, params) {
    return Vue.http.get(`${baseUrl}/case/${id}`, {params: params});
  }
  /**
   * 修改病例信息
   * @param {number} id 所需id
   * @param {Object} data 所需信息
   * @return {Promise}
   */
  editCase(id, data) {
    return Vue.http.patch(`${baseUrl}/case/${id}`, data);
  }
  /**
   * 上传附件
   * @param {Object} data 用户个人信息
   * @return {Promise}
   */
  uploadFile(data) {
    return Vue.http.post(`${baseUrl}/upload_file`, data);
  }
  /**
   * 获取籍贯信息
   * @return {Promise}
   */
  getArea() {
    return Vue.http.get(`${baseUrl}/region`);
  }
}

const entryService = new EntryService();

export {entryService};
