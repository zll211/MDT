<template>
  <div class="arrange-page main-contain">
    <div class="arrange-container">
      <div class="flex arrange-table-header justify-content-between">
        <div>
          <el-input placeholder="会诊单号/申请人"
                    clearable
                    size="small"
                    v-model="searchInput"
                    prefix-icon="el-icon-search"
          ></el-input>
        </div>
        <div class="flex align-items-center">
          <i class="el-icon-refresh action-icon" @click="refreshTable"></i>
        </div>
      </div>
      <el-table
        v-loading="loading"
        ref="arrangeTable"
        :data="tableData"
        tooltip-effect="dark"
        style="width: 100%"
        @row-click="rowClick"
        @selection-change="handleSelectionChange"
        highlight-current-row>
        <!--<el-table-column
          type="selection"
          align="center">
        </el-table-column>-->
        <el-table-column
          prop="consultation_number"
          label="会诊单号"
          align="center"
          width="150"
          fixed>
        </el-table-column>
        <el-table-column
          prop="userName"
          label="申请人"
          align="center"
          fixed>
        </el-table-column>
        <!--<el-table-column
          prop="type"
          label="会诊类型"
          width="100"
          align="center">
        </el-table-column>-->
        <el-table-column
          prop="patient_name"
          label="会诊对象"
          width="100"
          align="center">
          <template slot-scope="scope">
            <div>
              <router-link class="table-a-link"
                           :to="{ path: `/consultation/checkinfo/${scope.row.case_id}`,
                           query: {id: scope.row.id, readonly: 'true'}}">
                {{scope.row.patient_name}}
              </router-link>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="objective"
          label="会诊目的"
          align="center">
        </el-table-column>
        <el-table-column
          prop="reservation_at"
          label="会诊时间"
          width="160"
          align="center">
        </el-table-column>
        <el-table-column
          prop="invitee"
          label="会诊医生"
          align="center">
        </el-table-column>
        <el-table-column
          prop="action"
          label="状态"
          align="center">
          <template slot-scope="scope">
            <el-tag type="success"
                    v-if="scope.row.action === '进入会诊'"
                    @click="toMeeting(scope.row)"
                    style="cursor: pointer;">会诊中</el-tag>
            <el-tag type="warning"
                    v-if="scope.row.action !== '进入会诊'"
                    >待会诊</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          v-if="!isOnlyOwner"
          label="操作"
          fixed="right"
          align="center">
          <template slot-scope="scope">
            <a @click="scope.row.action === '进入会诊'?toMeeting(scope.row):editArrange(scope.row)"
               style="color: #609EFE;cursor: pointer;">{{scope.row.action === '进入会诊'?'进入会诊':'修改安排'}}</a>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination  class="flex justify-content-center"
                      @size-change="handleSizeChange"
                      @current-change="handleCurrentChange"
                      :current-page="pagination.current_page"
                      :page-sizes="[10, 20, 40, 80]"
                      :page-size="pagination.per_page"
                      layout="total, sizes, prev, pager, next, jumper"
                      :total="pagination.total">
      </el-pagination>
    </div>
    <el-dialog title="修改会诊安排" :visible.sync="editArrangeDialog" :center="false" width="500px">
      <el-form :model="checkedForm"
               ref="checkedForm"
               label-width="100px"
               label-position="right">
        <el-form-item label="会诊时间" prop="reservation_at">
          <el-date-picker
            v-model="checkedForm.reservation_at"
            type="datetime"
            placeholder="请选择会诊时间"
            default-time="12:00:00"
            value-format="yyyy-MM-dd HH:mm:ss"
            align="right"
            style="width: 260px;"
            >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="会诊医生" prop="invitee">
          <el-select v-model="checkedForm.invitee"
                     multiple
                     filterable
                     style="width: 260px;"
                     placeholder="请选择会诊医生">
            <el-option v-for="user in userList" :label="user.realname" :value="user.id" :key="user.id"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer flex justify-content-center">
        <el-button type="info" @click="editArrangeDialog = false" size="small" style="width: 110px">取消</el-button>
        <el-button type="primary" @click="editArrangeDialogConfirm" size="small" style="width: 110px">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script src="./arrange.component.js"></script>
<style lang="scss" src="./arrange.scss"></style>
