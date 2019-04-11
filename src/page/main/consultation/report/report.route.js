import defaultIcon from '../../../../assets/images/report.png';
import activeIcon from '../../../../assets/images/report_active.png';

export default[{
  path: 'report',
  component: () => import(/* webpackChunkName: 'report' */ './report'),
  name: '会诊报告',
  beforeEnter: (to, from, next) => {
    next();
  },
  show: true,
  auth: 'consultation_report',
  defaultIcon: defaultIcon,
  activeIcon: activeIcon,
}];
