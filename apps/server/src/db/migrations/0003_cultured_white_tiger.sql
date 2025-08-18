CREATE TABLE "github_installations" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text,
	"github_installation_id" integer NOT NULL,
	"account_login" text NOT NULL,
	"account_id" integer NOT NULL,
	"app_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "github_installations_github_installation_id_unique" UNIQUE("github_installation_id")
);
--> statement-breakpoint
CREATE TABLE "github_repositories" (
	"id" text PRIMARY KEY NOT NULL,
	"installation_id" text NOT NULL,
	"repo_id" integer NOT NULL,
	"full_name" text NOT NULL,
	"name" text NOT NULL,
	"private" boolean DEFAULT false NOT NULL,
	"default_branch" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "github_repositories_installation_id_repo_id_unique" UNIQUE("installation_id","repo_id")
);
--> statement-breakpoint
CREATE TABLE "github_webhook_deliveries" (
	"id" text PRIMARY KEY NOT NULL,
	"delivery_id" text NOT NULL,
	"event" text NOT NULL,
	"payload_hash" text,
	"received_at" timestamp DEFAULT now() NOT NULL,
	"handled_at" timestamp,
	CONSTRAINT "github_webhook_deliveries_delivery_id_unique" UNIQUE("delivery_id")
);
--> statement-breakpoint
ALTER TABLE "github_installations" ADD CONSTRAINT "github_installations_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "github_repositories" ADD CONSTRAINT "github_repositories_installation_id_github_installations_id_fk" FOREIGN KEY ("installation_id") REFERENCES "public"."github_installations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_github_installations_account" ON "github_installations" USING btree ("account_login");--> statement-breakpoint
CREATE INDEX "idx_github_repositories_installation" ON "github_repositories" USING btree ("installation_id");--> statement-breakpoint
CREATE INDEX "idx_github_webhook_delivery" ON "github_webhook_deliveries" USING btree ("delivery_id");