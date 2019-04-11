import Vue from 'vue';
import {baseUrl} from 'src/config/utils';
import {from, throwError} from 'rxjs';
import {pluck, switchMap, map, catchError} from 'rxjs/operators';

export default class IMService {
  /**
   * 获取token
   * @param {string} roomName 房间名称
   * @return {Observable<*>}
   */
  static getRoomToken(roomName = '') {
    return Vue.http.post(`${baseUrl}/im/rooms`, {
      room_name: roomName,
    });
  }

  /**
   * 获取好友登录状态
   * @param {number} userId
   * @return {Observable<*>}
   */
  static getUserStatus(userId) {
    return from(Vue.http.get(`${baseUrl}/im/${userId}/online_status`));
  }

  /**
   * 发起Facetime
   * @param {int} userId
   * @return {Observable<*>}
   */
  static startFacetime(userId) {
    return from(Vue.http.get(`${baseUrl}/im/${userId}/online_status`)).pipe(
      catchError(error => throwError('当前不是好友，无法视频')),
      pluck('body', 'online_status'),
      switchMap(status => (status === 'online' ? IMService.getRoomToken() : throwError('好友不在线，无法视频'))),
      map(response => {
        if (response.ok) {
          return response.body;
        } else {
          // eslint-disable-next-line no-throw-literal
          throw '无法建立Facetime';
        }
      })
    );
  }
}
