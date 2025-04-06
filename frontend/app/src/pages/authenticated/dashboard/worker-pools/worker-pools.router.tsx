import { RouteObject } from 'react-router-dom';

export const workerPoolsRoutes: RouteObject[] = [
  {
    path: '/pools',
    lazy: async () =>
      import('./worker-pools.page').then((res) => {
        return {
          Component: res.default,
        };
      }),
  },
  {
    path: '/pools/:poolName',
    lazy: async () =>
      import('./pool-detail.page').then((res) => {
        return {
          Component: res.default,
        };
      }),
  },
  {
    path: '/pools/:poolName/:workerId',
    lazy: async () =>
      import('./worker-detail.page').then((res) => {
        return {
          Component: res.default,
        };
      }),
  },
];
