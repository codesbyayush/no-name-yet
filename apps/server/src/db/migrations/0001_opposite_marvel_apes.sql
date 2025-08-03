ALTER TABLE "organization" ADD COLUMN "is_onboarded" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "onboarding_step" text DEFAULT 'organization' NOT NULL;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "onboarding_completed_at" timestamp;