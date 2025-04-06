import { RouteObject } from 'react-router-dom';

export const runsRoutes: RouteObject[] = [
  {
    path: '/runs',
    lazy: async () =>
      import('./runs.page').then((res) => {
        return {
          Component: res.default,
        };
      }),
  },
  {
    path: '/runs/:runId',
    lazy: async () =>
      import('./run-detail.page').then((res) => {
        return {
          Component: res.default,
        };
      }),
  },
];
