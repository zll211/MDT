<template>
  <div class="fill-contain login-container">
    <div class="login-main flex" :style="{'min-width': minWidth}">
      <div class="login-left flex-1" v-if="showLeft"></div>
      <div class="login-right flex-1">
        <div class="login-right-main">
          <p class="project-name"></p>
          <el-row>
            <el-col :span="24">
              <el-form label-width="0" :model="registerForm" :rules="registerRules" ref="registerForm">
                <el-form-item prop="phone">
                  <el-input
                    placeholder="请输入手机号码"
                    v-model="registerForm.phone">
                    <div slot="prefix" class="login-icon"><img src="@/assets/images/phone.png"></div>
                  </el-input>
                  <div class="form-error" slot="error" slot-scope="scope">
                    <i class="el-input__icon el-icon-info"></i>
                    <span>{{scope.error}}</span>
                  </div>
                </el-form-item>
                <el-form-item prop="code">
                  <el-input
                    placeholder="请输入验证码"
                    v-model="registerForm.code">
                    <div slot="prefix" class="login-icon"><img src="@/assets/images/code.png"></div>
                    <div slot="suffix" class="append-code" @click="getVerificationCode">{{message}}</div>
                  </el-input>
                  <div class="form-error" slot="error" slot-scope="scope">
                    <i class="el-input__icon el-icon-info"></i>
                    <span>{{scope.error}}</span>
                  </div>
                </el-form-item>
                <el-form-item prop="password">
                  <el-input
                    type="password"
                    placeholder="请输入密码"
                    v-model="registerForm.password">
                    <div slot="prefix" class="login-icon"><img src="@/assets/images/password.png"></div>
                  </el-input>
                  <div class="form-error" slot="error" slot-scope="scope">
                    <i class="el-input__icon el-icon-info"></i>
                    <span>{{scope.error}}</span>
                  </div>
                </el-form-item>
                <el-form-item prop="confirm_password">
                  <el-input
                    type="password"
                    placeholder="请确认密码"
                    v-model="registerForm.confirm_password">
                    <div slot="prefix" class="login-icon"><img src="@/assets/images/password.png"></div>
                  </el-input>
                  <div class="form-error" slot="error" slot-scope="scope">
                    <i class="el-input__icon el-icon-info"></i>
                    <span>{{scope.error}}</span>
                  </div>
                </el-form-item>
              </el-form>
            </el-col>
            <el-col :span="24">
              <el-button class="login-btn" type="primary" @click="register('registerForm')">注册</el-button>
            </el-col>
            <el-col :span="24">
              <div class="login-end-tips">
                <p>已有账号<router-link class="register" to="/login">马上登录</router-link></p>
                <span>忘记密码</span>
              </div>
            </el-col>
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

<script src="./register.components.js"></script>

<style lang="scss" scoped>
  @import "../../../style/variables";
  @import "../login/login";

  .login-container {
    .login-main {
      .login-right {
        height: 497px;
        .el-form {
          margin: 30px 0 0;
        }
      }
    }
  }
</style>

