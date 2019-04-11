const state = {
  debug: false,
  meetingDialog: false,
  meetingHover: false,
  consultationInfo: {},
  faceTimeRoomName: null,
  whiteboardStatus: false,
};

const mutations = {
  setDebug(state, debug) {
    state.debug = debug;
  },
  setMeetingDialog(state, status) {
    state.meetingDialog = status;
  },
  setMeetingHover(state, status) {
    state.meetingHover = status;
  },
  setConsultationInfo(state, info) {
    // 表示退出视频，重置值
    if (info.roomName === undefined) {
      state.meetingDialog = false;
      state.meetingHover = false;
      state.consultationInfo = info;
    } else {
      // 如果当前视频并未退出
      if (state.meetingHover || state.meetingDialog) {
        // 且是进入当前视频房间
        // 不重新赋值
        if (info.roomName === state.consultationInfo.roomName) {
          state.meetingDialog = true;
          state.meetingHover = false;
        }
      } else {
        // 赋值 并打开视频弹框
        state.consultationInfo = info;
        state.meetingDialog = true;
        state.meetingHover = false;
      }
    }
  },
  setFaceTimeRoomName(state, roomName) {
    state.faceTimeRoomName = roomName;
  },
  setWhiteboardStatus(state, status) {
    state.whiteboardStatus = status;
  },
};

const module = {
  state,
  mutations,
};
export default module;
