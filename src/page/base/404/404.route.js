import {routerHelperProvider} from '@/router/';

const notFindRoute = [{
  path: '/404',
  component: () => import(/* webpackChunkName: "404" */ './404.vue'),
  name: '404',
  beforeEnter: (to, from, next) => {
    next();
  },
}];

routerHelperProvider.configureRoutes(notFindRoute);
