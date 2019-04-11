<template>
  <header class="mdt-header">
    <div style="line-height: 0">
      <img class="collapse" v-show="!collapse" @click="toggleCollapse(true)" src="@/assets/images/collapse.png">
      <img class="expand" v-show="collapse" @click="toggleCollapse(false)" src="@/assets/images/expand.png">
    </div>
    <div class="header-right flex align-items-center">
      <!--<debug-button />-->
      <router-link to="/user" class="header-action" v-if="role.indexOf('管理员')>-1">用户管理</router-link>
      <!--<img class="header-action" src="../../assets/images/messge-icon.png" height="24" width="24"/>-->
      <router-link to="/account" class="header-action">{{user.realname}}</router-link>
      <el-dropdown @command="handleCommand" size="small">
        <div>
          <img class="user-img" v-if="user.avatar" :src="user.avatar"/>
          <img class="user-img" v-if="!user.avatar" src="../../assets/images/default-avator.png"/>
        </div>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="account">{{user.realname}}</el-dropdown-item>
          <el-dropdown-item :divided="true" command="logout">退出
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </header>
</template>

<script>
  import {mapState} from 'vuex';
  import {loginService} from '../../page/base/login/login.service';

  export default {
    name: 'mdtHeader',
    computed: {
      ...mapState(['collapse', 'user', 'role']),
    },
    data() {
      return {};
    },
    components: {
    },
    methods: {
      toggleCollapse(collapse) {
        this.$store.commit('setCollapse', collapse);
      },
      handleCommand(command) {
        if (command === 'logout') {
          loginService.logout()
            .then(() => {
              this.$store.commit('isLogin', false);
              window.sessionStorage.clear();
              // this.$router.push('/login');
              // 为了关闭LayIM
              window.location.href = '/';
            });
        }
        if (command === 'account') {
          this.$router.push('/account');
        }
      },
    },
  };
</script>

<style scoped lang="scss">
  .mdt-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 78px;
    min-height: 78px;
    background: #fff;
    border-bottom: 1px solid #EBEEF3;
    .collapse {
      margin-left: 46px;
      width: 24px;
      height: 24px;
      cursor: pointer;
    }
    .expand {
      @extend .collapse;
    }
    .header-right {
      margin: 0 64px 0 0;
      line-height: 0;
      .user-img {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: none;
      }
    }
    .header-action{
      color: rgb(68,68,68);
      margin-right: 20px;
      cursor: pointer;
      &:hover {
        color: #609EFE;
      }
    }
  }
</style>
