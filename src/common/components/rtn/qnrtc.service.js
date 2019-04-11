/* eslint-disable no-console, no-unused-vars */
import * as QNRTC from 'pili-rtc-web';
import {from, Observable, throwError} from 'rxjs';
import {exhaustMap, tap, switchMap} from 'rxjs/operators';
import {baseUrl} from 'src/config/utils';
import Vue from 'vue';
export class VideoType {
  static camera = 'camera';
  static screen = 'screen';
}
export default class QNRTCService {
  room = null;
  /**
   * 构造函数
   * @param {string} username 用户名
   */
  constructor({username}) {
    // 创建实例
    this.username = username;
    this.room = new QNRTC.TrackModeSession();
  }
  /**
   * 加入房间
   * @param {string} roomName 房间号
   * @return {Observable}
   */
  joinRoom(roomName) {
    return from(Vue.http.post(`${baseUrl}/im/rooms`, {room_name: roomName})).pipe(
      exhaustMap(response => {
        if (response.body.token) {
          return this.room.joinRoomWithToken(response.body.token);
        } else {
          return throwError('无效的房间号');
        }
      })
    );
  }
  /**
   * 统计本机有哪些音视频设备
   * @return {*}
   */
  static countDevices() {
    const devices = QNRTC.deviceManager.deviceInfo;
    console.log('countDevices', devices);
    let videoDevices = [];
    let audioDevices = [];
    if (Array.isArray(devices)) {
      devices.forEach(i => {
        if (i.kind === 'videoinput') {
          videoDevices.push({
            label: i.label,
            value: i.deviceId,
          });
        } else if (i.kind === 'audioinput') {
          audioDevices.push({
            label: i.label,
            value: i.deviceId,
          });
        }
      });
    }
    return {
      videoDevices,
      audioDevices,
    };
  }
  /**
   * 获取本地流
   * @param {*} params 获取本地流的参数
   * @return {[]}
   */
  async getLocalTracks(params) {
    return await QNRTC.deviceManager.getLocalTracks(params);
  }
  /**
   * 播放视频
   * @param {string} deviceId 设备id
   * @param {Element} container 容器
   * @return {Observable}
   */
  playVideo({deviceId, container}) {
    const params = {
      video: {enabled: true, tag: `${this.username}&video`, deviceId, width: 1280, height: 720},
    };
    return from(this.clearVideo()).pipe(
      exhaustMap(_ => this.getLocalTracks(params)),
      exhaustMap(tracks => this.clearScreen(tracks)),
      tap(tracks => {
        this.currentScreenTracks = tracks;
        this.currentScreenTracks.forEach(track => {
          track.play(container);
        });
      }),
      exhaustMap(tracks => this.room.publish(tracks))
    );
  }
  /**
   * 播放音频
   * @param {string} deviceId 设备id
   * @return {Observable}
   */
  playAudio(deviceId) {
    const params = {
      audio: {enabled: true, tag: `${this.username}&audio`, deviceId},
    };
    return from(this.clearAudio()).pipe(
      exhaustMap(_ => this.getLocalTracks(params)),
      tap(tracks => (this.currentAudioTracks = tracks)),
      exhaustMap(tracks => this.room.publish(tracks))
    );
  }
  /**
   * 分享屏幕
   * @param {dom} container
   * @param {Function} onended 屏幕共享停止后的回调
   * @return {Observable}
   */
  shareScreen(container, onended) {
    const params = {
      screen: {enabled: true, tag: `${this.username}&screen`, source: 'window', bitrate: 600, width: 1280, height: 720},
    };
    return from(this.clearScreen()).pipe(
      exhaustMap(_ => this.getLocalTracks(params)),
      exhaustMap(tracks => this.clearVideo(tracks)),
      tap(tracks => {
        this.currentScreenTracks = tracks;
        this.currentScreenTracks.forEach(track => {
          // 自己是不看自己共享的屏幕的
          // track.play(container);
          // 监听用户停止屏幕共享的操作
          track.mediaTrack.onended = () => {
            if (onended) onended();
            console.log('屏幕共享关闭');
          };
        });
      }),
      exhaustMap(tracks => this.room.publish(tracks))
    );
    // if (this.currentScreenTracks) {
    //   await this.unpublish(this.currentScreenTracks);
    //   this.currentScreenTracks = null;
    // }
    // this.currentScreenTracks = await this.getLocalTracks(params);
    // if (this.currentVideoTracks) {
    //   await this.unpublish(this.currentVideoTracks);
    //   this.currentVideoTracks = null;
    // }
    // this.currentScreenTracks.forEach(track => {
    //   track.play(container);
    //   // 监听用户停止屏幕共享的操作
    //   track.mediaTrack.onended = () => {
    //     console.log('屏幕共享关闭');
    //   };
    // });
    // await this.room.publish(this.currentScreenTracks);
  }
  /**
   * 退订
   * @param {[]} trackInfoList 流
   */
  async unsubscribe(trackInfoList) {
    const ids = trackInfoList.map(info => info.trackId);
    console.log('unsubscribe ids', ids);
    await this.room.unsubscribe(ids);
  }
  /**
   * 自动订阅流
   * @param {*} subscribe 订阅函数
   * @param {*} unsubscribe 退订函数
   */
  autoSubscribeTrack(subscribe, unsubscribe) {
    subscribe(this.room.trackInfoList)
      .then(() => console.log('subscribe success!'))
      .catch(e => console.error('subscribe error', e));

    // 添加事件监听，当房间中出现新的 Track 时就会触发，参数是 trackInfo 列表
    this.room.on('track-add', trackInfoList => {
      console.warn('get track-add event!', trackInfoList);
      subscribe(trackInfoList)
        .then(() => console.log('subscribe success!'))
        .catch(e => console.error('subscribe error', e));
    });

    // 添加事件监听，当房间中移除 Track 时就会触发，参数是 trackInfo 列表
    this.room.on('track-remove', trackInfoList => {
      console.warn('get track-remove event!', trackInfoList);
      unsubscribe(trackInfoList)
        .then(() => console.log('unsubscribe success!'))
        .catch(e => console.error('unsubscribe error', e));
    });
  }
  /**
   * 监听设备新增、拔出、更新函数
   * @param {*} cb 回调
   */
  autoSubscribeDevice({add, remove, update}) {
    // 添加事件监听，有新的媒体设备插入
    this.room.on('device-add', MediaDeviceInfo => {
      console.warn('get device-add event!', MediaDeviceInfo);
      if (add) {
        add();
      }
    });

    // 添加事件监听，有媒体设备拔出
    this.room.on('device-remove', MediaDeviceInfo => {
      console.warn('get device-remove event!', MediaDeviceInfo);
      if (remove) {
        remove();
      }
    });

    // 添加事件监听，媒体设备列表更新
    this.room.on('device-update', MediaDeviceInfo => {
      console.warn('get device-update event!', MediaDeviceInfo);
      if (update) {
        update();
      }
    });
  }
  /**
   * 取消发布
   * @param {[]} tracks 本地已经发布的音视频轨
   */
  async unpublish(tracks) {
    tracks.forEach(i => i.release());
    await this.room.unpublish(tracks.map(track => track.info.trackId));
  }

  /**
   * 清除视频流
   */
  async clearAudio() {
    if (this.currentAudioTracks) {
      await this.unpublish(this.currentAudioTracks);
      this.currentAudioTracks = null;
    }
  }

  /**
   * 清除视频流
   * @param {[]} tracks
   * @return {[]}
   */
  async clearVideo(tracks) {
    if (this.currentVideoTracks) {
      await this.unpublish(this.currentVideoTracks);
      this.currentVideoTracks = null;
    }
    return tracks;
  }
  /**
   * 清除屏幕流
   * @param {[]} tracks
   * @return {[]}
   */
  async clearScreen(tracks) {
    if (this.currentScreenTracks) {
      await this.unpublish(this.currentScreenTracks);
      this.currentScreenTracks = null;
    }
    return tracks;
  }
}
