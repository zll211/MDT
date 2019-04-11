<template>
  <div class="user-container main-contain" v-height="userHeight">
    <div class="content-left flex column" ref="leftContent">
      <div class="left-top flex align-items-start">
        <el-button  icon="el-icon-plus" type="primary" class="operate-add" @click="createGroup"  size="small"></el-button>
        <el-input
          class="flex-1"
          placeholder="搜索"
          prefix-icon="el-icon-search"
          size="small"
          v-model="leftSearch">
        </el-input>
      </div>
      <div class="left-center flex-1">
        <el-input
          v-model="hospitalName"
          v-show="groupInput"
          @blur="enter&&cancelSaveGroup()"
          @keyup.enter.native="saveGroup()"
          ref="newInput"></el-input>
        <el-tree :data="hospitalData"
                 node-key="id"
                 class="hospital-tree"
                 accordion
                 :default-expanded-keys="defaultExpanded"
                 :filter-node-method="filterNode"
                 ref="hospitalTree"
                 @node-click="handleNodeClick"
                 highlight-current
                 v-loading="loading">
          <div class="custom-tree-node flex flex-1 justify-content-between align-items-end"
               slot-scope="{ node, data }" @contextmenu.prevent="showContext(data,$event)" @dblclick="editTitle(data)">
            <span v-if="!data.double_click" class="not-db justify-content-between flex">
              <span :class="{'active-blue':data.active}">{{node.label}}</span>
              <span :class="{'active-blue':data.active}">{{data.count}}</span>
              <img v-if="data.active"  src="../../../assets/images/user-side.png" alt="" height="7px">
            </span>
            <el-input v-model=context v-else @blur="enter&&cancelSaveGroup(data)" @keyup.enter.native="saveGroup(data)" ref="editInput">
            </el-input>
            <div :class="{'menu-show':data.is_show,'menu-hide':!data.is_show}" v-if="node.level===1" :style="{top: menuTop,left: menuLeft}">
              <p @click.stop="createDepartment(data)" >创建科室</p>
              <p @click.stop="deleteGroup(data)" class="to-delete">删除工作组</p>
            </div>
            <div :class="{'menu-show':data.is_show,'menu-hide':!data.is_show}" :style="{top: menuTop,left: menuLeft}" v-else >
              <p @click.stop="deleteGroup(data)">删除科室</p>
            </div>
          </div>

        </el-tree>
      </div>
    </div>
    <div class="content-right flex column flex-1">
      <div class="right-top flex justify-content-between">
        <el-input
          class="right-search"
          placeholder="搜索"
          prefix-icon="el-icon-search"
          v-model="rightSearch"
          size="small"
          clearable>
        </el-input>
        <div class="operate">
          <el-button  icon="el-icon-plus" type="primary" class="operate-add" @click="createUser" size="small"></el-button>
          <el-button  icon="el-icon-delete" type="danger" class="operate-add" @click="deleteUser" size="small"></el-button>
        </div>
      </div>
      <div class="right-center flex-1">
        <el-table
          :data="doctorData"
          @selection-change="handleSelectionChange"
          ref="doctorTable"
          v-loading="tableLoading"
          style="width: 100%">
          <el-table-column
            type="selection"
            width="55">
          </el-table-column>
          <el-table-column
            v-for="(item,index) in doctorHeader"
            :key="index"
            :prop="item.prop"
            :label="item.label"
            :min-width="item['min-width']">
          </el-table-column>
          <el-table-column
            fixed="right"
            label="操作"
            width="150">
            <template slot-scope="scope">
              <span class="user-operator user-edit" @click="editUser(scope.row)"></span>
              <span class="user-operator user-delete" @click="deleteUser(scope.row.id)"></span>
              <!--<span class="user-operator user-enable"></span>-->
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination flex justify-content-center align-items-center">
          <el-pagination @size-change="handleSizeChange"
                         @current-change="handleCurrentChange"
                         :current-page="currentPage"
                         :page-sizes="[10, 20, 40, 80]"
                         :page-size="pageSize"
                         layout="total, sizes, prev, pager, next, jumper"
                         :total="total">
          </el-pagination>
        </div>
      </div>
      <el-dialog :title=userTitle :visible.sync="userFormVisible" width="625px" class="user-dialog" >
        <el-form :model="userForm" label-position="left" :label-width="formLabelWidth" :rules="userRules" ref="userForm" :validate-on-rule-change=false>
          <el-form-item label="用户名"  prop="username">
            <el-input v-model="userForm.username" clearable placeholder="输入用户名"></el-input>
          </el-form-item>
          <el-form-item label="用户姓名"  prop="realname">
            <el-input v-model="userForm.realname" clearable placeholder="输入用户姓名"></el-input>
          </el-form-item>
          <el-form-item label="密码"  prop="password">
            <el-input v-model="userForm.password" clearable placeholder="输入密码" type="password"></el-input>
          </el-form-item>
          <el-form-item label="角色" prop="role_id">
            <el-select v-model="userForm.role_id" placeholder="未选择" multiple>
              <el-option v-for="(item,index) in roleList" :key="index" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="职称" prop="title">
            <el-input v-model="userForm.title" placeholder="输入职称" clearable></el-input>
          </el-form-item>
          <el-form-item label="组织" prop="selectedOptions">
            <el-cascader
              expand-trigger="hover"
              :options="hospitalData"
              v-model="userForm.selectedOptions"
              change-on-select
              clearable
              @change="handleChange">
            </el-cascader>
          </el-form-item>
          <el-form-item label="联系电话" prop="mobile">
            <el-input v-model="userForm.mobile" autocomplete="off" placeholder="输入联系电话" clearable></el-input>
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input type="email" v-model="userForm.email" placeholder="输入邮箱" @input="showEmailError = false" @blur="validateEmail" clearable></el-input>
            <div class="el-form-item__error" v-show="showEmailError">邮箱的格式不正确</div>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click=cancelSave>取 消</el-button>
          <el-button type="primary" @click=saveUser>保存</el-button>
        </div>
      </el-dialog>
      <!--</div>-->
    </div>
  </div>
</template>

<script src="./user.component.js"></script>
<style lang="scss" src="./user.scss"></style>
