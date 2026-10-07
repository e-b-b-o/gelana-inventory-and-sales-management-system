CREATE TABLE "branch_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"branch_id" uuid NOT NULL,
	"assigned_by" uuid NOT NULL,
	"start_date" timestamp with time zone DEFAULT now() NOT NULL,
	"end_date" timestamp with time zone,
	"reason" varchar(500),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "branch_assignments" ADD CONSTRAINT "branch_assignments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "branch_assignments" ADD CONSTRAINT "branch_assignments_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "branch_assignments" ADD CONSTRAINT "branch_assignments_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "active_branch_assignment_idx" ON "branch_assignments" USING btree ("user_id") WHERE "branch_assignments"."end_date" is null;--> statement-breakpoint
INSERT INTO "branch_assignments" ("user_id", "branch_id", "assigned_by", "start_date")
SELECT 
	u.id as user_id, 
	u.branch_id as branch_id, 
	COALESCE((SELECT id FROM "users" WHERE role = 'OWNER' LIMIT 1), u.id) as assigned_by, 
	u.created_at as start_date
FROM "users" u
WHERE u.branch_id IS NOT NULL;