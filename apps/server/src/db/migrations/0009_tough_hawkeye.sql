ALTER TABLE "feedback_counters" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "statuses" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "feedback_counters" CASCADE;--> statement-breakpoint
DROP TABLE "statuses" CASCADE;--> statement-breakpoint
--> statement-breakpoint
DROP INDEX "idx_feedback_status";--> statement-breakpoint
DROP INDEX "idx_feedback_board_status_created";--> statement-breakpoint
DROP INDEX "idx_feedback_status_created";--> statement-breakpoint
CREATE INDEX "idx_feedback_board_status_created" ON "feedback" USING btree ("board_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_feedback_status_created" ON "feedback" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
ALTER TABLE "feedback" DROP COLUMN "status_id";--> statement-breakpoint
ALTER TABLE "feedback" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "feedback" DROP COLUMN "user_email";--> statement-breakpoint
ALTER TABLE "feedback" DROP COLUMN "user_name";--> statement-breakpoint
ALTER TABLE "feedback" DROP COLUMN "user_agent";--> statement-breakpoint
ALTER TABLE "feedback" DROP COLUMN "url";--> statement-breakpoint
ALTER TABLE "feedback" DROP COLUMN "browser_info";--> statement-breakpoint
ALTER TABLE "feedback" DROP COLUMN "attachments";--> statement-breakpoint
ALTER TABLE "feedback" DROP COLUMN "ai_analysis";--> statement-breakpoint
ALTER TABLE "feedback" DROP COLUMN "metadata";