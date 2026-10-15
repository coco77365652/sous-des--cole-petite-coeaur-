CREATE TABLE "site_settings" (
	"key" text PRIMARY KEY,
	"data" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
