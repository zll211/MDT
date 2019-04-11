import {routerHelperProvider} from '../../router';
import {caseRoute} from './case/case.route';
import {consultationRoute} from './consultation/consultation.route';
import {userRoute} from './user/user.route';
import {fileviewRoute} from './fileview/fileview.route';
import {homeRoute} from './home/home.route';
import {accountRoute} from './account/account.route';
import {whiteboardRoute} from 'src/common/components/rtn/meeting/whiteboard/whiteboard.route';
import {statisticRoute} from './statistic/statistic.router';

const mainRoute = [
  {
    path: '/main',
    component: () => import(/* webpackChunkName: "main" */ './main'),
    name: 'main',
    beforeEnter: (to, from, next) => {
      next();
    },
    redirect: '/home',
    auth: 'all',
    children: [...homeRoute, ...caseRoute, ...consultationRoute, ...userRoute, ...accountRoute, ...statisticRoute],
  },
  ...fileviewRoute,
  ...whiteboardRoute
];

export default mainRoute;

routerHelperProvider.configureRoutes(mainRoute);
