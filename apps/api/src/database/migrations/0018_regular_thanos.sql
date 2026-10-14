ALTER TYPE "public"."movement_type" ADD VALUE 'TRANSFER_DAMAGED';--> statement-breakpoint
ALTER TABLE "transfer_items" ADD COLUMN "damaged_quantity" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "transfer_items" ADD COLUMN "missing_quantity" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "transfer_items" ADD COLUMN "discrepancy_reason" varchar(255);--> statement-breakpoint
ALTER TABLE "transfers" ADD COLUMN "received_by_id" uuid;--> statement-breakpoint
ALTER TABLE "transfers" ADD COLUMN "received_at" timestamp;--> statement-breakpoint
ALTER TABLE "transfers" ADD COLUMN "receiving_notes" varchar(255);--> statement-breakpoint
ALTER TABLE "transfers" ADD COLUMN "has_discrepancy" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "transfers" ADD COLUMN "discrepancy_resolved_by_id" uuid;--> statement-breakpoint
ALTER TABLE "transfers" ADD COLUMN "discrepancy_resolved_at" timestamp;--> statement-breakpoint
ALTER TABLE "transfers" ADD COLUMN "discrepancy_resolution_notes" varchar(255);--> statement-breakpoint
ALTER TABLE "transfers" ADD COLUMN "closed_by_id" uuid;--> statement-breakpoint
ALTER TABLE "transfers" ADD COLUMN "closed_at" timestamp;--> statement-breakpoint
ALTER TABLE "transfers" ADD COLUMN "closing_notes" varchar(255);--> statement-breakpoint
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_received_by_id_users_id_fk" FOREIGN KEY ("received_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_discrepancy_resolved_by_id_users_id_fk" FOREIGN KEY ("discrepancy_resolved_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_closed_by_id_users_id_fk" FOREIGN KEY ("closed_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;