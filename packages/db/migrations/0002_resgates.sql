CREATE TYPE "public"."offer_usage_period" AS ENUM('day', 'week', 'month', 'year', 'unlimited');--> statement-breakpoint
CREATE TYPE "public"."redemption_status" AS ENUM('issued', 'redeemed', 'expired', 'voided');--> statement-breakpoint
ALTER TYPE "public"."offer_kind" ADD VALUE 'two_for_one';--> statement-breakpoint
CREATE TABLE "redemption" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"offer_id" text NOT NULL,
	"place_id" text NOT NULL,
	"subscription_id" text NOT NULL,
	"token_hash" text NOT NULL,
	"status" "redemption_status" DEFAULT 'issued' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"redeemed_at" timestamp with time zone,
	"operator_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "redemption_id_ulid" CHECK ("id" ~ '^[0-9A-HJKMNP-TV-Z]{26}$'),
	CONSTRAINT "redemption_redeemed_at" CHECK ("redemption"."status" <> 'redeemed' or "redemption"."redeemed_at" is not null)
);
--> statement-breakpoint
ALTER TABLE "redemption" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "offer" ADD COLUMN "usage_period" "offer_usage_period" DEFAULT 'year' NOT NULL;--> statement-breakpoint
ALTER TABLE "redemption" ADD CONSTRAINT "redemption_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "redemption" ADD CONSTRAINT "redemption_offer_id_offer_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offer"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "redemption" ADD CONSTRAINT "redemption_place_id_place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."place"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "redemption" ADD CONSTRAINT "redemption_subscription_id_subscription_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscription"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "redemption_token_issued" ON "redemption" USING btree ("token_hash") WHERE status = 'issued';--> statement-breakpoint
CREATE INDEX "redemption_user_offer_idx" ON "redemption" USING btree ("user_id","offer_id","created_at");--> statement-breakpoint
CREATE INDEX "redemption_place_idx" ON "redemption" USING btree ("place_id");--> statement-breakpoint
CREATE POLICY "redemption_leitura_da_propria_pessoa" ON "redemption" AS PERMISSIVE FOR SELECT TO "achados_app" USING (user_id = nullif(current_setting('app.user_id', true), ''));--> statement-breakpoint
CREATE POLICY "redemption_emissao_da_propria_pessoa" ON "redemption" AS PERMISSIVE FOR INSERT TO "achados_app" WITH CHECK (user_id = nullif(current_setting('app.user_id', true), '') and status = 'issued' and redeemed_at is null and operator_id is null);--> statement-breakpoint
CREATE POLICY "redemption_cancelamento_da_propria_pessoa" ON "redemption" AS PERMISSIVE FOR UPDATE TO "achados_app" USING (user_id = nullif(current_setting('app.user_id', true), '') and status = 'issued') WITH CHECK (user_id = nullif(current_setting('app.user_id', true), '') and status = 'voided' and redeemed_at is null and operator_id is null);