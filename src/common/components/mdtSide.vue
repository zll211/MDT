<template>
  <aside class="mdt-side" :style="{'min-width': collapse?'75px': '210px','width': collapse?'75px': '210px'}">
    <div class="side-header">
      <img src="@/assets/images/side-header.png">
      <p v-if="!collapse">MDT多学科<br>联合会诊平台</p>
    </div>
    <menu>
      <ul class="mdt-menu-ul">
        <li v-for="(menu, index) in menuList" :key="index">
          <router-link :to="menu.path" class="menu-item" active-class="active-menu-item" v-show="!collapse"
                       :class="{'menu-item-hidden-arrow': collapse}">
            <img class="mdt-menu-icon" :src="menu.defaultIcon" v-show="$route.path !== menu.path">
            <img class="mdt-menu-icon" :src="menu.activeIcon" v-show="$route.path === menu.path">
            <span class="mdt-menu-name">{{menu.name}}</span>
          </router-link>
          <el-tooltip class="item" effect="dark" :content="menu.name" placement="right" v-show="collapse">
            <router-link :to="menu.path" class="menu-item" active-class="active-menu-item"
                         :class="{'menu-item-hidden-arrow': collapse}">
              <img class="mdt-menu-icon" :src="menu.defaultIcon" v-show="$route.path !== menu.path">
              <img class="mdt-menu-icon" :src="menu.activeIcon" v-show="$route.path === menu.path">
            </router-link>
          </el-tooltip>
        </li>
      </ul>
    </menu>
  </aside>
</template>

<script>
  import {mapState} from 'vuex';

  export default {
    name: 'mdtSide',
    data() {
      return {};
    },
    computed: {
      ...mapState(['menus', 'collapse']),
      menuList() {
        return this.getMenus(this.menus);
      },
    },
    methods: {
      getMenus(list) {
        let menus = [];
        list.forEach((menu) => {
          if (menu.show) {
            if (menu.children?.length > 0) {
              const subMenus = this.getMenus(menu.children).map((item) => {
                item.path = menu.path + '/' + item.path;
                return item;
              });
              menus = [...menus, ...subMenus];
            } else {
              menus.push({...menu});
            }
          }
        });
        return menus;
      },
    },
  };
</script>

<style scoped lang="scss">
  @import '../../style/variables';

  .mdt-side {
    // width: 210px;
    background: #fff;
    border-right: 1px solid #EBEEF3;
    transition: all 300ms linear;
    /*height: 78px;
    background: #fff;*/
    z-index: 10;
    .side-header {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 78px;
      border-bottom: 1px solid #EBEEF3;
      img {
        width: 48px;
      }
      p {
        font-size: 16px;
        text-align: left;
        font-weight: 500;
        margin-left: 12px;
        color: #202020;
      }
    }
    .mdt-menu-ul {
      display: flex;
      flex-direction: column;
      li {
        position: relative;
        height: 60px;
        border-bottom: 1px solid #EBEEF3;
        font-size: 16px;
        .menu-item {
          height: 100%;
          width: 100%;
          display: flex;
          align-items: center;
          color: #A2A7AF;
          i {
            margin: 0 20px 0 29px;
          }
          .mdt-menu-icon {
            width: 30px;
            height: 30px;
            margin: 0 12px 0 22px;
          }
          .mdt-menu-name {
            white-space: nowrap;
            overflow-x: hidden;
          }
        }
        .active-menu-item {
          position: relative;
          padding: 0 1px 0 0;
          background: $mdt-base-active-color;
          color: #fff;
          &:after {
            position: absolute;
            width: 16px;
            height: 16px;
            content: '';
            background-image: url('../../assets/images/right.png');
            background-size: 16px 16px;
            right: 20px;
          }
        }
        .menu-item-hidden-arrow {
          &:after {
            content: none;
          }
        }
      }
    }
  }
</style>
