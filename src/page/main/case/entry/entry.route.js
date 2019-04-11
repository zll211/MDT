export default [{
  path: 'entry',
  component: () => import(/* webpackChunkName: "consultation-entry" */ './entry'),
  name: '病例录入',
  beforeEnter: (to, from, next) => {
    next();
  },
  auth: 'cases',
}];


