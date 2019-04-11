<template>
  <div class="report-page main-contain" v-loading="reportLoading" v-height="mainContainHeight">
    <mdt-table-tab :mdt-tab-list="mdtTabList"
                   @tab-click="handleClick" v-model="activeName"></mdt-table-tab>
    <div class="report-container">
      <div class="flex report-table-header justify-content-between">
        <div class="flex">
          <el-input placeholder="会诊单号/申请人"
                    clearable
                    size="small"
                    style="width: 220px;margin-right: 10px"
                    v-model="searchInput"
                    prefix-icon="el-icon-search"
          ></el-input>
          <el-select size="small"
                     style="width: 220px"
                     v-if="activeName === '已审核'"
                     v-model="tableStatusSelect"
                     @change="tableStatusChange"
                     clearable
                     placeholder="选择报告状态">
            <el-option label="未通过审核报告" value="报告未通过"></el-option>
            <el-option label="已通过审核报告" value="报告已审核"></el-option>
          </el-select>
        </div>
        <div class="flex align-items-center">
          <i class="el-icon-refresh action-icon" @click="refreshTable"></i>
          <el-button type="primary" size="small" @click="reportDownload">报告下载</el-button>
          <el-button type="primary" size="small" @click="reportPrint">报告打印</el-button>
        </div>
      </div>
      <el-table
        v-loading="loading"
        ref="reportTable"
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
          <template slot-scope="scope">
            <a @click="toRecord(scope.row.id)" style="color: #609EFE;cursor: pointer;text-decoration: underline;">{{scope.row.consultation_number}}</a>
          </template>
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
          v-if="activeName !== '待审核报告'"
          label="状态"
          width="120"
          align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status ==='已结束'" type="success">待提交</el-tag>
            <el-tag v-if="scope.row.status !=='报告未通过'&&scope.row.status !=='已结束'" :type="scope.row.status === '报告待审核'?'warning':'success'"
                    style="cursor: pointer;">{{scope.row.status==='报告已审核'?'通过审核':'待审核'}}</el-tag>
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
          fixed="right"
          align="center">
          <template slot-scope="scope">
            <a v-if="scope.row.status ==='已结束'&&(isNormalDoctor||isOwner)" @click="submitReport(scope.row.id)" style="color: #609EFE;cursor: pointer;">编辑报告</a>
            <a v-if="scope.row.status ==='报告待审核'" @click="checkReport(scope.row.id)" style="color: #609EFE;cursor: pointer;">查看报告</a>
            <a v-if="scope.row.status ==='报告未通过'&&isNormalDoctor" @click="editReport(scope.row.id)" style="color: #609EFE;cursor: pointer;">修改报告</a>
            <a v-if="scope.row.status ==='报告已审核'||(scope.row.status ==='报告未通过'&&!isNormalDoctor)"
               @click="viewReport(scope.row.id)" style="color: #609EFE;cursor: pointer;">预览报告</a>
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
    <iframe :src="printPdf" style="width: 100%;height: 100%;display: none;" frameborder="0" marginheight="0" marginwidth="0" class="printIfr"></iframe>
    <el-dialog
      class="pdf-dialog"
      title="报告预览"
      :visible.sync="pdfViewVisible"
      :fullscreen="true"
      @close="closePdfDialog">
      <iframe :src="pdf" style="width: 100%;height: 100%" frameborder="0"
              marginheight="0" marginwidth="0"></iframe>
      <div slot="footer" class="dialog-footer flex row justify-content-center" v-if="!readonly&&isReportCheckDoctor">
        <el-button type="info" @click="reportCheckedFail" size="small">不予通过</el-button>
        <el-button type="primary" @click="reportChecked" size="small">审核通过</el-button>
      </div>
    </el-dialog>
    <el-dialog title="审核未通过原因"
               :visible.sync="uncheckedDialog"
               :center="false"
               @close="closeUncheckedDialog"
               width="500px">
      <el-input type="textarea"
                v-model="uncheckedReason"
                :readonly="readonly"
                :autosize="{ minRows: 4, maxRows: 6}"
                clearable
                placeholder="请输入审核未通过原因"
      ></el-input>
      <div style="font-size: 16px;margin-top: 5px;" v-if="readonly">
        <p>审核人：{{checker}}</p>
        <p>审核时间：{{check_at}}</p>
      </div>
      <div v-if="!readonly" slot="footer" class="dialog-footer flex justify-content-center">
        <el-button type="info" @click="uncheckedDialogCancel" size="small" style="width: 110px">取消</el-button>
        <el-button type="primary" @click="uncheckedDialogConfirm" size="small" style="width: 110px">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script src="./report.component.js"></script>
<style lang="scss" src="./report.scss"></style>
