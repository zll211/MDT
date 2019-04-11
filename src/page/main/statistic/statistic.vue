<template>
  <div class="statistic-page main-contain">
    <div class="chart-main" v-loading="loading">
      <div class="statistic-month">
        <el-date-picker
          v-model="statisticMonth"
          @change="statisticMonthChange"
          type="month"
          placeholder="选择统计月份"
          size="mini"
          style="width: 173px;">
        </el-date-picker>
      </div>
      <div class="Chart1"></div>
    </div>
  </div>
</template>

<script src="./statistic.component.js"></script>
<style src="./statistic.scss" lang="scss"></style>
