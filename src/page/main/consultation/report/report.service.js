import Vue from 'vue';
import {baseUrl} from '../../../../config/utils';

class ReportService {
  reportCheck(id, params) {
    return Vue.http.post(`${baseUrl}/consultation_report_review/${id}`, params);
  }

  reportPrint(params) {
    return Vue.http.post(`${baseUrl}/consultation_report_pdf`, params, {responseType: 'blob'});
  }

  getApplyCount() {
    return Vue.http.get(`${baseUrl}/report_count`);
  }
}

export const reportService = new ReportService();
