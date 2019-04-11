import defaultIcon from '../../../../assets/images/apply.png';
import activeIcon from '../../../../assets/images/apply_active.png';

export default [{
  path: 'apply',
  component: () => import(/* webpackChunkName: "consultation-apply" */ './apply'),
  name: '会诊申请',
  beforeEnter: (to, from, next) => {
    next();
  },
  show: true,
  auth: 'consultation_apply',
  defaultIcon: defaultIcon,
  activeIcon: activeIcon,
}];
