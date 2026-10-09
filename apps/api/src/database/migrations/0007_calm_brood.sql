CREATE TABLE "product_prices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_unit_id" uuid NOT NULL,
	"selling_price" numeric(12, 2) NOT NULL,
	"effective_from" timestamp DEFAULT now() NOT NULL,
	"effective_until" timestamp
);
--> statement-breakpoint
ALTER TABLE "product_prices" ADD CONSTRAINT "product_prices_product_unit_id_product_units_id_fk" FOREIGN KEY ("product_unit_id") REFERENCES "public"."product_units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint

-- Backfill product prices
INSERT INTO "product_prices" ("id", "product_unit_id", "selling_price", "effective_from", "effective_until")
SELECT gen_random_uuid(), "product_units"."id", "products"."default_selling_price", now(), NULL
FROM "products"
JOIN "product_units" ON "products"."id" = "product_units"."product_id"
WHERE "product_units"."is_base" = true;
--> statement-breakpoint

ALTER TABLE "products" DROP COLUMN "unit";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "default_selling_price";