import defaultIcon from '../../../../assets/images/arrange.png';
import activeIcon from '../../../../assets/images/arrange_active.png';

export default[{
  path: 'arrange',
  component: () => import(/* webpackChunkName: 'arrange' */ './arrange'),
  name: '会诊安排',
  beforeEnter: (to, from, next) => {
    next();
  },
  show: true,
  auth: 'consultation_arrange',
  defaultIcon: defaultIcon,
  activeIcon: activeIcon,
}];
