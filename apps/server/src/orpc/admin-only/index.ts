import { boardsRouter } from "./boards";
import { changelogAdminRouter } from "./changelog";
import { postsRouter } from "./posts";
import { statusRouter } from "./status";
import { tagsRouter } from "./tags";
import { usersRouter } from "./users";

export const organizationRouter = {
	boardsRouter: boardsRouter,
	tagsRouter: tagsRouter,
	changelog: changelogAdminRouter,
	posts: postsRouter,
	users: usersRouter,
	status: statusRouter,
};
