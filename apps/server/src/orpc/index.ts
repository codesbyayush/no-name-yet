import { publicRouter } from './public';

export const apiRouter = {
  public: publicRouter,
};

export type AppRouter = typeof apiRouter;
