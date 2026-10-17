CREATE TYPE "public"."place_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."review_status" AS ENUM('draft', 'in_review', 'approved', 'published', 'superseded', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."editorial_seal" AS ENUM('featured', 'beloved', 'verified', 'new');--> statement-breakpoint
CREATE TYPE "public"."offer_kind" AS ENUM('discount', 'courtesy');--> statement-breakpoint
CREATE TYPE "public"."offer_status" AS ENUM('draft', 'pending_review', 'active', 'paused', 'expired', 'archived');--> statement-breakpoint
CREATE TYPE "public"."plan_period" AS ENUM('year');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('pending', 'active', 'past_due', 'canceled', 'expired', 'refunded');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limit" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"count" integer NOT NULL,
	"last_request" bigint NOT NULL,
	CONSTRAINT "rate_limit_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "two_factor" (
	"id" text PRIMARY KEY NOT NULL,
	"secret" text NOT NULL,
	"backup_codes" text NOT NULL,
	"user_id" text NOT NULL,
	"verified" boolean DEFAULT true NOT NULL,
	"failed_verification_count" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"two_factor_enabled" boolean DEFAULT false NOT NULL,
	"must_change_password" boolean DEFAULT false NOT NULL,
	"terms_version" text,
	"terms_accepted_at" timestamp with time zone,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "category" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"icon" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "category_slug_unique" UNIQUE("slug"),
	CONSTRAINT "category_id_ulid" CHECK ("id" ~ '^[0-9A-HJKMNP-TV-Z]{26}$')
);
--> statement-breakpoint
ALTER TABLE "category" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "city" (
	"id" text PRIMARY KEY NOT NULL,
	"state" char(2) NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "city_slug_unique" UNIQUE("slug"),
	CONSTRAINT "city_id_ulid" CHECK ("id" ~ '^[0-9A-HJKMNP-TV-Z]{26}$'),
	CONSTRAINT "city_state_uf" CHECK ("city"."state" ~ '^[A-Z]{2}$')
);
--> statement-breakpoint
ALTER TABLE "city" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "place_media" (
	"id" text PRIMARY KEY NOT NULL,
	"place_id" text NOT NULL,
	"url" text NOT NULL,
	"alt" text NOT NULL,
	"source" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "place_media_place_position" UNIQUE("place_id","position"),
	CONSTRAINT "place_media_id_ulid" CHECK ("id" ~ '^[0-9A-HJKMNP-TV-Z]{26}$')
);
--> statement-breakpoint
ALTER TABLE "place_media" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "place" (
	"id" text PRIMARY KEY NOT NULL,
	"city_id" text NOT NULL,
	"category_id" text NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"specialty" text NOT NULL,
	"summary" text NOT NULL,
	"description" text,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"address" text,
	"phone" text,
	"website" text,
	"latitude" numeric(9, 6),
	"longitude" numeric(9, 6),
	"status" "place_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "place_slug_unique" UNIQUE("slug"),
	CONSTRAINT "place_id_ulid" CHECK ("id" ~ '^[0-9A-HJKMNP-TV-Z]{26}$'),
	CONSTRAINT "place_phone_digits" CHECK ("place"."phone" ~ '^[0-9]{10,13}$'),
	CONSTRAINT "place_published_at" CHECK ("place"."status" <> 'published' or "place"."published_at" is not null)
);
--> statement-breakpoint
ALTER TABLE "place" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "editorial_review" (
	"id" text PRIMARY KEY NOT NULL,
	"place_id" text NOT NULL,
	"score" numeric(2, 1) NOT NULL,
	"summary" text NOT NULL,
	"caveats" text,
	"visited_on" date NOT NULL,
	"seal" "editorial_seal",
	"status" "review_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "editorial_review_id_ulid" CHECK ("id" ~ '^[0-9A-HJKMNP-TV-Z]{26}$'),
	CONSTRAINT "editorial_review_score" CHECK ("editorial_review"."score" between 0 and 5),
	CONSTRAINT "editorial_review_published_at" CHECK ("editorial_review"."status" <> 'published' or "editorial_review"."published_at" is not null)
);
--> statement-breakpoint
ALTER TABLE "editorial_review" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "offer" (
	"id" text PRIMARY KEY NOT NULL,
	"place_id" text NOT NULL,
	"title" text NOT NULL,
	"terms" text NOT NULL,
	"kind" "offer_kind" NOT NULL,
	"icon" text NOT NULL,
	"limit_per_user" integer DEFAULT 1 NOT NULL,
	"valid_from" timestamp with time zone,
	"valid_until" timestamp with time zone,
	"status" "offer_status" DEFAULT 'draft' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "offer_id_ulid" CHECK ("id" ~ '^[0-9A-HJKMNP-TV-Z]{26}$'),
	CONSTRAINT "offer_limit_per_user" CHECK ("offer"."limit_per_user" >= 1),
	CONSTRAINT "offer_valid_range" CHECK ("offer"."valid_until" is null or "offer"."valid_from" is null or "offer"."valid_until" > "offer"."valid_from")
);
--> statement-breakpoint
ALTER TABLE "offer" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "plan" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"price_cents" integer NOT NULL,
	"currency" char(3) DEFAULT 'BRL' NOT NULL,
	"period" "plan_period" DEFAULT 'year' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "plan_id_ulid" CHECK ("id" ~ '^[0-9A-HJKMNP-TV-Z]{26}$'),
	CONSTRAINT "plan_price_positive" CHECK ("plan"."price_cents" > 0)
);
--> statement-breakpoint
ALTER TABLE "plan" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "subscription" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"plan_id" text NOT NULL,
	"status" "subscription_status" DEFAULT 'pending' NOT NULL,
	"provider_subscription_id" text,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscription_id_ulid" CHECK ("id" ~ '^[0-9A-HJKMNP-TV-Z]{26}$'),
	CONSTRAINT "subscription_active_period" CHECK ("subscription"."status" <> 'active' or ("subscription"."starts_at" is not null and "subscription"."ends_at" is not null and "subscription"."ends_at" > "subscription"."starts_at"))
);
--> statement-breakpoint
ALTER TABLE "subscription" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "favorite" (
	"user_id" text NOT NULL,
	"place_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "favorite_user_id_place_id_pk" PRIMARY KEY("user_id","place_id")
);
--> statement-breakpoint
ALTER TABLE "favorite" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "two_factor" ADD CONSTRAINT "two_factor_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "place_media" ADD CONSTRAINT "place_media_place_id_place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."place"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "place" ADD CONSTRAINT "place_city_id_city_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."city"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "place" ADD CONSTRAINT "place_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "editorial_review" ADD CONSTRAINT "editorial_review_place_id_place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."place"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer" ADD CONSTRAINT "offer_place_id_place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."place"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_plan_id_plan_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plan"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite" ADD CONSTRAINT "favorite_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite" ADD CONSTRAINT "favorite_place_id_place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."place"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "two_factor_secret_idx" ON "two_factor" USING btree ("secret");--> statement-breakpoint
CREATE INDEX "two_factor_user_id_idx" ON "two_factor" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "place_media_place_id_idx" ON "place_media" USING btree ("place_id");--> statement-breakpoint
CREATE INDEX "place_city_id_idx" ON "place" USING btree ("city_id");--> statement-breakpoint
CREATE INDEX "place_category_id_idx" ON "place" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "editorial_review_place_id_idx" ON "editorial_review" USING btree ("place_id");--> statement-breakpoint
CREATE UNIQUE INDEX "editorial_review_one_published" ON "editorial_review" USING btree ("place_id") WHERE status = 'published';--> statement-breakpoint
CREATE INDEX "offer_place_id_idx" ON "offer" USING btree ("place_id");--> statement-breakpoint
CREATE INDEX "subscription_user_id_idx" ON "subscription" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "subscription_provider_id" ON "subscription" USING btree ("provider_subscription_id") WHERE provider_subscription_id is not null;--> statement-breakpoint
CREATE INDEX "favorite_place_id_idx" ON "favorite" USING btree ("place_id");--> statement-breakpoint
CREATE POLICY "category_leitura_publica" ON "category" AS PERMISSIVE FOR SELECT TO "achados_app" USING (true);--> statement-breakpoint
CREATE POLICY "city_leitura_publica" ON "city" AS PERMISSIVE FOR SELECT TO "achados_app" USING (true);--> statement-breakpoint
CREATE POLICY "place_media_leitura_publica" ON "place_media" AS PERMISSIVE FOR SELECT TO "achados_app" USING (exists (select 1 from place p where p.id = place_id and p.status = 'published'));--> statement-breakpoint
CREATE POLICY "place_leitura_publica" ON "place" AS PERMISSIVE FOR SELECT TO "achados_app" USING (status = 'published');--> statement-breakpoint
CREATE POLICY "editorial_review_leitura_publica" ON "editorial_review" AS PERMISSIVE FOR SELECT TO "achados_app" USING (status = 'published'
        and exists (select 1 from place p where p.id = place_id and p.status = 'published'));--> statement-breakpoint
CREATE POLICY "offer_leitura_publica" ON "offer" AS PERMISSIVE FOR SELECT TO "achados_app" USING (status = 'active'
        and (valid_from is null or valid_from <= now())
        and (valid_until is null or valid_until > now())
        and exists (select 1 from place p where p.id = place_id and p.status = 'published'));--> statement-breakpoint
CREATE POLICY "plan_leitura_publica" ON "plan" AS PERMISSIVE FOR SELECT TO "achados_app" USING (active);--> statement-breakpoint
CREATE POLICY "subscription_leitura_da_propria_pessoa" ON "subscription" AS PERMISSIVE FOR SELECT TO "achados_app" USING (user_id = nullif(current_setting('app.user_id', true), ''));--> statement-breakpoint
CREATE POLICY "favorite_da_propria_pessoa" ON "favorite" AS PERMISSIVE FOR ALL TO "achados_app" USING (user_id = nullif(current_setting('app.user_id', true), '')) WITH CHECK (user_id = nullif(current_setting('app.user_id', true), ''));