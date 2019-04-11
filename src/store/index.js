import Vue from 'vue';
import Vuex from 'vuex';
// import {exampleModule} from "../example/example.store";
import meeting from './meeting';

Vue.use(Vuex);

const state = {
  urlList: [],
  menus: [],
  isLogin: false,
  user: {},
  role: [],
  collapse: false,
  userList: [],
  permissions: [],
  width: document.body.clientWidth,
  height: document.body.clientHeight,
  currentPageStatus: {},
};

const mutations = {
  setURL(state, list) {
    state.urlList = list;
  },
  setMenus(state, menus) {
    state.menus = menus;
  },
  setPermissions(state, permissions) {
    state.permissions = permissions;
  },
  isLogin(state, status) {
    state.isLogin = status;
  },
  setUser(state, user) {
    state.user = user;
  },
  setRole(state, role) {
    state.role = role;
  },
  setCollapse(state, collapse) {
    state.collapse = collapse;
  },
  setUserList(state, userList) {
    state.userList = userList;
  },
  resize(state, size) {
    state.width = size.width;
    state.height = size.height;
  },
  setCurrentPage(state, currentPage) {
    state.currentPageStatus = currentPage;
  },
};

const actions = {};

export default new Vuex.Store({
  strict: true,
  state,
  actions,
  mutations,
  modules: {
    // exampleModule,
    meeting,
  },
});
