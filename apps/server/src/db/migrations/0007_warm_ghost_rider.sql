CREATE TYPE "public"."status_enum" AS ENUM('to-do', 'in-progress', 'completed', 'backlog', 'technical-review', 'paused');--> statement-breakpoint
ALTER TABLE "feedback" ALTER COLUMN "issue_key" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "feedback" ALTER COLUMN "title" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "feedback" ALTER COLUMN "status_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "feedback" ALTER COLUMN "priority" SET DEFAULT 'no_priority';--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "status" "status_enum" DEFAULT 'to-do' NOT NULL;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_issue_key_unique" UNIQUE("issue_key");