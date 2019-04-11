/* eslint-disable no-empty */
import Vue from 'vue';
import {baseUrl} from 'src/config/utils';
export default class WebWatchService {
  /**
   * 上报错误
   * @param {string} description 错误描述
   * @param {Error} error 错误对象
   */
  static reportError(description, error) {
    let content = description;
    if (error) {
      if (typeof error === 'string') {
        content += ` ${error}`;
      } else {
        content += WebWatchService.handleAjaxError(error);
      }
    }
    Vue.http.post(`${baseUrl}/error_record`, {content});
  }
  /**
   * 转换 AjaxError to String
   * @param {AjaxError} error ajax错误
   * @return {String}
   */
  static handleAjaxError(error) {
    let msg = '';
    try {
      if (error.url) {
        if (error.url) {
          msg += `url=${error.url} `;
        }
        if (error.body) {
          msg += `message=${error.body.message} `;
          msg += `class=${error.body.debug.class} `;
          msg += `file=${error.body.debug.file} `;
          msg += `line=${error.body.debug.line} `;
        }
      }
    } catch (e) {}
    return msg;
  }
}
