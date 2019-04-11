import {userService} from './user.service';
import {debounce} from '../../../config/utils';

export default {
  data() {
    return {
      currentData: {},
      currentPage: 1,
      context: '',
      defaultExpanded: [],
      doctorData: [],
      doctorHeader: [{
        'prop': 'username',
        'label': '用户名',
        'min-width': 120,
      }, {
        'prop': 'realname',
        'label': '用户姓名',
        'min-width': 120,
      }, {
        'prop': 'role',
        'label': '角色',
        'min-width': 90,
      }, {
        'prop': 'title',
        'label': '职称',
        'min-width': 70,
      }, {
        'prop': 'mobile',
        'label': '联系电话',
        'min-width': 120,
      }],
      enter: true,
      formLabelWidth: '80px',
      groupInput: false,
      hospitalData: [],
      hospitalName: '未命名工作组',
      loading: false,
      leftSearch: '',
      menuLeft: 0,
      menuTop: 0,
      operateData: {},
      selectedOptions: [],
      pageSize: 10,
      rightSearch: '',
      roleList: [],
      selectedList: [],
      showEmailError: false,
      tableLoading: false,
      timer: null,
      total: 30,
      userFormVisible: false,
      userTitle: '添加用户',
      userForm: {
        selectedOptions: [],
        role_id: [],
      },
      userRules: {
        username: [{
          required: true, message: '请输入用户名', trigger: 'blur',
        }, {pattern: /^[\w]{1,}$/, message: '用户名必须由字母，数字和下划线组成', trigger: 'blur'}],
        realname: [{
          required: true, message: '请输入用户姓名', trigger: 'blur',
        }],
        password: [{
          required: true, message: '请输入密码', trigger: 'blur',
        }],
        role_id: [{
          required: true, message: '请选择角色', trigger: 'change',
        }],
        title: [{
          required: true, message: '请输入职称', trigger: 'blur',
        }],
        mobile: [{
          required: true, message: '请输入手机号', trigger: 'blur',
        }, {pattern: /^1[34578]\d{9}$/, message: '请填写正确手机号', trigger: 'blur'}],
        selectedOptions: [{required: true, message: '请选择组织', trigger: 'change'}],
      },
      userHeight: -100,
    };
  },
  watch: {
    leftSearch(val) {
      this.$refs.hospitalTree.filter(val);
    },
  },
  created() {
    this.getHospitalList();
    this.getRoles();
  },
  mounted() {
    window.addEventListener('click', this.initState);
    this.$watch('rightSearch', debounce(() => {
      this.currentPage = 1;
      this.getUserList();
    }, 1000));
  },
  methods: {
    getDoctorList() {
      userService.getUserDoctor().then((res) => {
        if (res.status === 200) {
          this.$store.commit('setUserList', res.body.data);
        }
      });
    },
    handleChange(val) {
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    getRoles() {
      userService.getRoles().then((res) => {
        if (res.status === 200) {
          this.roleList = res.body.data || [];
        }
      });
    },
    getHospitalList(id, subId) {
      // 得到组织列表
      this.loading = true;
      userService.getOrganization().then((res) => {
        if (res.status === 200) {
          this.hospitalData = (res.body.data || []).map((item) => {
            let children = item.children.map((subItem) => ({
              active: false,
              is_show: false,
              double_click: false,
              level: 2,
              label: subItem.name,
              id: subItem.id,
              parent_id: Number(subItem.parent_id),
              value: subItem.id,
              count: subItem.user_count,
            }));
            return {
              active: false,
              is_show: false,
              double_click: false,
              level: 1,
              label: item.name,
              id: item.id,
              children: children,
              value: item.id,
              count: item.user_count,
            };
          });
          if (this.hospitalData.length > 0) {
            // 初始化工作
            this.operateData = {};
            if (id !== undefined) {
              let data = this.hospitalData.find((item) => item.id === id);
              this.currentData = data;
              if (subId !== undefined) {
                let index = data.children.findIndex((item) => item.id === subId);
                this.currentData = data.children[index];
              }
            } else {
              this.currentData = this.hospitalData[0];
            }
            this.defaultExpanded = [this.currentData.id];
            if (this.currentData.level === 2) {
              this.currentData.active = true;
            } else {
              this.$nextTick(() => {
                this.$refs.hospitalTree.setCurrentKey(this.currentData.id);
              });
            }
            this.getUserList();
          }
        } else {
          this.$message.error(res.body.message);
        }
      }).catch((res) => {
        this.$message.error(res.body.message || '组织列表获取失败');
      }).finally(() => {
        this.loading = false;
      });
    },
    initState() {
      this.hospitalData.forEach((item) => {
        item.is_show = false;
        item.children.forEach((val) => {
          val.is_show = false;
        });
      });
    },
    changeState(type, data) {
      this.hospitalData.forEach((item) => {
        if (item.id === data.id) {
          item[type] = true;
        } else item[type] = false;
        item.children.forEach((val) => {
          if (val.id === data.id) {
            val[type] = true;
          } else val[type] = false;
        });
      });
    },
    handleNodeClick(data, node) {
      // 如果此时有其它项出现右键菜单
      if (data.new) {
        this.$nextTick(() => {
          this.$refs.hospitalTree.setCurrentKey(this.currentData.id);
        });
      }
      this.initState();
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.clickEvent(data);
      }, 280);
    },
    clickEvent(data) {
      this.rightSearch = '';
      // // 如果此时正在编辑
      if (this.operateData.double_click) {
        if (this.operateData.id !== undefined) {
          // 编辑group 或者是科室
          if (this.operateData.id === data.id) {
            // 点击的正好是编辑的
            return;
          }
        } else {
          // 新增科室
          return;
        }
      }
      // 改变状态
      this.$set(this.currentData, 'active', false);
      this.currentData = data;
      if (data.level === 2) {
        this.$set(this.currentData, 'active', true);
      }
      this.currentPage = 1;
      this.getUserList();
    },
    // 创建以及修改组织
    createGroup() {
      this.groupInput = true;
      this.enter = true;
      this.$nextTick(() => {
        if (this.$refs['newInput']) {
          this.$refs['newInput'].focus();
        }
      });
      this.hospitalName = '未命名工作组';
    },
    validateOrganizationName(data, params, operate = 'new') {
      if (params.name.match(/^[ ]*$/)) {
        this.$message.error('名称不能为空或全为空格');
        this.enter = true;
      } else {
        if (!params.parent_id) {
          let sameName = this.hospitalData.find((item) => item.label === params.name);
          if (sameName) {
            if (operate === 'edit') {
              if (!(data.id === sameName.id)) {
                this.$message.error('该医院已经存在');
                this.enter = true;
              }
            } else {
              this.$message.error('该医院已经存在');
              this.enter = true;
            }
          }
        } else {
          let parent = this.hospitalData.find((item) => item.id === params.parent_id);
          let sameName = parent.children.find((item) => item.label === params.name);
          let index = parent.children.findIndex((item) => item.label === params.name);
          if (sameName) {
            if (operate === 'edit') {
              if (!(data.id === sameName.id)) {
                this.$message.error('该科室已经存在');
                this.enter = true;
              }
            } else {
              if (!(index === parent.children.length - 1)) {
                this.$message.error('该科室已经存在');
                this.enter = true;
              }
            }
          }
        }
      }
    },
    saveGroup(data) {
      this.enter = false;
      if (data) {
        // 编辑用户组保存,根据node的level确定是group还是科室
        if (data.level === 1) {
          // group   this.operateData请求编辑保存工作组接口
          let params = {
            name: this.context,
          };
          this.patch(data, params, data.id);
        } else {
          // 科室 还要判断是新增还是编辑
          if (data.id !== undefined) {
            // 编辑
            let params = {
              name: this.context,
              parent_id: this.operateData.parent_id,
            };
            this.patch(data, params, data.id, data.parent_id);
          } else {
            // 新增
            let params = {
              name: this.context,
              parent_id: data.parent_id,
            };
            this.save(data, params, data.parent_id);
          }
        }
      } else {
        // 新增用户组保存
        if (this.groupInput) {
          // group新增 groupName = hospitalName
          let params = {
            name: this.hospitalName,
          };
          this.save(data, params);
        }
      }
    },
    save(data, params, id = undefined) {
      // 对组织名进行验证
      this.validateOrganizationName(data, params);
      if (this.enter) {
        return;
      }
      userService.saveOrganization(params).then((res) => {
        if (res.status === 200) {
          this.$message.success('创建成功');
          if (this.groupInput) {
            this.groupInput = false;
          }
          this.getHospitalList(id);
        } else {
          this.enter = true;
          this.$message.error(res.body.message);
        }
      }).catch((res) => {
        this.enter = true;
        this.$message.error(res.body.message);
      });
    },
    patch(data, params, id, parentId) {
      this.validateOrganizationName(data, params, 'edit');
      if (this.enter) {
        return;
      }
      userService.patchOrganization(id, params).then((res) => {
        if (res.status === 200) {
          this.$message.success('编辑成功');
          if (arguments.length === 4) {
            this.getHospitalList(parentId, id);
          } else {
            this.getHospitalList(id);
          }
        } else {
          this.enter = true;
          this.$message.error(res.body.message);
        }
      }).catch((res) => {
        this.enter = true;
        this.$message.error(res.body.message);
      });
    },
    cancelSaveGroup(data) {
      this.enter = true;
      this.$confirm('你确认要取消修改操作吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        if (data) {
          if (data.id !== undefined) {
            this.operateData.double_click = false;
          } else {
            // 新建科室的时候取消
            let parent;
            let index;
            this.hospitalData.forEach((item) => {
              if (item.children.find((val) => val.new)) {
                parent = item;
                index = parent.children.findIndex((subVal) => subVal.new);
              }
            });
            parent.children.splice(index, 1);
          }
        } else {
          this.groupInput = false;
        }
        this.operateData = {};
      }).catch(() => {
        if (this.$refs['editInput']) {
          this.$refs['editInput'].focus();
        }
        if (this.$refs['newInput']) {
          this.$refs['newInput'].focus();
        }
      });
    },
    // 删除组织
    deleteGroup(data) {
      // 调用删除工作组接口，注意是否要二次删除
      this.initState();
      this.$confirm('该组织删除后无法恢复，确定要删除吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        userService.deleteOrganization(data.id).then((res) => {
          if (res.status === 201) {
            this.$message.success('删除成功');
            if (data.parent_id) {
              this.getHospitalList(data.parent_id);
            } else {
              this.getHospitalList();
            }
          } else {
            this.$message.error('删除失败');
          }
        }).catch(() => {
          this.$message.error('删除失败');
        });
      }).catch(() => {
        this.$message.info('已取消删除');
      });
    },
    // 组织右击事件
    showContext(data, e) {
      this.initState();
      this.hospitalData.forEach((item) => {
        if (item.id === data.id) {
          if (!item.double_click) {
            item.is_show = true;
          }
        } else item.is_show = false;
        item.children.forEach((val) => {
          if (val.id === data.id) {
            if (!val.double_click) {
              val.is_show = true;
            }
          } else val.is_show = false;
        });
      });
      // 控制出现位置
      let left = e.offsetX + 26;
      if (left > 176) {
        left = 176;
      }
      this.menuLeft = left + 'px';
      this.menuTop = e.offsetY + 'px';
    },
    // 组织双击事件
    editTitle(data) {
      // 如果此时有其它项出现右键菜单
      this.initState();
      clearTimeout(this.timer);
      // this.changeState('select', data);
      this.clickEvent(data);
      this.enter = true;
      this.operateData = data;
      this.context = data.label;
      this.changeState('double_click', data);
      this.$nextTick(() => {
        this.$refs['editInput'].focus();
      });
    },
    createDepartment(data) {
      this.defaultExpanded = [];
      this.defaultExpanded.push(data.id);
      this.enter = true;
      const newChild = {
        label: '未命名科室',
        double_click: true,
        is_show: false,
        new: true,
        parent_id: data.id,
      };
      this.operateData = newChild;
      this.context = '未命名科室';
      if (!data.children) {
        this.$set(data, 'children', []);
      }
      data.children.push(newChild);
      this.initState();
      // this.$forceUpdate();
      setTimeout(() => {
        if (this.$refs['editInput']) {
          this.$refs['editInput'].focus();
        }
      });
    },
    // 用户部分
    validateEmail() {
      if (this.userForm.email) {
        let reg = new RegExp('^[a-z0-9A-Z]+[- | a-z0-9A-Z . _]+@([a-z0-9A-Z]+(-[a-z0-9A-Z]+)?\\.)+[a-z]{2,}$');
        if (!reg.test(this.userForm.email)) {
          this.showEmailError = true;
          return;
        }
      }
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getUserList();
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.getUserList();
    },
    createUser() {
      this.userTitle = '添加用户';
      this.showEmailError = false;
      this.userFormVisible = true;
      if (this.$refs['userForm']) {
        this.$refs['userForm'].resetFields();
        this.userForm = {
          username: '',
          realname: '',
          password: '',
          role_id: [],
          title: '',
          email: '',
          mobile: '',
          selectedOptions: [],
        };
      }
      if (this.currentData.level === 1) {
        if (this.currentData.children.length > 0) {
          this.userForm.selectedOptions = [this.currentData.id, this.currentData.children[0].id];
        } else {
          this.userForm.selectedOptions = [this.currentData.id];
        }
      } else {
        this.userForm.selectedOptions = [this.currentData.parent_id, this.currentData.id];
      }
    },
    editUser(row) {
      this.userTitle = '编辑用户';
      this.showEmailError = false;
      let secondId = Number(row.organization_id);
      let firstId;
      for (let item of this.hospitalData) {
        for (let subItem of item.children) {
          if (subItem.id === secondId) {
            firstId = item.id;
            break;
          }
        }
        if (firstId) {
          break;
        }
      }
      if (this.$refs['userForm']) {
        this.$refs['userForm'].resetFields();
      }
      let _form = Object.assign({}, row);
      _form.password = encodeURIComponent('//:,;');
      this.userForm = _form;
      if (firstId) {
        this.userForm.selectedOptions = [firstId, secondId];
      } else {
        this.userForm.selectedOptions = [secondId];
      }

      this.userFormVisible = true;
    },
    deleteUser(id) {
      let data;
      if (typeof id === 'number') {
        data = {user_id: [id]};
      } else if (this.selectedList.length === 0) {
        this.$message.error('请先选择要删除的用户');
        return;
      } else {
        let arr = [];
        this.selectedList.forEach((item) => {
          arr.push(item.id);
        });
        data = {user_id: arr};
      }
      this.$confirm('用户删除后无法恢复，确定要删除吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        //  调用单个删除接口
        userService.deleteUser(data).then((res) => {
          if (res.status === 204) {
            this.$message.success('删除成功');
            if (this.currentData.level === 1) {
              this.getHospitalList(this.currentData.id);
            } else {
              this.getHospitalList(this.currentData.parent_id, this.currentData.id);
            }
            this.getDoctorList();
          } else {
            this.$message.error('删除失败');
          }
        }).catch(() => {
          this.$message.error('删除失败');
        });
      }).catch(() => {
        this.$message.info('已取消删除');
        // this.$refs.doctorTable.clearSelection();
      });
    },
    cancelSave() {
      this.userFormVisible = false;
    },
    filterParams(params, id) {
      let originObj = this.doctorData.find((item) => item.id === id);
      for (let attr in params) {
        if (!params[attr] || params[attr] === originObj[attr]) {
          delete params[attr];
        }
      }
      return params;
    },
    saveUser() {
      let params = {
        username: this.userForm.username,
        password: this.userForm.password,
        email: this.userForm.email,
        mobile: this.userForm.mobile,
        realname: this.userForm.realname,
        title: this.userForm.title,
        role_id: this.userForm.role_id,
        hospital_id: this.userForm.selectedOptions.length ? this.userForm.selectedOptions[0] : '',
        organization_id: this.userForm.selectedOptions.length >= 2 ? this.userForm.selectedOptions[this.userForm.selectedOptions.length - 1] : '',
      };
      // 如果输入了邮箱，对邮箱进行验证
      this.validateEmail();
      this.$refs['userForm'].validate((valid) => {
        if (valid && !this.showEmailError) {
          if (this.userForm.id) {
            // 编辑
            if (params.password === encodeURIComponent('//:,;')) {
              params.password = '';
            }
            params = this.filterParams(params, this.userForm.id);
            userService.patchUser(this.userForm.id, params).then((res) => {
              if (res.status === 200) {
                this.$message.success('编辑成功');
                if (this.currentData.level === 1) {
                  this.getHospitalList(this.currentData.id);
                } else {
                  this.getHospitalList(this.currentData.parent_id, this.currentData.id);
                }
                this.userFormVisible = false;
                this.getDoctorList();
              } else {
                this.$message.error(res.body.message);
              }
            }).catch((res) => {
              this.$message.error(res.body.message);
            });
          } else {
            // 新建保存
            if (!params.email) {
              delete params.email;
            }
            if (!params.organization_id) {
              delete params.organization_id;
            }
            userService.saveUser(params).then((res) => {
              if (res.status === 201) {
                this.$message.success('创建成功');
                if (this.currentData.level === 1) {
                  this.getHospitalList(this.currentData.id);
                } else {
                  this.getHospitalList(this.currentData.parent_id, this.currentData.id);
                }
                this.getDoctorList();
                this.userFormVisible = false;
              } else {
                this.$message.error(res.body.message);
              }
            }).catch((res) => {
              this.$message.error(res.body.message);
            });
          }
        }
      });
    },
    handleSelectionChange(val) {
      this.selectedList = val;
    },
    getUserList() {
      // 得到用户列表
      this.tableLoading = true;
      let params = {
        organization_id: this.currentData.id,
        include: 'roles',
        username: this.rightSearch,
        page: this.currentPage,
        page_size: this.pageSize,
      };
      userService.userList(params).then((res) => {
        if (res.status === 200) {
          this.doctorData = res.body.data;
          res.body.data.forEach((item) => {
            item.role = (item.roles.data || []).map((item) => item.name);
            item.role_id = (item.roles.data || []).map((item) => item.id);
            if (item.role.length === 0) {
              item.role = '';
            } else {
              item.role = item.role.join(' , ');
            }
          });
          this.total = res.body.meta.pagination.total;
        }
      }).catch((res) => {
        this.$message.error(res.body.message);
      }).finally(() => {
        this.tableLoading = false;
      });
    },
  },
};
