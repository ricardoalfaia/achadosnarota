ALTER TABLE "editorial_review" ADD COLUMN "hygiene" numeric(2, 1);--> statement-breakpoint
ALTER TABLE "editorial_review" ADD COLUMN "presentation" numeric(2, 1);--> statement-breakpoint
ALTER TABLE "editorial_review" ADD COLUMN "flavor" numeric(2, 1);--> statement-breakpoint
ALTER TABLE "editorial_review" ADD COLUMN "sophistication" numeric(2, 1);--> statement-breakpoint
ALTER TABLE "editorial_review" ADD COLUMN "service" numeric(2, 1);--> statement-breakpoint
ALTER TABLE "editorial_review" ADD COLUMN "ambience" numeric(2, 1);--> statement-breakpoint
ALTER TABLE "editorial_review" ADD COLUMN "value" numeric(2, 1);--> statement-breakpoint
ALTER TABLE "editorial_review" ADD COLUMN "highlight" text;--> statement-breakpoint
ALTER TABLE "editorial_review" ADD COLUMN "tips" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "editorial_review" ADD CONSTRAINT "editorial_review_hygiene" CHECK ("editorial_review"."hygiene" is null or "editorial_review"."hygiene" between 0 and 5);--> statement-breakpoint
ALTER TABLE "editorial_review" ADD CONSTRAINT "editorial_review_presentation" CHECK ("editorial_review"."presentation" is null or "editorial_review"."presentation" between 0 and 5);--> statement-breakpoint
ALTER TABLE "editorial_review" ADD CONSTRAINT "editorial_review_flavor" CHECK ("editorial_review"."flavor" is null or "editorial_review"."flavor" between 0 and 5);--> statement-breakpoint
ALTER TABLE "editorial_review" ADD CONSTRAINT "editorial_review_sophistication" CHECK ("editorial_review"."sophistication" is null or "editorial_review"."sophistication" between 0 and 5);--> statement-breakpoint
ALTER TABLE "editorial_review" ADD CONSTRAINT "editorial_review_service" CHECK ("editorial_review"."service" is null or "editorial_review"."service" between 0 and 5);--> statement-breakpoint
ALTER TABLE "editorial_review" ADD CONSTRAINT "editorial_review_ambience" CHECK ("editorial_review"."ambience" is null or "editorial_review"."ambience" between 0 and 5);--> statement-breakpoint
ALTER TABLE "editorial_review" ADD CONSTRAINT "editorial_review_value" CHECK ("editorial_review"."value" is null or "editorial_review"."value" between 0 and 5);