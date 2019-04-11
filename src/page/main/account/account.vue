<template>
  <div class="account-container main-contain" v-height>
    <div class="account-main">
      <el-upload
        action="/api/im/upload_image"
        :on-success="uploadImgSuccess"
        :headers="uploadHeaders"
        :show-file-list="false">
        <div class="user-head">
          <img v-if="!user.avatar" src="../../../assets/images/default-head.png">
          <img v-if="user.avatar" :src="user.avatar">
          <div class="img-hover"></div>
        </div>
      </el-upload>
      <p class="user-name">{{user.realname}}</p>
      <div class="user-main">
        <div class="user-form-item">
          <div class="flex align-items-center" v-if="!isEditRealName">
            <span class="user-item-label">用户名</span>
            <span class="user-item-value">{{user.realname}}</span>
          </div>
          <div class="flex" v-if="isEditRealName">
            <span class="user-item-label" style="margin: 5px 0 0">用户名</span>
            <div class="user-item-value flex column">
              <el-input size="small" v-model="lastRealName"></el-input>
              <div class="flex" style="margin: 20px 0 0">
                <el-button type="primary" size="small" class="flex-1" @click="confirmEditRealName">确定</el-button>
                <el-button type="info" size="small" class="flex-1" @click="cancelEditRealName">取消</el-button>
              </div>
            </div>
          </div>
          <el-button class="user-item-btn" v-if="!isEditRealName" type="text" @click="editRealName">编辑</el-button>
        </div>
        <div class="user-form-item">
          <div class="flex">
            <span class="user-item-label">性别</span>
            <span class="user-item-value flex row">
              <div class="sex-item" v-for="sex in sexList" :key="sex.value" @click="selectSex(sex)">
                <img v-if="sex.value!==user.gender" src="../../../assets/images/unselected.png">
                <img v-if="sex.value===user.gender" src="../../../assets/images/selected.png">
                <span>{{sex.name}}</span>
              </div>
            </span>
          </div>
        </div>
        <div class="user-form-item">
          <div class="flex align-items-center">
            <span class="user-item-label">角色</span>
            <span class="user-item-value">
              <el-tag style="margin-right: 10px" v-for="role in roles" :key="role.id">{{role.name}}</el-tag>
            </span>
          </div>
        </div>
        <div class="user-form-item">
          <div class="flex">
            <span class="user-item-label">手机号码</span>
            <span class="user-item-value" v-if="!mobileStep">{{user.mobile}}</span>
          </div>
          <el-button class="user-item-btn" type="text" v-if="!mobileStep" @click="changeMobile">更换</el-button>
        </div>
        <div class="change-user-mobile" v-if="mobileStep">
          <div class="user-mobile-item flex align-items-center">
            <span class="user-mobile-item-label">新手机号：</span>
            <div>
              <el-input size="small" placeholder="请输入新手机号" v-model="newMobile"></el-input>
            </div>
          </div>
          <div class="user-mobile-item flex">
            <span class="user-mobile-item-label" style="margin: 5px 0 0">验证码：</span>
            <div>
              <el-input size="small" placeholder="请输入验证码" v-model="code">
                <div slot="suffix" class="append-code" @click="getVerificationCode">{{message}}</div>
              </el-input>
              <div class="flex align-items-center" style="margin: 20px 0 0">
                <el-button type="primary" size="small" class="flex-1" @click="nextEditPhone">确定</el-button>
                <el-button type="info" size="small" class="flex-1" @click="cancelEditPhone">取消</el-button>
              </div>
            </div>
          </div>
        </div>
        <div class="user-form-item">
          <div class="flex">
            <span class="user-item-label">登录密码</span>
            <span class="user-item-value" v-if="!isModifyPwd">××××××××</span>
          </div>
          <el-button class="user-item-btn" type="text" v-if="!isModifyPwd" @click="modifyPassword">修改</el-button>
        </div>
        <div class="modify-user-pwd" v-if="isModifyPwd">
          <!--<div class="user-pwd-item flex align-items-center">
            <span class="user-pwd-item-label">原始密码：</span>
            <div class="user-item-value">
              <el-input size="small" v-model="lastMobile"></el-input>
            </div>
          </div>-->
          <div class="user-pwd-item flex align-items-center">
            <span class="user-pwd-item-label">新密码：</span>
            <div class="user-item-value">
              <el-input size="small" type="password" placeholder="请输入新密码" v-model="newPassword"></el-input>
            </div>
          </div>
          <div class="user-pwd-item flex">
            <span class="user-pwd-item-label" style="margin: 5px 0 0">确认新密码：</span>
            <div class="user-item-value">
              <el-input size="small" type="password" placeholder="请确认新密码" v-model="confirmPassword"></el-input>
              <div class="flex align-items-center" style="margin: 20px 0 0">
                <el-button type="primary" size="small" class="flex-1" @click="confirmEditPwd">确定</el-button>
                <el-button type="info" size="small" class="flex-1" @click="cancelEditPwd">取消</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./account.component.js"></script>
<style lang="scss" src="./account.scss" scoped></style>
