export default [{
  path: 'appointment',
  component: () => import(/* webpackChunkName: "consultation-appointment" */ './appointment'),
  name: '预约会诊',
  beforeEnter: (to, from, next) => {
    next();
  },
  auth: 'consultation_apply',
}];
