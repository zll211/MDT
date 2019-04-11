<template>
  <div class="information-page main-contain">
    <div class="information-container">
      <div class="flex justify-content-between">
        <div class="flex">
          <el-button type="primary" v-if="!isOnlyOwner" size="small" @click="caseEntry"><i class="el-icon-plus"></i>
          </el-button>
          <el-button type="danger" v-if="!isOnlyOwner" size="small" @click="deleteMore(idArray)"><i
            class="el-icon-delete"></i></el-button>
        </div>
        <div>
          <el-input placeholder="姓名/病历号"
                    v-model="keyword"
                    size="small"
                    clearable
                    suffix-icon="el-icon-search">
          </el-input>
        </div>
      </div>
      <el-table
        v-loading="loading"
        ref="caseTable"
        :data="tableData"
        tooltip-effect="dark"
        style="width: 100%"
        @row-click="rowClick"
        @selection-change="handleSelectionChange"
        highlight-current-row>
        <el-table-column
          type="selection"
          :selectable="selectTable"
          align="center">
        </el-table-column>
        <el-table-column
          prop="case_hospital.case_no"
          label="病历号"
          align="center"
          fixed>
        </el-table-column>
        <el-table-column
          prop="patient_name"
          label="姓名"
          align="center"
          fixed>
          <template slot-scope="scope">
            <div v-if="scope.row.consultation_status !== '未使用'">
              <router-link class="table-a-link"
                           :to="{ path: '/case/entry', query: { id: scope.row.id, patient_name: scope.row.patient_name, readonly: true}}">
                {{scope.row.patient_name}}
              </router-link>
            </div>
            <div v-if="scope.row.consultation_status === '未使用'">
              <router-link class="table-a-link"
                           :to="{ path: '/case/entry', query: { id: scope.row.id, patient_name: scope.row.patient_name}}">
                {{scope.row.patient_name}}
              </router-link>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="gender"
          label="性别"
          align="center"
          fixed>
        </el-table-column>
        <el-table-column
          prop="age"
          label="年龄"
          align="center">
          <template slot-scope="scope">
            {{scope.row.age}} {{scope.row.age_unit}}
          </template>
        </el-table-column>
        <el-table-column
          prop="case_hospital.hospital"
          label="医院"
          align="center">
        </el-table-column>
        <el-table-column
          prop="case_hospital.doctor"
          label="主治医生"
          align="center">
        </el-table-column>
        <el-table-column
          prop="consultation_status"
          label="状态"
          align="center">
          <template slot-scope="scope">
            <el-tag type="success"
                    v-if="scope.row.consultation_status === '未使用'">{{scope.row.consultation_status}}
            </el-tag>
            <el-popover v-if="scope.row.consultation_status !== '未使用'" trigger="hover" placement="top"
                        ref="reasonPopover"
                        width="160">
              <p>点击查看病例会诊状态</p>
              <div slot="reference" class="name-wrapper">
                <el-tag type="warning"
                        @click="showHistory(scope.row.consultation_type, scope.row.consultation_id)"
                        style="cursor: pointer;">{{scope.row.consultation_status}}
                </el-tag>
              </div>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column
          prop="state"
          label="操作"
          fixed="right"
          :width="isOnlyOwner?'70':'150'">
          <template slot-scope="scope">
            <div v-if="!isOnlyOwner">
              <span :class="(scope.row.consultation_status === '未使用' || scope.row.consultation_status === '未通过') ?
                  'case-icon case-icon1': 'case-icon case-icon1 case-icon1-disabled'"
                    @click="(scope.row.consultation_status === '未使用' || scope.row.consultation_status === '未通过') ?
                  caseEdit(scope.row.id, scope.row.patient_name) : null">
            </span>
              <span
                :class="scope.row.consultation_status === '未使用' ? 'case-icon case-icon2' : 'case-icon case-icon2 case-icon2-disabled'"
                @click="scope.row.consultation_status === '未使用' ? caseDelete(scope.row.id) : null">
            </span>
              <span
                :class="scope.row.consultation_status === '未使用' ? 'case-icon case-icon3' : 'case-icon case-icon3 case-icon3-disabled'"
                @click="scope.row.consultation_status === '未使用' ? caseImport(scope.row) : null">
            </span>
            </div>
            <div v-if="isOnlyOwner">
              <span class="el-icon-view" style="font-size: 16px;cursor: pointer;"
                    @click="caseEdit(scope.row.id, scope.row.patient_name)"></span>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination class="flex justify-content-center"
                     @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
                     :current-page="pageIndex"
                     :page-sizes="[10, 20, 40, 80]"
                     :page-size="pageSize"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="total">
      </el-pagination>
    </div>
    <el-dialog :title="timestamTitle" :visible.sync="timestampDialog" center width="500px">
      <div class="block">
        <el-timeline>
          <el-timeline-item
            v-for="(activity, index) in activities"
            :key="index"
            :icon="activity.icon"
            :type="activity.type"
            :color="activity.color"
            :size="activity.size"
            :timestamp="activity.timestamp">
            {{activity.content}} / {{activity.user}}
            <p v-if="activity.desc">原因：{{activity.desc}}</p>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {informationService} from './information.service';
  import {debounce} from '../../../../config/utils';

  export default {
    name: 'information',
    data() {
      return {
        pagination: {},
        loading: false,
        timestamTitle: '会诊流程时间线',
        tableData: [],
        pageIndex: 1,
        pageSize: 10,
        total: 10,
        keyword: '',
        idArray: [],
        timestampDialog: false,
        activities: [],
      };
    },
    created() {
      if (Object.keys(this.$route.query).length>0) {
        this.pageIndex = parseInt(this.$route.query?.page);
        this.pageSize = parseInt(this.$route.query?.pageSize);
      }
      this.getCaseList();
    },
    mounted() {
      this.$watch('keyword', debounce(() => {
        this.getCaseList();
      }, 1000));
    },
    methods: {
      getCaseList() {
        let params = {
          page: this.pageIndex,
          page_size: this.pageSize,
          include: 'case_hospital',
          search: this.keyword,
        };
        this.loading = true;
        informationService.caseList(params).then((res) => {
          if (res.status === 200) {
            this.tableData = res.body.data;
            this.total = res.body.meta.pagination.total;
          }
        }).finally(() => {
          this.loading = false;
        });
      },
      handleCurrentChange(val) {
        this.$router.replace({path: '/case/information', query: {page: val, pageSize: this.pageSize}});
        this.pageIndex = val;
        this.getCaseList();
      },
      handleSizeChange(val) {
        this.$router.replace({path: '/case/information', query: {page: this.pageIndex, pageSize: val}});
        this.pageSize = val;
        this.getCaseList();
      },
      rowClick(row) {
        if (row.consultation_status === '未使用') {
          this.$refs.caseTable.toggleRowSelection(row);
        }
      },
      selectTable(row, index) {
        if (row.consultation_status === '未使用') return row;
      },
      handleSelectionChange(val) {
        this.idArray = [];
        val.forEach((val) => {
          this.idArray.push(val.id);
        });
      },
      caseEntry() {
        this.$router.push('/case/entry');
      },
      caseEdit(id, name) {
        this.$router.push({path: '/case/entry', query: {id: id, patient_name: name}});
      },
      caseImport(row) {
        this.$router.push({path: '/consultation/appointment', query: {id: row.id, patient_name: row.patient_name}});
      },
      // 删除单个病例
      caseDelete(id) {
        this.deleteFn([id]);
      },
      // 删除多个病例
      deleteMore() {
        if (!this.idArray.length) {
          return this.$message.info('请选择要删除的数据!');
        }
        this.deleteFn(this.idArray);
      },
      deleteFn(data) {
        this.$confirm('该用户删除后无法恢复，确定要删除吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          // 删除
          informationService.deleteCase({id: data}).then((res) => {
            if (res.status === 201) {
              this.$message.success('删除成功');
              this.getCaseList();
            }
          });
        }).catch(() => {
          this.$message.info('已取消删除');
        });
      },
      showHistory(type, id) {
        if (type === '预约会诊') {
          this.timestamTitle = '预约会诊流程时间线';
        } else if (type === '即时会诊') {
          this.timestamTitle = '即时会诊流程时间线';
        } else {
          this.timestamTitle = '会诊流程时间线';
        }
        this.timestampDialog = true;
        this.getConsultationHistory(id);
      },
      getConsultationHistory(id, {...rest}) {
        informationService.consultationAction(id, Object.assign({
          include: 'user',
        }, rest)).then(({body}) => {
          this.activities = body.data.map((item) => {
            return {
              content: item.action,
              timestamp: item.operate_at,
              desc: item.desc,
              size: 'large',
              type: ['会诊审核不通过', '报告审核不通过'].indexOf(item.action) > -1?'danger':'primary',
              user: item.user.realname,
            };
          });
        });
      },
    },
  };
