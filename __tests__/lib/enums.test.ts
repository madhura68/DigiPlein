import { describe, it, expect } from 'vitest'
import {
  StaffRole,
  CourseAssessment,
  ClientStatus,
  TrackStatus,
  LessonStatus,
  RosterStatus,
  ActorType,
} from '@prisma/client'
import {
  STAFF_ROLE_LABELS,
  COURSE_ASSESSMENT_LABELS,
  CLIENT_STATUS_LABELS,
  TRACK_STATUS_LABELS,
  LESSON_STATUS_LABELS,
  ROSTER_STATUS_LABELS,
  ACTOR_TYPE_LABELS,
} from '@/lib/enums'

const checks = [
  { name: 'StaffRole', values: Object.values(StaffRole as Record<string, string>), labels: STAFF_ROLE_LABELS as Record<string, string> },
  { name: 'CourseAssessment', values: Object.values(CourseAssessment as Record<string, string>), labels: COURSE_ASSESSMENT_LABELS as Record<string, string> },
  { name: 'ClientStatus', values: Object.values(ClientStatus as Record<string, string>), labels: CLIENT_STATUS_LABELS as Record<string, string> },
  { name: 'TrackStatus', values: Object.values(TrackStatus as Record<string, string>), labels: TRACK_STATUS_LABELS as Record<string, string> },
  { name: 'LessonStatus', values: Object.values(LessonStatus as Record<string, string>), labels: LESSON_STATUS_LABELS as Record<string, string> },
  { name: 'RosterStatus', values: Object.values(RosterStatus as Record<string, string>), labels: ROSTER_STATUS_LABELS as Record<string, string> },
  { name: 'ActorType', values: Object.values(ActorType as Record<string, string>), labels: ACTOR_TYPE_LABELS as Record<string, string> },
]

describe('lib/enums (ADR-0004)', () => {
  for (const { name, values, labels } of checks) {
    it(`elke ${name}-waarde heeft een niet-lege NL-label`, () => {
      expect(values.length).toBeGreaterThan(0)
      for (const value of values) {
        expect(labels[value], `label voor ${name}.${value}`).toBeTruthy()
      }
    })
  }
})
