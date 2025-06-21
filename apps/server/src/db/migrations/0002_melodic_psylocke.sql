ALTER TABLE "comments" ALTER COLUMN "author_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "is_anonymous" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "anonymous_name" text;--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "anonymous_email" text;