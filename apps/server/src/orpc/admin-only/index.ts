import { boardsRouter } from "./boards";
import { changelogAdminRouter } from "./changelog";
import { tagsRouter } from "./tags";

export const organizationRouter = {
	boardsRouter: boardsRouter,
	tagsRouter: tagsRouter,
	changelog: changelogAdminRouter,
};
