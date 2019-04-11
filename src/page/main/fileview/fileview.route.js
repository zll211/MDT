
export const fileviewRoute = [{
  path: '/fileview',
  component: () => import(/* webpackChunkName: "fileview" */ './fileview'),
  name: 'fileview',
  beforeEnter: (to, from, next) => {
    next();
  },
  auth: 'all',
  children: [],
  // show: true,
}];
