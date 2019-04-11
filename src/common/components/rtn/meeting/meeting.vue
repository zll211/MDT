<template>
  <el-dialog
    :visible.sync="visible"
    fullscreen
    :show-close="false"
    :custom-class="'meeting-dialog'"
    :key="consultationInfo.roomName || 'meeting'"
    :modal="false"
  >
    <el-button
      icon="el-icon-close"
      size="mini"
      circle
      class="el-dialog_close"
      @click="minimalDialog"
    ></el-button>
    <div
      class="meeting-container"
      v-loading="initLoading"
      element-loading-text="正在进入房间"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.8)"
    >
      <div class="meeting-main" v-if="qnrtc !== null">
        <div class="sub left-sub" :class="{'collapse': leftCollapse}" v-if="isMeeting">
          <button class="caret" @click="leftCollapse = !leftCollapse"></button>
          <div class="follow-switch" v-if="!isRequestDoctor">
            <p>查看会诊资料:
              <el-tooltip effect="dark" content="开启跟随后将于发起会诊医生同步打开会诊资料" placement="right">
                <i class="el-icon-question"></i>
              </el-tooltip>
            </p>
            <el-switch v-model="isFollow" active-text="跟随" inactive-text="自由"></el-switch>
          </div>
          <ul class="files">
            <li class="file" v-for="(files, type) in attachment" :key="type">
              <el-dropdown @command="openFile">
                <button class="file-btn" :class="[files[0].type]"></button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item
                    v-for="(file, index) in files"
                    :key="file.id + 'file_id'"
                    :command="{files, index, type}"
                  >{{ file.filename }}</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </li>
          </ul>
        </div>
        <div class="main">
          <button
            class="chat-btn"
            @click="calloutChat"
            v-if="isMeeting && meetingInfo.group_name && meetingInfo.group_id"
          ></button>
          <div class="meeting-info" v-if="isMeeting">
            <div class="info-main" :class="{'collapse': !meetingInfoShow}">
              <p>
                <span class="info-label">会诊患者:</span>
                <span class="info-content">{{ meetingInfo.case.patient_name }}</span>
              </p>
              <p>
                <span class="info-label">会诊号:</span>
                <span class="info-content">{{ meetingInfo.consultation_number }}</span>
              </p>
              <p>
                <span class="info-label">会诊医生:</span>
                <span class="info-content">{{requestDoctor.realname}}</span>
              </p>
            </div>
            <div class="info-collapse" @click="meetingInfoShow = !meetingInfoShow">
              <i
                :class="{'el-icon-d-arrow-left': meetingInfoShow, 'el-icon-d-arrow-right': !meetingInfoShow}"
              ></i>
            </div>
          </div>
          <div
            class="video"
            :ref="mainWindowName"
            v-loading="videoLoading"
            element-loading-text="正在加载画面"
            element-loading-spinner="el-icon-loading"
            element-loading-background="rgba(0, 0, 0, 0.8)"
          >
            <div class="screen-active" v-show="isScreenActive">正在共享屏幕</div>
            <div class="tools" v-show="!videoLoading && !initLoading">
              <el-dropdown @command="onVideoChange" placement="top" v-if="videoDevices.length > 1">
                <button class="tool-btn camera"></button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item
                    v-for="item in videoDevices"
                    :key="item.value"
                    :command="item.value"
                    :disabled="item.value === currentVideoId"
                  >{{ item.label }}</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
              <el-dropdown @command="onAudioChange" placement="top" v-if="audioDevices.length > 1">
                <button class="tool-btn mic"></button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item
                    v-for="item in audioDevices"
                    :key="item.value"
                    :command="item"
                    :disabled="item.value === currentAudioId"
                  >{{ item.label }}</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
              <button class="tool-btn hangout" @click="finishDialog = true"></button>
              <button class="tool-btn share" @click="shareScreen" v-show="showShare"></button>
              <button class="tool-btn whiteboard" @click="openWhiteboard"></button>
            </div>
          </div>
          <div class="friend-video" v-if="isFriend" :ref="username"></div>
          <WhiteBoard v-if="whiteboardStatus"/>
        </div>
        <div class="sub right-sub" :class="{'collapse': rightCollapse}" v-if="!isFriend">
          <button class="caret" @click="rightCollapse = !rightCollapse"></button>
          <ul class="videos" v-show="!rightCollapse" v-if="isMeeting">
            <li class="videos-item" v-for="doctor in inviteeDoctors" :key="doctor.user.username">
              <div class="video" :ref="doctor.user.username">
                <div class="tools" v-if="subscribes[doctor.user.username]">
                  <button
                    class="tool-btn"
                    :class="[subscribes[doctor.user.username].video ? 'camera_off' : 'camera']"
                    @click="toggleSomeoneMedia(doctor.user.username, 'video')"
                  ></button>
                  <button
                    class="tool-btn"
                    :class="[subscribes[doctor.user.username].audio ? 'volume_off' : 'volume']"
                    @click="toggleSomeoneMedia(doctor.user.username, 'audio')"
                  ></button>
                </div>
              </div>
              <p class="title">
                {{doctor.user.realname}}-
                {{ doctor.user.organization ? doctor.user.organization.name : '' }}-
                {{doctor.user.hospital ? doctor.user.hospital.name : ''}}
                <span
                  class="online"
                >{{ doctor.user.username === username || subscribes[doctor.user.username] ? '在线' : '' }}</span>
              </p>
            </li>
          </ul>
          <ul class="videos" v-show="!rightCollapse" v-if="isGroup">
            <li class="videos-item" v-for="(trackObj, username) in subscribes" :key="username">
              <div class="video" :ref="username">
                <div class="tools">
                  <button
                    class="tool-btn"
                    v-if="subscribes[username].video !== undefined"
                    :class="[subscribes[username].video ? 'camera_off' : 'camera']"
                    @click="toggleSomeoneMedia(username, 'video')"
                  ></button>
                  <button
                    class="tool-btn"
                    v-if="subscribes[username].audio !== undefined"
                    :class="[subscribes[username].audio ? 'volume_off' : 'volume']"
                    @click="toggleSomeoneMedia(username, 'audio')"
                  ></button>
                </div>
              </div>
              <p class="title">{{username}}</p>
            </li>
          </ul>
        </div>
        <el-dialog
          :title="dislogTitle"
          :visible.sync="finishDialog"
          :width="isRequestDoctor ? '300px' : '400px'"
          center
          :modal="false"
        >
          <span>{{ dislogContent}}</span>
          <span slot="footer" class="dialog-footer">
            <el-button @click="leaveRoom" plain>{{ dislogCancelText}}</el-button>
            <el-button type="danger" @click="finish">{{ dislogOKText}}</el-button>
          </span>
        </el-dialog>
      </div>
      <div class="meeting-main wrong-msg" v-else-if="wrongMsg !== ''">
        <p style="margin-bottom: 16px;">{{wrongMsg}}</p>
        <el-button type="danger" @click="unNormalQuit">关闭</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script src="./meeting.component.js"></script>
<style lang="scss" src="./meeting.scss"></style>
