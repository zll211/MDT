import Vue from 'vue';
import {baseUrl} from '../../../../config/utils';

class AppointmentService {
  uploadFile(data) {
    return Vue.http.post(`${baseUrl}/upload_file`, data);
  }

  consultation(params) {
    return Vue.http.get(`${baseUrl}/consultation`, {params: params});
  }

  appointment(params) {
    return Vue.http.post(`${baseUrl}/consultation`, params);
  }
}

export const appointmentService = new AppointmentService();
