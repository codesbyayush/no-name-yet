CREATE TYPE "public"."priority_enum" AS ENUM('low', 'medium', 'high', 'urgent', 'no_priority');--> statement-breakpoint
ALTER TABLE "tags" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;--> statement-breakpoint
ALTER TABLE "tags" ALTER COLUMN "type" SET DEFAULT 'feedback';--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "assignee_id" text;--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "due_date" timestamp;--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "priority_value" "priority_enum" DEFAULT 'medium';--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_assignee_id_user_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" DROP COLUMN "priority";--> statement-breakpoint
DROP TYPE "public"."plan_type";--> statement-breakpoint
DROP TYPE "public"."severity";