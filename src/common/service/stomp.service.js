/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
import {RxStomp, RxStompState} from '@stomp/rx-stomp';
import {distinctUntilChanged, filter, map, tap} from 'rxjs/operators';

export class StompTopic {
  static consultation = 'consultation';
  static notify = 'notify';
}

export class StompMessageType {
  static openFile = 'openFile';
  static closeFile = 'closeFile';
  static openWhiteboard = 'openWhiteboard';
  static closeWhiteboard = 'closeWhiteboard';
}

export class StompNotifyType {
  static consultationStart = 'consultationStart';
}

const protocol = window.location.protocol;
let stompConfig = {
  protocol: 'ws',
  host: '192.168.1.91',
  port: '15674',
  login: 'guest',
  passcode: 'guest',
  reconnectDelay: 1000,
};
const env = process.env.NODE_ENV;
if (env === 'production' || env === 'none') {
  if (protocol === 'http:') {
    stompConfig.host = window.location.hostname;
    stompConfig.login = 'hzzt';
    stompConfig.passcode = 'hzztrbq@2018';
  } else if (protocol === 'https:') {
    stompConfig.protocol = 'wss';
    stompConfig.host = window.location.hostname;
    stompConfig.port = '15675';
    stompConfig.login = 'hzzt';
    stompConfig.passcode = 'hzztrbq@2018';
  }
}

class StompClient {
  /**
   * stomp 实例
   */
  rxStomp;
  /**
   * 收到的消息
   */
  message$;
  /**
   * 是否连接
   */
  connected$;

  /**
   * 连接状态
   */
  connectionState$;

  constructor() {
    this.rxStomp = new RxStomp();
    this.rxStomp.configure({
      brokerURL: `${stompConfig.protocol}://${stompConfig.host}:${stompConfig.port}/ws`,
      connectHeaders: {
        login: stompConfig.login,
        passcode: stompConfig.passcode,
      },
      heartbeatIncoming: 0,
      heartbeatOutgoing: 20000,
      reconnectDelay: stompConfig.reconnectDelay,
      debug: msg => {
        console.log('stomp debug -------- ', msg);
      },
    });

    // 连接状态
    this.connectionState$ = this.rxStomp.connectionState$.pipe(distinctUntilChanged());

    // 是否连接
    this.connected$ = this.rxStomp.connectionState$.pipe(
      distinctUntilChanged(),
      map(value => value === RxStompState.OPEN)
    );
    this.rxStomp.activate();
  }
}

export const stompClient = new StompClient();

export class ConsultationStomp {
  constructor(id) {
    this.id = id;
    this.stomp = new StompService(`${StompTopic.consultation}.${id}`);
    this.message$ = this.stomp.message$;
  }

  sendDirectJson(body) {
    this.stomp.sendDirectJson(`${StompTopic.consultation}.${this.id}`, body);
  }

  send(body) {
    this.stomp.send(StompTopic.consultation, body);
  }

  sendJson(body) {
    this.stomp.sendJson(StompTopic.consultation, body);
  }
}

export class NotifyStomp {
  constructor(id) {
    this.stomp = new StompService(`${StompTopic.notify}.${id}`);
    this.message$ = this.stomp.message$;
  }

  send(body) {
    this.stomp.send(StompTopic.consultation, body);
  }

  sendJson(body) {
    this.stomp.sendJson(StompTopic.consultation, body);
  }
}

export default class StompService {
  /**
   * 初始化消息订阅
   * @param {string} topic topic
   */
  constructor(topic) {
    this.connected$ = stompClient.connected$;
    this.message$ = stompClient.rxStomp.watch(`/topic/${topic}`).pipe(
      // tap(message => console.log('progress Message', message)),
      map(message => JSON.parse(message.body)),
      tap(body => console.log('message body', body))
    );
  }

  /**
   * 发送消息
   * @param {string} topic topic
   * @param {string} body 消息
   */
  send(topic, body) {
    stompClient.rxStomp.publish({destination: `/queue/${topic}`, body});
  }

  /**
   * 发送json消息
   * @param {string} topic topic
   * @param {JSON} body json消息
   */
  sendJson(topic, body) {
    this.send(topic, JSON.stringify(body));
  }

  /**
   * 直接发送消息
   * @param {string} topic topic
   * @param {string} body 消息
   */
  sendDirect(topic, body) {
    stompClient.rxStomp.publish({destination: `/topic/${topic}`, body});
  }

  /**
   * 直接发送json消息，不经过后台转发
   * @param {string} topic topic
   * @param {JSON} body json消息
   */
  sendDirectJson(topic, body) {
    this.sendDirect(topic, JSON.stringify(body));
  }
}
