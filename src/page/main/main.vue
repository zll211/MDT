<template>
  <el-container class='fill-contain'>
    <mdt-side></mdt-side>
    <el-container direction='vertical' style='overflow:auto;'>
      <mdt-header style='min-width: 900px;'></mdt-header>
      <el-main style='min-width: 900px;'>
        <router-view></router-view>
        <Meeting/>
        <HoverButton/>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
  // import {mainService} from './main.service';
  import {mapState} from 'vuex';
  import MdtHeader from '../../common/components/mdtHeader';
  import MdtSide from '../../common/components/mdtSide';
  import menus from './main.route';
  import {userService} from './user/user.service';
  import IMInit from 'src/layim/init';
  import {NotifyStomp, StompNotifyType} from 'src/common/service/stomp.service';
  import {FaceTimeType} from 'src/common/components/rtn/status';
  import {unsubscribe} from 'src/config/utils';
  import Meeting from 'src/common/components/rtn/meeting/meeting';
  import HoverButton from 'src/common/components/rtn/hover/hoverButton';

  export default {
    async created() {
      this.getUserInfo();
    },
    data() {
      return {};
    },
    computed: mapState(['permissions']),
    components: {MdtSide, MdtHeader, Meeting, HoverButton},
    methods: {
      formatMenus(menus, permissions) {
        return menus.map((menu) => {
          if (menu.children?.length > 0 || permissions.indexOf(menu.auth) > -1) {
            return {
              activeIcon: menu.activeIcon ? menu.activeIcon : '',
              defaultIcon: menu.defaultIcon ? menu.defaultIcon : '',
              auth: menu.auth ? menu.auth : '',
              name: menu.name ? menu.name : '',
              path: menu.path ? menu.path : '',
              show: menu.show ? menu.show : false,
              children: menu.children ? this.formatMenus(menu.children, permissions) : [],
            };
          } else {
            return {};
          }
        });
      },
      getUserInfo() {
        userService
          .getUserInfoById(window.sessionStorage.getItem('userId'), {
            include: 'organization, roles, hospital',
          })
          .then(({body}) => {
            this.$store.commit('setUser', body);
            let roleArr = body.roles.data.map((role) => {
              return role.name;
            });
            this.$store.commit('setRole', roleArr);
            const _token = window.sessionStorage.getItem('accessToken');
            if (body.hx_id && body.hx_pwd) {
              IMInit.init({
                username: body.username,
                userId: body.hx_id,
                password: body.hx_pwd,
                token: _token,
              });
            }
            this.handleNotify(body.id);
          });
      },
      getUserList() {
        userService.getUserDoctor().then(res => {
          if (res.status === 200) {
            this.$store.commit('setUserList', res.body.data);
          }
        });
      },
      handleNotify(id) {
        this.notifySubscription = new NotifyStomp(id).message$.subscribe(
          msg => {
            switch (msg.type) {
              case StompNotifyType.consultationStart: {
                const data = msg.data;
                this.$confirm(
                  `由${data.request_doctor}发起，会诊对象为${
                    data.patient_name
                    }的会诊已经开始，请立即加入会诊。`,
                  '会诊开始',
                  {
                    confirmButtonText: '立即加入',
                    cancelButtonText: '稍后加入',
                    type: 'info',
                  },
                )
                  .then(() => {
                    // 删除
                    this.$store.commit('setConsultationInfo', {
                      type: FaceTimeType.meeting,
                      id: data.id,
                      roomName: data.room_name,
                    });
                  })
                  .catch(() => {
                    // this.$message.info('已取消删除');
                  });
              }
            }
          },
          error => {
            // console.error('handleNotify', error);
          },
        );
      },
    },
    mounted() {
      this.getUserList();
      this.$store.commit('setMenus', this.formatMenus(menus[0].children, this.permissions));
    },
    beforeDestroy() {
      unsubscribe(this.notifySubscription);
      window.onresize = null;
    },
  };
</script>

<style lang='scss'>
  @import '../../style/variables';

  .fill-contain {
    background: $mdt-main-background-color;
  }

  .el-main {
    padding: 0;
  }

  /* .el-header{
      height:78px !important;
      background: #fff;
    }*/
</style>
