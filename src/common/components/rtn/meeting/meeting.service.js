import Vue from 'vue';
import {baseUrl} from 'src/config/utils';
export default class MeetingService {
  static getMeetingInfo(id) {
    return Vue.http.get(`${baseUrl}/consultation_person/${id}`, {
      params: {
        include: 'user.organization,user.hospital,case',
      },
    });
  }
  static finishConsultation(id) {
    return Vue.http.post(`${baseUrl}/consultation_finish`, {
      id,
    });
  }
}
