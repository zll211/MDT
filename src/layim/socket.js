/* eslint-disable no-console, no-unused-vars */
import IM from './im';
import IMUtils from './utils';
import IMService from './service';

/*
 * IM 通信
 */
export default class IMSocket {
  /**
   * layui
   * @param {object} layui layui
   */
  constructor(layui) {
    this.layui = layui;
  }

  /**
   * 登录环信
   * @param {string} username 昵称
   * @param {string} userId 用户id
   * @param {string} password 密码
   * @param {object} layim layim
   */
  login({username, userId, password, token}) {
    /* eslint-disable new-cap */
    this.userId = userId;
    const WebIM = window.WebIM;
    // 环信设置
    this.conn = new WebIM.connection({
      isMultiLoginSessions: WebIM.config.isMultiLoginSessions,
      https: typeof WebIM.config.https === 'boolean' ? WebIM.config.https : location.protocol === 'https:',
      url: WebIM.config.xmppURL,
      heartBeatWait: WebIM.config.heartBeatWait,
      autoReconnectNumMax: WebIM.config.autoReconnectNumMax,
      autoReconnectInterval: WebIM.config.autoReconnectInterval,
      apiUrl: WebIM.config.apiURL,
      isAutoLogin: true,
    });
    // 根据本地token来判断是用密码登录还是token登录
    const _accessToken = WebIM.utils.getCookie()['webim_' + userId];
    if (_accessToken) {
      this.conn.open({
        apiUrl: WebIM.config.apiURL,
        user: userId,
        appKey: WebIM.config.appkey,
        accessToken: _accessToken,
      });
    } else {
      this.conn.open({
        apiUrl: WebIM.config.apiURL,
        user: userId,
        appKey: WebIM.config.appkey,
        pwd: password,
        // 密码登录成功后保存token
        success: function(data) {
          const token = data.access_token;
          WebIM.utils.setCookie('webim_' + userId, token, 1);
        },
        error: function() {},
      });
    }
    const im = (this.im = new IM(this.layui, this.conn));
    // 注册环信的事件监听
    this.conn.listen({
      onOpened: message => {
        console.log('onOpened', message);
      },
      // 连接关闭回调
      onClosed: message => {
        console.log('onClosed', message);
      },
      // 收到文本消息
      onTextMessage: message => {
        console.log('onTextMessage', message);
        im.defineMessage(message, 'Text');
      },
      // 收到表情消息
      onEmojiMessage: message => {
        console.log('onEmojiMessage', message);
      },
      // 收到图片消息
      onPictureMessage: message => {
        console.log('onPictureMessage', message);
      },
      // 收到命令消息
      onCmdMessage: message => {
        console.log('onCmdMessage', message);
      },
      // 收到音频消息
      onAudioMessage: message => {
        console.log('onAudioMessage', message);
      },
      // 收到位置消息
      onLocationMessage: message => {
        console.log('onLocationMessage', message);
      },
      // 收到文件消息
      onFileMessage: message => {
        console.log('onFileMessage', message);
      },
      // 收到视频消息
      onVideoMessage: message => {
        console.log('onVideoMessage', message);
        let node = document.getElementById('privateVideo');
        let option = {
          url: message.url,
          headers: {
            Accept: 'audio/mp4',
          },
          onFileDownloadComplete: function(response) {
            let objectURL = WebIM.utils.parseDownloadResponse.call(this.conn, response);
            node.src = objectURL;
          },
          onFileDownloadError: function() {
            console.log('File down load error.');
          },
        };
        WebIM.utils.download.call(this.conn, option);
      },
      // 处理“广播”或“发布-订阅”消息，如联系人订阅请求、处理群组、聊天室被踢解散等消息
      onPresence: message => {
        console.log('onPresence', message);
      },
      // 处理好友申请
      onRoster: message => {
        console.log('onRoster', message);
      },
      // 处理群组邀请
      onInviteMessage: message => {
        console.log('onInviteMessage', message);
      },
      // 本机网络连接成功
      onOnline: function() {},
      // 本机网络掉线
      onOffline: function() {},
      // 失败回调
      onError: message => {
        console.log('onError', message);
      },
      // 黑名单变动
      // 查询黑名单，将好友拉黑，将好友从黑名单移除都会回调这个函数，list则是黑名单现有的所有好友信息
      onBlacklistUpdate: function(list) {
        console.log(list);
      },
      // 收到消息送达服务器回执
      onReceivedMessage: message => {
        console.log('onReceivedMessage', message);
      },
      // 收到消息送达客户端回执
      onDeliveredMessage: message => {
        console.log('onDeliveredMessage', message);
      },
      // 收到消息已读回执
      onReadMessage: message => {
        console.log('onReadMessage', message);
      },
      // 创建群组成功回执（需调用createGroupNew）
      onCreateGroup: message => {
        console.log('onCreateGroup', message);
      },
      // 如果用户在A群组被禁言，在A群发消息会走这个回调并且消息不会传递给群其它成员
      onMutedMessage: message => {
        console.log('onMutedMessage', message);
      },
    });

    this.register();
  }

