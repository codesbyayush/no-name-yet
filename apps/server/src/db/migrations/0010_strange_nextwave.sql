DROP INDEX "idx_feedback_type";--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "counter" serial NOT NULL;--> statement-breakpoint
ALTER TABLE "feedback" DROP COLUMN "type";--> statement-breakpoint
DROP TYPE "public"."feedback_type";