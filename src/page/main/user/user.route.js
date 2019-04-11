export const userRoute = [{
  path: '/user',
  component: () => import(/* webpackChunkName: "user" */ './user'),
  name: '用户管理',
  auth: 'user_manager',
  beforeEnter: (to, from, next) => {
    next();
  },
  // show: true,
}];
