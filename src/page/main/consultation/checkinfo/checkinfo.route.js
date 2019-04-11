export default[{
  path: 'checkinfo/:id',
  component: () => import(/* webpackChunkName: "checkinfo" */ './checkinfo'),
  name: '审核信息',
  beforeEnter: (to, from, next) => {
    next();
  },
  auth: 'consultation_recheck',
}];
