CREATE TABLE "team" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"organization_id" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "team_member" (
	"id" text PRIMARY KEY NOT NULL,
	"team_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "github_repositories" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "issue_sequences" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "github_repositories" CASCADE;--> statement-breakpoint
DROP TABLE "issue_sequences" CASCADE;--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "user_organization_id_email_unique";--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "user_organization_id_external_id_unique";--> statement-breakpoint
ALTER TABLE "boards" DROP CONSTRAINT "boards_organization_id_slug_unique";--> statement-breakpoint
ALTER TABLE "github_installations" DROP CONSTRAINT "github_installations_github_installation_id_unique";--> statement-breakpoint
ALTER TABLE "github_webhook_deliveries" DROP CONSTRAINT "github_webhook_deliveries_delivery_id_unique";--> statement-breakpoint
ALTER TABLE "organization" DROP CONSTRAINT "organization_slug_unique";--> statement-breakpoint
ALTER TABLE "tags" DROP CONSTRAINT "tags_organization_id_name_unique";--> statement-breakpoint
ALTER TABLE "votes" DROP CONSTRAINT "votes_user_id_feedback_id_comment_id_unique";--> statement-breakpoint
DROP INDEX "idx_users_organization";--> statement-breakpoint
DROP INDEX "idx_users_email";--> statement-breakpoint
DROP INDEX "idx_boards_organization";--> statement-breakpoint
DROP INDEX "idx_changelog_org";--> statement-breakpoint
DROP INDEX "idx_changelog_slug";--> statement-breakpoint
DROP INDEX "idx_comments_feedback";--> statement-breakpoint
DROP INDEX "idx_comments_parent";--> statement-breakpoint
DROP INDEX "idx_feedback_tags_feedback";--> statement-breakpoint
DROP INDEX "idx_feedback_tags_tag";--> statement-breakpoint
DROP INDEX "idx_feedback_boards";--> statement-breakpoint
DROP INDEX "idx_github_webhook_delivery";--> statement-breakpoint
DROP INDEX "idx_tags_organization";--> statement-breakpoint
DROP INDEX "idx_tags_org_name_lower";--> statement-breakpoint
DROP INDEX "idx_votes_feedback";--> statement-breakpoint
DROP INDEX "idx_votes_comment";--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "active_team_id" text;--> statement-breakpoint
ALTER TABLE "invitation" ADD COLUMN "team_id" text;--> statement-breakpoint
ALTER TABLE "team" ADD CONSTRAINT "team_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_member" ADD CONSTRAINT "team_member_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_member" ADD CONSTRAINT "team_member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_team_member_team_id_user_id" ON "team_member" USING btree ("team_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_user_organization_id_email" ON "user" USING btree ("organization_id","email");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_user_organization_id_external_id" ON "user" USING btree ("organization_id","external_id");--> statement-breakpoint
CREATE INDEX "idx_user_organization_id" ON "user" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_user_email" ON "user" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_boards_organization_id_slug" ON "boards" USING btree ("organization_id","slug");--> statement-breakpoint
CREATE INDEX "idx_boards_organization_id" ON "boards" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_changelog_organization_id" ON "changelog" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_changelog_organization_id_slug" ON "changelog" USING btree ("organization_id","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_comments_feedback_id" ON "comments" USING btree ("feedback_id");--> statement-breakpoint
CREATE INDEX "idx_comments_parent_comment_id" ON "comments" USING btree ("parent_comment_id");--> statement-breakpoint
CREATE INDEX "idx_feedback_tags_feedback_id" ON "feedback_tags" USING btree ("feedback_id");--> statement-breakpoint
CREATE INDEX "idx_feedback_tags_tag_id" ON "feedback_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "idx_feedback_board_id" ON "feedback" USING btree ("board_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_github_installations_github_installation_id" ON "github_installations" USING btree ("github_installation_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_github_webhook_deliveries_delivery_id" ON "github_webhook_deliveries" USING btree ("delivery_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_organization_slug" ON "organization" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_tags_organization_id_name" ON "tags" USING btree ("organization_id","name");--> statement-breakpoint
CREATE INDEX "idx_tags_organization_id" ON "tags" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_tags_organization_id_name_lower" ON "tags" USING btree ("organization_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_votes_user_id_feedback_id_comment_id" ON "votes" USING btree ("user_id","feedback_id","comment_id");--> statement-breakpoint
CREATE INDEX "idx_votes_feedback_id" ON "votes" USING btree ("feedback_id");--> statement-breakpoint
CREATE INDEX "idx_votes_comment_id" ON "votes" USING btree ("comment_id");--> statement-breakpoint
ALTER TABLE "boards" DROP COLUMN "symbol";--> statement-breakpoint
ALTER TABLE "boards" DROP COLUMN "post_count";--> statement-breakpoint
ALTER TABLE "boards" DROP COLUMN "view_count";--> statement-breakpoint
ALTER TABLE "boards" DROP COLUMN "custom_fields";--> statement-breakpoint
ALTER TABLE "organization" DROP COLUMN "is_onboarded";--> statement-breakpoint
ALTER TABLE "organization" DROP COLUMN "onboarding_step";--> statement-breakpoint
ALTER TABLE "organization" DROP COLUMN "onboarding_completed_at";