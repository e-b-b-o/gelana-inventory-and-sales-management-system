CREATE SEQUENCE "public"."daily_closing_number_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE TABLE "daily_closing_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"closing_id" uuid NOT NULL,
	"event_type" varchar(50) NOT NULL,
	"actor_id" uuid NOT NULL,
	"actor_role" varchar(50) NOT NULL,
	"expected_cash" numeric(12, 2) NOT NULL,
	"actual_cash" numeric(12, 2),
	"cash_difference" numeric(12, 2),
	"notes" varchar(500),
	"revision" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_closing_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"closing_id" uuid NOT NULL,
	"payment_method_id" uuid NOT NULL,
	"payment_method_name" varchar(100) NOT NULL,
	"received_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"refunded_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"net_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"transaction_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_closings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"closing_number" varchar(50) NOT NULL,
	"branch_id" uuid NOT NULL,
	"closing_date" varchar(10) NOT NULL,
	"status" varchar(50) DEFAULT 'NOT_SUBMITTED' NOT NULL,
	"total_sales_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"total_returns_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"net_sales_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"sales_count" integer DEFAULT 0 NOT NULL,
	"expected_cash" numeric(12, 2) DEFAULT '0' NOT NULL,
	"actual_cash" numeric(12, 2),
	"cash_difference" numeric(12, 2),
	"discrepancy_reason" varchar(500),
	"submitted_by_id" uuid,
	"submitted_at" timestamp with time zone,
	"reviewed_by_id" uuid,
	"reviewed_at" timestamp with time zone,
	"review_notes" varchar(500),
	"rejection_reason" varchar(500),
	"revision" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "daily_closings_closing_number_unique" UNIQUE("closing_number")
);
--> statement-breakpoint
ALTER TABLE "daily_closing_events" ADD CONSTRAINT "daily_closing_events_closing_id_daily_closings_id_fk" FOREIGN KEY ("closing_id") REFERENCES "public"."daily_closings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_closing_events" ADD CONSTRAINT "daily_closing_events_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_closing_payments" ADD CONSTRAINT "daily_closing_payments_closing_id_daily_closings_id_fk" FOREIGN KEY ("closing_id") REFERENCES "public"."daily_closings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_closing_payments" ADD CONSTRAINT "daily_closing_payments_payment_method_id_payment_methods_id_fk" FOREIGN KEY ("payment_method_id") REFERENCES "public"."payment_methods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_closings" ADD CONSTRAINT "daily_closings_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_closings" ADD CONSTRAINT "daily_closings_submitted_by_id_users_id_fk" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_closings" ADD CONSTRAINT "daily_closings_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "daily_closings_branch_date_idx" ON "daily_closings" USING btree ("branch_id","closing_date");