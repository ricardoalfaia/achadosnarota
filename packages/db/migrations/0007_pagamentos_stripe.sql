-- O papel dos pagamentos precisa existir para as políticas abaixo. Nasce sem
-- login; scripts/setup-papel-de-pagamentos.mjs liga o login, a senha e os
-- grants só nas tabelas dele.
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'achados_pagamentos') THEN
    CREATE ROLE achados_pagamentos NOLOGIN;
  END IF;
END $$;--> statement-breakpoint
CREATE TABLE "payment_event" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "payment_event" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "provider_payment_id" text;--> statement-breakpoint
CREATE POLICY "plan_leitura_dos_pagamentos" ON "plan" AS PERMISSIVE FOR SELECT TO "achados_pagamentos" USING (true);--> statement-breakpoint
CREATE POLICY "subscription_escrita_dos_pagamentos" ON "subscription" AS PERMISSIVE FOR ALL TO "achados_pagamentos" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "payment_event_dos_pagamentos" ON "payment_event" AS PERMISSIVE FOR ALL TO "achados_pagamentos" USING (true) WITH CHECK (true);