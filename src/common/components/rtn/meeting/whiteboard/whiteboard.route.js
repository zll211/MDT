export const whiteboardRoute = [
  {
    path: '/whiteboard',
    component: () => import(/* webpackChunkName: "whiteboard" */ './whiteboard'),
    name: 'whiteboard',
    beforeEnter: (to, from, next) => {
      next();
    },
    auth: 'all',
    // show: true,
  },
];
