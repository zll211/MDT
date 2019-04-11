import Vue from 'vue';
import {baseUrl} from '../../../../config/utils';

class RecordService {
  uploadFile(data) {
    return Vue.http.post(`${baseUrl}/upload_file`, data);
  }

  consultation(params) {
    return Vue.http.get(`${baseUrl}/consultation`, {params: params});
  }

  record(params) {
    return Vue.http.post(`${baseUrl}/consultation`, params);
  }

  opinion(id, params) {
    return Vue.http.get(`${baseUrl}/consultation_option/${id}`, {params: params});
  }

  setOpinion(params) {
    return Vue.http.post(`${baseUrl}/consultation_option`, params);
  }

  report(id) {
    return Vue.http.get(`${baseUrl}/consultation_report/${id}`, {params: {include: 'reportFail.user'}});
  }

  saveReport(params) {
    return Vue.http.post(`${baseUrl}/consultation_report`, params);
  }

  reportPrint(params) {
    return Vue.http.post(`${baseUrl}/consultation_report_pdf`, params, {responseType: 'blob'});
  }
}

export const recordService = new RecordService();
