ALTER TABLE "tags" DROP CONSTRAINT "tags_organization_id_name_unique";--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_organization_id_type_unique" UNIQUE("organization_id","type");