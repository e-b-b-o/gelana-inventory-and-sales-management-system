CREATE TABLE "product_unit_conversions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_unit_id" uuid NOT NULL,
	"conversion_quantity" numeric(15, 4) NOT NULL,
	"effective_from" timestamp DEFAULT now() NOT NULL,
	"effective_until" timestamp
);
--> statement-breakpoint
CREATE TABLE "product_units" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"is_base" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "product_unit_conversions" ADD CONSTRAINT "product_unit_conversions_product_unit_id_product_units_id_fk" FOREIGN KEY ("product_unit_id") REFERENCES "public"."product_units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_units" ADD CONSTRAINT "product_units_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "product_units_product_id_name_idx" ON "product_units" USING btree ("product_id","name");
--> statement-breakpoint
WITH inserted_units AS (
  INSERT INTO "product_units" ("id", "product_id", "name", "is_base", "is_active")
  SELECT gen_random_uuid(), "id", "unit", true, true
  FROM "products"
  RETURNING "id"
)
INSERT INTO "product_unit_conversions" ("id", "product_unit_id", "conversion_quantity")
SELECT gen_random_uuid(), "id", 1
FROM inserted_units;