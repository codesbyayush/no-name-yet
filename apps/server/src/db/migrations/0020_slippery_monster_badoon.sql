ALTER TABLE "user" DROP CONSTRAINT "user_organization_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "boards" DROP CONSTRAINT "boards_organization_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "feedback" DROP CONSTRAINT "feedback_team_id_team_id_fk";
--> statement-breakpoint
ALTER TABLE "github_installations" DROP CONSTRAINT "github_installations_organization_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "tags" DROP CONSTRAINT "tags_organization_id_organization_id_fk";
--> statement-breakpoint
DROP INDEX "idx_user_organization_id_email";--> statement-breakpoint
DROP INDEX "idx_user_organization_id_external_id";--> statement-breakpoint
DROP INDEX "idx_user_organization_id";--> statement-breakpoint
DROP INDEX "idx_boards_organization_id_slug";--> statement-breakpoint
DROP INDEX "idx_boards_organization_id";--> statement-breakpoint
DROP INDEX "idx_tags_organization_id_name";--> statement-breakpoint
DROP INDEX "idx_tags_organization_id";--> statement-breakpoint
DROP INDEX "idx_tags_organization_id_name_lower";--> statement-breakpoint
ALTER TABLE "boards" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;--> statement-breakpoint
ALTER TABLE "boards" ADD COLUMN "team_id" text;--> statement-breakpoint
ALTER TABLE "github_installations" ADD COLUMN "team_id" text;--> statement-breakpoint
ALTER TABLE "team" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "team" ADD COLUMN "logo" text;--> statement-breakpoint
ALTER TABLE "team" ADD COLUMN "public_key" text DEFAULT gen_random_uuid()::text;--> statement-breakpoint
ALTER TABLE "tags" ADD COLUMN "team_id" text;--> statement-breakpoint
ALTER TABLE "boards" ADD CONSTRAINT "boards_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "github_installations" ADD CONSTRAINT "github_installations_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_boards_team_id_slug" ON "boards" USING btree ("team_id","slug");--> statement-breakpoint
CREATE INDEX "idx_boards_team_id" ON "boards" USING btree ("team_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_tags_team_id_name" ON "tags" USING btree ("team_id","name");--> statement-breakpoint
CREATE INDEX "idx_tags_team_id" ON "tags" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "idx_tags_team_id_name_lower" ON "tags" USING btree ("team_id","name");--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "organization_id";--> statement-breakpoint
ALTER TABLE "boards" DROP COLUMN "organization_id";--> statement-breakpoint
ALTER TABLE "feedback" DROP COLUMN "team_id";--> statement-breakpoint
ALTER TABLE "github_installations" DROP COLUMN "organization_id";--> statement-breakpoint
ALTER TABLE "organization" DROP COLUMN "public_key";--> statement-breakpoint
ALTER TABLE "tags" DROP COLUMN "organization_id";