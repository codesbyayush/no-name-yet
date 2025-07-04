CREATE TYPE "public"."feedback_type" AS ENUM('bug', 'suggestion');--> statement-breakpoint
CREATE TYPE "public"."plan_type" AS ENUM('starter', 'pro', 'enterprise');--> statement-breakpoint
CREATE TYPE "public"."severity" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('open', 'in_progress', 'resolved', 'closed');--> statement-breakpoint
CREATE TYPE "public"."vote_type" AS ENUM('upvote', 'downvote', 'bookmark');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"active_organization_id" text,
	"impersonated_by" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"organization_id" text,
	"auth_provider" text DEFAULT 'email' NOT NULL,
	"external_id" text,
	"role" text DEFAULT 'user' NOT NULL,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp,
	"custom_fields" jsonb,
	"last_active_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_organization_id_email_unique" UNIQUE("organization_id","email"),
	CONSTRAINT "user_organization_id_external_id_unique" UNIQUE("organization_id","external_id")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "boards" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"is_private" boolean DEFAULT false,
	"post_count" integer DEFAULT 0,
	"view_count" integer DEFAULT 0,
	"custom_fields" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "boards_organization_id_slug_unique" UNIQUE("organization_id","slug")
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" text PRIMARY KEY NOT NULL,
	"feedback_id" text NOT NULL,
	"parent_comment_id" text,
	"author_id" text,
	"is_anonymous" boolean DEFAULT false NOT NULL,
	"anonymous_name" text,
	"anonymous_email" text,
	"content" text NOT NULL,
	"sentiment_score" real,
	"is_internal" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" text PRIMARY KEY DEFAULT 'gen_random_uuid()::text' NOT NULL,
	"board_id" text NOT NULL,
	"type" "feedback_type" NOT NULL,
	"title" text,
	"description" text NOT NULL,
	"status" "status" DEFAULT 'open' NOT NULL,
	"user_id" text,
	"user_email" text,
	"user_name" text,
	"user_agent" text,
	"url" text,
	"browser_info" jsonb,
	"attachments" jsonb DEFAULT '[]'::jsonb,
	"ai_analysis" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_anonymous" boolean DEFAULT false NOT NULL,
	"tags" text[] DEFAULT '{}',
	"priority" text DEFAULT 'medium'
);
--> statement-breakpoint
CREATE TABLE "votes" (
	"id" text PRIMARY KEY NOT NULL,
	"feedback_id" text,
	"comment_id" text,
	"user_id" text NOT NULL,
	"type" "vote_type" NOT NULL,
	"weight" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "votes_user_id_feedback_id_comment_id_unique" UNIQUE("user_id","feedback_id","comment_id")
);
--> statement-breakpoint
CREATE TABLE "invitation" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"inviter_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"role" text NOT NULL,
	"status" text NOT NULL,
	"team_id" text,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"role" text NOT NULL,
	"team_id" text,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"logo" text,
	"metadata" text,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"organization_id" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boards" ADD CONSTRAINT "boards_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_feedback_id_feedback_id_fk" FOREIGN KEY ("feedback_id") REFERENCES "public"."feedback"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_comment_id_comments_id_fk" FOREIGN KEY ("parent_comment_id") REFERENCES "public"."comments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_feedback_id_feedback_id_fk" FOREIGN KEY ("feedback_id") REFERENCES "public"."feedback"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_comment_id_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviter_id_user_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team" ADD CONSTRAINT "team_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_users_organization" ON "user" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "user" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_boards_organization" ON "boards" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_comments_feedback" ON "comments" USING btree ("feedback_id");--> statement-breakpoint
CREATE INDEX "idx_comments_parent" ON "comments" USING btree ("parent_comment_id");--> statement-breakpoint
CREATE INDEX "idx_feedback_boards" ON "feedback" USING btree ("board_id");--> statement-breakpoint
CREATE INDEX "idx_feedback_status" ON "feedback" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_feedback_type" ON "feedback" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_votes_feedback" ON "votes" USING btree ("feedback_id");--> statement-breakpoint
CREATE INDEX "idx_votes_comment" ON "votes" USING btree ("comment_id");--> statement-breakpoint
CREATE INDEX "idx_invitation_email_org" ON "invitation" USING btree ("email","organization_id");--> statement-breakpoint
CREATE INDEX "idx_invitation_status" ON "invitation" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_invitation_expires" ON "invitation" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_member_user_org" ON "member" USING btree ("user_id","organization_id");--> statement-breakpoint
CREATE INDEX "idx_member_org" ON "member" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_member_team" ON "member" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "idx_organization_slug" ON "organization" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_team_org" ON "team" USING btree ("organization_id");