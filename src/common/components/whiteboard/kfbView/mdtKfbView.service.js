import Vue from 'vue';

import {baseUrl} from '@/config/utils';

/**
 * @class
 */
class MdtKfbViewService {
  getImageInfo(fileName) {
    return Vue.http.get(`${baseUrl}/kfb/info`, {params: {file: fileName}});
  }
  labelList(params) {
    return Vue.http.get(`${baseUrl}/annotation`, {params});
  }

  saveLabel(content, fileName) {
    return Vue.http.post(`${baseUrl}/annotation`, content, {params: {file: fileName}});
  }

  deleteLabel(id, fileName) {
    return Vue.http.delete(`${baseUrl}/annotation`, {params: {file: fileName}, body: {id: id}});
  }

  modifyLabel(id, content, fileName) {
    return Vue.http.patch(`${baseUrl}/annotation`, content, {params: {file: fileName}});
  }

  navigatorPointList(fileName) {
    return Vue.http.get(`${baseUrl}/annotation_above`, {params: {file: fileName}});
  }

  navigatorPoint(content, fileName) {
    return Vue.http.post(`${baseUrl}/annotation_above`, content, {params: {file: fileName}});
  }

  labelImageList(params) {
    return Vue.http.get(`${baseUrl}/kfb/labels`, {params});
  }

  labelCount(fileName) {
    return Vue.http.get(`${baseUrl}/annotation/count`, {params: {file: fileName}});
  }

  labelAverageInfo(fileName) {
    return Vue.http.get(`${baseUrl}/annotation/mean`, {params: {file: fileName}});
  }
  kfbImg(file, type) {
    return Vue.http.get(`${baseUrl}/kfb/get_image`, {params: {file, type}});
  }
}

const mdtKfbViewService = new MdtKfbViewService();

export {mdtKfbViewService};
