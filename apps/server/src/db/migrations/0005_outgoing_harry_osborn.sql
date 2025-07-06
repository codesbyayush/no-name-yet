CREATE TABLE "tags" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"color" text DEFAULT 'blue' NOT NULL,
	"organization_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tags_organization_id_name_unique" UNIQUE("organization_id","name")
);
--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "tag_ids" text[] DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_tags_organization" ON "tags" USING btree ("organization_id");--> statement-breakpoint
ALTER TABLE "feedback" DROP COLUMN "tags";