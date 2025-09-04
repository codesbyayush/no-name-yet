import { boardsRouter } from './boards';
import { changelogPublicRouter } from './changelog';
import { commentsRouter } from './comments';
import { postsRouter } from './posts';
import { votesRouter } from './votes';

export const publicRouter = {
  comments: commentsRouter,
  votes: votesRouter,
  posts: postsRouter,
  changelog: changelogPublicRouter,
  boards: boardsRouter,
};

export * from './schemas';
