# Herreview — Gebruikersbeheer Beheerlaag Specificatie

Datum: 2026-06-15
Reviewer: Claude via `s4m-queue`
Queue-id: `142a43ab-8d07-42ee-8af3-653d4edc1c7e`
Review van: `docs/superpowers/specs/2026-06-15-gebruikersbeheer-beheerlaag-design.md`

## Conclusie

**GO.**

Claude heeft bevestigd dat de vijf eerdere blokkers zijn opgelost:

- `proxy.ts`-bypass voor `/uitnodiging/`.
- Read-only uitnodigingspagina met accept-mutatie via server action.
- Atomische token-consume met guarded `updateMany`.
- Loop-vrije `requireStaff({ allowPasswordChange })`-afdwinging.
- Gedeelde e-mailnormalisatie via `normalizeStaffEmail`.

Ook de P2-punten uit de eerste review zijn verwerkt: audit-builder, retentie/cleanup, sessiefixatie, mailfout-flow, named relations, recursieve nav-children en de mailprovider/FG-hardstop.

## P3 Meenemen In Implementatie

1. Voeg `requireStaff()` toe aan `/stijlgids`, zodat `mustChangePassword` ook daar afdwingt.
2. Houd de active-staff-check in de accept-flow binnen dezelfde transactie; gebruik zo nodig een aparte query in plaats van Prisma relation filters in `updateMany`.
3. Maak `isActive` child-bewust voor parent-items zonder `href`, zoals `Beheer`.
4. Verwijder het wachtwoordveld uit create-schema, formulier en tests; maak `href` optioneel in nav-rendering en key parent-items op `label`.
5. Routeer `prisma/seed.ts` e-mail door dezelfde normalisatie-helper.

## Vervolg

De specificatie is vrijgegeven voor het implementatieplan. Deze P3-punten worden als plan-acceptatiecriteria meegenomen.
