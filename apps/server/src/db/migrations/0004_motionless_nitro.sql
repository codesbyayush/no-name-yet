CREATE TABLE "issue_sequences" (
	"organization_id" text NOT NULL,
	"last_number" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "issue_sequences_pk" PRIMARY KEY("organization_id")
);
--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "issue_key" text;--> statement-breakpoint
ALTER TABLE "issue_sequences" ADD CONSTRAINT "issue_sequences_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_feedback_issue_key" ON "feedback" USING btree ("issue_key");