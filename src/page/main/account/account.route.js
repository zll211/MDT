export const accountRoute = [
  {
    path: '/account',
    component: () => import(/* webpackChunkName: "account" */ './account'),
    name: '账户设置',
    beforeEnter: (to, from, next) => {
      next();
    },
    // show: true,
    auth: 'all',
  },
];
