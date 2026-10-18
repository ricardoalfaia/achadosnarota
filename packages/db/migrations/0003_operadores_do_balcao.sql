CREATE TABLE "partner_operator" (
	"user_id" text NOT NULL,
	"place_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "partner_operator_user_id_place_id_pk" PRIMARY KEY("user_id","place_id")
);
--> statement-breakpoint
ALTER TABLE "partner_operator" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "redemption_attempt" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"place_id" text NOT NULL,
	"succeeded" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "redemption_attempt_id_ulid" CHECK ("id" ~ '^[0-9A-HJKMNP-TV-Z]{26}$')
);
--> statement-breakpoint
ALTER TABLE "redemption_attempt" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "partner_operator" ADD CONSTRAINT "partner_operator_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_operator" ADD CONSTRAINT "partner_operator_place_id_place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."place"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "redemption_attempt" ADD CONSTRAINT "redemption_attempt_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "redemption_attempt" ADD CONSTRAINT "redemption_attempt_place_id_place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."place"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "partner_operator_place_idx" ON "partner_operator" USING btree ("place_id");--> statement-breakpoint
CREATE INDEX "redemption_attempt_user_idx" ON "redemption_attempt" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE POLICY "redemption_leitura_do_operador" ON "redemption" AS PERMISSIVE FOR SELECT TO "achados_app" USING (exists (select 1 from partner_operator po where po.user_id = nullif(current_setting('app.user_id', true), '') and po.place_id = "redemption"."place_id"));--> statement-breakpoint
CREATE POLICY "redemption_consumo_do_operador" ON "redemption" AS PERMISSIVE FOR UPDATE TO "achados_app" USING (status = 'issued' and exists (select 1 from partner_operator po where po.user_id = nullif(current_setting('app.user_id', true), '') and po.place_id = "redemption"."place_id")) WITH CHECK (exists (select 1 from partner_operator po where po.user_id = nullif(current_setting('app.user_id', true), '') and po.place_id = "redemption"."place_id")
        and ((status = 'redeemed' and operator_id = nullif(current_setting('app.user_id', true), '') and operator_id <> user_id and redeemed_at is not null)
          or (status = 'expired' and operator_id is null)));--> statement-breakpoint
CREATE POLICY "partner_operator_leitura_da_propria_pessoa" ON "partner_operator" AS PERMISSIVE FOR SELECT TO "achados_app" USING (user_id = nullif(current_setting('app.user_id', true), ''));--> statement-breakpoint
CREATE POLICY "redemption_attempt_leitura_da_propria_pessoa" ON "redemption_attempt" AS PERMISSIVE FOR SELECT TO "achados_app" USING (user_id = nullif(current_setting('app.user_id', true), ''));--> statement-breakpoint
CREATE POLICY "redemption_attempt_registro_da_propria_pessoa" ON "redemption_attempt" AS PERMISSIVE FOR INSERT TO "achados_app" WITH CHECK (user_id = nullif(current_setting('app.user_id', true), ''));