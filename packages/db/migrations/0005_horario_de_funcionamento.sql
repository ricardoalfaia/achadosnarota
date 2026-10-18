CREATE TABLE "place_hours" (
	"id" text PRIMARY KEY NOT NULL,
	"place_id" text NOT NULL,
	"weekday" smallint NOT NULL,
	"opens" time NOT NULL,
	"closes" time NOT NULL,
	CONSTRAINT "place_hours_id_ulid" CHECK ("id" ~ '^[0-9A-HJKMNP-TV-Z]{26}$'),
	CONSTRAINT "place_hours_weekday" CHECK ("place_hours"."weekday" between 0 and 6),
	CONSTRAINT "place_hours_interval" CHECK ("place_hours"."opens" <> "place_hours"."closes")
);
--> statement-breakpoint
ALTER TABLE "place_hours" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "place" ADD COLUMN "hours_note" text;--> statement-breakpoint
ALTER TABLE "place_hours" ADD CONSTRAINT "place_hours_place_id_place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."place"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "place_hours_place_idx" ON "place_hours" USING btree ("place_id","weekday");--> statement-breakpoint
CREATE POLICY "place_hours_leitura_publica" ON "place_hours" AS PERMISSIVE FOR SELECT TO "achados_app" USING (exists (select 1 from place p where p.id = place_id and p.status = 'published'));--> statement-breakpoint
CREATE POLICY "place_hours_leitura_da_equipe" ON "place_hours" AS PERMISSIVE FOR SELECT TO "achados_app" USING (exists (select 1 from staff_member sm where sm.user_id = nullif(current_setting('app.user_id', true), '') and sm.role in ('admin', 'curator', 'commercial')));--> statement-breakpoint
CREATE POLICY "place_hours_insert_da_equipe" ON "place_hours" AS PERMISSIVE FOR INSERT TO "achados_app" WITH CHECK (exists (select 1 from staff_member sm where sm.user_id = nullif(current_setting('app.user_id', true), '') and sm.role in ('admin', 'curator')));--> statement-breakpoint
CREATE POLICY "place_hours_update_da_equipe" ON "place_hours" AS PERMISSIVE FOR UPDATE TO "achados_app" USING (exists (select 1 from staff_member sm where sm.user_id = nullif(current_setting('app.user_id', true), '') and sm.role in ('admin', 'curator'))) WITH CHECK (exists (select 1 from staff_member sm where sm.user_id = nullif(current_setting('app.user_id', true), '') and sm.role in ('admin', 'curator')));--> statement-breakpoint
CREATE POLICY "place_hours_delete_da_equipe" ON "place_hours" AS PERMISSIVE FOR DELETE TO "achados_app" USING (exists (select 1 from staff_member sm where sm.user_id = nullif(current_setting('app.user_id', true), '') and sm.role in ('admin', 'curator')));