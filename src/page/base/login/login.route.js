import {routerHelperProvider} from '@/router/';

const loginRoute = [{
  path: '/login',
  component: () => import(/* webpackChunkName: "login" */ './login'),
  name: '登录',
  beforeEnter: (to, from, next) => {
    next();
  },
}];

routerHelperProvider.configureRoutes(loginRoute, '/login', '/404');
