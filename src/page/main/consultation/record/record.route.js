export default[{
  path: 'record/:id',
  component: () => import(/* webpackChunkName: "record" */ './record'),
  name: '会诊意见',
  beforeEnter: (to, from, next) => {
    next();
  },
  auth: 'consultation_report',
}];
