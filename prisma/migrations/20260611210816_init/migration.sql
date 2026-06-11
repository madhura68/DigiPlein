-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('ADMIN', 'STAFF');

-- CreateEnum
CREATE TYPE "CourseAssessment" AS ENUM ('KLIK_EN_TIK', 'LES_OP_MAAT', 'NOG_BEPALEN');

-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('AANGEMELD', 'INTAKE', 'ACTIEF', 'AFGEROND', 'GESTOPT');

-- CreateEnum
CREATE TYPE "TrackStatus" AS ENUM ('ACTIEF', 'AFGEROND', 'GESTOPT');

-- CreateEnum
CREATE TYPE "LessonStatus" AS ENUM ('GEPLAND', 'VERVALLEN');

-- CreateEnum
CREATE TYPE "RosterStatus" AS ENUM ('INGEPLAND', 'AFGEMELD', 'AANWEZIG', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "ActorType" AS ENUM ('STAFF', 'CHAT_AGENT', 'SYSTEM');

-- CreateTable
CREATE TABLE "staff_members" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "StaffRole" NOT NULL DEFAULT 'STAFF',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "staff_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "volunteers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "prefers_tuesday" BOOLEAN NOT NULL DEFAULT false,
    "prefers_thursday" BOOLEAN NOT NULL DEFAULT false,
    "frequency_note" TEXT,
    "nda_signed_at" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "volunteers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "first_name" TEXT NOT NULL,
    "last_name" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "learning_wish" TEXT,
    "assessment" "CourseAssessment" NOT NULL DEFAULT 'NOG_BEPALEN',
    "status" "ClientStatus" NOT NULL DEFAULT 'AANGEMELD',
    "oefenen_username" TEXT,
    "consent_extras_at" TIMESTAMPTZ,
    "consent_extras_note" TEXT,
    "last_attended_on" DATE,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "max_sessions" INTEGER,
    "session_minutes" INTEGER NOT NULL DEFAULT 120,
    "on_tuesday" BOOLEAN NOT NULL DEFAULT true,
    "on_thursday" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_tracks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "client_id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "goal" TEXT,
    "status" "TrackStatus" NOT NULL DEFAULT 'ACTIEF',
    "started_on" DATE NOT NULL,
    "ended_on" DATE,
    "next_step" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "learning_tracks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_dates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "date" DATE NOT NULL,
    "starts_at" TIME NOT NULL DEFAULT '10:00:00'::time,
    "ends_at" TIME NOT NULL DEFAULT '12:00:00'::time,
    "status" "LessonStatus" NOT NULL DEFAULT 'GEPLAND',
    "note" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "lesson_dates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roster_entries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "lesson_date_id" UUID NOT NULL,
    "volunteer_id" UUID NOT NULL,
    "status" "RosterStatus" NOT NULL DEFAULT 'INGEPLAND',
    "note" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "roster_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "absences" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "volunteer_id" UUID NOT NULL,
    "starts_on" DATE NOT NULL,
    "ends_on" DATE NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "absences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendances" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "lesson_date_id" UUID NOT NULL,
    "learning_track_id" UUID NOT NULL,
    "attended" BOOLEAN NOT NULL DEFAULT true,
    "note" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "actor_type" "ActorType" NOT NULL,
    "actor_id" UUID,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" UUID,
    "summary" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "staff_members_email_key" ON "staff_members"("email");

-- CreateIndex
CREATE UNIQUE INDEX "volunteers_email_key" ON "volunteers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "courses_code_key" ON "courses"("code");

-- CreateIndex
CREATE UNIQUE INDEX "lesson_dates_date_key" ON "lesson_dates"("date");

-- CreateIndex
CREATE UNIQUE INDEX "roster_entries_lesson_date_id_volunteer_id_key" ON "roster_entries"("lesson_date_id", "volunteer_id");

-- CreateIndex
CREATE UNIQUE INDEX "attendances_lesson_date_id_learning_track_id_key" ON "attendances"("lesson_date_id", "learning_track_id");

-- AddForeignKey
ALTER TABLE "learning_tracks" ADD CONSTRAINT "learning_tracks_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_tracks" ADD CONSTRAINT "learning_tracks_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roster_entries" ADD CONSTRAINT "roster_entries_lesson_date_id_fkey" FOREIGN KEY ("lesson_date_id") REFERENCES "lesson_dates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roster_entries" ADD CONSTRAINT "roster_entries_volunteer_id_fkey" FOREIGN KEY ("volunteer_id") REFERENCES "volunteers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absences" ADD CONSTRAINT "absences_volunteer_id_fkey" FOREIGN KEY ("volunteer_id") REFERENCES "volunteers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_lesson_date_id_fkey" FOREIGN KEY ("lesson_date_id") REFERENCES "lesson_dates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_learning_track_id_fkey" FOREIGN KEY ("learning_track_id") REFERENCES "learning_tracks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- --- Raw SQL (niet declaratief in Prisma uit te drukken) ---------------------

-- CHECK: cursus-sessiemaximum positief (mvp-spec §6); NULL = onbeperkt blijft toegestaan.
ALTER TABLE "courses" ADD CONSTRAINT "courses_max_sessions_positive"
  CHECK ("max_sessions" IS NULL OR "max_sessions" > 0);

-- CHECK: afwezigheids-datumbereik geldig (ends_on >= starts_on).
ALTER TABLE "absences" ADD CONSTRAINT "absences_dates_order"
  CHECK ("ends_on" >= "starts_on");

-- App-regel als partial unique index: max. één ACTIEF traject per (client, course).
CREATE UNIQUE INDEX "learning_tracks_one_active_per_client_course"
  ON "learning_tracks" ("client_id", "course_id")
  WHERE "status" = 'ACTIEF'::"TrackStatus";
