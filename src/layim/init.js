import IMSocket from './socket';

/**
 * IM 初始化
 */
class IMInit {
  /**
   * 初始化方法
   * @param {string} username 昵称
   * @param {string} userId 用户id
   * @param {string} password 密码
   * @param {string} token token
   */
  init({username, userId, password, token}) {
    const layui = window.layui;
    // 判断layui是否加载，layui加载后config变成自己的属性，未加载时是原型上的属性
    if (layui.hasOwnProperty('config')) return;
    layui.config({
      base: '/static/layim/js/',
    });
    layui.use(['layim', 'jquery', 'layer', 'contextMenu', 'form', 'config'], function() {
      const $ = layui.jquery;
      const imConfig = layui.config;
      $.ajaxSetup({
        beforeSend(request) {
          request.setRequestHeader('Authorization', 'bearer ' + token);
        },
      });
      layui.layim.config({
        init: {
          url: imConfig.baseURL + 'dashboard',
        },
        // 获取群成员
        members: {
          url: imConfig.baseURL + 'group_members',
          data: {},
        },
        // 上传图片接口
        uploadImage: {
          url: imConfig.baseURL + 'upload_image', // （返回的数据格式见下文）
          type: 'post', // 默认post
        },
        // 上传文件接口
        uploadFile: {
          url: imConfig.baseURL + 'upload_file', //
          type: 'post', // 默认post
        },
        isAudio: false, // 开启聊天工具栏音频
        isVideo: false, // 开启聊天工具栏视频
        // 扩展工具栏
        tool: [
          {
            alias: imConfig.videoToolName,
            title: 'Facetime',
            icon: '&#xe6ed;',
          },
        ],
        min: true,
        title: '点我聊天',
        // 是否已获得授权，true则底部没有版权信息小按钮
        copyright: true,
        notice: true, // 是否开启桌面消息提醒，默认false
        // msgbox: layui.cache.dir + 'css/modules/layim/html/msgbox.html', // 消息盒子页面地址，若不开启，剔除该项即可
        // find: layui.cache.dir + 'css/modules/layim/html/find.html', // 发现页面地址，若不开启，剔除该项即可
        // chatLog: layui.cache.dir + 'css/modules/layim/html/chatlog.html', // 聊天记录页面地址，若不开启，剔除该项即可
        // createGroup: layui.cache.dir + 'css/modules/layim/html/createGroup.html', // 创建群页面地址，若不开启，剔除该项即可
        // Information: layui.cache.dir + 'css/modules/layim/html/getInformation.html', // 好友群资料页面
      });
      const socket = new IMSocket(layui);
      socket.login({username, userId, password, token});
    });
  }
}

const imInit = new IMInit();
export default imInit;
