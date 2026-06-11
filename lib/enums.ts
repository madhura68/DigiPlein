import type {
  StaffRole,
  CourseAssessment,
  ClientStatus,
  TrackStatus,
  LessonStatus,
  RosterStatus,
  ActorType,
} from '@prisma/client'

// ADR-0004 — de ENIGE conversiegrens tussen DB-enums (UPPER_SNAKE) en de
// Nederlandse weergavelabels. `Record<EnumType, string>` dwingt af dat elke
// (en alleen elke) enumwaarde een label heeft: een ontbrekende of overbodige
// sleutel is een compile-fout. Nergens anders inline mapping of case-coercion.

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  ADMIN: 'Beheerder',
  STAFF: 'Medewerker',
}

export const COURSE_ASSESSMENT_LABELS: Record<CourseAssessment, string> = {
  KLIK_EN_TIK: 'Klik & Tik',
  LES_OP_MAAT: 'Les op maat',
  NOG_BEPALEN: 'Nog bepalen',
}

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  AANGEMELD: 'Aangemeld',
  INTAKE: 'Intake',
  ACTIEF: 'Actief',
  AFGEROND: 'Afgerond',
  GESTOPT: 'Gestopt',
}

export const TRACK_STATUS_LABELS: Record<TrackStatus, string> = {
  ACTIEF: 'Actief',
  AFGEROND: 'Afgerond',
  GESTOPT: 'Gestopt',
}

export const LESSON_STATUS_LABELS: Record<LessonStatus, string> = {
  GEPLAND: 'Gepland',
  VERVALLEN: 'Vervallen',
}

export const ROSTER_STATUS_LABELS: Record<RosterStatus, string> = {
  INGEPLAND: 'Ingepland',
  AFGEMELD: 'Afgemeld',
  AANWEZIG: 'Aanwezig',
  NO_SHOW: 'Niet verschenen',
}

export const ACTOR_TYPE_LABELS: Record<ActorType, string> = {
  STAFF: 'Medewerker',
  CHAT_AGENT: 'Chat-assistent',
  SYSTEM: 'Systeem',
}
