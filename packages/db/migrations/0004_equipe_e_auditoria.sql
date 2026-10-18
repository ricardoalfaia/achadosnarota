CREATE TYPE "public"."staff_role" AS ENUM('admin', 'curator', 'commercial');--> statement-breakpoint
CREATE TABLE "audit_event" (
	"id" text PRIMARY KEY NOT NULL,
	"actor_id" text NOT NULL,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" text NOT NULL,
	"details" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "audit_event_id_ulid" CHECK ("id" ~ '^[0-9A-HJKMNP-TV-Z]{26}$')
);
--> statement-breakpoint
ALTER TABLE "audit_event" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "staff_member" (
	"user_id" text PRIMARY KEY NOT NULL,
	"role" "staff_role" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "staff_member" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "audit_event" ADD CONSTRAINT "audit_event_actor_id_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_member" ADD CONSTRAINT "staff_member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_event_entity_idx" ON "audit_event" USING btree ("entity","entity_id");--> statement-breakpoint
CREATE INDEX "audit_event_created_idx" ON "audit_event" USING btree ("created_at");--> statement-breakpoint
CREATE POLICY "category_insert_da_equipe" ON "category" AS PERMISSIVE FOR INSERT TO "achados_app" WITH CHECK (exists (select 1 from staff_member sm where sm.user_id = nullif(current_setting('app.user_id', true), '') and sm.role in ('admin')));--> statement-breakpoint
CREATE POLICY "category_update_da_equipe" ON "category" AS PERMISSIVE FOR UPDATE TO "achados_app" USING (exists (select 1 from staff_member sm where sm.user_id = nullif(current_setting('app.user_id', true), '') and sm.role in ('admin'))) WITH CHECK (exists (select 1 from staff_member sm where sm.user_id = nullif(current_setting('app.user_id', true), '') and sm.role in ('admin')));--> statement-breakpoint
CREATE POLICY "city_insert_da_equipe" ON "city" AS PERMISSIVE FOR INSERT TO "achados_app" WITH CHECK (exists (select 1 from staff_member sm where sm.user_id = nullif(current_setting('app.user_id', true), '') and sm.role in ('admin')));--> statement-breakpoint
CREATE POLICY "city_update_da_equipe" ON "city" AS PERMISSIVE FOR UPDATE TO "achados_app" USING (exists (select 1 from staff_member sm where sm.user_id = nullif(current_setting('app.user_id', true), '') and sm.role in ('admin'))) WITH CHECK (exists (select 1 from staff_member sm where sm.user_id = nullif(current_setting('app.user_id', true), '') and sm.role in ('admin')));--> statement-breakpoint
CREATE POLICY "place_media_leitura_da_equipe" ON "place_media" AS PERMISSIVE FOR SELECT TO "achados_app" USING (exists (select 1 from staff_member sm where sm.user_id = nullif(current_setting('app.user_id', true), '') and sm.role in ('admin', 'curator', 'commercial')));--> statement-breakpoint
CREATE POLICY "place_media_insert_da_equipe" ON "place_media" AS PERMISSIVE FOR INSERT TO "achados_app" WITH CHECK (exists (select 1 from staff_member sm where sm.user_id = nullif(current_setting('app.user_id', true), '') and sm.role in ('admin', 'curator')));--> statement-breakpoint
CREATE POLICY "place_media_update_da_equipe" ON "place_media" AS PERMISSIVE FOR UPDATE TO "achados_app" USING (exists (select 1 from staff_member sm where sm.user_id = nullif(current_setting('app.user_id', true), '') and sm.role in ('admin', 'curator'))) WITH CHECK (exists (select 1 from staff_member sm where sm.user_id = nullif(current_setting('app.user_id', true), '') and sm.role in ('admin', 'curator')));--> statement-breakpoint
CREATE POLICY "place_media_delete_da_equipe" ON "place_media" AS PERMISSIVE FOR DELETE TO "achados_app" USING (exists (select 1 from staff_member sm where sm.user_id = nullif(current_setting('app.user_id', true), '') and sm.role in ('admin', 'curator')));--> statement-breakpoint
CREATE POLICY "place_leitura_da_equipe" ON "place" AS PERMISSIVE FOR SELECT TO "achados_app" USING (exists (select 1 from staff_member sm where sm.user_id = nullif(current_setting('app.user_id', true), '') and sm.role in ('admin', 'curator', 'commercial')));--> statement-breakpoint
CREATE POLICY "place_insert_da_equipe" ON "place" AS PERMISSIVE FOR INSERT TO "achados_app" WITH CHECK (exists (select 1 from staff_member sm where sm.user_id = nullif(current_setting('app.user_id', true), '') and sm.role in ('admin', 'curator')));--> statement-breakpoint
CREATE POLICY "place_update_da_equipe" ON "place" AS PERMISSIVE FOR UPDATE TO "achados_app" USING (exists (select 1 from staff_member sm where sm.user_id = nullif(current_setting('app.user_id', true), '') and sm.role in ('admin', 'curator'))) WITH CHECK (exists (select 1 from staff_member sm where sm.user_id = nullif(current_setting('app.user_id', true), '') and sm.role in ('admin', 'curator')));--> statement-breakpoint
CREATE POLICY "editorial_review_leitura_da_equipe" ON "editorial_review" AS PERMISSIVE FOR SELECT TO "achados_app" USING (exists (select 1 from staff_member sm where sm.user_id = nullif(current_setting('app.user_id', true), '') and sm.role in ('admin', 'curator', 'commercial')));--> statement-breakpoint
CREATE POLICY "editorial_review_insert_da_equipe" ON "editorial_review" AS PERMISSIVE FOR INSERT TO "achados_app" WITH CHECK (exists (select 1 from staff_member sm where sm.user_id = nullif(current_setting('app.user_id', true), '') and sm.role in ('admin', 'curator')));--> statement-breakpoint
CREATE POLICY "editorial_review_update_da_equipe" ON "editorial_review" AS PERMISSIVE FOR UPDATE TO "achados_app" USING (exists (select 1 from staff_member sm where sm.user_id = nullif(current_setting('app.user_id', true), '') and sm.role in ('admin', 'curator'))) WITH CHECK (exists (select 1 from staff_member sm where sm.user_id = nullif(current_setting('app.user_id', true), '') and sm.role in ('admin', 'curator')));--> statement-breakpoint
CREATE POLICY "offer_leitura_da_equipe" ON "offer" AS PERMISSIVE FOR SELECT TO "achados_app" USING (exists (select 1 from staff_member sm where sm.user_id = nullif(current_setting('app.user_id', true), '') and sm.role in ('admin', 'curator', 'commercial')));--> statement-breakpoint
CREATE POLICY "offer_insert_da_equipe" ON "offer" AS PERMISSIVE FOR INSERT TO "achados_app" WITH CHECK (exists (select 1 from staff_member sm where sm.user_id = nullif(current_setting('app.user_id', true), '') and sm.role in ('admin', 'commercial')));--> statement-breakpoint
CREATE POLICY "offer_update_da_equipe" ON "offer" AS PERMISSIVE FOR UPDATE TO "achados_app" USING (exists (select 1 from staff_member sm where sm.user_id = nullif(current_setting('app.user_id', true), '') and sm.role in ('admin', 'commercial'))) WITH CHECK (exists (select 1 from staff_member sm where sm.user_id = nullif(current_setting('app.user_id', true), '') and sm.role in ('admin', 'commercial')));--> statement-breakpoint
CREATE POLICY "redemption_leitura_da_equipe" ON "redemption" AS PERMISSIVE FOR SELECT TO "achados_app" USING (exists (select 1 from staff_member sm where sm.user_id = nullif(current_setting('app.user_id', true), '') and sm.role in ('admin', 'commercial')));--> statement-breakpoint
CREATE POLICY "partner_operator_leitura_da_equipe" ON "partner_operator" AS PERMISSIVE FOR SELECT TO "achados_app" USING (exists (select 1 from staff_member sm where sm.user_id = nullif(current_setting('app.user_id', true), '') and sm.role in ('admin')));--> statement-breakpoint
CREATE POLICY "partner_operator_insert_da_equipe" ON "partner_operator" AS PERMISSIVE FOR INSERT TO "achados_app" WITH CHECK (exists (select 1 from staff_member sm where sm.user_id = nullif(current_setting('app.user_id', true), '') and sm.role in ('admin')));--> statement-breakpoint
CREATE POLICY "partner_operator_delete_da_equipe" ON "partner_operator" AS PERMISSIVE FOR DELETE TO "achados_app" USING (exists (select 1 from staff_member sm where sm.user_id = nullif(current_setting('app.user_id', true), '') and sm.role in ('admin')));--> statement-breakpoint
CREATE POLICY "audit_event_registro_da_equipe" ON "audit_event" AS PERMISSIVE FOR INSERT TO "achados_app" WITH CHECK (actor_id = nullif(current_setting('app.user_id', true), '') and exists (select 1 from staff_member sm where sm.user_id = nullif(current_setting('app.user_id', true), '') and sm.role in ('admin', 'curator', 'commercial')));--> statement-breakpoint
CREATE POLICY "audit_event_leitura_da_administracao" ON "audit_event" AS PERMISSIVE FOR SELECT TO "achados_app" USING (exists (select 1 from staff_member sm where sm.user_id = nullif(current_setting('app.user_id', true), '') and sm.role in ('admin')));--> statement-breakpoint
CREATE POLICY "staff_member_leitura_da_propria_pessoa" ON "staff_member" AS PERMISSIVE FOR SELECT TO "achados_app" USING (user_id = nullif(current_setting('app.user_id', true), ''));