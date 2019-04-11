import Vue from 'vue';
import {baseUrl} from '../../../../config/utils';

class CheckService {
  consultation(params) {
    return Vue.http.get(`${baseUrl}/consultation`, {params: params});
  }

  ckecked(params) {
    return Vue.http.post(`${baseUrl}/data_verify`, params);
  }

  result(id) {
    return Vue.http.get(`${baseUrl}/data_verify/${id}`, {params: {include: 'applyFail.user'}});
  }

  getApplyCount() {
    return Vue.http.get(`${baseUrl}/verify_count`);
  }
}

export const checkService = new CheckService();
