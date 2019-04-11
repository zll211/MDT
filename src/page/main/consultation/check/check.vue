<template>
  <div class="check-page main-contain">
    <mdt-table-tab :mdt-tab-list="mdtTabList"
                   @tab-click="handleClick" v-model="activeName"></mdt-table-tab>
    <div class="check-container">
      <div class="flex arrange-table-header justify-content-between">
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
            <el-option label="审核未通过" value="未通过"></el-option>
            <el-option label="审核已通过" value="已通过"></el-option>
          </el-select>
        </div>
        <div class="flex align-items-center">
          <i class="el-icon-refresh action-icon" @click="refreshTable"></i>
        </div>
      </div>
      <el-table
        v-loading="loading"
        ref="checkTable"
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
          fixed>
        </el-table-column>
        <el-table-column
          prop="userName"
          label="申请人"
          align="center"
          fixed>
        </el-table-column>
        <el-table-column
          prop="type"
          label="会诊类型"
          align="center">
        </el-table-column>
        <el-table-column
          prop="patient_name"
          label="会诊对象"
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
          prop="application_at"
          label="申请时间"
          width="160"
          align="center">
        </el-table-column>
        <!-- <el-table-column
           prop="application_data"
           label="待审核资料"
           align="center">
           <template slot-scope="scope">
             <div>
               <a v-for="(data, index) in scope.row.application_data"
                  :key="index"
                  :href="data.path"
                  class="flex column application-data"
                  >{{data.filename}}</a>
             </div>
           </template>
         </el-table-column>-->
        <el-table-column
          prop="status"
          label="状态"
          align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status !=='未通过'" :type="scope.row.status === '审核中'?'warning':scope.row.status === '未通过'?'danger':'success'"
                    style="cursor: pointer;">{{scope.row.status}}</el-tag>
            <el-popover v-if="scope.row.status ==='未通过'" trigger="hover" placement="top" ref="reasonPopover" width="160">
              <p>点击查看审核未通过原因</p>
              <div slot="reference" class="name-wrapper">
                <el-tag :type="scope.row.status === '审核中'?'warning':scope.row.status === '未通过'?'danger':'success'"
                        style="cursor: pointer;"
                        @click="viewReason(scope.row)">{{scope.row.status}}</el-tag>
              </div>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          v-if="!isOnlyOwner"
          fixed="right"
          align="center">
          <template slot-scope="scope">
            <a @click="checkInfo(scope.row.case_id, scope.row.id)" v-if="activeName === '已审核'"
               style="color: #609EFE;cursor: pointer;">查看资料</a>
            <a @click="checkInfo(scope.row.case_id, scope.row.id)" v-if="activeName === '待审核'"
               style="color: #609EFE;cursor: pointer;">审核</a>
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
    <el-dialog title="未通过原因" :visible.sync="uncheckedDialog" :center="false" width="500px">
      <el-input type="textarea"
                v-model="uncheckedReason"
                :autosize="{ minRows: 4, maxRows: 6}"
                disabled
      ></el-input>
      <div style="font-size: 16px;margin-top: 5px;">
        <p>审核人：{{checker}}</p>
        <p>审核时间：{{check_at}}</p>
      </div>
    </el-dialog>
  </div>
</template>

<script src="./check.component.js"></script>

<style src="./check.scss" lang="scss"></style>
