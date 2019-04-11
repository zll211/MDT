import Vue from 'vue';
import {baseUrl} from '../../../../config/utils';

class ApplyService {
  consultation(params) {
    return Vue.http.get(`${baseUrl}/consultation`, {params: params});
  }

  deleteConsultation(params) {
    return Vue.http.delete(`${baseUrl}/consultation`, {body: params});
  }

  patchConsultation(id) {
    return Vue.http.patch(`${baseUrl}/consultation/${id}`);
  }

  getApplyCount() {
    return Vue.http.get(`${baseUrl}/apply_count`);
  }
}

export const applyService = new ApplyService();
