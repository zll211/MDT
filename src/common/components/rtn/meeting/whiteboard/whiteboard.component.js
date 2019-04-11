/* eslint-disable max-len, no-console */
import WhiteBoardService from './whiteboard.service';
import Color from './color';
import {LoadingStatus} from 'src/common/components/rtn/status';
class ApplianceNameType {
  static selector = 'selector';
  static pencil = 'pencil';
  static rectangle = 'rectangle';
  static ellipse = 'ellipse';
  static eraser = 'eraser';
  static text = 'text';
}
export default {
  data() {
    return {
      currentApplianceName: ApplianceNameType.pencil,
      strokeColor: 'rgb(236,52,85)',
      ratio: 1,
      status: LoadingStatus.init,
      wrongMsg: ''
    };
  },
  components: {
    Color
  },
  computed: {
    ratioPercent() {
      return parseInt(100 * this.ratio) + '%';
    },
    isLoading() {
      return this.status === LoadingStatus.pending;
    },
    isDone() {
      return this.status === LoadingStatus.done;
    }
  },
  mounted() {
    this.initRoom();
    window.addEventListener('resize', this.onWindowResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onWindowResize);
  },
  methods: {
    async initRoom() {
      if (this.$route.query.uuid) {
        this.whiteboard = new WhiteBoardService();
        this.status = LoadingStatus.pending;
        try {
          const response = await this.whiteboard.getToken(this.$route.query.uuid);
          if (response.status === 200) {
            await this.whiteboard.joinRoom({
              uuid: this.$route.query.uuid,
              roomToken: response.body.data.room_token,
              container: this.$refs.whiteboard
            });
            this.status = LoadingStatus.done;
          } else {
            this.status = LoadingStatus.failed;
            this.wrongMsg = '无法进入白板房间';
          }
        } catch (e) {
          this.status = LoadingStatus.failed;
          this.wrongMsg = '无法进入白板房间';
        }
      } else {
        this.status = LoadingStatus.failed;
        this.$message.error('无法进入白板房间');
        this.wrongMsg = '无法进入白板房间';
      }
    },
    onWindowResize() {
      if (this.whiteboard && this.whiteboard.room) {
        this.whiteboard.room.refreshViewSize();
      }
    },
    /**
     * 更换教具
     * @param {string} value 教具
     */
    changeApplianceName(value) {
      this.whiteboard.room.setMemberState({
        currentApplianceName: value
      });
      this.currentApplianceName = value;
    },

    /**
     * 更换颜色
     * @param {string} value 颜色
     */
    changeStrokeColor(value) {
      const strs = value.replace(/(^rgb\()|(\)$)/g, '').split(', ');
      const colors = strs.map(i => parseInt(i));
      this.whiteboard.room.setMemberState({
        strokeColor: colors
      });
      this.strokeColor = value;
    },
    zoomToNormal() {
      this.ratio = 1;
      this.whiteboard.room.zoomChange(1);
    },
    zoomChange(bigger) {
      if (bigger) {
        if (this.ratio < 10) {
          this.ratio *= 1.2;
        }
      } else {
        if (this.ratio > 0.05) {
          this.ratio *= 0.8;
        }
      }
      this.whiteboard.room.zoomChange(this.ratio);
    },

    newPage() {
      this.whiteboard.room.putScenes('/math', [{name: undefined}]);
      console.log(this.whiteboard.room.state.sceneState);
    }
  }
};
