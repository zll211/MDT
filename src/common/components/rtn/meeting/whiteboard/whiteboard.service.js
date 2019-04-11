/* eslint-disable no-unused-vars, no-console */
import {WhiteWebSdk} from 'white-web-sdk';
import Vue from 'vue';
import {from} from 'rxjs';
import {map, pluck} from 'rxjs/operators';
import {baseUrl} from 'src/config/utils';
export default class WhiteboardService {
  constructor() {
    this.whiteWebSdk = new WhiteWebSdk();
  }
  /**
   * 进入白板房间
   * @param {string} uuid uuid
   * @param {string} roomToken roomToken
   * @param {string} container container
   */
  async joinRoom({uuid, roomToken, container}) {
    this.room = await this.whiteWebSdk.joinRoom({uuid, roomToken});
    this.room.bindHtmlElement(container);
  }

  async getToken(uuid) {
    const response = await Vue.http.put(`${baseUrl}/white/get_token`, {uuid});
    return response;
  }

  static createWhiteboard() {
    return from(Vue.http.post(`${baseUrl}/white/create`, {type: 'transitory'})).pipe(
      pluck('body', 'data')
    );
  }
}
