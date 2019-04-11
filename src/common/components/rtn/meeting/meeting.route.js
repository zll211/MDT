export const meetingRoute = [
  {
    path: '/meeting',
    component: () => import(/* webpackChunkName: "meeting" */ './meeting'),
    name: 'meeting',
    beforeEnter: (to, from, next) => {
      next();
    },
    // show: true,
    auth: 'all',
  },
];
