import Vue from 'vue';
import {baseUrl} from '@/config/utils';

class StatisticService {
  consultationStatistic(params) {
    return Vue.http.get(`${baseUrl}/statistic`, {params: params});
  }
}

export const statisticService = new StatisticService();
