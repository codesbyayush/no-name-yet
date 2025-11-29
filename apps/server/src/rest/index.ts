import { Hono } from 'hono';
import githubSetupRouter from './github-setup';
import publicApiRouter from './public';

const v1Router = new Hono();

v1Router.route('/public', publicApiRouter);
v1Router.route('/github', githubSetupRouter);

export default v1Router;
