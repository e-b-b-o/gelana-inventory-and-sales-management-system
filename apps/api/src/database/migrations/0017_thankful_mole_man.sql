CREATE SEQUENCE "public"."transfer_number_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE TABLE "transfer_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transfer_id" uuid NOT NULL,
	"event_type" varchar(50) NOT NULL,
	"actor_id" uuid NOT NULL,
	"notes" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transfer_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transfer_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"unit_id" uuid,
	"requested_quantity" integer NOT NULL,
	"approved_quantity" integer,
	"dispatched_quantity" integer,
	"received_quantity" integer,
	"source_unit_cost" numeric(12, 2),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transfers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transfer_number" varchar(50) NOT NULL,
	"source_branch_id" uuid NOT NULL,
	"destination_branch_id" uuid NOT NULL,
	"status" varchar(50) DEFAULT 'REQUESTED' NOT NULL,
	"notes" varchar(255),
	"created_by_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"approved_by_id" uuid,
	"approved_at" timestamp,
	"approval_notes" varchar(255),
	"rejected_by_id" uuid,
	"rejected_at" timestamp,
	"rejection_reason" varchar(255),
	"dispatched_by_id" uuid,
	"dispatched_at" timestamp,
	"dispatch_notes" varchar(255),
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "transfers_transfer_number_unique" UNIQUE("transfer_number")
);
--> statement-breakpoint
ALTER TABLE "transfer_events" ADD CONSTRAINT "transfer_events_transfer_id_transfers_id_fk" FOREIGN KEY ("transfer_id") REFERENCES "public"."transfers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfer_events" ADD CONSTRAINT "transfer_events_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfer_items" ADD CONSTRAINT "transfer_items_transfer_id_transfers_id_fk" FOREIGN KEY ("transfer_id") REFERENCES "public"."transfers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfer_items" ADD CONSTRAINT "transfer_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfer_items" ADD CONSTRAINT "transfer_items_unit_id_product_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."product_units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_source_branch_id_branches_id_fk" FOREIGN KEY ("source_branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_destination_branch_id_branches_id_fk" FOREIGN KEY ("destination_branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_approved_by_id_users_id_fk" FOREIGN KEY ("approved_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_rejected_by_id_users_id_fk" FOREIGN KEY ("rejected_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_dispatched_by_id_users_id_fk" FOREIGN KEY ("dispatched_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "transfer_events_transfer_id_idx" ON "transfer_events" USING btree ("transfer_id");--> statement-breakpoint
CREATE INDEX "transfer_items_transfer_id_idx" ON "transfer_items" USING btree ("transfer_id");--> statement-breakpoint
CREATE INDEX "transfer_items_product_id_idx" ON "transfer_items" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "transfers_source_dest_status_idx" ON "transfers" USING btree ("source_branch_id","destination_branch_id","status");--> statement-breakpoint
CREATE INDEX "transfers_status_created_at_idx" ON "transfers" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "transfers_dest_branch_idx" ON "transfers" USING btree ("destination_branch_id");