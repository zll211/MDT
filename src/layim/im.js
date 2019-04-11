/**
 * IM
 */
export default class IM {
  constructor(layui, conn) {
    let contextMenu = layui.contextMenu;
    let $ = layui.jquery;
    let layer = layui.layer;
    let form = layui.form;
    const layim = layui.layim;
    let cachedata = layim.cache();
    const im = {
      // 自定义消息，把消息格式定义为layim的消息类型
      defineMessage: (message, msgType) => {
        let timestamp;
        let id;
        let type;
        console.log('message', message);
        let msg;
        switch (msgType) {
          case 'Text':
            msg = message.data;
            break;
          case 'Picture':
            msg = 'img[' + message.thumb + ']';
            break;
          case 'Audio':
            msg = 'audio[' + message.audio + ']';
            break;
          case 'File':
            msg = 'file(' + message.url + ')[' + message.filename + ']';
            break;
          case 'Video':
            msg = 'video[' + message.video + ']';
            break;
        }
        if (message.ext.cmd) {
          // 如果有命令参数
          switch (message.ext.cmd.cmdName) {
            case 'gag': // 禁言
              im.setGag({
                groupidx: message.to,
                type: 'set',
                user: message.ext.cmd.id,
                gagTime: message.data,
              });
              break;
            case 'liftGag': // 取消禁言
              im.setGag({
                groupidx: message.to,
                type: 'lift',
                user: message.ext.cmd.id,
                gagTime: 0,
              });
              break;
            // case 'setGag': //禁言
            // case 'joinGroup': //取消禁言
            // case 'joinGroup': //加入群
            // case 'leaveGroup': //退出群
            // case 'setAdmin': //设置管理员
            // case 'removeAdmin': //取消管理员
            // break;
            default:
              layim.getMessage({
                system: true, // 系统消息
                id: message.to, // 聊天窗口ID
                type: 'group', // 聊天窗口类型
                content: msg,
              });
          }
        }
        if (message.type === 'chat') {
          type = 'friend';
          id = message.from;
        } else if (message.type === 'groupchat') {
          type = 'group';
          id = message.to;
        }
        if (message.delay) {
          // 离线消息获取不到本地cachedata用户名称需要从服务器获取
          timestamp = Date.parse(new Date(message.delay));
        } else {
          timestamp = new Date().valueOf();
        }
        const _friendList = cachedata.friend.reduce((arr, i) => arr.concat(i.list), []);
        const _friend = _friendList.find(i => i.id === message.from);
        let data = {
          mine: false,
          cid: 0,
          username: message.ext.username,
          avatar: _friend?.avatar || '',
          content: msg,
          id: id,
          fromid: message.from,
          timestamp: timestamp,
          type: type,
        };
        console.log(data);
        if (!message.ext.cmd) {
          layim.getMessage(data);
        }
      },
      sendMsg: function(data) {
        // 根据layim提供的data数据，进行解析
        let id = conn.getUniqueId();
        let content = data.mine.content;
        let msg = new WebIM.message('txt', id); // 创建文本消息
        console.log('sendMsg', data);
        msg.set({
          msg: data.mine.content,
          to: data.to.id, // 接收消息对象（用户id）
          roomType: false,
          success: function(id, serverMsgId) {
            // 发送成功则记录信息到服务器
            let sendData = {
              to: data.to.id,
              content: data.mine.content,
              sendTime: data.mine.timestamp,
              type: data.to.type,
            };

            if (data.to.cmd && (data.to.cmd.cmdName === 'leaveGroup' || data.to.cmd.cmdName === 'joinGroup')) {
              sendData.sysLog = true;
            }
          },
          fail: function(e) {
            // 发送失败移除发送消息并提示发送失败
            im.popMsg(data, '发送失败 刷新页面试试！');
          },
        });
        layer;
        if (data.to.id == data.mine.id) {
          layer.msg('不能给自己发送消息');
          return;
        }
        if (data.to.cmd) {
          msg.body.ext.cmd = data.to.cmd;
        }
        msg.body.ext.username = cachedata.mine.username;
        if (data.to.type === 'group') {
          msg.setGroup('groupchat');
          msg.body.chatType = 'chatRoom';
        } else {
          msg.body.chatType = 'singleChat';
        }
        conn.send(msg.body);
      },
      IsExist: function(avatar) {
        // 判断头像是否存在
        let ImgObj = new Image();
        ImgObj.src = avatar;
        if (ImgObj.fileSize > 0 || (ImgObj.width > 0 && ImgObj.height > 0)) {
          return true;
        } else {
          return false;
        }
      },
      audio: function(msg) {
        // 消息提示
        layim.msgbox(msg);
        let audio = document.createElement('audio');
        audio.src = layui.cache.dir + 'css/modules/layim/voice/' + cachedata.base.voice;
        audio.play(); // 消息提示音
      },
      receiveAddFriendGroup: function(othis, agree) {
        // 确认添加好友或群
        let li = othis.parents('li'),
          type = li.data('type'),
          uid = li.data('uid'),
          username = li.data('name'),
          signature = li.data('signature'),
          msgIdx = li.data('id');
        if (type == 1) {
          type = 'friend';
          var avatar = './uploads/person/' + uid + '.jpg';
          msgType = 2;
        } else {
          type = 'group';
          var groupIdx = li.data('groupidx');
          msgType = 4;
        }
        let status = agree == 2 ? 2 : 3;
        if (agree == 2) {
          if (msgType == 2) {
            var default_avatar = './uploads/person/empty2.jpg';
            layim.setFriendGroup({
              type: type,
              username: username, // 用户名称或群组名称
              avatar: im['IsExist'].call(this, avatar) ? avatar : default_avatar,
              group: cachedata.friend || [], // 获取好友分组数据
              submit: function(group, index) {
                $.get(
                  'class/doAction.php?action=modify_msg',
                  {
                    msgIdx: msgIdx,
                    msgType: msgType,
                    status: status,
                    mygroupIdx: group,
                    friendIdx: uid,
                  },
                  function(res) {
                    let data = eval('(' + res + ')');
                    if (data.code == 0) {
                      // 将好友 追加到主面板
                      layim.addList({
                        type: 'friend',
                        avatar: im['IsExist'].call(this, avatar) ? avatar : default_avatar, // 好友头像
                        username: username, // 好友昵称
                        groupid: group, // 所在的分组id
                        id: uid, // 好友ID
                        sign: signature, // 好友签名
                      });
                      conn.subscribed({
                        // 同意添加后通知对方
                        to: uid,
                        message: 'Success',
                      });
                      parent.layer.close(index);
                      othis.parent().html('已同意');
                      // parent.location.reload();
                      im.contextMenu(); // 更新右键点击事件
                    } else {
                      console.log('添加失败');
                    }
                  }
                );
                layer.close(index);
              },
            });
          } else if ((msgType = 4)) {
            var default_avatar = './uploads/person/empty1.jpg';
            $.get(
              'class/doAction.php?action=modify_msg',
              {
                msgIdx: msgIdx,
                msgType: msgType,
                status: status,
              },
              function(res) {
                let data = eval('(' + res + ')');
                if (data.code == 0) {
                  let options = {
                    applicant: uid,
                    groupId: groupIdx,
                    success: function(resp) {
                      conn.subscribed({
                        // 同意添加后通知对方
                        to: uid,
                        message: 'addGroupSuccess',
                      });
                      im.sendMsg({
                        // 系统消息
                        mine: {
                          content: username + ' 已加入该群',
                          timestamp: new Date().getTime(),
                        },
                        to: {
                          id: groupIdx,
                          type: 'group',
                          cmd: {
                            cmdName: 'joinGroup',
                            cmdValue: username,
                          },
                        },
                      });
                    },
                    error: function(e) {},
                  };
                  conn.agreeJoinGroup(options);
                  othis.parent().html('已同意');
                  // parent.location.reload();
                  im.contextMenu(); // 更新右键点击事件
                } else if (data.code == 1) {
                  console.log(data.msg);
                } else {
                  console.log('添加失败');
                }
              }
            );
          }
        } else {
          $.get(
            'class/doAction.php?action=modify_msg',
            {
              msgIdx: msgIdx,
              msgType: msgType,
              status: status,
            },
            function(res) {
              let data = eval('(' + res + ')');
              if (data.code == 0) {
                conn.unsubscribed({
                  to: uid,
                  message: 'rejectAddFriend',
                });
                othis.parent().html('<em>已拒绝</em>');
              }
              layer.close(layer.index);
            }
          );
        }
      },
      getMyInformation: function() {
        let index = layer.open({
          type: 2,
          title: '我的资料',
          shade: false,
          maxmin: false,
          area: ['400px', '670px'],
          skin: 'layui-box layui-layer-border',
          resize: true,
          content: cachedata.base.Information + '?id=' + cachedata.mine.id + '&type=friend',
        });
      },
      getInformation: function(data) {
        let id = data.id || {},
          type = data.type || {};
        let index = layer.open({
          type: 2,
          title: type === 'friend' ? (cachedata.mine.id == id ? '我的资料' : '好友资料') : '群资料',
          shade: false,
          maxmin: false,
          // ,closeBtn: 0
          area: ['400px', '670px'],
          skin: 'layui-box layui-layer-border',
          resize: true,
          content: cachedata.base.Information + '?id=' + id + '&type=' + type,
        });
      },
      userStatus: function(data) {
        if (data.id) {
          $.get(
            `/api/im/${data.id}/online_status`,
            function(data) {
              if (data.online_status === 'online') {
                layim.setChatStatus('<span style="color:#FF5722;">在线</span>');
              } else {
                layim.setChatStatus('<span style="color:#444;">离线</span>');
              }
            }
          );
        }
      },
      groupMembers: function(othis, e) {
        var othis = $(this);
        let icon = othis.find('.layui-icon'),
          hide = function() {
            icon.html('&#xe602;');
            $('#layui-layim-chat > ul:eq(1)').remove();
            $('.layui-layim-group-search').remove();
            othis.data('show', null);
          };
        if (othis.data('show')) {
          hide();
        } else {
          icon.html('&#xe603;');
          othis.data('show', true);
          let members = cachedata.base.members || {},
            ul = $('#layui-layim-chat'),
            li = '',
            membersCache = {};
          let info = JSON.parse(decodeURIComponent(othis.parent().data('json')));
          members.data = $.extend(members.data, {
            id: info.id,
          });
          $.get(members, function(res) {
            let resp = eval('(' + res + ')');
            let html =
              '<ul class="layui-unselect layim-group-list groupMembers" data-groupidx="' +
              info.id +
              '" style="height: 510px; display: block;right:-200px;padding-top: 10px;">';
            layui.each(resp.data.list, function(index, item) {
              html +=
                '<li  id="' +
                item.id +
                '" isfriend="' +
                item.friendship +
                '" manager="' +
                item.type +
                '" gagTime="' +
                item.gagTime +
                '"><img src="' +
                item.avatar +
                '">';
              item.type == 1
                ? (html += '<span style="color:#e24242">' + item.username + '</span><i class="layui-icon" style="color:#e24242">&#xe612;</i>')
                : item.type == 2
                ? (html += '<span style="color:#de6039">' + item.username + '</span><i class="layui-icon" style="color:#eaa48e">&#xe612;</i>')
                : (html += '<span>' + item.username + '</span>');
              html += '</li>';
              membersCache[item.id] = item;
            });
            html += '</ul>';
            html += '<div class="layui-layim-group-search" socket-event="groupSearch"><input placeholder="搜索"></div>';
            ul.append(html);
            im.contextMenu();
          });
        }
      },
      closeAllGroupList: function() {
        let othis = $('.groupMembers');
        othis.remove(); // 关闭全部的群员列表
        $('.layui-layim-group-search').remove();
        let icon = $('.layim-tool-groupMembers').find('.layui-icon');
        $('.layim-tool-groupMembers').data('show', null);
        icon.html('&#xe602;');
      },
      popMsg: function(data, msg) {
        // 删除本地最新一条发送失败的消息
        let logid = cachedata.local.chatlog[data.to.type + data.to.id];
        logid.pop();
        let timestamp = '.timestamp' + data.mine.timestamp;
        $(timestamp).html('<i class="layui-icon" style="color: #F44336;font-size: 20px;float: left;margin-top: 1px;">&#x1007;</i>' + msg);
      },
    };
    return im;
  }
}
