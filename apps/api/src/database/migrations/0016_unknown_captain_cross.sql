CREATE SEQUENCE "public"."return_number_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE TABLE "sales_return_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"return_id" uuid NOT NULL,
	"sale_item_id" uuid,
	"product_id" uuid NOT NULL,
	"unit_id" uuid NOT NULL,
	"entered_quantity" integer NOT NULL,
	"base_quantity" integer NOT NULL,
	"unit_price" numeric(12, 2) NOT NULL,
	"condition" varchar(20) NOT NULL,
	"refund_amount" numeric(12, 2) DEFAULT '0' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales_returns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"return_number" varchar(50) NOT NULL,
	"sale_id" uuid,
	"branch_id" uuid NOT NULL,
	"created_by_id" uuid NOT NULL,
	"returned_at" timestamp DEFAULT now() NOT NULL,
	"refund_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"refund_payment_method_id" uuid NOT NULL,
	"status" varchar(50) DEFAULT 'COMPLETED' NOT NULL,
	"reason" varchar(255) NOT NULL,
	"is_unlinked" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sales_returns_return_number_unique" UNIQUE("return_number")
);
--> statement-breakpoint
CREATE TABLE "sale_corrections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sale_id" uuid NOT NULL,
	"correction_type" varchar(50) NOT NULL,
	"reason" varchar(255) NOT NULL,
	"created_by_id" uuid NOT NULL,
	"previous_state" jsonb,
	"new_state" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sales" ADD COLUMN "status" varchar(50) DEFAULT 'COMPLETED' NOT NULL;--> statement-breakpoint
ALTER TABLE "sales_return_items" ADD CONSTRAINT "sales_return_items_return_id_sales_returns_id_fk" FOREIGN KEY ("return_id") REFERENCES "public"."sales_returns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_return_items" ADD CONSTRAINT "sales_return_items_sale_item_id_sale_items_id_fk" FOREIGN KEY ("sale_item_id") REFERENCES "public"."sale_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_return_items" ADD CONSTRAINT "sales_return_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_return_items" ADD CONSTRAINT "sales_return_items_unit_id_product_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."product_units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_returns" ADD CONSTRAINT "sales_returns_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_returns" ADD CONSTRAINT "sales_returns_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_returns" ADD CONSTRAINT "sales_returns_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_returns" ADD CONSTRAINT "sales_returns_refund_payment_method_id_payment_methods_id_fk" FOREIGN KEY ("refund_payment_method_id") REFERENCES "public"."payment_methods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_corrections" ADD CONSTRAINT "sale_corrections_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_corrections" ADD CONSTRAINT "sale_corrections_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;