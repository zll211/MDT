export default [{
  path: 'instant',
  component: () => import(/* webpackChunkName: "consultation-instant" */ './instant'),
  name: '即时会诊',
  beforeEnter: (to, from, next) => {
    next();
  },
  auth: 'consultation_apply',
}];
