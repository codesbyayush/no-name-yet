import { boardsRouter } from './boards';
import { commentsRouter } from './comments';
import { postsRouter } from './posts';
import { votesRouter } from './votes';

export const publicRouter = {
  comments: commentsRouter,
  votes: votesRouter,
  posts: postsRouter,
  boards: boardsRouter,
};

export * from './schemas';
