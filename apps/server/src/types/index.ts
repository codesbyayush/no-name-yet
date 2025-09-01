import type { account, session, user, verification } from '../db/schema/auth';
import type { boards } from '../db/schema/boards';
import type { comments } from '../db/schema/comments';
import type { feedback } from '../db/schema/feedback';
import type { feedbackCounters } from '../db/schema/feedback-counter';
import type { feedbackTags } from '../db/schema/feedback-tags';
import type {
  githubInstallations,
  githubRepositories,
  githubWebhookDeliveries,
} from '../db/schema/github';
import type { issueSequences } from '../db/schema/issue-sequences';
import type {
  invitation,
  member,
  organization,
} from '../db/schema/organization';
import type { tags } from '../db/schema/tags';
import type { votes } from '../db/schema/votes';

// Auth
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;
export type Account = typeof account.$inferSelect;
export type NewAccount = typeof account.$inferInsert;
export type Verification = typeof verification.$inferSelect;
export type NewVerification = typeof verification.$inferInsert;

// Organization & related
export type Organization = typeof organization.$inferSelect;
export type NewOrganization = typeof organization.$inferInsert;
export type Member = typeof member.$inferSelect;
export type NewMember = typeof member.$inferInsert;
export type Invitation = typeof invitation.$inferSelect;
export type NewInvitation = typeof invitation.$inferInsert;

// Boards
export type Board = typeof boards.$inferSelect;
export type NewBoard = typeof boards.$inferInsert;

// Tags
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;

// Feedback
export type Feedback = typeof feedback.$inferSelect;
export type NewFeedback = typeof feedback.$inferInsert;
export type FeedbackCountersRow = typeof feedbackCounters.$inferSelect;
export type NewFeedbackCountersRow = typeof feedbackCounters.$inferInsert;
export type FeedbackTag = typeof feedbackTags.$inferSelect;
export type NewFeedbackTag = typeof feedbackTags.$inferInsert;

// Comments
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;

// Votes
export type Vote = typeof votes.$inferSelect;
export type NewVote = typeof votes.$inferInsert;

// GitHub integration
export type GithubInstallation = typeof githubInstallations.$inferSelect;
export type NewGithubInstallation = typeof githubInstallations.$inferInsert;
export type GithubRepository = typeof githubRepositories.$inferSelect;
export type NewGithubRepository = typeof githubRepositories.$inferInsert;
export type GithubWebhookDelivery = typeof githubWebhookDeliveries.$inferSelect;
export type NewGithubWebhookDelivery =
  typeof githubWebhookDeliveries.$inferInsert;

// Issue sequences
export type IssueSequence = typeof issueSequences.$inferSelect;
export type NewIssueSequence = typeof issueSequences.$inferInsert;
