import { commentsRouter } from "./comments";
import { votesRouter } from "./votes";
import { postsRouter } from "./posts";
import { boardsRouter } from "./boards";

export const publicRouter = {
  comments: commentsRouter,
  votes: votesRouter,
  posts: postsRouter,
  boards: boardsRouter,
};
