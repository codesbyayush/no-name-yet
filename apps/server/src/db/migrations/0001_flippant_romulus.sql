CREATE TYPE "public"."changelog_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TABLE "changelog" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
	"organization_id" text NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"content" jsonb NOT NULL,
	"html_content" text,
	"excerpt" text,
	"status" "changelog_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp,
	"author_id" text NOT NULL,
	"meta_title" text,
	"meta_description" text,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"version" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "changelog" ADD CONSTRAINT "changelog_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "changelog" ADD CONSTRAINT "changelog_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_changelog_org" ON "changelog" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_changelog_status" ON "changelog" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_changelog_published" ON "changelog" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "idx_changelog_slug" ON "changelog" USING btree ("organization_id","slug");--> statement-breakpoint
CREATE INDEX "idx_changelog_author" ON "changelog" USING btree ("author_id");