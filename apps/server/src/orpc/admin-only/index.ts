import { boardsRouter } from './boards';
import { changelogAdminRouter } from './changelog';
import { postsRouter } from './posts';
import { tagsRouter } from './tags';
import { teamsRouter } from './teams';
import { usersRouter } from './users';

export const organizationRouter = {
  boardsRouter,
  tagsRouter,
  changelog: changelogAdminRouter,
  posts: postsRouter,
  users: usersRouter,
  teams: teamsRouter,
};