  /**
   * 注册layim监听事件
   */
  register() {
    const layim = this.layui.layim;
    const layer = this.layui.layer;
    const cachedata = this.layui.layim.cache();
    if (layim) {
      // 监听在线状态的切换事件
      layim.on('online', function(data) {
        console.log('在线状态' + data);
      });
      // 监听layim建立就绪
      layim.on('ready', res => {
        if (cachedata.mine.msgBox != 0) {
          layim.msgbox(cachedata.mine.msgBox); // 消息盒子有新消息
        }
        console.log('ready', res);
        // const targetName = res.mine.id === 'admin' ? 'yuming' : 'admin';
        // layim.chat({
        //   name: targetName, // 名称
        //   type: 'friend', // 聊天类型
        //   avatar: 'http://lara.zfsphp.com/uploads/images/link/201806/13/ln_1528902580_jpv3zVFR4V.jpg', // 头像
        //   id: targetName, // 好友id
        // });
      });

      // 监听查看群员
      layim.on('members', function(data) {});

      // $('body').on('click', '*[socket-event]', function(e) {
      //   // 自定义事件
      //   let othis = $(this);
      //   let methid = othis.attr('socket-event');
      //   im[methid] ? im[methid].call(this, othis, e) : '';
      // });
      // 监听聊天窗口的切换
      layim.on('chatChange', res => {
        this.im.closeAllGroupList();
        let type = res.data.type;
        if (type === 'friend') {
          // 模拟标注好友状态
          this.im.userStatus({
            id: res.data.id,
          });
        } else if (type === 'group') {
          let _time = new Date().valueOf(); // 当前时间
          if (parseInt(res.data.gagTime) > _time) {
            this.im.setGag({
              groupidx: res.data.id,
              type: 'set',
              user: cachedata.mine.id,
              gagTime: '',
            });
          }
        }
      });
      layim.on('sendMessage', data => {
        // 监听发送消息
        data.to.cmd = 0;
        console.log('sendMessage', data);
        if (data.to.type === 'friend') {
          this.im.sendMsg(data);
        } else {
          this.im.sendMsg(data);
        }
      });
      layim.on(`tool(${this.layui.config.videoToolName})`, (insert, send, obj) => {
        // 事件中的tool为固定字符，而code则为过滤器，对应的是工具别名（alias）
        IMUtils.unsubscribe(this.startFacetimeSubscription);
        const {id, type} = obj.data;
        if (type === 'friend') {
          this.startFacetimeSubscription = IMService.startFacetime(id).subscribe(
            data => {
              const msg = {
                type,
                roomName: data.name,
                toUser: id,
                fromUser: cachedata.mine.id,
              };
              insert(`facetime[${JSON.stringify(msg)}]`);
              send();
            },
            error => {
              if (typeof error === 'string') {
                layer.msg(error);
              } else {
                layer.msg('无法发起视频通话，请稍后再试');
              }
            }
          );
        } else {
          IMService.getRoomToken().then(
            ({body}) => {
              const msg = {
                type,
                roomName: body.name,
              };
              insert(`facetime[${JSON.stringify(msg)}]`);
              send();
              // const msg = {
              //   type: 'meeting',
              //   id: 31,
              //   roomName: body.name,
              //   request_doctor: '余名',
              //   patient_name: '李三三',
              //   time: '2019年3月2日 14:30',
              // };
              // insert(`meeting[${JSON.stringify(msg)}]`);
              // send();
            },
            error => {
              if (typeof error === 'string') {
                layer.msg(error);
              } else {
                layer.msg('无法发起视频通话，请稍后再试');
              }
            }
          );
        }
      });
    }
  }
}
