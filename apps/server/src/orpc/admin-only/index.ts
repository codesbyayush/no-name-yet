import { boardsRouter } from './boards';
import { postsRouter } from './posts';
import { tagsRouter } from './tags';
import { teamsRouter } from './teams';
import { usersRouter } from './users';

export const organizationRouter = {
  boardsRouter,
  tagsRouter,
  posts: postsRouter,
  users: usersRouter,
  teams: teamsRouter,
};
