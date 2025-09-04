ALTER TABLE "comments" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;--> statement-breakpoint
ALTER TABLE "votes" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "author_id" text;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" DROP COLUMN "anonymous_name";--> statement-breakpoint
ALTER TABLE "comments" DROP COLUMN "anonymous_email";--> statement-breakpoint
ALTER TABLE "comments" DROP COLUMN "sentiment_score";--> statement-breakpoint
ALTER TABLE "feedback" DROP COLUMN "counter";--> statement-breakpoint
ALTER TABLE "votes" DROP COLUMN "type";--> statement-breakpoint
ALTER TABLE "votes" DROP COLUMN "weight";--> statement-breakpoint
DROP TYPE "public"."vote_type";