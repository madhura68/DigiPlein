---
title: "Claude review — QR-pairing login"
status: processed
date: 2026-06-13
queue_message_id: 214241aa-8f91-4b40-a26b-f4d01e0b1d23
reply_message_id: e3ba8031-f712-4124-b7d2-6103ae174262
reviewer: mac:claude
requester: mac:codex
---

# Claude review — QR-pairing login

## Scope

Review van het goedgekeurde DigiPlein ontwerp/plan voor QR-pairing login als
extra loginpad naast e-mail+wachtwoord.

Te reviewen bestand:

- `docs/superpowers/specs/2026-06-13-digiplein-qr-pairing-login-design.md`

Context:

- Branch: `codex/qr-pairing-login`
- Commit: `fe05d7e docs(auth): ontwerp qr-pairing login`
- Scrum4Me story: `ST-023`
- Taken: `T-37` t/m `T-41`

## Review Request

De reviewrequest is via `s4m-queue` verstuurd naar `mac:claude`.

Queue message:

- `214241aa-8f91-4b40-a26b-f4d01e0b1d23`

Gevraagde focus:

- Security van de overgenomen Scrum4Me QR-pairing flow.
- AVG/dataminimalisatie en DigiPlein hardstops.
- Technische haalbaarheid binnen Next.js 16, iron-session en Prisma/Postgres.
- Compleetheid van taken en test/verificatieplan.
- Inconsistenties tussen spec, huidige code en productdocs.

## Resultaat

Claude heeft de review beantwoord met: **GO to implementation, conditioneel**.
Er zijn geen P0-blokkers. De AVG-hardstops zijn akkoord: geen client-login,
geen clientdata en geen verboden velden.

## Bevindingen

### P1

- `requireStaff()` mag een verlopen paired-session niet zelf vernietigen,
  omdat pages Server Components zijn en daar geen cookies gemuteerd mogen
  worden. Keuze: `requireStaff()` redirect bij paired-expiry naar een route
  handler die de session-cookie wist en daarna naar `/login` redirect.

### P2

- `staff_id` moet expliciet `@db.Uuid` zijn, passend bij `StaffMember.id`.
- SSE moet de Scrum4Me-racefix overnemen: `LISTEN` actief maken vóór de
  definitieve status-read, daarna status opnieuw lezen, hard-close toevoegen
  en de dedicated `pg`-client bij abort/terminal state sluiten.
- Client-IP voor `desktop_ip` en rate-limit moet uit trusted proxy-context
  komen en niet uit spoofbare forwarded headers.
- De mobiele bevestiging is een security-control tegen pairing-phishing; UA/IP
  moeten prominent zijn en de tekst moet zeggen dat je alleen bevestigt als je
  deze login net zelf startte.
- `login_pairings` bevat medewerker-IP/user-agent en krijgt daarom korte
  retentie/cleanup.
- Paired-session TTL moet expliciet zijn. Keuze: 8 uur, gelijk aan Scrum4Me.

### P3

- `PairingStatus` als Prisma-enum is opgenomen als type-safety verbetering.
- Niet-ingelogd mobiel verliest het URL-fragment; voor MVP is opnieuw scannen
  acceptabel.
- SSE-response headers moeten streaming/proxy-vriendelijk zijn.

## Verwerking

Verwerkt in:

- `docs/superpowers/specs/2026-06-13-digiplein-qr-pairing-login-design.md`
- Scrum4Me ProductDoc `plans/2026-06-13-digiplein-qr-pairing-login-design`,
  revisie `cmqc8hw8z000wn3175lps6rbn`
- Scrum4Me taakplannen `T-37` t/m `T-41`

Besluiten:

- Paired-expiry loopt via route-handler logout, niet via cookie-mutatie in
  `requireStaff()`.
- Paired desktop-sessie TTL is 8 uur.
- Cleanup-retentie voor afgehandelde/verlopen pairingrijen is maximaal 24 uur.
- T-37 t/m T-40 kunnen starten; T-41 gebruikt de route-handler logout-aanpak.
