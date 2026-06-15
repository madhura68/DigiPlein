-- Vastleggen dat DigiPlein de copilot-registratie van een medewerker heeft doorgezet.
ALTER TABLE "staff_members" ADD COLUMN "copilot_registered_at" TIMESTAMPTZ;
