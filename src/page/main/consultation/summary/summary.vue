<template>
  <div class="summary-page main-contain">
    <div class="summary-container">
      <div class="flex summary-table-header justify-content-between">
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
        ref="summaryTable"
        :data="tableData"
        tooltip-effect="dark"
        style="width: 100%"
        @row-click="rowClick"
        @selection-change="handleSelectionChange"
        highlight-current-row>
        <el-table-column
          type="selection"
          align="center">
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
          prop="userName"
          label="申请人"
          align="center"
          width="100"
          fixed>
        </el-table-column>
        <el-table-column
          prop="application_at"
          label="申请时间"
          align="center">
        </el-table-column>
        <el-table-column
          prop="reservation_at"
          label="会诊开始时间"
          align="center">
        </el-table-column>
        <el-table-column
          prop="finish_at"
          label="会诊结束时间"
          align="center">
        </el-table-column>
        <el-table-column
          prop="invitee"
          label="会诊医生"
          align="center">
        </el-table-column>
        <el-table-column
          label="状态"
          width="120"
          align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status !=='报告未通过'" type="warning"
                    style="cursor: pointer;">报告待提交</el-tag>
            <el-popover v-if="scope.row.status ==='报告未通过'" trigger="hover" placement="top" ref="reasonPopover" width="160">
              <p>点击查看审核未通过原因</p>
              <div slot="reference" class="name-wrapper">
                <el-tag type="danger"
                        style="cursor: pointer;"
                        @click="viewReason(scope.row.id)">未通过审核</el-tag>
              </div>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="80"
          align="center">
          <template slot-scope="scope">
            <span @click="toRecord(scope.row.id)"><i class="el-icon-edit"></i></span>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination class="flex justify-content-center"
                     @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
                     :current-page="pagination.current_page"
                     :page-sizes="[10, 20, 40, 80]"
                     :page-size="pagination.per_page"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="pagination.total">
      </el-pagination>
    </div>
    <el-dialog title="审核未通过原因"
               :visible.sync="uncheckedDialog"
               :center="false"
               width="500px">
      <el-input type="textarea"
                v-model="uncheckedReason"
                :readonly="true"
                :autosize="{ minRows: 4, maxRows: 6}"
                clearable
                placeholder="请输入审核未通过原因"
      ></el-input>
    </el-dialog>
  </div>
</template>

<script src="./summary.component.js"></script>
<style lang="scss" src="./summary.scss"></style>
