import defaultIcon from '@/assets/images/statistic.png';
import activeIcon from '@/assets/images/statistic_active.png';

export const statisticRoute = [{
  path: '/statistic',
  component: () => import(/* webpackChunkName: "statistic" */ './statistic'),
  name: '数据统计',
  beforeEnter: (to, from, next) => {
    next();
  },
  show: true,
  auth: 'statistic',
  defaultIcon: defaultIcon,
  activeIcon: activeIcon,
}];
