import defaultIcon from '@/assets/images/home.png';
import activeIcon from '@/assets/images/home_active.png';

export const homeRoute = [{
  path: '/home',
  component: () => import(/* webpackChunkName: "home" */ './home'),
  name: '首页',
  beforeEnter: (to, from, next) => {
    next();
  },
  children: [],
  show: true,
  auth: 'home',
  defaultIcon: defaultIcon,
  activeIcon: activeIcon,
}];
