---
title: M0–M2 MVP-implementatieplan DigiPlein
status: approved
author: Claude (Fable 5), in opdracht van JP
version: "0.5"
date: 2026-06-11
approved_by: JP (2026-06-11, na 2 externe reviewrondes + ADR-toets)
basis: docs/mvp-spec.md §11 (backlog M0–M2), product-spec.md §6 (randvoorwaarden) en §10 (open vragen)
scope: M0 Fundament · M1 Vier kerntabellen · M2 Chat-window — M3+ bewust níét uitgewerkt
---

# M0–M2 MVP-implementatieplan — DigiPlein

> **Doel:** de MVP uit [docs/mvp-spec.md](../mvp-spec.md) bouwbaar maken in losse, per sessie afrondbare taken: datafundament + beheer van de vier kerntabellen + chat-window-integratie, AVG-by-design, in de huisstijl van Bibliotheek Rotterdam.
>
> **Uitvoering:** na goedkeuring wordt dit plan omgezet in Scrum4Me (sprint per milestone, PBI per milestone, story per ST-taak, taken per story — zie §"Sprint-structuur" onderaan). Werkwijze: **één branch per milestone** (ADR-0003: `feat/m0-fundament`, `feat/m1-kerntabellen`, `feat/m2-chat-window`); per story de taken in volgorde → `npm run verify && npm run build` → commit per laag → status bijwerken via MCP. Push + één PR per milestone (Forgejo), nooit automatisch — pas na de gebruikerstest van het milestone en expliciete bevestiging van JP.

---

## 0. Aannames (uit product-spec §10 — expliciet, gelden tot tegenbericht)

De open vragen uit de productspec zijn voor dit plan als volgt vastgezet:

| # | Aanname | Gevolg voor M0–M2 |
|---|---|---|
| A1 | **Sessiemaximum Les op maat = 4**, maar **configureerbaar per cursus** (`courses.max_sessions`, leeg = onbeperkt). De "1 tot 6"-discrepantie van de site wordt een instelling, geen code. | Seed in ST-003 zet `LES_OP_MAAT.max_sessions = 4`; aanpasbaar via ST-104 zonder code. |
| A2 | **Hostingkeuze is nog open** (Vercel EU + Neon vs. eigen Ubuntu-server). De bouw is hosting-agnostisch: lokale Postgres voor dev, geen platform-specifieke features. CI = `npm run verify && npm run build` via Forgejo Actions — de runner op git.jp-visser.nl is beschikbaar (bevestigd in review), dus `verify.yml` is vanaf ST-001 direct actief; npm-verify heeft geen docker-socket nodig. | **Besliskaart uiterlijk tijdens S-M1** (Vercel+Neon vs. eigen server): de demo aan het eind van M2 vereist deploy + demo-omgeving + dagelijkse versleutelde backup (mvp-spec §9) — geen onverwachte infra-klus laten worden. |
| A3 | **Chat-window-contract = mvp-spec §10.** Het externe component is **opgeleverd** (bevestigd door JP, 2026-06-11; de product-DoD wijst op Scrum4Me-functionaliteit: chat, docs, ideas, jobs). Integratie is **bewust uitgesteld naar de slotstap** (M2, ná M0/M1); de feature-flag blijft tot dan uit. M2 bouwt de app-kant van het contract (sessie-doorgifte, guardrail-config, bevestigings- en audit-pad) plus de stub-/uit-modus; deploy-details (URL/agent-account, §10.7) volgen bij ST-201. | ST-201 t/m ST-203 blijven afrondbaar los van het component; de demo "medewerker kan chatten" volgt bij de integratie als slotstap van M2. NB: de "scrum-rechten"-rollen uit de product-DoD zitten nog niet in het MVP-rollenmodel (mvp-spec §3: ADMIN/STAFF) — uitwerken bij de integratie. |
| A4 | UVV-rol onbevestigd → `volunteers` bevat **alleen rooster-relevante velden** (mvp-spec §6); geen HR-gegevens. | Veldenscope ST-102 ligt vast. |
| A5 | Alleen de **Centrale Bibliotheek** (Librijesteeg 4) in v1; geen locatiemodel in de UI. | Geen `location`-tabel in M0–M2; het lesmoment-model (M3) houdt de uitbreiding open. |
| A6 | Rooster toont lesmoment **10:00–12:00** (marge 9:30–12:30 onbevestigd, niet getoond). | Alleen relevant voor defaults in `lesson_dates` (ST-003). |
| A7 | Schaal: 5–20 vrijwilligers, **min 2 / max 4** per lesmoment (configureerbaar; pas gebruikt in M3). | Geen schaalmaatregelen; bezettings-config buiten M0–M2. |
| A8 | **"DigiPlein" is werknaam**; neutraal presenteren ("cursusplanning"), nooit "register". App-naam als constante op één plek zodat hernoemen één regel is. | ST-002 (layout/titel) en B1-teksten. |
| A9 | Governance-route (FG/verwerkersovereenkomst) loopt parallel; **livegang met echte data is geen onderdeel van M0–M2** (dat is ST-505, M5). | Hardstop "dummydata" hieronder. |
| A10 | Oefenen.nl-export onbekend → speelt pas in M4+ (geen afhankelijkheid in dit plan). | — |

### Hardstops (gelden voor élke taak hieronder)

