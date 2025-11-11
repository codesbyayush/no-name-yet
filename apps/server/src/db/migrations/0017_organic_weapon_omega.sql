CREATE TYPE "public"."activity_action" AS ENUM('created', 'updated', 'deleted', 'status_changed', 'priority_changed', 'assigned', 'unassigned', 'tag_added', 'tag_removed', 'board_changed', 'due_date_changed', 'completed', 'description_changed', 'title_changed');--> statement-breakpoint
CREATE TABLE "activity_log" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
	"feedback_id" text NOT NULL,
	"user_id" text NOT NULL,
	"action" "activity_action" NOT NULL,
	"field" text,
	"old_value" jsonb,
	"new_value" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_feedback_id_feedback_id_fk" FOREIGN KEY ("feedback_id") REFERENCES "public"."feedback"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_activity_log_feedback_id" ON "activity_log" USING btree ("feedback_id");--> statement-breakpoint
CREATE INDEX "idx_activity_log_feedback_created" ON "activity_log" USING btree ("feedback_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_activity_log_user_id" ON "activity_log" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_activity_log_action" ON "activity_log" USING btree ("action");--> statement-breakpoint
CREATE INDEX "idx_activity_log_created_at" ON "activity_log" USING btree ("created_at" DESC NULLS LAST);