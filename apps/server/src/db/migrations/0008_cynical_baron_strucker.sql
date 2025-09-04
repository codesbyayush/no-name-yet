ALTER TABLE "feedback" ALTER COLUMN "priority" SET DEFAULT 'low';--> statement-breakpoint
ALTER TYPE priority_enum RENAME VALUE 'no_priority' TO 'no-priority';