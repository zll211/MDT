<template>
  <div class="instant-page fill-contain flex column justify-content-between">
    <div class="main-contain" :style="{height: mainContainHeight}">
      <mdt-form-header :form-name="'即时会诊申请单'" @resetForm="resetForm('instantForm')"></mdt-form-header>
      <div class="instant-form">
        <el-form :model="instantForm" :rules="rules" ref="instantForm" label-width="100px"
                 label-position="left">
          <el-form-item label="会诊目的" prop="objective">
            <el-input type="textarea"
                      :autosize="{ minRows: 4, maxRows: 6}"
                      v-model="instantForm.objective"
                      style="width: 640px"
                      size="small"
                      clearable>
            </el-input>
          </el-form-item>
          <el-form-item label="会诊对象" prop="application_data">
            <span class="action-btn" @click="importInfo">导入</span>
            <p class="flex justify-content-between align-items-center case-info-list" v-if="caseId?true:false">
              <span>{{casePatientName}}</span>
              <i class="el-icon-delete" @click="deleteCase"></i>
            </p>
          </el-form-item>
          <el-form-item label="会诊医生" prop="invitee">
            <el-select v-model="instantForm.invitee"
                       multiple
                       clearable
                       filterable
                       style="width: 640px"
                       placeholder="请选择会诊医生">
              <el-option v-for="user in doctors" :label="user.realname" :value="user.id" :key="user.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="申请人" prop="user_id">
            <el-select v-model="instantForm.user_id"
                       clearable
                       filterable
                       allow-create>
              <el-option v-for="user in userList" :label="user.realname" :value="user.id" :key="user.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input type="textarea"
                      :autosize="{ minRows: 2, maxRows: 4}"
                      v-model="instantForm.remark"
                      style="width: 640px"
                      size="small"
                      clearable>
            </el-input>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <mdt-form-footer @submitForm="submitForm('instantForm')"></mdt-form-footer>
    <el-dialog title="导入病人信息" :visible.sync="importCaseDialog" center width="70%">
      <div class="flex justify-content-between">
        <el-input placeholder="姓名/身份证"
                  size="small"
                  v-model="searchInput"
                  prefix-icon="el-icon-search"
                  clearable
                  style="width: 220px"></el-input>
        <el-pagination
          @current-change="handleCurrentChange"
          :page-size="pagination.per_page"
          layout="total, prev, next"
          prev-text="上一页"
          next-text="下一页"
          :total="pagination.total">
        </el-pagination>
      </div>
      <el-table
        v-loading="caseTableLoading"
        ref="caseTable"
        highlight-current-row
        :data="caseTableData"
        tooltip-effect="dark"
        @selection-change="handleSelectionChange"
        @row-click="caseTableRowClick"
        style="width: 100%">
        <el-table-column
          type="selection"
          align="center">
        </el-table-column>
        <el-table-column
          prop="patient_name"
          label="姓名"
          align="center">
        </el-table-column>
        <el-table-column
          prop='age'
          label="年龄"
          align="center">
        </el-table-column>
        <el-table-column
          prop="gender"
          label="性别"
          align="center">
        </el-table-column>
        <el-table-column
          prop="papers_number"
          label="证件号"
          align="center">
        </el-table-column>
        <el-table-column
          prop="phone"
          label="联系电话"
          align="center">
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="importCaseBtn" size="small">导入</el-button>
        <el-button @click="cancelImportCase" size="small">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script src="./instant.component.js"></script>
<style lang="scss" src="./instant.scss"></style>
