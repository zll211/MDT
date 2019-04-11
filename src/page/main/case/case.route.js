import informationRoute from './information/information.route';
import entryRoute from './entry/entry.route';

export const caseRoute = [{
  path: '/case',
  component: () => import(/* webpackChunkName: "case" */ './case'),
  name: '病例',
  beforeEnter: (to, from, next) => {
    next();
  },
  redirect: '/case/information',
  children: [...informationRoute, ...entryRoute],
  show: true,
  auth: 'cases',
}];