1. **AVG-veldenmodel is bindend** (mvp-spec §6, product-spec §6.1): geen velden voor BSN, geboortedatum, adres, pasnummer, gezondheid/afkomst/religie, niveau-labels — ook niet "tijdelijk" of via vrije kolommen. Notitievelden tonen de vaste instructie *"Alleen feitelijk en cursusgericht. Geen gezondheid of privéomstandigheden. Schrijf alsof de cliënt meeleest."*
2. **Uitsluitend dummydata tot FG-akkoord** — in álle omgevingen; seed en fixtures bevatten alleen verzonnen personen.
3. **Huisstijl-tokens** komen uit [docs/research/branding-bibliotheek-rotterdam.md](../research/branding-bibliotheek-rotterdam.md) en staan centraal in `app/styles/theme.css`; geen losse hexcodes in componenten — componenten gebruiken uitsluitend MD3-rolparen (achtergrondrol + bijbehorende `on-*`-tekstkleur); geen logo van Bibliotheek Rotterdam zonder schriftelijke toestemming.
4. **Oranje `#ee7203` nooit als tekstkleur op wit** (2,98:1) — voor oranje tekst bestaat het token "primary-text" `#b35400` (5,0:1); wit op oranje alleen groot/bold.
5. Alles achter login; foutcodes 400 (parse) / 422 (Zod) / 401–403 (auth/rol); rollen server-side afgedwongen.
6. **ADR-0001 t/m ADR-0005** ([docs/adr/](../adr/), overgenomen van Scrum4Me) zijn bindend: `@base-ui/react` met `render`-prop (geen `@radix-ui/*`/`asChild`), Float `sort_order` voor elke toekomstige herordenbare lijst, één branch per milestone met push-na-akkoord, enum-conversie uitsluitend via `lib/enums.ts`, iron-session + bcryptjs.

---

## 1. Bestandsstructuur (doelbeeld na M2)

```
DigiPlein/
├── app/
│   ├── layout.tsx                  # root-layout: Poppins, nav, ChatWindow-slot (M2)
│   ├── page.tsx                    # ST-107 startscherm (tegels)
│   ├── styles/theme.css            # ST-002 huisstijl-tokens (enige plek met hexcodes)
│   ├── stijlgids/page.tsx          # ST-002 voorbeeldpagina componenten
│   ├── login/page.tsx + actions.ts # ST-004
│   ├── medewerkers/page.tsx + actions.ts            # ST-101 (ADMIN)
│   ├── vrijwilligers/page.tsx, [id]/page.tsx, actions.ts   # ST-102
│   ├── clienten/page.tsx, [id]/page.tsx, [id]/export/page.tsx, actions.ts  # ST-103/105
│   ├── cursusaanbod/page.tsx, [id]/page.tsx, actions.ts    # ST-104
│   ├── audit/page.tsx              # ST-106 (ADMIN)
│   └── api/chat/session/route.ts   # ST-201 identiteits-endpoint chat-contract
├── components/
│   ├── ui/…                        # shadcn/ui-componenten, aangepast op tokens (ST-002)
│   ├── avg-notice.tsx              # vaste notitie-instructie (ST-102/103)
│   ├── confirm-delete-dialog.tsx   # naam-overtypen-bevestiging (ST-105)
│   └── chat/chat-window.tsx        # ST-201 embed + feature-flag/stub
├── lib/
│   ├── env.ts                      # Zod-gevalideerde env (ST-003)
│   ├── db.ts                       # Prisma-singleton (ST-003)
│   ├── enums.ts                    # NL-labels + enum-mappers — enige conversiegrens (ADR-0004)
│   ├── session.ts                  # iron-session helpers (ST-004)
│   ├── auth.ts                     # requireStaff()/requireAdmin() (ST-004)
│   ├── audit.ts                    # writeAuditLog() + summary-conventie (ST-103/106)
│   ├── app-name.ts                 # werknaam-constante (A8)
│   ├── avg.ts                      # notitie-instructie + VERBODEN_VELDEN — AVG-bron (form-level ST-102/103 + bron voor de geseede Copilot-policy, ST-202)
│   └── chat/guardrails.ts          # ORPHANED — vervangen door de Copilot content-policy-gate (ST-202 herzien); opruiming = aparte taak
├── prisma/schema.prisma, migrations/, seed.ts        # ST-003
├── scripts/verify-constraints.ts   # herhaalbaar constraint-/cascade-bewijs (ST-003/105)
├── __tests__/                      # Vitest (spiegel van lib/ en app/)
├── proxy.ts                        # route-bescherming (ST-004; géén middleware.ts)
├── vitest.config.ts, eslint-config, tsconfig.json    # ST-001
└── .forgejo/workflows/verify.yml   # CI-voorbereiding (A2)
```

Conventies: Engelse tabel-/kolom-/codenamen, Nederlandse UI-labels (B1, je-vorm); enums DB `UPPER_SNAKE`; server actions per route co-located in `actions.ts` met Zod; geen publieke data-routes.

---

## 2. M0 — Fundament

### ST-001 Scaffold

