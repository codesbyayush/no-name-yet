DROP TABLE "feedback_tags" CASCADE;--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "tags" text[];