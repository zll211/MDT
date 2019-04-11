<template>
  <div class="home-page main-contain">
    <el-row :gutter="28" class="section section-1">
      <el-col :span="screenWidth > 1200?6:24">
        <div class="section-item base-info">
          <div class="base-info-body flex justify-content-center column align-items-center">
            <p class="title">{{user.title}}</p>
            <img class="user-img" :src="user.avatar" />
            <h3 class="real-name">Hello! {{user.realname}}</h3>
            <p class="organization-name">{{user.hospital?user.hospital.name:''}}</p>
            <span class="login-time">上次登录时间：{{loginTime}}</span>
          </div>
          <div class="base-info-footer flex justify-content-center align-items-center">
            <p @click="toEditUser">修改密码 <i class="el-icon-back"></i></p>
          </div>
        </div>
      </el-col>
      <el-col :span="screenWidth > 1200?18:24">
        <div class="section-item arrange">
          <el-table
            v-loading="loading"
            ref="arrangeTable"
            :data="tableData"
            tooltip-effect="dark"
            style="width: 100%"
            highlight-current-row>
            <el-table-column
              type="index"
              fixed
              width="50">
            </el-table-column>
            <el-table-column
              prop="consultation_number"
              label="会诊单号"
              align="center"
              width="150"
              fixed>
            </el-table-column>
            <el-table-column
              prop="type"
              label="会诊类型"
              width="100"
              align="center">
            </el-table-column>
            <el-table-column
              prop="patient_name"
              label="会诊对象"
              width="100"
              align="center">
            </el-table-column>
            <el-table-column
              v-if="isCheckDoctor"
              prop="application_at"
              label="申请时间"
              width="160"
              align="center">
            </el-table-column>
            <el-table-column
              v-if="isCheckDoctor"
              prop="userName"
              label="申请医生"
              align="center">
            </el-table-column>
            <el-table-column
              v-if="!isCheckDoctor"
              prop="reservation_at"
              label="会诊时间"
              width="160"
              align="center">
            </el-table-column>
            <el-table-column
              v-if="!isCheckDoctor"
              prop="invitee"
              label="会诊医生"
              align="center">
            </el-table-column>
            <el-table-column
              prop="action"
              label="状态"
              fixed="right"
              align="center">
              <template slot-scope="scope">
                <el-tag type="success"
                        v-if="scope.row.status === '已通过'&&scope.row.action === '进入会诊'"
                        @click="toMeeting(scope.row)"
                        style="cursor: pointer;">进入会诊</el-tag>
                <el-tag type="warning"
                        v-if="scope.row.action === '等待会诊'"
                >等待会诊</el-tag>
                <el-tag type="warning"
                        style="cursor: pointer;"
                        @click="review(scope.row)"
                        v-if="scope.row.status === '审核中'||scope.row.status === '报告待审核'||isOwner"
                >查看资料</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="28" class="section section-2">
      <el-col :span="screenWidth > 1200?6:12" v-for="(item,index) in tipList" :key="index" v-if="item.show">
        <div class="section-item flex align-items-center justify-content-between">
          <div class="flex align-items-center">
            <img :src="item.iconPath" alt="" width="34" class="tip-icon">
            <p class="tip-name">{{item.name}}</p>
          </div>
          <p class="tip-number">{{item.number}}</p>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script src="./home.component.js"></script>
<style lang="scss" src="./home.scss"></style>
