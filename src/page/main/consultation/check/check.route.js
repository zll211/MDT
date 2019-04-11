import defaultIcon from '../../../../assets/images/check.png';
import activeIcon from '../../../../assets/images/check_active.png';

export default[{
  path: 'check',
  component: () => import(/* webpackChunkName: 'check' */ './check'),
  name: '会诊审核',
  beforeEnter: (to, from, next) => {
    next();
  },
  show: true,
  auth: 'consultation_recheck',
  defaultIcon: defaultIcon,
  activeIcon: activeIcon,
}];
