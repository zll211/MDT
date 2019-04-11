
import defaultIcon from '../../../../assets/images/case.png';
import activeIcon from '../../../../assets/images/case_active.png';

export default [{
  path: 'information',
  component: () => import(/* webpackChunkName: "consultation-information" */ './information'),
  name: '病例管理',
  beforeEnter: (to, from, next) => {
    next();
  },
  show: true,
  auth: 'cases',
  defaultIcon: defaultIcon,
  activeIcon: activeIcon,
}];

