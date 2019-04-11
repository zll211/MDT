import Vue from 'vue';
import {baseUrl} from '@/config/utils';

/**
 * 病例管理模块的服务
 * @class
 */
class InformationService {
  /**
   * @constructor
   */
  constructor() {}
  /**
   * 病例列表接口
   *  @param {Object} params
   * @return {Promise}
   */
  caseList(params) {
    return Vue.http.get(`${baseUrl}/case`, {params: params});
  }
  /**
   * 删除单个病例信息
   * @param {Object} params 需要的信息
   * @return {Promise}
   */
  deleteCase(params) {
    return Vue.http.delete(`${baseUrl}/case`, {body: params});
  }

  consultationAction(id, params) {
    return Vue.http.get(`${baseUrl}/consultation_action/${id}`, {params: params});
  }
}

const informationService = new InformationService();

export {informationService};
