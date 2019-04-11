import Vue from 'vue';
import {baseUrl} from '@/config/utils';

class HomeService {
  consultationCount() {
    return Vue.http.get(`${baseUrl}/consultation_amount`);
  }
}

export const homeService = new HomeService();