- **Aanpak.** Next.js 16 (App Router) + React 19 + TypeScript strict opzetten met `create-next-app`, Tailwind CSS v4 en shadcn/ui (`shadcn init`, base-componenten button/input/card/dialog/table). De shadcn-output wordt direct omgebouwd naar `@base-ui/react` met het `render`-prop-patroon (ADR-0001) — geen `@radix-ui/*`-dependency in `package.json`. Vitest + Testing Library + jsdom configureren; `server-only` mocken via alias (zelfde aanpak als Scrum4Me). Scripts: `dev`, `build`, `test` (`vitest run`), `lint`, `typecheck` (`tsc --noEmit`) en `verify` = lint + typecheck + test. `.env.example` met `DATABASE_URL`, `SESSION_SECRET`, `APP_BASE_URL`. Forgejo Actions-workflow `verify.yml` is direct actief — de runner op git.jp-visser.nl draait (A2); npm-verify heeft geen docker-socket nodig, eerste CI-run is groen bij de eerste push.
- **Bestanden.** `package.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `vitest.config.ts`, `components.json`, `app/layout.tsx`, `app/page.tsx` (placeholder), `.env.example`, `.forgejo/workflows/verify.yml`, `__tests__/smoke.test.tsx`.
- **Testaanpak.** Eén smoke-test (render van de placeholder-page) om de hele keten vitest+jsdom+TSX te bewijzen; lint-/testregel die elke `@radix-ui/*`-import en elk `asChild`-gebruik laat falen (ADR-0001); daarna `npm run verify && npm run build`.
- **Afhankelijkheden.** Geen (startpunt).
- **Klaar wanneer.** `npm run dev` en `npm run verify` draaien schoon (mvp-spec); build groen; smoke-test slaagt.

### ST-002 Huisstijl-thema

- **Aanpak.** `app/styles/theme.css` gestructureerd als **MD3-rolparen** exact conform de annex-tabel "Advies: vertaling naar onze app" (die sectie is de **normatieve checklist** voor thema én stijlgids): `primary #ee7203`/`on-primary` (lopende tekst op oranje = `#000` 7,0:1; wit alleen groot/bold), `primary-container #fac494`/`on-primary-container #000`, **`primary-text #b35400`** (de enige toegestane oranje tékstkleur op wit — hardstop 4), `secondary #38383a`/`on-secondary #fff`, `tertiary #65baa8`/`on-tertiary #000`, `surface #fff`/`on-surface #000` (+ `#565656` gedempt), `surface-variant #eeeff5`/`#f8f8f8`, `outline #979797`/`outline-variant #eeeff5`, `error #962737` met wit (8,0:1 — annex-kandidaat, hierbij gekozen), succes `#28a84f`/`#155927`, accenten (`#e2b41d`, `#79c4e3`, `#585f98`). Conventie: componenten gebruiken uitsluitend rolparen (achtergrond + bijbehorende `on-*`), nooit losse kleuren. **shadcn-mapping:** shadcn-`primary` wijst naar **zwart** (dat ís de huisstijl-primaire knop) zodat `text-primary` nooit oranje oplevert — oranje bestaat als aparte brand-/focus-tokens zonder tekst-utility; de scan-test (hieronder) test dan uitzonderingen i.p.v. de standaardtoestand. Poppins 400/500/700 via `next/font` met Arial-fallback (`size-adjust: 112.5%` tegen CLS); typografie-schaal uit de annex (h1 48→60 lh 1, h2 32→40, h3 28, h4 20; body 16→18px fluid; headings 700). Componentstijl conform annex-advies: pill-knoppen (radius 9999px), primaire knop zwart met hover-inversie (wit + zwarte rand), **secundaire knop** (wit, 2px zwarte rand, hover `#ededed`), inputs radius ~24px met oranje focus-rand, **tekstlink** (bold + zwarte onderrand, hover `#b35400`), **focus-/skip-link-stijl** (oranje pill), kaartvariant "plectrum" (basisradius 4–8px + één hoek 100px). Basislayout: header met app-naam (uit `lib/app-name.ts`, A8) + navigatie. Voorbeeldpagina `/stijlgids` toont per rolpaar een voorbeeldvlak mét tekst, plus alle bovenstaande componenten, statuskleuren en de notitie-instructie-stijl.
- **Bestanden.** `app/styles/theme.css`, `app/layout.tsx` (font + nav), `lib/app-name.ts`, `components/ui/button.tsx`, `components/ui/input.tsx`, `components/ui/card.tsx` (plectrum-variant), `app/stijlgids/page.tsx`.
- **Testaanpak.** Token-/hex-scan als unit-test over **alle** bestanden onder `app/` en `components/`, niet alleen `theme.css`: faalt op (a) hex-literals buiten `theme.css` (hardstop 3) en (b) oranje-als-tekst-patronen — `text-[#ee7203]`, `text-primary`, inline `color: #ee7203`/`var(--color-primary)` op tekstrollen (hardstop 4); allowlist per gemotiveerde uitzondering (groot/bold op donkere of oranje-container-achtergrond). Tokencontract expliciet: oranje tekst is uitsluitend `text-primary-text` (`#b35400`). Handmatige contrastcheck op de stijlgids met de berekende ratio's uit de annex (zwart/wit-combinaties ≥ 4,5:1). Lichte a11y-check op de stijlgids zelf (toetsenbord, focus, labels, klikdoelen) — het M1-patroon geldt ook voor de M0-UI.
- **Afhankelijkheden.** ST-001.
- **Klaar wanneer.** Stijlgids toont alle rolparen (vlak + tekst) en componenten in huisstijl; contrastcheck gehaald (mvp-spec); scan-test groen.

### ST-003 Database & schema

- **Aanpak.** Eén Prisma-schema met **alle tien** tabellen uit mvp-spec §6 — `staff_members`, `volunteers`, `clients`, `courses`, `learning_tracks`, `lesson_dates`, `roster_entries`, `absences`, `attendances`, `audit_logs` — inclusief de M3/M4-tabellen (bewuste keuze uit de spec: uitbreiden zonder verbouwing). Enums: `STAFF_ROLE`, `COURSE_ASSESSMENT`, `CLIENT_STATUS`, `TRACK_STATUS`, `LESSON_STATUS`, `ROSTER_STATUS`, `ACTOR_TYPE` (UPPER_SNAKE, via `@map` naar snake_case kolommen). Alle tabellen `id uuid pk default gen_random_uuid()` (`@default(dbgenerated("gen_random_uuid()"))`), `created_at`/`updated_at timestamptz`. Constraints uit de spec: uniques (`courses.code`, `lesson_dates.date`, `(lesson_date_id, volunteer_id)`, `(lesson_date_id, learning_track_id)`, e-mails), **cascade delete** `clients → learning_tracks → attendances` (fundament voor F-05), `courses → learning_tracks` Restrict; CHECK-constraints (`max_sessions > 0`, `ends_on ≥ starts_on`) als raw SQL in de migratie (Prisma kent geen CHECK), plus de app-regel "max. één `ACTIEF` traject per (client, course)" (mvp-spec §6) als **partial unique index** (`WHERE status = 'ACTIEF'`) in dezelfde migratie — M4-proof, consistent met "uitbreiden zonder verbouwing". `lib/env.ts` (Zod), `lib/db.ts` (singleton) en `lib/enums.ts`: de Nederlandse weergavelabels en álle enum-mappers met exhaustive switches (ADR-0004 — nergens anders inline mapping of case-coercion). Seed (`prisma/seed.ts`): de twee cursussen (`KLIK_EN_TIK` max leeg/∞, `LES_OP_MAAT` max 4 — A1, beide 120 min di+do) + 1 admin (wachtwoord via `SEED_ADMIN_PASSWORD`-env, bcrypt-hash via `bcryptjs` — conform mvp-spec §9, geen native build). Lokale dev-Postgres via Docker (`docker-compose.dev.yml`); geen hostingkeuze nodig (A2).
- **Bestanden.** `prisma/schema.prisma`, `prisma/migrations/<ts>_init/migration.sql` (incl. CHECK- en partial-index-SQL), `prisma/seed.ts`, `scripts/verify-constraints.ts`, `lib/env.ts`, `lib/db.ts`, `lib/enums.ts`, `docker-compose.dev.yml`, `.env.example` (aangevuld), `__tests__/lib/env.test.ts`, `__tests__/lib/enums.test.ts`.
- **Testaanpak.** `prisma validate` in verify-pad; `prisma migrate reset --force` + seed op lege DB als bewijs (migratie + seed idempotent herhaalbaar); unique-, CHECK-, partial-index- en cascade-gedrag aantonen met een **gecommit, herhaalbaar bewijsscript** `scripts/verify-constraints.ts` tegen de dev-DB (duplicate `courses.code` → fout; tweede `ACTIEF` traject per client+course → fout; delete client met traject → traject weg) — ST-105 hergebruikt ditzelfde cascade-bewijs. Unit-test op `lib/env.ts` (ontbrekende var → duidelijke fout) en op `lib/enums.ts` (elke enumwaarde heeft een NL-label; exhaustiveness).
- **Afhankelijkheden.** ST-001.
- **Klaar wanneer.** Migratie + seed draaien op lege DB; unique-constraints aantoonbaar (mvp-spec); cascade aantoonbaar via het gecommitte bewijsscript (voorschot op ST-105).

### ST-004 Auth

- **Aanpak.** iron-session volgens het bekende patroon van de bouwer: `lib/session.ts` (sessievorm `{ staffId, name, role }`, cookie httpOnly/secure, `SESSION_SECRET` ≥ 32 chars). `/login`: e-mail + wachtwoord → Zod-parse (422-conventie) → `bcryptjs`-vergelijking → **neutrale foutmelding** bij elke ongeldige combinatie (geen "e-mail bestaat niet"); gedeactiveerde accounts kunnen niet inloggen. Logout-action vernietigt de sessie aantoonbaar. `proxy.ts` in de root (Next 16-conventie, géén `middleware.ts`): onverzegelt de sessie en redirect alles behalve `/login` en statics naar `/login`. `lib/auth.ts`: `requireStaff()` / `requireAdmin()` voor pages en server actions — rolcheck altijd server-side (403 bij rol-tekort), ook waar de UI al verbergt.
- **Bestanden.** `lib/session.ts`, `lib/auth.ts`, `proxy.ts`, `app/login/page.tsx`, `app/login/actions.ts`, `app/logout/actions.ts` (of action in layout), `__tests__/lib/auth.test.ts`, `__tests__/app/login-action.test.ts`.
- **Testaanpak.** Unit: `requireStaff`/`requireAdmin` met gemockte sessie (geen sessie → redirect/401, STAFF op ADMIN-actie → 403); login-action: parse-fout → 422-pad, onbekende combinatie en inactief account → zelfde neutrale fout. Handmatig: beschermde route zonder cookie → redirect; terugknop na uitloggen toont geen data. Lichte a11y-check op het loginscherm (toetsenbord, focus, labels, klikdoelen, contrast) — het M1-patroon geldt ook voor de M0-UI; login is het eerste scherm dat iedereen ziet.
- **Afhankelijkheden.** ST-003 (staff_members + seed-admin), ST-002 (login-formulier in huisstijl).
- **Klaar wanneer.** Beschermde route zonder sessie redirect; ADMIN/STAFF-onderscheid werkt (mvp-spec); alle F-01-criteria die over inloggen gaan zijn groen.

---

## 3. M1 — De vier tabellen

Gedeeld patroon voor alle beheer-stories: lijst = server component met Prisma-query, zoeken/filteren via `searchParams`; mutaties = server actions met Zod (`.strict()` — onbekende velden zijn een 422, nooit "even erbij"); rolcheck via `lib/auth.ts`; formulieren met shadcn/ui in huisstijl; B1-teksten. **Elke UI-story sluit af met een lichte a11y-check** (toetsenbordnavigatie, zichtbare focus, gekoppelde labels, klikdoel-grootte, contrast) zodat de MVP-DoD "geen WCAG 2.2 AA-blokkers" (mvp-spec §12) per scherm wordt opgebouwd in plaats van achteraf — ST-503 (M5) blijft de volledige pass.

### ST-101 Medewerkersbeheer (F-01)

- **Aanpak.** `/medewerkers` (ADMIN-only, ook server-side): lijst met naam/e-mail/rol/actief; aanmaken (naam, e-mail uniek, rol, initieel wachtwoord), bewerken, deactiveren (geen hard delete — accounts zijn audit-actoren), wachtwoordreset (beheerder zet nieuw tijdelijk wachtwoord; geen self-service, team is klein). **Laatste-admin-bescherming**: degrade/deactivate van een admin gebeurt in een transactie die eerst telt of er >1 actieve admin is; zo nee → 422 met B1-uitleg.
- **Bestanden.** `app/medewerkers/page.tsx`, `app/medewerkers/actions.ts`, `components/ui/table.tsx` (shadcn), `__tests__/app/medewerkers-actions.test.ts`.
- **Testaanpak.** Unit op de actions: laatste-admin-regel (laatste actieve admin deactiveren/degraderen → geweigerd), dubbele e-mail → validatiefout, STAFF roept action aan → 403, gedeactiveerd account kan niet inloggen (samen met ST-004-test).
- **Afhankelijkheden.** ST-004.
- **Klaar wanneer.** Alle F-01-criteria groen, incl. laatste-admin-bescherming (mvp-spec).

### ST-102 Vrijwilligersbeheer (F-02)

- **Aanpak.** `/vrijwilligers`: lijst met naam, voorkeursdag(en) (di/do/beide als badges), actief-status en **NDA-indicator** (geen `nda_signed_at` → zichtbare markering, géén blokkade); zoeken op naam (case-insensitive contains), filter actief/inactief (default: actief). Formulier met exact de F-02-velden: naam (verplicht), e-mail, telefoon, voorkeur di (vinkje), voorkeur do (vinkje), frequentie-notitie, geheimhoudingsverklaring getekend op (datum), notities. Deactiveren is de standaardflow; **verwijderen alleen zonder gekoppelde rooster-/historiedata** (count op `roster_entries` + `absences`; in de MVP altijd 0, maar de guard staat er vanaf dag één). Notitieveld gebruikt `components/avg-notice.tsx` met de vaste instructie (hardstop 1); de instructietekst staat in `lib/avg.ts` — ST-103 vult daar de verboden-veldenlijst aan, zodat er één AVG-bron is.
- **Bestanden.** `app/vrijwilligers/page.tsx`, `app/vrijwilligers/[id]/page.tsx`, `app/vrijwilligers/actions.ts`, `components/avg-notice.tsx`, `lib/avg.ts`, `__tests__/app/vrijwilligers-actions.test.ts`.
- **Testaanpak.** Unit: delete-guard (vrijwilliger met roosterdata → deactiveren afgedwongen), Zod-schema (verplicht naam, datumformaat NDA), zoek-/filterquery-opbouw. Rendertest: NDA-indicator verschijnt bij ontbrekende datum; notitie-instructie zichtbaar.
- **Afhankelijkheden.** ST-004; levert `avg-notice.tsx` dat ST-103 hergebruikt.
- **Klaar wanneer.** F-02-criteria groen (mvp-spec).

### ST-103 Cliëntenbeheer (F-03) — AVG-by-design

- **Aanpak.** Dit scherm ís het veldenadvies in software. `/clienten`: lijst toont **voornaam + eerste letter achternaam**, lesvorm-inschatting, status; zoeken op naam; standaardfilter verbergt `AFGEROND`/`GESTOPT`. Formulier met uitsluitend de F-03-velden (voornaam verplicht; contactgegevens mogen leeg — cliënt komt fysiek langs; leerwens functioneel geformuleerd; assessment-enum; status-enum; pseudonieme oefenen.nl-gebruikersnaam; toestemming-extra's datum + wijze; `last_attended_on` handmatig; notities met vaste instructie). Zod `.strict()` + het Prisma-model vormen samen de technische borging dat verboden velden niet bestaan; de **volledige verboden-veldenlijst staat als constante in `lib/avg.ts`** — één bron, hergebruikt door de form-tests hier én (gecureerd) geseed als de Copilot-`content_policy` (ST-202 herzien). Dubbele naam → waarschuwing (geen blokkade). **Audit-schrijfpad wordt hier gebouwd** (planbeslissing): `lib/audit.ts` met `writeAuditLog({ actorType, actorId, action, entity, entityId, summary })` en een summary-conventie die nooit veldinhoud bevat ("status gewijzigd naar ACTIEF", "notities bijgewerkt") — elke create/update/statuswissel op cliënten logt; ST-106 levert de inzage-UI en de dekkingstests.
- **Bestanden.** `app/clienten/page.tsx`, `app/clienten/[id]/page.tsx`, `app/clienten/actions.ts`, `lib/audit.ts`, `__tests__/app/clienten-actions.test.ts`, `__tests__/lib/audit.test.ts`.
- **Testaanpak.** Unit: Zod weigert onbekende velden — expliciete test met de **volledige lijst uit `lib/avg.ts`** als input (`bsn`, `geboortedatum`, `adres`, `pasnummer`, gezondheids-, afkomst- en religievelden, niveau-labels → telkens 422); statusfilter-default; voornaam+initiaal-formatter; audit-write bij create/update/statuswissel met persoonsgegevens-arme summary. Rendertest: permanente notitie-instructie. Review-stap: tweede paar ogen (JP of reviewer-agent) bevestigt dat schema + UI geen verboden velden bevatten.
- **Afhankelijkheden.** ST-004, ST-102 (`avg-notice.tsx`).
- **Klaar wanneer.** F-03-criteria groen; reviewer bevestigt dat er geen verboden velden bestaan (mvp-spec).

### ST-104 Cursusaanbod (F-04)

- **Aanpak.** `/cursusaanbod`: lijst voor elke medewerker (read-only voor STAFF); bewerken alleen ADMIN — naam, beschrijving, **max. sessies (leeg = onbeperkt)**, sessieduur, lesdagen di/do; **`code` is onveranderlijk** (zit simpelweg niet in het update-schema). Seed-waarden uit ST-003 zichtbaar. Deactiveren kan; verwijderen alleen zonder gekoppelde trajecten (count `learning_tracks`).
- **Bestanden.** `app/cursusaanbod/page.tsx`, `app/cursusaanbod/[id]/page.tsx`, `app/cursusaanbod/actions.ts`, `__tests__/app/cursusaanbod-actions.test.ts`.
- **Testaanpak.** Unit: STAFF-mutatie → 403; update-payload met `code` → genegeerd/422; `max_sessions` leeg → null (onbeperkt), 0 of negatief → 422 (sluit aan op DB-CHECK); delete-guard met gekoppeld traject.
- **Afhankelijkheden.** ST-004.
- **Klaar wanneer.** F-04-criteria groen; max-sessies aanpasbaar zonder code (mvp-spec, A1).

### ST-105 Cliënt-export & definitieve verwijdering (F-05)

- **Aanpak.** `/clienten/[id]/export`: server-gerenderde, print/PDF-vriendelijke pagina (eigen printstylesheet, geen app-chrome) met **álle** opgeslagen gegevens van de cliënt incl. notities, en — omdat de tabellen al bestaan — trajecten/aanwezigheden zodra die er zijn (M4-proof). "Definitief verwijderen": ADMIN-only server action achter een bevestigingsdialoog met **naam-overtypen** (`components/confirm-delete-dialog.tsx`); verwijdering steunt op de DB-cascade uit ST-003 (client → tracks → attendances) en schrijft een **persoonsgegevens-vrije** auditregel (alleen intern id + tijdstip + uitvoerder; geen naam in de summary).
- **Bestanden.** `app/clienten/[id]/export/page.tsx`, `components/confirm-delete-dialog.tsx`, uitbreiding `app/clienten/actions.ts`, `__tests__/app/clienten-delete.test.ts`.
- **Testaanpak.** Unit: delete-action weigert zonder exacte naam-bevestiging en zonder ADMIN; auditregel bevat id maar geen naam (string-assertie). Demo-stap (DoD-scenario uit de spec): dummycliënt mét dummytraject aanmaken → export tonen → verwijderen → cascade geverifieerd (traject weg), auditregel zichtbaar. De cascade is daarnaast geautomatiseerd geborgd via het gedeelde bewijsscript `scripts/verify-constraints.ts` (ST-003).
- **Afhankelijkheden.** ST-103 (cliënt-CRUD + audit-helper), ST-003 (cascade).
- **Klaar wanneer.** F-05-criteria groen; cascade geverifieerd met dummytraject (mvp-spec).

### ST-106 Audit-log (F-06)

- **Aanpak.** `/audit` (ADMIN-only): nieuwste eerst, filter op actor-type en entiteit via `searchParams`, eenvoudige paginering (`take`/cursor). Insert-only is al de DB-vorm (geen update/delete-actions bestaan); de UI biedt ze ook niet. Hardening van de summary-conventie uit ST-103: centrale helper is de enige plek die summaries bouwt, zodat notitie-teksten of namen er niet per ongeluk in kunnen lekken.
- **Bestanden.** `app/audit/page.tsx`, eventueel `lib/audit.ts` (verfijning), `__tests__/app/audit-page.test.ts`.
- **Testaanpak.** Unit: filteropbouw; dekkingstest "cliëntmutatie produceert logregel" (create/update/statuswissel/delete → 4 regels); summary-test: notitie-inhoud komt nooit in een logregel; STAFF op `/audit` → 403/redirect.
- **Afhankelijkheden.** ST-103 (schrijfpad bestaat).
- **Klaar wanneer.** Cliëntmutatie produceert logregel; log-UI filtert (mvp-spec); logregels niet bewerkbaar/verwijderbaar via de UI.

### ST-107 Startscherm (F-08)

- **Aanpak.** `/`: begroeting met naam uit de sessie; vier navigatietegels (vrijwilligers, cliënten, cursusaanbod, medewerkers — die laatste alleen zichtbaar én bereikbaar voor ADMIN) plus chat-window-toegang (tot ST-201: nette "binnenkort"-tegel achter de feature-flag, A3). Lege-staat-teksten in B1 leggen per tegel uit wat hij doet ("Hier zet je wie er op dinsdag en donderdag helpt."). Dit scherm wordt in M3/M4 het "vandaag"-overzicht — de layout reserveert daar visueel ruimte voor, zonder te bouwen (YAGNI).
- **Bestanden.** `app/page.tsx`, `components/tile.tsx` (kaart in plectrum-stijl), `__tests__/app/startscherm.test.tsx`.
- **Testaanpak.** Rendertest per rol: ADMIN ziet vier tegels + audit-link, STAFF ziet er drie; B1-lege-staat-teksten aanwezig.
- **Afhankelijkheden.** ST-004 (sessie/rol), ST-002 (tegels in huisstijl). Kan parallel aan ST-101–106; tegels linken hoogstens naar nog lege routes.
- **Klaar wanneer.** F-08-criteria groen (mvp-spec).

---

## 4. M2 — Chat-window

Het chat-window is een extern component (A3). M2 bouwt de **app-kant van het integratiecontract** (mvp-spec §10) zó dat (a) de app zonder component gewoon werkt (flag uit → "binnenkort"), en (b) het component bij oplevering alleen nog hoeft aan te haken op de afgesproken endpoints. Het gedeelde M1-patroon — inclusief de a11y-check per UI-story — geldt ook hier.

### ST-201 Inbedding (F-07)

- **Aanpak.** `components/chat/chat-window.tsx` als integratiepunt, geladen in de layout/startpagina, uitsluitend voor ingelogde medewerkers (proxy + render-conditie). Feature-flag `CHAT_WINDOW_ENABLED` + `CHAT_WINDOW_URL` in `lib/env.ts`. **Sessie-doorgifte conform contract §10.1**: het component erft de app-sessie; `app/api/chat/session/route.ts` levert — alleen met geldige iron-session — `{ name, role }` van de aanvrager aan het component (zelfde-origin; geen aparte tokens zolang het deploymodel onbekend is, A3-uitzoekpunt voor JP). Uitgelogd: niets zichtbaar, endpoint geeft 401.
- **Bestanden.** `components/chat/chat-window.tsx`, `app/api/chat/session/route.ts`, `lib/env.ts` (flag/URL), aanpassing `app/layout.tsx`/`app/page.tsx`, `__tests__/app/chat-session-route.test.ts`.
- **Testaanpak.** Unit: session-endpoint zonder sessie → 401, met sessie → naam+rol; rendertest: flag uit → "binnenkort"-tegel, flag aan + uitgelogd → geen chat. Acceptatie "medewerker kan chatten" volgt zodra het externe component beschikbaar is (afhankelijkheid bij JP, open vraag §10.7).
- **Afhankelijkheden.** ST-004, ST-107; extern: component-oplevering (JP).
- **Klaar wanneer.** Ingelogde medewerker ziet het chat-window (of de nette flag-uit-staat), uitgelogd niemand (mvp-spec); identiteits-endpoint aantoonbaar dicht zonder sessie.

### ST-202 Guardrails & bevestigingsflow

> **Herzien (AVG-gate D):** het chat-window is het **Scrum4Me-Copilot**-component; de AVG-handhaving wordt geleverd door het Copilot-platform, niet meer door bespoke in-app guardrails. De ingebedde Copilot-chat raakt DigiPlein's eigen `lib/chat/guardrails.ts` + check/confirm-endpoints niet meer (die zijn orphaned; **opruiming is een aparte taak, buiten deze slice**). De **form-level** AVG-check in de cliëntregistratie (`lib/avg.ts` + Zod `.strict()` + Prisma-model, ST-103) blijft ongewijzigd.

- **Aanpak.** Twee lagen op het Copilot-platform: (1) **preventief** — een per-product *content-policy-gate*: de Copilot weigert idee-/feature-verzoeken die een verboden veld/feature uit product-spec §6.1 noemen, *fail-closed*, vóór er iets wordt vastgelegd. De weigerlijst is de bron `lib/avg.ts`, **gecureerd geseed** in de Scrum4Me-DB als het product-`content_policy` (gecureerd voor de substring-checker van de gate). (2) **correctief** — de *job-flow-approval*: schema-/gedragwijzigingen lopen via plan→review→uitvoer waarin een beheerder (RW/PO) plan/PR/deploy expliciet bevestigt vóór uitvoering.
- **Bestanden.** Seed-artefact + applier in **Scrum4Me** (`prisma/content-policies.ts`, `prisma/seed-content-policies.ts`); geen nieuwe DigiPlein-code. (De bestaande bespoke `lib/chat/guardrails.ts` + chat-endpoints blijven staan tot de aparte opruim-taak.)
- **Testaanpak.** Curatie-assertietest in Scrum4Me (de gecureerde policy blokkeert bsn/taalniveau/woonadres/etnische afkomst/politieke voorkeur/client-login/externe dienst en blokkeert NIET de legitieme frasen). Smoke via het echte Copilot-pad: een DigiPlein-idee met een verboden term (create én update) → geweigerd met user-facing AVG-reden.
- **Afhankelijkheden.** ST-201; de live Copilot content-policy-gate (sub-project C, mcp/web).
- **Klaar wanneer.** De gecureerde `content_policy` is geseed; een verboden-veld-verzoek via de Copilot wordt aantoonbaar geweigerd; een schema-/gedragwijziging wacht op beheerder-bevestiging.

### ST-203 Audit-koppeling

- **Aanpak.** Chat-geïnitieerde wijzigingen schrijven via `lib/audit.ts` een regel met `actor_type = CHAT_AGENT` en een **verwijzing naar het chatverzoek**: uitsluitend het `chat_request_id`, de capability-categorie (a/b/c), de uitkomst (uitgevoerd / geweigerd / FG-toets vereist) en een **app-gegenereerde, allowlisted actieomschrijving** — nooit de verzoektekst of prompt-inhoud zelf, want die kan gevoelige of verboden inhoud bevatten (persoonsgegevens-arme summaries, F-06). `entity = "schema"` bij migratie-voorstellen. Representatie expliciet als **twee gekoppelde regels** met hetzelfde `chat_request_id`: (1) de bevestiging — `actor_type = STAFF` met het ADMIN-id als `actor_id`, `action = "CONFIRM_CHAT_CHANGE"`; (2) de uitvoering — `actor_type = CHAT_AGENT`, `action = "MIGRATION"`/`"UPDATE"`. `fgReviewRequired`-uitkomsten krijgen de markering "FG-toets vereist" in de uitvoeringsregel.
- **Bestanden.** Uitbreiding `app/api/chat/confirm/route.ts` + `lib/audit.ts`, `__tests__/app/chat-audit.test.ts`.
- **Testaanpak.** Unit: bevestigde chat-wijziging → twee gekoppelde regels (STAFF/`CONFIRM_CHAT_CHANGE` met ADMIN-id + CHAT_AGENT-uitvoeringsregel) met dezelfde verzoek-referentie; **gevoelig geweigerd verzoek** (bv. "voeg een BSN-veld toe voor cliënt Jan Jansen") → de logregel bevat noch "BSN" noch de naam, alleen id + categorie + uitkomst "geweigerd"; FG-markering aanwezig wanneer guardrails dat zeggen.
- **Afhankelijkheden.** ST-202, ST-106.
- **Klaar wanneer.** Uitgevoerde chat-wijziging is traceerbaar in het log (mvp-spec) — daarmee is de MVP-DoD-regel "audit registreert cliëntmutaties én chat-wijzigingen" volledig.

---

## 5. Volgorde & afhankelijkheden (samengevat)

```
ST-001 ─→ ST-002 ─→ ST-004 ─→ ST-101
   └────→ ST-003 ──┘    ├───→ ST-102 ─→ ST-103 ─→ ST-105
                        │        (avg-notice)└───→ ST-106
                        ├───→ ST-104
                        └───→ ST-107 ─→ ST-201 ─→ ST-202 ─→ ST-203
                                          (extern: chat-component, JP)
```

Per story: `npm run verify && npm run build` vóór afronding; commit per logische laag op de **milestone-branch** (ADR-0003: `feat/m0-fundament` / `feat/m1-kerntabellen` / `feat/m2-chat-window`); push + één PR per milestone (Forgejo) pas na de gebruikerstest en akkoord van JP. MVP-DoD: mvp-spec §12.

## 6. Sprint-structuur (aan te maken ná goedkeuring — stap 4 van de opdracht)

Voorstel voor de Scrum4Me-hiërarchie (product `cmq9hybds0003v27r99zvo92k`):

| Sprint (goal) | PBI | Stories (met acceptatiecriteria uit de F-specs) | Taken per story |
|---|---|---|---|
| **S-M0** — "M0 Fundament: scaffold, huisstijl, schema en auth staan; verify groen" | "M0 — Fundament" (prio 1) | ST-001 t/m ST-004 (prio 1, sort_order 1–4) | 2–4 per story, conform §2 (bv. ST-003: schema → migratie+CHECKs → seed → constraint-bewijs) |
| **S-M1** — "M1 Vier kerntabellen: volledig beheer met AVG-by-design" | "M1 — De vier tabellen" (prio 1) | ST-101 t/m ST-107 (sort_order 1–7) + mini-story **"Hostingkeuze (A2)"** (sort_order 8) | 2–4 per story, conform §3; de hosting-mini-story heeft één taak: besliskaart Vercel+Neon vs. eigen Ubuntu-server → keuze vastleggen als ADR-product-doc |
| **S-M2** — "M2 Chat-window: contract-kant, guardrails en audit-koppeling" | "M2 — Chat-window" (prio 2) | ST-201 t/m ST-203 (sort_order 1–3) | 2–3 per story, conform §4; slottaak onder ST-203: **a11y-sweep van alle MVP-schermen** (DoD mvp-spec §12) |

Werkafspraken bij het aanmaken: stories krijgen de F-criteria als `acceptance_criteria`; taken krijgen de aanpak-tekst als `implementation_plan`; dit plan gaat ook als product-doc (folder PLANS) naar Scrum4Me en wordt via `source_docs`/`link_pbi_doc` (rol PLAN) aan de drie PBI's gekoppeld. Na het aanmaken: **hardstop** — niets uitvoeren.

## 7. Revisiehistorie

- **0.5 (2026-06-11, na goedkeuring)** — A3 bijgewerkt: het chat-component is opgeleverd (JP); integratie bewust uitgesteld naar de slotstap van M2, feature-flag blijft tot dan uit. De product-DoD is door JP in Scrum4Me geregistreerd en wijst op Scrum4Me-functionaliteit (chat/docs/ideas/jobs) voor gebruikers met scrum-rechten — die rollen vallen buiten het MVP-rollenmodel (ADMIN/STAFF) en worden bij de M2-integratie uitgewerkt. Sprint-structuur aangemaakt (3 sprints / 3 PBI's / 15 stories / 36 taken); bouwvolgorde M0 → M1 → M2.
- **0.4 (2026-06-11)** — ADR-0001 t/m ADR-0005 overgenomen van Scrum4Me ([docs/adr/](../adr/)) en het plan erop getoetst (nieuwe hardstop 6): ST-001 bouwt de shadcn-output om naar `@base-ui/react` met `render`-prop + lint-bewaking tegen `@radix-ui/*`/`asChild` (ADR-0001); `lib/enums.ts` als enige enum-conversiegrens, met exhaustiveness-test (ADR-0004); werkwijze aangescherpt van "branch per story" naar één branch per milestone met push pas na gebruikerstest (ADR-0003); Float `sort_order` vastgelegd als richtlijn voor toekomstige herordenbare lijsten — de MVP heeft er geen (ADR-0002); iron-session + bcryptjs was al conform (ADR-0005, formaliseert mvp-spec §9).
- **0.3 (2026-06-11)** — reviewronde 2 verwerkt; beide reviewers bevestigen dat alle ronde-1-bevindingen correct in de plantekst zitten (geen regressies):
  - `scrum4me-server:claude` — AKKOORD MITS. Major: MD3-rollenstructuur uit de branding-annex overnemen → ST-002 herschreven rond rolparen (`on-*`-tekstkleur per achtergrondrol), annex-sectie "Advies: vertaling naar onze app" is de normatieve checklist, `error #962737` gekozen, shadcn-`primary` gemapt op zwart (oranje-als-tekst onrepresenteerbaar), secundaire knop/tekstlink/focus-stijl/typografie-schaal/plectrum-detail toegevoegd. Minors: a11y-check ook op M0-UI (ST-002/ST-004), ST-105 noemt het gedeelde bewijsscript, hostingkeuze als eigen mini-story met ADR.
  - `mac:codex` — AKKOORD (geen majors). Minors: a11y M0 expliciet (zelfde fix), audit-representatie in ST-203 vastgelegd als twee gekoppelde regels (STAFF/`CONFIRM_CHAT_CHANGE` + CHAT_AGENT-uitvoering, gekoppeld op `chat_request_id`).
- **0.2 (2026-06-11)** — beide externe reviews verwerkt, elk eindoordeel "AKKOORD MITS":
  - `scrum4me-server:claude` — majors: WCAG-AA-borging binnen M0–M2 (a11y-check per UI-story + a11y-sweep-slottaak in S-M2), hex-scan verbreed naar alle `app/`- en `components/`-bestanden. Minors: volledige AVG-verboden-veldenlijst als testinput via gedeelde constante `lib/avg.ts`; Forgejo Actions-runner bevestigd → CI direct actief; hostingbesliskaart als taak in S-M1; partial unique index "één ACTIEF traject per (client, course)"; herhaalbaar bewijsscript `scripts/verify-constraints.ts`; `bcryptjs` i.p.v. bcrypt (conform mvp-spec §9).
  - `mac:codex` — majors: oranje-tekst-tokencontract breed getest (ook `text-primary`/`text-[#ee7203]`/inline-patronen, allowlist per uitzondering); ST-203-summaries bevatten nooit chat-verzoektekst (alleen `chat_request_id`, categorie, uitkomst, allowlisted actieomschrijving + lektest met gevoelig geweigerd verzoek).
- **0.1 (2026-06-11)** — eerste versie ter goedkeuring.
