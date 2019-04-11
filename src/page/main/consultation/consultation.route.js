import applyRoute from './apply/apply.route';
import appointmentRoute from './appointment/appointment.route';
import instantRoute from './instant/instant.route';
import checkRoute from './check/check.route';
import checkInfoRoute from './checkinfo/checkinfo.route';
import arrangeRoute from './arrange/arrange.route';
import reportRoute from './report/report.route';
import recordRoute from './record/record.route';

export const consultationRoute = [{
  path: '/consultation',
  component: () => import(/* webpackChunkName: "consultation" */ './consultation'),
  name: '会诊',
  beforeEnter: (to, from, next) => {
    next();
  },
  redirect: '/consultation/apply',
  children: [...applyRoute, ...appointmentRoute, ...instantRoute, ...checkRoute,
    ...checkInfoRoute, ...arrangeRoute, ...reportRoute, ...recordRoute],
  show: true,
  auth: 'all',
}];
