import {routerHelperProvider} from '@/router/';

const registerRoute = [{
  path: '/register',
  component: () => import(/* webpackChunkName: "register" */ './register'),
  name: '注册',
  beforeEnter: (to, from, next) => {
    next();
  },
}];

routerHelperProvider.configureRoutes(registerRoute);
