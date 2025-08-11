// Main export for all table CRUD operations
export { changelogAdminRouter, changelogPublicRouter } from "./changelog";

// Export schemas for reuse
export * from "./changelog/schemas";

// Future table routers will be exported here:
// export { boardsAdminRouter, boardsPublicRouter } from "./boards";
// export { feedbackAdminRouter, feedbackPublicRouter } from "./feedback";
// export { usersAdminRouter, usersPublicRouter } from "./users";
// export { organizationAdminRouter, organizationPublicRouter } from "./organization";
// export { commentsAdminRouter, commentsPublicRouter } from "./comments";
// export { votesAdminRouter, votesPublicRouter } from "./votes";
// export { tagsAdminRouter, tagsPublicRouter } from "./tags";
// export { statusesAdminRouter, statusesPublicRouter } from "./statuses";
