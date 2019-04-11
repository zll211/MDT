<template>
  <div class="fill-contain login-container">
    <div class="login-main flex" :style="{'min-width': minWidth}">
      <div class="login-left flex-1" v-if="showLeft"></div>
      <div class="login-right flex-1">
        <div class="login-right-main">
          <p class="project-name"></p>
          <div class="login-tabs">
            <div class="tab" :class="{'active': activeName==='1'}"
                 @click="handleClick('1')">密码登录
            </div>
            <div class="tab" style="margin-left: 30px"
                 :class="{'active': activeName==='2'}"
                 @click="handleClick('2')">短信登录
            </div>
          </div>
          <el-row>
            <el-col :span="24">
              <el-form label-width="0" :model="loginForm" :rules="loginRules" ref="loginForm">
                <el-form-item prop="username" v-if="activeName==='1'">
                  <el-input placeholder="请输入手机号码/用户名" v-model="loginForm.username">
                    <!--<i slot="prefix" class="el-input__icon el-icon-mobile-phone"></i>-->
                    <div slot="prefix" class="login-icon"><img src="@/assets/images/phone.png"></div>
                  </el-input>
                  <div class="form-error" slot="error" slot-scope="scope">
                    <i class="el-input__icon el-icon-info"></i>
                    <span>{{scope.error}}</span>
                  </div>
                </el-form-item>
                <el-form-item prop="mobile" v-if="activeName==='2'">
                  <el-input placeholder="请输入手机号码" v-model="loginForm.mobile">
                    <!--<i slot="prefix" class="el-input__icon el-icon-mobile-phone"></i>-->
                    <div slot="prefix" class="login-icon"><img src="@/assets/images/phone.png"></div>
                  </el-input>
                  <div class="form-error" slot="error" slot-scope="scope">
                    <i class="el-input__icon el-icon-info"></i>
                    <span>{{scope.error}}</span>
                  </div>
                </el-form-item>
                <el-form-item v-if="activeName==='1'" prop="password">
                  <el-input
                    type="password" placeholder="请输入密码" v-model="loginForm.password">
                    <div slot="prefix" class="login-icon"><img src="@/assets/images/password.png"></div>
                  </el-input>
                  <div class="form-error" slot="error" slot-scope="scope">
                    <i class="el-input__icon el-icon-info"></i>
                    <span>{{scope.error}}</span>
                  </div>
                </el-form-item>
                <el-form-item v-if="activeName==='2'" prop="code">
                  <el-input placeholder="请输入验证码" v-model="loginForm.code">
                    <div slot="prefix" class="login-icon"><img src="@/assets/images/code.png"></div>
                    <div slot="suffix" class="append-code" @click="getVerificationCode">{{message}}</div>
                  </el-input>
                  <div class="form-error" slot="error" slot-scope="scope">
                    <i class="el-input__icon el-icon-info"></i>
                    <span>{{scope.error}}</span>
                  </div>
                </el-form-item>
              </el-form>
            </el-col>
            <el-col :span="24">
              <el-button class="login-btn" type="primary" @click="login('loginForm')">登录</el-button>
            </el-col>
            <!--<el-col :span="24">
              <div class="login-end-tips">
                <p>没有帐号<router-link class="register" to="/register">立即注册</router-link></p>
                <span>忘记密码</span>
              </div>
            </el-col>-->
          </el-row>
        </div>
      </div>
    </div>
    <div class="project-info">
      <p>v1.0</p>
      <p>售后服务联系人:江丰生物 联系电话:18888888888</p>
      <p>版权 江丰生物©2018</p>
    </div>
  </div>
</template>

<script src="./login.component.js"></script>
<style lang="scss" scoped src="./login.scss"></style>
