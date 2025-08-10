CREATE TABLE "feedback_counters" (
	"feedback_id" text PRIMARY KEY NOT NULL,
	"upvote_count" integer DEFAULT 0 NOT NULL,
	"comment_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_boards_slug" ON "boards" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_comments_feedback_created" ON "comments" USING btree ("feedback_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_feedback_board_status_created" ON "feedback" USING btree ("board_id","status_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_feedback_status_created" ON "feedback" USING btree ("status_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_tags_org_name_lower" ON "tags" USING btree ("organization_id","name");--> statement-breakpoint
CREATE INDEX "idx_statuses_org_order" ON "statuses" USING btree ("organization_id","order");