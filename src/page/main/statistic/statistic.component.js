import {statisticService} from '@/page/main/statistic/statistic.service';
import {formatNumber, formatDate} from '@/config/utils';
// 引入基本模板
let echarts = require('echarts/lib/echarts');
// 引入柱状图组件
require('echarts/lib/chart/bar');
require('echarts/lib/chart/line');
// 引入提示框和title组件
require('echarts/lib/component/tooltip');
require('echarts/lib/component/title');
require('echarts/lib/component/legend');
require('echarts/lib/component/legendScroll');

export default {
  name: 'statistic',
  data() {
    return {
      loading: false,
      statisticMonth: '',
    };
  },
  created() {
    this.getConsultationStatistic();
  },
  mounted() {
    this.chart1 = echarts.init(this.$el.getElementsByClassName('Chart1')[0]);
    this.$root.$on('resize', this.resize);
  },
  methods: {
    resize() {
      this.chart1.resize();
    },
    statisticMonthChange() {
      if (this.statisticMonth) {
        let startTime = `${this.statisticMonth.getFullYear()}-${formatNumber(this.statisticMonth.getMonth() + 1)}-01`;
        let endTime = formatDate(new Date(this.statisticMonth.getFullYear(), this.statisticMonth.getMonth()+ 1, 0)).replace(/\//g, '-');
        this.getConsultationStatistic({
          start_time: startTime,
          end_time: endTime,
        });
      } else {
        this.getConsultationStatistic();
      }
    },
    getConsultationStatistic({...rest}) {
      this.loading = true;
      statisticService.consultationStatistic(rest).then(({body}) => {
        const xAxis = Object.keys(body.apply_count);
        let applySeriesLine = {
          name: '会诊申请量',
          type: 'line',
          smooth: true,
          data: [],
        };
        let consultationSeriesLine = {
          name: '会诊量',
          type: 'line',
          smooth: true,
          data: [],
        };
        /* let applySeriesBar = {
           name: '会诊申请量',
           type: 'bar',
           barGap: 0,
           data: [],
         };
         let consultationSeriesBar = {
           name: '会诊量',
           type: 'bar',
           data: [],
         };*/
        xAxis.forEach((data) => {
          applySeriesLine.data.push(body.apply_count[data]);
          //  applySeriesBar.data.push(body.apply_count[data]);
          consultationSeriesLine.data.push(body.consultation_count[data]);
          //  consultationSeriesBar.data.push(body.consultation_count[data]);
        });
        let series = [];
        series.push(applySeriesLine, consultationSeriesLine);
        this.drawLine(xAxis, series);
      }).finally(() => {
        this.loading = false;
      });
    },
    drawLine(xAxis, series) {
      this.chart1.clear();
      this.chart1.setOption({
        title: {
          //  show: 'false'
          text: '会诊申请量、会诊量折线图',
          subtext: '',
          x: 'center',
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: { // 坐标轴指示器，坐标轴触发有效
            type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'
          },
        },
        toolbox: {
          show: true,
          feature: {
            saveAsImage: {},
          },
        },
        grid: {
          top: 50,
          left: '3%',
          right: '3%',
          bottom: '3%',
          containLabel: true,
        },
        dataZoom: [{
          type: 'inside',
        }, {
          type: 'slider',
        }],
        legend: {
          top: 10,
          left: 50,
          data: ['会诊申请量', '会诊量'],
        },
        xAxis: {
          data: xAxis,
        },
        yAxis: {
          name: '数量/起',
          minInterval: 1,
          nameLocation: 'center',
          nameTextStyle: {
            fontSize: 14,
            padding: [0, 0, 10, 0],
          },
          type: 'value',
        },
        series: series,
      });
    },
  },
};
