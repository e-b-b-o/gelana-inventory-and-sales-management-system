CREATE SEQUENCE "public"."product_sku_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "category_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "brand" varchar(255);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "image_url" varchar(1024);