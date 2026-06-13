-- CreateEnum
CREATE TYPE "PairingStatus" AS ENUM ('pending', 'approved', 'consumed', 'cancelled');

-- CreateTable
CREATE TABLE "login_pairings" (
    "id" TEXT NOT NULL,
    "secret_hash" TEXT NOT NULL,
    "desktop_token_hash" TEXT NOT NULL,
    "status" "PairingStatus" NOT NULL DEFAULT 'pending',
    "staff_id" UUID,
    "desktop_ua" VARCHAR(255),
    "desktop_ip" VARCHAR(45),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "approved_at" TIMESTAMPTZ,
    "consumed_at" TIMESTAMPTZ,

    CONSTRAINT "login_pairings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "login_pairings_expires_at_idx" ON "login_pairings"("expires_at");

-- CreateIndex
CREATE INDEX "login_pairings_status_expires_at_idx" ON "login_pairings"("status", "expires_at");

-- AddForeignKey
ALTER TABLE "login_pairings" ADD CONSTRAINT "login_pairings_staff_id_fkey"
  FOREIGN KEY ("staff_id") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Postgres LISTEN/NOTIFY for the QR-pairing flow.
CREATE OR REPLACE FUNCTION notify_pairing_change() RETURNS trigger AS $$
DECLARE
  payload jsonb;
BEGIN
  payload := jsonb_build_object(
    'op', CASE TG_OP
            WHEN 'INSERT' THEN 'I'
            WHEN 'UPDATE' THEN 'U'
          END,
    'pairing_id', NEW.id,
    'status', NEW.status
  );

  PERFORM pg_notify('digiplein_pairing', payload::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS login_pairings_notify ON login_pairings;
CREATE TRIGGER login_pairings_notify
  AFTER INSERT OR UPDATE ON login_pairings
  FOR EACH ROW EXECUTE FUNCTION notify_pairing_change();
