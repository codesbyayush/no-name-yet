import { commentsRouter } from "./comments";
import { votesRouter } from "./votes";
import { postsRouter } from "./posts";

export const publicRouter = {
  comments: commentsRouter,
  votes: votesRouter,
  posts: postsRouter,
};
