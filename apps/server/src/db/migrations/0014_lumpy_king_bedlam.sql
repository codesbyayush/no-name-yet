CREATE TABLE "team_serials" (
	"team_id" text PRIMARY KEY NOT NULL,
	"next_serial" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "feedback" ALTER COLUMN "issue_key" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "feedback" ALTER COLUMN "board_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "team_id" text;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;