---
title: "ADR-0004: DB-enums UPPER_SNAKE; elke conversie uitsluitend via lib/enums.ts"
status: active
language: nl
last_updated: 2026-06-11
---

# ADR-0004: DB-enums UPPER_SNAKE; elke conversie uitsluitend via lib/enums.ts

## Status

accepted — overgenomen van Scrum4Me ADR-0004 (besluit 2026-05-16), aangepast voor DigiPlein op 2026-06-11.

## Context

Prisma genereert TypeScript-types letterlijk uit de PostgreSQL-enumwaarden. DigiPlein gebruikt `UPPER_SNAKE_CASE` in de database (mvp-spec §6: `KLIK_EN_TIK`, `AANGEMELD`, `CHAT_AGENT`, …) — de PostgreSQL-conventie. Aan de randen is conversie nodig: Nederlandse weergavelabels in de UI ("Aangemeld", "Les op maat"), en eventuele lowercase-waarden op API-randen (chat-window-endpoints uit mvp-spec §10, magic-link-routes in M3). Verspreide ad-hoc `.toLowerCase()`-aanroepen of inline labelmappen introduceren stille bugs zodra een enumwaarde wijzigt. In Scrum4Me is dit opgelost met één conversiegrens (`lib/task-status.ts`).

## Besluit

- De database houdt `UPPER_SNAKE_CASE`-enumwaarden; het Prisma-schema is de bron van waarheid.
- Álle conversie — Nederlandse UI-labels én eventuele lowercase API-waarden — gebeurt uitsluitend in `lib/enums.ts`, via benoemde mapper-functies met exhaustive switches.
- Nergens anders `.toLowerCase()`, `.toUpperCase()` of inline string-mapping op enumwaarden; UI-componenten importeren labels alleen uit `lib/enums.ts`.

## Consequenties

### Positief

- Eén bestand om te auditen wanneer enumwaarden wijzigen (en het chat-window mag enums alleen via migratie + deze module aanpassen).
- TypeScript vangt ontbrekende branches in de exhaustive checks.
- B1-labels staan op één plek — taalrevisie raakt één bestand.

### Negatief

- Iedereen (ook de chat-window-agent) moet de mappers gebruiken; overtredingen compileren maar breken de weergave. Mitigatie: lint-regel die directe case-coercion op bekende enum-types markeert (zoals in Scrum4Me voorgenomen).
