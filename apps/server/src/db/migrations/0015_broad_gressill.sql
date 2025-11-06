ALTER TYPE "public"."status_enum" ADD VALUE 'pending';--> statement-breakpoint
ALTER TABLE "comments" DROP CONSTRAINT "comments_parent_comment_id_comments_id_fk";
--> statement-breakpoint
ALTER TABLE "boards" ADD COLUMN "is_system" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "completed_at" timestamp;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_comment_id_comments_id_fk" FOREIGN KEY ("parent_comment_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_feedback_assignee_status" ON "feedback" USING btree ("assignee_id","status");--> statement-breakpoint
ALTER TABLE "feedback" DROP COLUMN "is_anonymous";