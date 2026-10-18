CREATE TABLE "courtesy" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"granted_by" text NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"revoked_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "courtesy_id_ulid" CHECK ("id" ~ '^[0-9A-HJKMNP-TV-Z]{26}$'),
	CONSTRAINT "courtesy_sete_dias" CHECK ("courtesy"."ends_at" = "courtesy"."starts_at" + make_interval(days => 7)),
	CONSTRAINT "courtesy_revogacao" CHECK (("courtesy"."revoked_at" is null) = ("courtesy"."revoked_by" is null)),
	CONSTRAINT "courtesy_nao_para_si" CHECK ("courtesy"."user_id" <> "courtesy"."granted_by")
);
--> statement-breakpoint
ALTER TABLE "courtesy" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "redemption" ALTER COLUMN "subscription_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "redemption" ADD COLUMN "courtesy_id" text;--> statement-breakpoint
ALTER TABLE "courtesy" ADD CONSTRAINT "courtesy_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courtesy" ADD CONSTRAINT "courtesy_granted_by_user_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courtesy" ADD CONSTRAINT "courtesy_revoked_by_user_id_fk" FOREIGN KEY ("revoked_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "courtesy_user_id_unica" ON "courtesy" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "redemption" ADD CONSTRAINT "redemption_courtesy_id_courtesy_id_fk" FOREIGN KEY ("courtesy_id") REFERENCES "public"."courtesy"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "redemption" ADD CONSTRAINT "redemption_um_passaporte" CHECK (num_nonnulls("redemption"."subscription_id", "redemption"."courtesy_id") = 1);--> statement-breakpoint
CREATE POLICY "plan_leitura_da_equipe" ON "plan" AS PERMISSIVE FOR SELECT TO "achados_app" USING (exists (select 1 from staff_member sm where sm.user_id = nullif(current_setting('app.user_id', true), '') and sm.role in ('admin')));--> statement-breakpoint
CREATE POLICY "subscription_leitura_da_equipe" ON "subscription" AS PERMISSIVE FOR SELECT TO "achados_app" USING (exists (select 1 from staff_member sm where sm.user_id = nullif(current_setting('app.user_id', true), '') and sm.role in ('admin')));--> statement-breakpoint
CREATE POLICY "courtesy_leitura_da_propria_pessoa" ON "courtesy" AS PERMISSIVE FOR SELECT TO "achados_app" USING (user_id = nullif(current_setting('app.user_id', true), ''));--> statement-breakpoint
CREATE POLICY "courtesy_leitura_da_equipe" ON "courtesy" AS PERMISSIVE FOR SELECT TO "achados_app" USING (exists (select 1 from staff_member sm where sm.user_id = nullif(current_setting('app.user_id', true), '') and sm.role in ('admin')));--> statement-breakpoint
CREATE POLICY "courtesy_concessao_da_administracao" ON "courtesy" AS PERMISSIVE FOR INSERT TO "achados_app" WITH CHECK (granted_by = nullif(current_setting('app.user_id', true), '') and revoked_at is null and revoked_by is null and exists (select 1 from staff_member sm where sm.user_id = nullif(current_setting('app.user_id', true), '') and sm.role in ('admin')));--> statement-breakpoint
CREATE POLICY "courtesy_revogacao_da_administracao" ON "courtesy" AS PERMISSIVE FOR UPDATE TO "achados_app" USING (revoked_at is null and exists (select 1 from staff_member sm where sm.user_id = nullif(current_setting('app.user_id', true), '') and sm.role in ('admin'))) WITH CHECK (revoked_by = nullif(current_setting('app.user_id', true), '') and revoked_at is not null and exists (select 1 from staff_member sm where sm.user_id = nullif(current_setting('app.user_id', true), '') and sm.role in ('admin')));