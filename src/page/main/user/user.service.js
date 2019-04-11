import Vue from 'vue';
import {baseUrl} from '@/config/utils';

/**
 * 用户管理模块的服务
 * @class
 */
class UserService {
  /**
   * @constructor
   */
  constructor() {
  }

  /**
   * 用户列表接口
   * @param {Object} params 获取的条件
   * @return {Promise}
   */
  userList(params) {
    return Vue.http.get(`${baseUrl}/users`, {params: params});
  }

  /**
   * 编辑用户个人信息
   * @param {int} id 用户的id
   * @param {Object} params 用户个人信息
   * @return {Promise}
   */
  patchUser(id, params) {
    return Vue.http.put(`${baseUrl}/users/${id}`, params);
  }

  /**
   * 保存用户个人信息
   * @param {object} params 用户个人信息
   * @return {Promise}
   */
  saveUser(params) {
    return Vue.http.post(`${baseUrl}/users`, params);
  }

  /**
   * 删除用户
   * @param {Object} data  要删除用户的id
   * @return {Promise}
   */
  deleteUser(data) {
    return Vue.http.delete(`${baseUrl}/users`, {body: data});
  }

  /**
   * 获取角色下拉框内容
   * @return {Promise}
   */
  getRoles() {
    return Vue.http.get(`${baseUrl}/roles`);
  }

  /**
   * 获取组织列表
   * @return {Promise}
   */
  getOrganization() {
    return Vue.http.get(`${baseUrl}/organization`);
  }

  /**
   * 获取单个组织及下属组织
   * @param {int} id 要获取的组织的
   * @return {Promise}
   */
  getSingleOrganization(id) {
    return Vue.http.get(`${baseUrl}/organization/${id}`);
  }

  /**
   * 添加组织
   * @param {Object} params 添加组织所需的信息
   * @param {string} params.name - 组织名
   * @param {string} params.parent_id - 父组织id
   * @return {Promise}
   */
  saveOrganization(params) {
    return Vue.http.post(`${baseUrl}/organization`, params);
  }

  /**
   * 修改组织
   * @param {int} id 要修改的组织id
   * @param {Object} params 修改的组织信息
   * @return {Promise}
   */
  patchOrganization(id, params) {
    return Vue.http.patch(`${baseUrl}/organization/${id}`, params);
  }

  /**
   * 删除组织
   * @param {int} id 要删除的组织
   * @return {Promise}
   */
  deleteOrganization(id) {
    return Vue.http.delete(`${baseUrl}/organization/${id}`);
  }

  /**
   * 通过用户id获取用户信息
   * @param {String} id 用户id
   * @param {Object} params include
   * @return {Promise}
   */
  getUserInfoById(id, params) {
    return Vue.http.get(`${baseUrl}/users/${id}`, {params: params});
  }

  /**
   * 获取所有医生
   * @return {Promise}
   */
  getUserDoctor() {
    return Vue.http.get(`${baseUrl}/doctors`);
  }
}

const userService = new UserService();

export {userService};
