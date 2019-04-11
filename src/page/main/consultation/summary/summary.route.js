import defaultIcon from '../../../../assets/images/summary.png';
import activeIcon from '../../../../assets/images/summary_active.png';

export default[{
  path: 'summary',
  component: () => import(/* webpackChunkName: 'summary' */ './summary'),
  name: '会诊总结',
  beforeEnter: (to, from, next) => {
    next();
  },
  show: false,
  defaultIcon: defaultIcon,
  activeIcon: activeIcon,
}];