</script>

<style lang="scss">
  .information-page {
    .information-container {
      background-color: #ffffff;
      border-radius: 5px;
      padding: 15px;

      .el-table {
        margin: 15px 0;

        .case-icon1-disabled {
          cursor: not-allowed !important;

          &:hover {
            background: url("../../../../assets/images/user-edit.png") !important;
          }
        }

        .case-icon2-disabled {
          cursor: not-allowed !important;

          &:hover {
            background: url("../../../../assets/images/single-del.png") !important;
          }
        }

        .case-icon3-disabled {
          cursor: not-allowed !important;

          &:hover {
            background: url("../../../../assets/images/case-import.png") !important;
          }
        }

        .case-icon {
          display: inline-block;
          width: 24px;
          height: 24px;
          background-size: cover;
          margin-right: 20px;
          cursor: pointer;
        }

        .case-icon1 {
          background: url("../../../../assets/images/user-edit.png");

          &:hover {
            background: url("../../../../assets/images/user-edit-hover.png");
          }
        }

        .case-icon2 {
          background: url("../../../../assets/images/single-del.png");

          &:hover {
            background: url("../../../../assets/images/single-del-hover.png");
          }
        }

        .case-icon3 {
          background: url("../../../../assets/images/case-import.png");
          margin-right: 0;

          &:hover {
            background: url("../../../../assets/images/case-import-hover.png");
          }
        }
      }

    }
    .table-a-link{
      cursor: pointer;
      color: #609EFE;
      text-decoration: underline;
    }
    .el-dialog__body {
      padding: 0 30px 25px 30px;
      max-height: 500px;
      overflow-y: auto;
    }
  }
</style>
