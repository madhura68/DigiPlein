CREATE TABLE "staff_invites" (
  "id" TEXT NOT NULL,
  "token_hash" TEXT NOT NULL,
  "staff_id" UUID NOT NULL,
  "created_by_id" UUID NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expires_at" TIMESTAMPTZ NOT NULL,
  "used_at" TIMESTAMPTZ,
  "revoked_at" TIMESTAMPTZ,

  CONSTRAINT "staff_invites_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "staff_invites_token_hash_key" UNIQUE ("token_hash"),
  CONSTRAINT "staff_invites_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff_members"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "staff_invites_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "staff_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "staff_invites_staff_id_expires_at_idx" ON "staff_invites"("staff_id", "expires_at");
CREATE INDEX "staff_invites_expires_at_idx" ON "staff_invites"("expires_at");
