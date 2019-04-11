/* eslint-disable no-console, no-unused-vars */
import {forkJoin, Observable, of, pipe, throwError} from 'rxjs';
import {switchMap, tap, filter, catchError} from 'rxjs/operators';
import {ConsultationStomp, StompMessageType} from 'src/common/service/stomp.service';
import WebWatchService from 'src/common/service/webWatch.service';
import {unsubscribe} from 'src/config/utils';
import QNRTCService, {VideoType} from 'src/common/components/rtn/qnrtc.service';
import {FaceTimeType, LoadingStatus} from 'src/common/components/rtn/status';
import MeetingService from 'src/common/components/rtn/meeting/meeting.service';
import WhiteBoard from 'src/common/components/rtn/meeting/whiteboard/whiteboard';
import {AttachmentFile, AttachmentFileOriginalType, dicomsType} from 'src/common/components/rtn/meeting/meeting.module';
import WhiteboardService from 'src/common/components/rtn/meeting/whiteboard/whiteboard.service';

export default {
  data() {
    return {
      // 七牛 sdk instance
      qnrtc: null,
      // 本地音视频设备
      videoDevices: [],
      audioDevices: [],
      // 当前视频源
      currentVideoId: null,
      // 当前音频源
      currentAudioId: null,
      // 视频源类型
      videoType: null,
      // 申请医生
      requestDoctor: {},
      // 邀请医生
      inviteeDoctors: [],
      meetingInfo: {},
      meetingInfoShow: true,
      // 整体初始化状态
      initLoadingStatus: LoadingStatus.pending,
      // 视频加载状态
      videoLoadingStatus: LoadingStatus.init,
      // 结束会诊弹框
      finishDialog: false,
      // 左侧收起状态
      leftCollapse: false,
      // 右侧收起状态
      rightCollapse: false,
      // 订阅对象
      subscribes: {},
      // 一对一时好友名
      friendUsername: '',
      // 会诊资料
      attachment: {},
      // stomp
      stomp: null,
      // 跟随/自由
      isFollow: true,
      wrongMsg: ''
    };
  },
  computed: {
    // 登录用户的环信昵称，即医生名
    username() {
      return this.$store.state.user.username;
    },
    // 登录用户的环信昵称，即医生名
    userId() {
      return this.$store.state.user.id;
    },
    bodyWidth() {
      return this.$store.state.width;
    },
    // 是否为会诊
    isMeeting() {
      return this.$store.state.meeting.consultationInfo.type === FaceTimeType.meeting;
    },
    // 是否为好友视频
    isFriend() {
      return this.$store.state.meeting.consultationInfo.type === FaceTimeType.friend;
    },
    // 是否为群视频
    isGroup() {
      return this.$store.state.meeting.consultationInfo.type === FaceTimeType.group;
    },
    // 只有发起人才能共享屏幕
    isRequestDoctor() {
      return this.requestDoctor && this.requestDoctor.username && this.username === this.requestDoctor.username;
    },
    // 弹框是否可见
    visible() {
      return this.$store.state.meeting.meetingDialog;
    },
    // 白板是否开启
    whiteboardStatus() {
      return this.$store.state.meeting.whiteboardStatus;
    },
    // 是否正在共享屏幕
    isScreenActive() {
      return this.videoType === VideoType.screen;
    },
    // 是否正在使用摄像头
    isCameraActive() {
      return this.videoType === VideoType.camera;
    },
    // 会诊信息/视频信息
    consultationInfo() {
      return this.$store.state.meeting.consultationInfo;
    },
    // 初始加载
    initLoading() {
      return this.initLoadingStatus === LoadingStatus.pending;
    },
    // 自己的视频正在加载
    videoLoading() {
      return this.videoLoadingStatus === LoadingStatus.pending || this.videoLoadingStatus === LoadingStatus.init;
    },
    // 主咖名称
    mainWindowName() {
      if (this.isMeeting) {
        return this.requestDoctor.username;
      } else if (this.isFriend) {
        return this.friendUsername;
      } else {
        return this.username;
      }
    },
    // 是否展示屏幕分享
    showShare() {
      if (this.isMeeting) {
        return this.isRequestDoctor;
      } else {
        return true;
      }
    },
    // 退出弹框标题
    dislogTitle() {
      if (this.isMeeting) {
        return this.isRequestDoctor ? '结束会诊？' : '退出会诊';
      } else {
        return '退出视频聊天？';
      }
    },
    // 退出弹框 内容
    dislogContent() {
      if (this.isMeeting) {
        return this.isRequestDoctor ? '是否结束会诊？' : '会诊是否结束？如果会诊结束，请填写会诊报告';
      } else {
        return '是否退出视频聊天？';
      }
    },
    // 退出弹框 取消文本
    dislogCancelText() {
      if (this.isMeeting) {
        return '暂时退出';
      } else {
        return '取消？';
      }
    },
    // 退出弹框 确认文本
    dislogOKText() {
      if (this.isMeeting) {
        return this.isRequestDoctor ? '结束会诊' : '填写报告';
      } else {
        return '退出';
      }
    }
  },
  components: {WhiteBoard},
  watch: {
    // 监听新的视频信息
    consultationInfo(newValue, oldValue) {
      console.log(newValue, oldValue);
      console.log(this.bodyWidth);
      if (newValue.roomName) {
        // 屏幕过小时，先收起资料区

        this.init(newValue);
        if (newValue.type === FaceTimeType.meeting && newValue.id) {
          this.initStomp(newValue.id);
        }
      }
    }
  },
  mounted() {},
  methods: {
    /**
     * 初始化
     * @param {*} consultationInfo 视频信息
     */
    init(consultationInfo) {
      this.countDevices();
      if (this.bodyWidth < 1400) {
        this.leftCollapse = true;
      }
      const {id, roomName, type, fromUser, toUser} = consultationInfo || {};
      if (roomName && type) {
        if (type === FaceTimeType.meeting) {
          // 是会诊
          if (id) {
            this.initSubscription = this.leaveRoomObservable()
              .pipe(
                // 获取会诊信息
                tap(() => this.reset()),
                switchMap(_ => MeetingService.getMeetingInfo(id)),
                switchMap(({body}) => {
                  if (body.status_code === undefined) {
                    this.initLoadingStatus = LoadingStatus.done;
                    // 发起人
                    let requestDoctor = body.user;
                    this.meetingInfo = body;
                    this.whiteboardUUID = body.white_id || '';
                    // 会诊资料
                    const attachment = body.case.attachment || {};
                    let _attachment = {};
                    Object.keys(attachment).map(type => {
                      if (attachment[type].length > 0) {
                        _attachment[type] = attachment[type].map(i => new AttachmentFile(i));
                      }
                    });
                    this.attachment = _attachment;
                    // 邀请人
                    let inviteeDoctors = body.invitee ? body.invitee.filter(i => i.user) : null;
                    if (requestDoctor && inviteeDoctors) {
                      this.requestDoctor = requestDoctor;
                      // 如果自己不是发起人
                      if (requestDoctor.username !== this.username) {
                        // 将自己排到邀请人队列的第一个
                        const selfIndex = inviteeDoctors.findIndex(i => i.username === this.username);
                        this.inviteeDoctors = inviteeDoctors.splice(selfIndex, 1).concat(inviteeDoctors);
                      } else {
                        this.inviteeDoctors = inviteeDoctors;
                      }
                      return of('');
                    } else {
                      return throwError('会议信息错误，无法获取到发起人和邀请人');
                    }
                  } else {
                    WebWatchService.reportError(`${this.username} 进入视频会诊失败, 会诊id=${id}`);
                    return throwError('会议不存在');
                  }
                }),
                this.joinRoom(roomName)
              )
              .subscribe(
                _ => {
                  this.initRoom();
                },
                error => {
                  if (typeof error === 'string') {
                    this.wrongMsg = error;
                  } else {
                    this.wrongMsg = '进入视频会诊失败';
                  }
                  this.initLoadingStatus = LoadingStatus.failed;
                  WebWatchService.reportError(`${this.username} 进入视频会诊失败, 会诊id=${id}, 房间号=${roomName} `, error);
                  console.error('mounted error', error);
                }
              );
          } else {
            this.wrongMsg = '进入视频会诊失败, 没有会诊id';
            WebWatchService.reportError(`${this.username} 进入视频会诊失败, 没有会诊id`);
            this.initLoadingStatus = LoadingStatus.failed;
          }
        } else {
          // 是视频通话
          if (type === FaceTimeType.friend) {
            if (fromUser && toUser) {
              if (fromUser === this.username) {
                this.friendUsername = toUser;
              } else {
                this.friendUsername = fromUser;
              }
            } else {
              this.initLoadingStatus = LoadingStatus.failed;
              this.wrongMsg = '进入视频聊天失败，信息不全';
              WebWatchService.reportError(`${this.username} 进入视频聊天失败, 房间号=${roomName} 一对一没有好友id`);
            }
          }
          this.initSubscription = this.leaveRoomObservable()
            .pipe(this.joinRoom(roomName))
            .subscribe(
              _ => {
                this.initLoadingStatus = LoadingStatus.done;
                this.initRoom();
              },
              error => {
                this.initLoadingStatus = LoadingStatus.failed;
                this.wrongMsg = '进入视频聊天失败';
                WebWatchService.reportError(`${this.username} 进入视频聊天失败, 房间号=${roomName} `, error);
                console.error('mounted error', error);
              }
            );
        }
      } else {
        WebWatchService.reportError(`${this.username} 视频失败, 视频类型=${type}, 没有房间号`);
        this.initLoadingStatus = LoadingStatus.failed;
        this.wrongMsg = '无房间号，无法视频';
      }
    },
    /**
     * 加入房间
     * @param {string} roomName 房间号
     * @return {*}
     */
    joinRoom(roomName) {
      console.log('joinRoom roomName', roomName);
      return pipe(
        switchMap(_ => {
          window.addEventListener('beforeunload', this.leaveRoom, true);
          this.qnrtc = new QNRTCService({username: this.username});
          return this.qnrtc.joinRoom(roomName + '');
        })
      );
    },
    /**
     * 初始化房间
     */
    initRoom() {
      this.qnrtc.autoSubscribeTrack(this.subscribe, this.unsubscribe);
      // 监听七牛房间消息
      this.qnrtc.room.on('messages-received', msg => {
        try {
          const data = JSON.parse(msg);
          switch (data.type) {
            case StompMessageType.openWhiteboard:
              {
                this.whiteboardUUID = data.data.uuid;
              }
              break;
          }
          // eslint-disable-next-line no-empty
        } catch (e) {}
      });
      this.countDevices();
      // TODO: 正式版全部打开
      this.onVideoChange(this.currentVideoId);
      // this.onAudioChange(this.currentAudioId);
    },
    /**
     * 根据会诊id初始化stomp
     * @param {int} id
     */
    initStomp(id) {
      unsubscribe(this.stompSubscription);
      this.stomp = new ConsultationStomp(id);
      this.stompSubscription = this.stomp.message$.pipe(filter(msg => msg.from !== this.userId)).subscribe(msg => {
        const data = msg.data;
        switch (msg.type) {
          // 打开文件
          case StompMessageType.openFile:
            {
              // 有会诊资料，且跟随情况下
              if (this.attachment && this.isFollow) {
                const files = this.attachment[data.type];
                if (files) {
                  this.openFile({
                    files: this.attachment[data.type],
                    index: data.index,
                    type: data.type,
                    fromStomp: true
                  });
                }
              }
              console.warn('打开文件', msg);
            }
            break;
          case StompMessageType.openWhiteboard:
            {
              // 有会诊资料，且跟随情况下
              if (this.isMeeting && this.isFollow) {
                this.openWhiteBoardTab(this.meetingInfo.white_id);
              }
              console.warn('打开白板', msg);
            }
            break;
          default:
            console.log('consultation stomp', msg);
        }
      });
    },
    /**
     * 打开文件的消息
     * @param {AttachMentFile[]} files
     * @param {int} index
     * @param {string} type
     * @param {boolean} fromStomp
     */
    openFile({files, index, type, fromStomp}) {
      // 会诊申请人才可以发送打开文件的消息
      if (!fromStomp && this.isRequestDoctor) {
        this.stomp.sendJson({
          type: StompMessageType.openFile,
          from: this.userId,
          id: this.consultationInfo.id,
          data: {index, type}
        });
      }
      // 点击的那一个文件
      const file = files[index];
      // 会诊id
      const consultationId = this.consultationInfo.id;
      // 发起人id
      const requestId = this.requestDoctor.id;
      // 如果是kfb或者dcm
      if (type === AttachmentFileOriginalType.kfb || dicomsType.indexOf(type) !== -1) {
        const fileUrlList = files.map(i => i.path);
        this.openFileTab({
          index,
          isKfb: type === AttachmentFileOriginalType.kfb,
          dcmType: 'DCM',
          requestId,
          consultationId,
          fileUrlList
        });
      } else {
        // 如果是图片
        // 选出该类型下所有的图片
        if (file.isPicture) {
          const dcmType = file.type;
          const pictures = files.reduce((arr, i) => {
            if (i.isPicture) {
              arr.push(i);
            }
            return arr;
          }, []);
          const newIndex = pictures.findIndex(i => i.id === file.id);
          const fileUrlList = pictures.map(i => i.path);
          this.openFileTab({
            index: newIndex,
            isKfb: false,
            dcmType,
            requestId,
            consultationId,
            fileUrlList
          });
        } else {
          // 依赖浏览器的查看
          window.open(file.path);
        }
      }
    },
    /**
     * 打开新文件到新标签页
     * @param {*} data 打开新tab需要的值
     */
    openFileTab(data) {
      window.sessionStorage.setItem(StompMessageType.openFile, JSON.stringify(data));
      const {href} = this.$router.resolve({
        path: '/fileview'
      });
      window.open(href, '_blank');
    },
    /**
     * 打开新文件到新标签页
     * @param {string} uuid 打开新tab需要的值
     */
    openWhiteBoardTab(uuid) {
      const {href} = this.$router.resolve({
        path: `/whiteboard?uuid=${uuid}`
      });
      window.open(href, '_blank');
    },
    /**
     * 判断当前用户的dom是否创建完毕
     * @param {string} username 环信id
     * @param {Track} track track
     */
    playTrack(username, track) {
      if (this.trackContainer(username)) {
        track.play(this.trackContainer(username));
      } else {
        this.$forceUpdate();
        this.$nextTick(() => {
          track.play(this.trackContainer(username));
        });
      }
    },
    /**
     * 获取用户的dom
     * @param {string} username 环信id
     * @return {dom | false}
     */
    trackContainer(username) {
      if (this.isMeeting) {
        if (username === this.requestDoctor.username) {
          return this.$refs[username];
        } else if (this.$refs[username] && this.$refs[username][0]) {
          return this.$refs[username][0];
        } else {
          return false;
        }
      } else if (this.isFriend) {
        return this.$refs[username];
      } else if (this.isGroup) {
        // 群聊时 自己是主咖
        if (username === this.username) {
          return this.$refs[username];
        } else if (this.$refs[username]) {
          return this.$refs[username][0];
        }
      } else {
        return false;
      }
    },
    /**
     * 统计本机有哪些音视频设备
     */
    countDevices() {
      const devices = QNRTCService.countDevices();
      let videoDevices = devices.videoDevices;
      let audioDevices = devices.audioDevices;
      this.videoDevices = videoDevices;
      if (videoDevices.length > 0) {
        this.currentVideoId = videoDevices[0].value;
      }
      this.audioDevices = audioDevices;
      if (audioDevices.length > 0) {
        this.currentAudioId = audioDevices[0].value;
      }
    },
    /**
     * 切换音视频设备
     * @param {string} deviceId deviceId
     */
    onVideoChange(deviceId) {
      this.currentVideoId = deviceId;
      if (this.trackContainer(this.username)) {
        this.playVideo(deviceId);
      } else {
        this.$forceUpdate();
        this.$nextTick(() => {
          this.playVideo(deviceId);
        });
      }
    },
    /**
     * 播放摄像头
     * @param {string} deviceId deviceId
     */
    playVideo(deviceId) {
      if (this.videoLoadingStatus === LoadingStatus.pending) {
        return;
      }
      this.videoLoadingStatus = LoadingStatus.pending;
      unsubscribe(this.playVideoSubscription);
      console.log('playVideo', this.$refs, this.trackContainer(this.username));
      this.playVideoSubscription = this.qnrtc
        .playVideo({
          deviceId,
          container: this.trackContainer(this.username)
        })
        .subscribe(
          () => {
            this.videoType = VideoType.camera;
            this.videoLoadingStatus = LoadingStatus.done;
          },
          error => {
            this.videoLoadingStatus = LoadingStatus.failed;
          }
        );
    },
    /**
     * 切换音视频设备
     * @param {string} deviceId deviceId
     */
    onAudioChange(deviceId) {
      this.currentAudioId = deviceId;
      unsubscribe(this.playAudioSubscription);
      this.playAudioSubscription = this.qnrtc.playAudio(deviceId).subscribe(_ => {}, error => {});
    },
    /**
     * 屏幕分享
     */
    shareScreen() {
      if (this.videoLoadingStatus === LoadingStatus.pending || this.isScreenActive) {
        this.$message({
          message: '当前正在共享屏幕，请勿重复点击',
          type: 'warning'
        });
        return;
      }
      this.currentVideoId = null;
      this.videoLoadingStatus = LoadingStatus.pending;
      unsubscribe(this.shareScreenSubscription);
      this.shareScreenSubscription = this.qnrtc.shareScreen(this.$refs[this.requestDoctor.username], this.shareScreenEnded).subscribe(
        () => {
          this.videoType = VideoType.screen;
          this.videoLoadingStatus = LoadingStatus.done;
        },
        error => {
          this.videoLoadingStatus = LoadingStatus.failed;
        }
      );
    },
    /**
     * 屏幕共享中断的回调，一般是用户主动点击停止共享
     */
    shareScreenEnded() {
      this.$message({
        message: '屏幕共享中断，自动切换到摄像头',
        type: 'warning'
      });
      this.playVideo(this.currentVideoId);
    },
    /**
     * 订阅其他人的流
     * @param {[]} trackInfoList 订阅到的流列表
     */
    async subscribe(trackInfoList) {
      const remoteTracks = await this.qnrtc.room.subscribe(trackInfoList.map(info => info.trackId));
      remoteTracks.forEach(remoteTrack => {
        console.log('remoteTrack', remoteTrack);
        const tags = remoteTrack.info.tag.split('&');
        const username = tags[0];
        const type = tags[1];
        // 绑定好，便于取消订阅和重新订阅
        if (this.subscribes[username]) {
          this.subscribes[username][type] = [remoteTrack.info];
        } else {
          this.subscribes[username] = {
            [type]: [remoteTrack.info]
          };
        }
        this.playTrack(username, remoteTrack);
      });
      this.$forceUpdate();
    },
    /**
     * 退订其他人的流
     * @param {[]} trackInfoList 订阅到的流列表
     */
    async unsubscribe(trackInfoList) {
      trackInfoList.forEach(i => {
        const tags = i.tag.split('&');
        const username = tags[0];
        const type = tags[1];
        if (this.subscribes[username]) {
          delete this.subscribes[username][type];
          if (Object.keys(this.subscribes[username]).length === 0) {
            delete this.subscribes[username];
          }
        }
      });
      this.$forceUpdate();
      await this.qnrtc.unsubscribe(trackInfoList);
    },
    /**
     * 开关目标的音视频
     * @param {string} username 目标用户名
     * @param {string} type 视频还是音频
     */
    async toggleSomeoneMedia(username, type) {
      if (this.subscribes[username][type]) {
        await this.qnrtc.unsubscribe(this.subscribes[username][type]);
        this.subscribes[username][type] = null;
        this.$forceUpdate();
      } else {
        const trackInfoList = this.qnrtc.room.trackInfoList;
        console.log('trackInfoList', trackInfoList);
        let targets = [];
        trackInfoList.forEach(i => {
          if (i.tag === `${username}&${type}`) {
            targets.push(i);
          }
        });
        this.subscribe(targets);
      }
    },
    /**
     * 离开房间
     * @return {Observable}
     */
    leaveRoomObservable() {
      if (this.qnrtc && this.qnrtc.room) {
        return forkJoin(this.qnrtc.clearVideo(), this.qnrtc.clearScreen(), this.qnrtc.clearAudio()).pipe(
          catchError(error => of('1'), tap(() => this.qnrtc.room.leaveRoom()))
        );
      } else {
        return of('');
      }
    },
    /**
     * 离开房间
     */
    leaveRoom() {
      this.leaveRoomObservable().subscribe(
        _ => {
          unsubscribe(this.initSubscription);
          this.reset();
          this.resetConsultationInfo();
        },
        error => {
          WebWatchService.reportError(`${this.username} 离开房间出错`, error);
          console.error('leaveRoom', error);
        }
      );
    },
    /**
     * 结束会诊
     */
    finish() {
      this.leaveRoomObservable().subscribe(
        _ => {
          unsubscribe(this.initSubscription);
          if (this.isMeeting) {
            const id = this.consultationInfo.id;
            this.resetConsultationInfo();
            if (this.isRequestDoctor) {
              this.reset();
              this.consultationReport(id);
            } else {
              this.reset();
              this.$router.push(`/consultation/record/${id}`);
            }
          } else {
            this.reset();
            this.resetConsultationInfo();
          }
        },
        error => {
          console.error('finish', error);
        }
      );
    },
    /**
     * 未进入会诊的退出
     */
    unNormalQuit() {
      this.reset();
      this.resetConsultationInfo();
    },
    /**
     * 进入会诊报告页面
     * @param {int} id 会诊id
     */
    consultationReport(id) {
      MeetingService.finishConsultation(id).then(
        response => {
          console.log(response);
          if (response.status === 201) {
            this.$router.push(`/consultation/record/${id}`);
          } else {
            this.$message.error('结束会诊失败');
            WebWatchService.reportError(`${this.username} 结束会诊失败, 会诊id=${id}, 状态码：${response.status}`);
          }
        },
        error => {
          this.$message.error('结束会诊失败');
          WebWatchService.reportError(`${this.username} 结束会诊失败, 会诊id=${id}`, error);
        }
      );
    },
    /**
     * 最小化会诊框
     */
    minimalDialog() {
      this.$store.commit('setMeetingDialog', false);
      this.$store.commit('setMeetingHover', true);
    },
    /**
     * reset 会诊信息
     */
    resetConsultationInfo() {
      this.$store.commit('setConsultationInfo', {});
    },
    /**
     * 所有状态重置
     */
    reset() {
      // 重置状态
      this.qnrtc = null;
      this.videoType = null;
      this.requestDoctor = {};
      this.inviteeDoctors = [];
      this.initLoadingStatus = LoadingStatus.pending;
      this.videoLoadingStatus = LoadingStatus.init;
      this.finishDialog = false;
      // this.leftCollapse = false;
      // this.rightCollapse = false;
      this.subscribes = {};
      this.friendUsername = '';
      this.attachment = {};
      this.stomp = null;
      this.isFollow = true;
      this.wrongMsg = '';
      // 各种退订
      // unsubscribe(this.initSubscription);
      unsubscribe(this.playVideoSubscription);
      unsubscribe(this.shareScreenSubscription);
      unsubscribe(this.stompSubscription);
    },
    /**
     * 打开白板
     */
    openWhiteboard() {
      if (this.isMeeting && this.isRequestDoctor) {
        this.stomp.sendDirectJson({
          type: StompMessageType.openWhiteboard,
          from: this.userId,
          id: this.consultationInfo.id,
          data: {
            uuid: this.meetingInfo.white_id
          }
        });
        this.openWhiteBoardTab(this.meetingInfo.white_id);
      } else if (!this.isMeeting) {
        WhiteboardService.createWhiteboard().subscribe(
          data => {
            if (data && data.uuid) {
              this.qnrtc.room.sendCustomMessage(
                JSON.stringify({
                  type: StompMessageType.openWhiteboard,
                  data: {
                    uuid: data.uuid
                  }
                })
              );
              this.openWhiteBoardTab(data.uuid);
            }
          },
          error => {
            this.$message.error('打开白板失败');
          }
        );
      }
    },
    /**
     * 唤出群聊
     */
    calloutChat() {
      window.layui.layim.chat({
        name: this.meetingInfo.group_name, // 名称
        type: 'group', // 聊天类型
        avatar: '/static/images/group_avatar.png', // 头像
        id: this.meetingInfo.group_id // 群id
      });
    }
  }
};
