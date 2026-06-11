# Digiplein — MVP-specificatie

> **Versie:** 0.1 — 2026-06-11 · **Status:** concept, ter review
> **Volgt:** [product-spec.md](product-spec.md) v0.1 — randvoorwaarden daar (m.n. §6.1 AVG en §6.5 chat-window-kaders) zijn bindend voor alles hieronder.

## 1. MVP-scope

De MVP is het **datafundament + beheer + uitbreidingsmotor**: een ingelogde bibliotheekmedewerker beheert de vier kerntabellen — **medewerkers, vrijwilligers, cliënten en cursusaanbod** — in de huisstijl van Bibliotheek Rotterdam, met AVG-by-design (bindend veldenmodel, notitie-instructie, export en verwijdering per cliënt, audit-log), en kan via het **chat-window** de app aanpassen en functionaliteit toevoegen. Het volledige datamodel (inclusief rooster- en trajecttabellen) wordt in de MVP al aangelegd, zodat de vervolgfases — rooster (M3) en leertrajecten (M4) — begeleide uitbreidingen zijn in plaats van verbouwingen.

**MVP-formule:** vier tabellen met UI + AVG-basis + chat-window. Niet meer.

## 2. Expliciet buiten scope voor de MVP

- Rooster-UI (lesmomenten, inroostering, afwezigheid, bezetting) → **M3** in de backlog
- Vrijwilliger-login/zelfservice (magic link) → **M3**; in de MVP voert de medewerker vrijwilligersgegevens in
- Intake-flow, leertrajecten, sessieteller, aanwezigheid → **M4**
- E-mails (herinneringen, oproepen), rapportages, ICS-export → **v2** (zie product-spec §5)
- Cliënt-login, koppeling ledensysteem, oefenen.nl-API — **nooit** (product-spec §5)
- Livegang met echte cliëntgegevens — pas na FG-akkoord + verwerkersovereenkomst (product-spec §6.1); de MVP draait met dummydata

## 3. Rollen & toegang

| Rol | Wie | Kan in de MVP |
|---|---|---|
| `ADMIN` (beheerder) | JP + coördinator | Alles van `STAFF`, plus: medewerkers beheren, cursusaanbod wijzigen, chat-wijzigingen met schema-impact bevestigen, cliënt definitief verwijderen |
| `STAFF` (medewerker) | Bibliotheekmedewerkers | Inloggen; vrijwilligers en cliënten beheren; cursusaanbod inzien; chat-window gebruiken (vraag/uitleg + voorstellen zonder schema-impact) |
| Vrijwilliger | — | Geen toegang in de MVP (komt in M3 met magic-link-zelfservice) |
| Cliënt | — | Nooit toegang |

Toegangsprincipes: geen enkele route met data is publiek; sessies via versleutelde cookie; geen wachtwoord-reset-selfservice in de MVP (beheerder reset — team is klein).

## 4. Functionele specificaties (MVP)

### F-01 Inloggen & medewerkersbeheer

**Persona:** Sandra · **Prioriteit:** MVP

Medewerkers loggen in met e-mail + wachtwoord. Beheerders maken medewerker-accounts aan, deactiveren ze en resetten wachtwoorden.

**Acceptatiecriteria**
- [ ] Inloggen met geldig e-mail+wachtwoord leidt naar het startscherm; ongeldige combinatie toont een neutrale foutmelding (geen "e-mail bestaat niet")
- [ ] Niet-ingelogde bezoekers van een beschermde route worden naar `/login` geleid
- [ ] Beheerder kan medewerker aanmaken (naam, e-mail, rol), deactiveren en wachtwoord resetten; gedeactiveerde accounts kunnen niet inloggen
- [ ] Laatste actieve beheerder kan zichzelf niet deactiveren of degraderen
- [ ] Uitloggen beëindigt de sessie aantoonbaar (terugknop toont geen data)

**Randgevallen:** sessie verlopen tijdens formulier → bij submit terug naar login zonder dataverlies-belofte; dubbele e-mail → validatiefout.

### F-02 Vrijwilligersbeheer

**Persona:** Sandra (invoer), Joke/Ahmed (onderwerp) · **Prioriteit:** MVP

CRUD op vrijwilligers met de roostervoorbereidende velden: voorkeursdag(en) di/do, actief-status, datum geheimhoudingsverklaring.

**Acceptatiecriteria**
- [ ] Lijst toont naam, voorkeursdag(en) (di/do/beide), actief-status; zoeken op naam; filter actief/inactief
- [ ] Aanmaken/bewerken met: naam (verplicht), e-mail, telefoon, voorkeur dinsdag (vinkje), voorkeur donderdag (vinkje), frequentie-notitie (vrij, bv. "om de week"), geheimhoudingsverklaring getekend op (datum), notities (functioneel)
- [ ] Vrijwilliger zonder getekende geheimhoudingsverklaring krijgt een zichtbare indicator in de lijst (geen blokkade)
- [ ] Deactiveren i.p.v. verwijderen is de standaardflow; verwijderen kan alleen als er geen rooster-/historiedata aan hangt (anders deactiveren afdwingen)
- [ ] Notitieveld toont de vaste AVG-instructie als hulptekst (zelfde regel als bij cliënten: feitelijk, taakgericht)

### F-03 Cliëntenbeheer (AVG-by-design)

**Persona:** Sandra · **Prioriteit:** MVP

CRUD op cliënten volgens het bindende veldenmodel uit product-spec §6.1. Dit scherm ís het AVG-veldenadvies, in software.

**Acceptatiecriteria**
- [ ] Aanmaken/bewerken met uitsluitend: voornaam (verplicht), achternaam, telefoon en/of e-mail (minstens leeg toegestaan), leerwens (vrije tekst, functioneel geformuleerd), inschatting lesvorm (`KLIK_EN_TIK` / `LES_OP_MAAT` / `NOG_BEPALEN`), status (`AANGEMELD`/`INTAKE`/`ACTIEF`/`AFGEROND`/`GESTOPT`), oefenen.nl-gebruikersnaam (pseudoniem, optioneel), toestemming-extra's geregistreerd op + wijze (optioneel; alleen voor foto's e.d.), notities
- [ ] Er bestaan **geen** velden voor geboortedatum, adres, BSN, pasnummer, gezondheid, afkomst of niveau-labels — ook niet "even erbij" via vrije kolommen
- [ ] Notitieveld toont permanent de instructie: *"Alleen feitelijk en cursusgericht. Geen gezondheid of privéomstandigheden. Schrijf alsof de cliënt meeleest."*
- [ ] Lijst toont voornaam + eerste letter achternaam, lesvorm-inschatting, status; zoeken op naam; standaardfilter verbergt `AFGEROND`/`GESTOPT`
- [ ] Elke mutatie (aanmaken, wijzigen, statuswissel) komt in het audit-log (F-06)
- [ ] Veld "laatste deelname op" is zichtbaar (handmatig in MVP; automatisch vanaf M4) — dit stuurt later de bewaartermijn

**Randgevallen:** dubbele naam toegestaan (waarschuwing, geen blokkade); cliënt zonder contactgegevens toegestaan (komt fysiek langs).

### F-04 Cursusaanbod

**Persona:** Sandra · **Prioriteit:** MVP

Het cursusaanbod is een beheerbare tabel, geseed met de twee lesvormen. Regels van de lesvorm (sessiemaximum, duur) zijn data, geen code — zo is de "4 vs. 6 lessen"-discrepantie (product-spec §10.1) een instelling.

**Acceptatiecriteria**
- [ ] Seed bevat: `KLIK_EN_TIK` ("Computercursus Klik & Tik", max. sessies = leeg/onbeperkt, 120 min, di+do) en `LES_OP_MAAT` ("Computercursus Les op maat", max. sessies = 4, 120 min, di+do)
- [ ] Beheerder kan naam, beschrijving, max. sessies (leeg = onbeperkt), sessieduur en lesdagen (di/do-vinkjes) wijzigen; `code` is onveranderlijk na aanmaak
- [ ] Medewerker (niet-beheerder) kan het aanbod inzien, niet wijzigen
- [ ] Deactiveren kan; verwijderen alleen zonder gekoppelde trajecten

### F-05 Cliënt-export & definitieve verwijdering (AVG-rechten)

**Persona:** Sandra (namens cliënt) · **Prioriteit:** MVP

Inzage- en wisverzoeken zijn één klik, geen project.

**Acceptatiecriteria**
- [ ] "Exporteer gegevens" op de cliëntpagina levert één leesbaar overzicht (print/PDF-vriendelijke pagina) van álle opgeslagen gegevens van die cliënt, incl. notities en (vanaf M4) trajecten/aanwezigheid
- [ ] "Definitief verwijderen" (alleen `ADMIN`) verwijdert de cliënt en alle gekoppelde records onomkeerbaar, na een expliciete bevestiging met naam-overtypen
- [ ] De verwijdering zelf wordt in het audit-log vastgelegd zónder persoonsgegevens (alleen intern id + tijdstip + uitvoerder)
- [ ] Export en verwijdering werken aantoonbaar in de demo met dummydata (testscenario in de DoD)

### F-06 Audit-log

**Persona:** Sandra/JP/FG · **Prioriteit:** MVP

Wijzigingsgeschiedenis voor verantwoording (AVG) en voor vertrouwen in het chat-window.

**Acceptatiecriteria**
- [ ] Elke mutatie op cliënten en elke chat-geïnitieerde wijziging schrijft een regel: tijdstip, actor (medewerker / chat-agent / systeem), actie, entiteit, korte samenvatting
- [ ] Beheerder kan het log inzien (nieuwste eerst, filter op actor/entiteit)
- [ ] Logregels bevatten geen gevoelige inhoud (geen notitie-teksten), alleen wát er wijzigde
- [ ] Logregels zijn niet bewerkbaar of verwijderbaar via de UI

### F-07 Chat-window-integratie

**Persona:** Sandra (gebruiker), JP (kaders) · **Prioriteit:** MVP

Het chat-window (apart in ontwikkeling) wordt ingebed voor ingelogde medewerkers; integratiecontract en guardrails in §10.

**Acceptatiecriteria**
- [ ] Ingelogde medewerkers zien het chat-window; niet-ingelogden nooit
- [ ] Medewerker kan in het Nederlands een vraag of wijzigingsverzoek stellen ("voeg bij vrijwilligers een veld 'rijdt zelf' toe")
- [ ] Wijzigingen met schema- of gedragimpact vereisen bevestiging door een `ADMIN` vóór uitvoering
- [ ] De AVG-guardrails uit product-spec §6.5 zijn actief: verzoeken om verboden velden (BSN, gezondheid, niveau-labels, …) worden geweigerd met uitleg
- [ ] Elke uitgevoerde wijziging staat in het audit-log met verwijzing naar het chatverzoek

### F-08 Startscherm

**Persona:** allen · **Prioriteit:** MVP

Eenvoudig vertrekpunt: tegels naar de vier tabellen + chat, en een plek die in M3/M4 het "vandaag"-overzicht wordt (bezetting + wie er komt).

**Acceptatiecriteria**
- [ ] Na inloggen: begroeting, vier navigatietegels (vrijwilligers, cliënten, cursusaanbod, medewerkers — laatste alleen `ADMIN`), chat-window-toegang
- [ ] Lege-staat-teksten leggen in B1-taal uit wat elke tegel doet

## 5. Belangrijkste user flows

### Flow: nieuwe cliënt aanmelden (MVP-versie)

**Start:** Sandra, na een telefoontje of inloop-aanmelding.
1. Cliënten → "Nieuwe cliënt"
2. Vult voornaam, contactkanaal, leerwens in ("wil leren e-mailen en DigiD gebruiken")
3. Kiest inschatting: leerwens breed/beginner → `KLIK_EN_TIK`; specifiek doel, redelijke basis → `LES_OP_MAAT`; twijfel → `NOG_BEPALEN` (intakegesprek volgt op een lesochtend)
4. Status `AANGEMELD` → opslaan. Klaar; vanaf M4 start hier het leertraject met leerdoel.

**Rand:** cliënt wil geen contactgegevens geven → toegestaan; status-flow werkt ook zonder.

### Flow: AVG-wisverzoek

**Start:** cliënt zegt tegen Joke "haal mij maar uit jullie systeem"; Joke geeft het door aan Sandra.
1. Sandra opent de cliënt → "Exporteer gegevens" (desgewenst eerst inzage aanbieden)
2. `ADMIN` → "Definitief verwijderen" → naam overtypen → bevestigen
3. App bevestigt; audit-log bevat een persoonsgegevens-vrije regel. Binnen één maand afgerond — in de praktijk: dezelfde dag.

### Flow: app uitbreiden via chat (MVP-versie)

**Start:** Sandra mist een veld.
1. Chat: "Kun je bij vrijwilligers bijhouden of iemand de geheimhoudingsverklaring heeft getekend?" *(bestaat al — agent wijst het aan)* of een écht nieuw verzoek
2. Agent legt voor: wat verandert er (veld, scherm, migratie), AVG-check-resultaat
3. `ADMIN` bevestigt → agent voert uit (migratie + UI) → audit-log-regel → Sandra ziet het veld

**Rand:** verzoek botst met AVG-kaders ("leeftijd erbij") → agent weigert, legt uit waarom, verwijst naar product-spec §6.1.

## 6. Datamodel

Volledig schema vanaf de MVP (rooster-/trajecttabellen worden aangelegd maar pas in M3/M4 van UI voorzien). Conventies: Engelse tabel-/kolomnamen, Nederlandse UI-labels; enums in DB `UPPER_SNAKE`; alle tabellen `id uuid pk default gen_random_uuid()`, `created_at`/`updated_at timestamptz`.

### staff_members (medewerkers)

| Kolom | Type | Constraints | Notities |
|---|---|---|---|
| name | text | not null | |
| email | text | not null, unique | inlognaam |
| password_hash | text | not null | bcrypt |
| role | enum `STAFF_ROLE` | not null, default `STAFF` | `ADMIN` \| `STAFF` |
| is_active | boolean | not null, default true | inactief = niet inloggen |

### volunteers (vrijwilligers)

| Kolom | Type | Constraints | Notities |
|---|---|---|---|
| name | text | not null | |
| email | text | unique, nullable | nodig voor magic link (M3); mag leeg |
| phone | text | nullable | |
| prefers_tuesday | boolean | not null, default false | voorkeursdag |
| prefers_thursday | boolean | not null, default false | voorkeursdag |
| frequency_note | text | nullable | vrij: "om de week", "alleen even weken" |
| nda_signed_at | date | nullable | geheimhoudingsverklaring (Probiblio-model) |
| is_active | boolean | not null, default true | |
| notes | text | nullable | functioneel; zelfde AVG-notitie-instructie |

### clients (cliënten) — veldenmodel is bindend (product-spec §6.1)

| Kolom | Type | Constraints | Notities |
|---|---|---|---|
| first_name | text | not null | |
| last_name | text | nullable | lijsten tonen voornaam + initiaal |
| phone | text | nullable | één contactkanaal volstaat |
| email | text | nullable | |
| learning_wish | text | nullable | functioneel geformuleerd ("wil leren videobellen") |
| assessment | enum `COURSE_ASSESSMENT` | not null, default `NOG_BEPALEN` | `KLIK_EN_TIK` \| `LES_OP_MAAT` \| `NOG_BEPALEN` |
| status | enum `CLIENT_STATUS` | not null, default `AANGEMELD` | `AANGEMELD` \| `INTAKE` \| `ACTIEF` \| `AFGEROND` \| `GESTOPT` |
| oefenen_username | text | nullable | **pseudoniem** (app-gegenereerd), nooit echte naam |
| consent_extras_at | timestamptz | nullable | alléén voor extra's (foto's e.d.) |
| consent_extras_note | text | nullable | wat + hoe geregistreerd (papier/mondeling+log) |
| last_attended_on | date | nullable | stuurt bewaartermijn (M4: automatisch) |
| notes | text | nullable | vaste UI-instructie; eerste kandidaat voor opschoning |

**Verboden — bewust géén kolommen voor:** BSN, geboortedatum, adres, pasnummer, gezondheids-/afkomst-/religiegegevens, taal-/diginiveau-labels. Deze lijst is ook een chat-window-guardrail (§10).

### courses (cursusaanbod)

| Kolom | Type | Constraints | Notities |
|---|---|---|---|
| code | text | not null, unique | `KLIK_EN_TIK`, `LES_OP_MAAT` — stabiel bij rebranding |
| name | text | not null | weergavenaam (kan wijzigen, zie product-spec §9) |
| description | text | nullable | |
| max_sessions | int | nullable, check > 0 | **null = onbeperkt** (Klik & Tik); 4 = Les op maat (configureerbaar; open vraag §10.1 product-spec) |
| session_minutes | int | not null, default 120 | |
| on_tuesday / on_thursday | boolean | not null, default true | lesdagen; multi-locatie/tijdslot is een latere uitbreiding |
| is_active | boolean | not null, default true | |

### learning_tracks (leertrajecten — UI in M4)

| Kolom | Type | Constraints | Notities |
|---|---|---|---|
| client_id | uuid | fk → clients, not null | cascade delete (F-05) |
| course_id | uuid | fk → courses, not null | |
| goal | text | nullable | **verplicht (app-regel) bij `LES_OP_MAAT`** — het vooraf bepaalde leerdoel |
| status | enum `TRACK_STATUS` | not null, default `ACTIEF` | `ACTIEF` \| `AFGEROND` \| `GESTOPT` |
| started_on | date | not null | |
| ended_on | date | nullable | |
| next_step | text | nullable | inschatting vrijwilliger: volgende stap / vervolgaanbod (Klik & Tik-werkwijze) |

App-regel: max. één `ACTIEF` traject per (client, course).

### lesson_dates (lesmomenten — UI in M3)

| Kolom | Type | Constraints | Notities |
|---|---|---|---|
| date | date | not null, unique | generator maakt alle di/do per kwartaal |
| starts_at / ends_at | time | not null, default 10:00 / 12:00 | |
| status | enum `LESSON_STATUS` | not null, default `GEPLAND` | `GEPLAND` \| `VERVALLEN` (feestdag, sluiting) |
| note | text | nullable | bv. "Tweede Paasdag — vervallen" |

### roster_entries (inroosteringen — UI in M3)

| Kolom | Type | Constraints | Notities |
|---|---|---|---|
| lesson_date_id | uuid | fk → lesson_dates, not null | |
| volunteer_id | uuid | fk → volunteers, not null | |
| status | enum `ROSTER_STATUS` | not null, default `INGEPLAND` | `INGEPLAND` \| `AFGEMELD` \| `AANWEZIG` \| `NO_SHOW` (laatste twee: v2-registratie) |
| note | text | nullable | |

Unique (lesson_date_id, volunteer_id). Bezettingsregels (min/max per lesmoment) zijn app-config, default min 2 / max 4.

### absences (afwezigheid vrijwilligers — UI in M3)

| Kolom | Type | Constraints | Notities |
|---|---|---|---|
| volunteer_id | uuid | fk → volunteers, not null | |
| starts_on / ends_on | date | not null, check ends_on ≥ starts_on | datumbereik; **geen reden-veld** (dataminimalisatie — vakantie of ziek gaat de app niet aan) |
| note | text | nullable | optioneel, functioneel |

### attendances (deelnames cliënt per lesmoment — UI in M4)

| Kolom | Type | Constraints | Notities |
|---|---|---|---|
| lesson_date_id | uuid | fk → lesson_dates, not null | |
| learning_track_id | uuid | fk → learning_tracks, not null | cascade delete met traject/cliënt |
| attended | boolean | not null, default true | |
| note | text | nullable | de 1-minuut-voortgangsnotitie; AVG-instructie |

Unique (lesson_date_id, learning_track_id). **Sessieteller Les op maat** = count(attended) op het traject; waarschuwing bij bereiken van `courses.max_sessions`.

### audit_logs

| Kolom | Type | Constraints | Notities |
|---|---|---|---|
| actor_type | enum `ACTOR_TYPE` | not null | `STAFF` \| `CHAT_AGENT` \| `SYSTEM` |
| actor_id | uuid | nullable | staff_members.id indien van toepassing |
| action | text | not null | `CREATE` / `UPDATE` / `DELETE` / `MIGRATION` / … |
| entity | text | not null | tabelnaam of "schema" |
| entity_id | uuid | nullable | |
| summary | text | not null | persoonsgegevens-arm ("status gewijzigd naar ACTIEF") |

Geen update/delete via UI; alleen insert.

## 7. Navigatiestructuur

```
/login
/                  (startscherm: tegels + chat)
/vrijwilligers     (+ /vrijwilligers/[id])
/clienten          (+ /clienten/[id], /clienten/[id]/export)
/cursusaanbod      (+ /cursusaanbod/[id] — bewerken alleen ADMIN)
/medewerkers       (alleen ADMIN)
/audit             (alleen ADMIN)
— M3: /rooster (+ /rooster/[datum]), /mijn (vrijwilliger-zelfservice via magic link)
— M4: /clienten/[id]/traject
```

## 8. Niet-functionele eisen

| Eis | Waarde |
|---|---|
| Taal | Nederlands (nl-NL), B1-niveau, je-vorm (u alleen in juridische teksten) |
| Platform | Responsive web; volwaardig op desktop, iPad en telefoon |
| Toegankelijkheid | WCAG 2.2 AA op alle schermen (product-spec §6.3); geen oranje tekst op wit |
| Huisstijl | Tokens uit [research/branding-bibliotheek-rotterdam.md](research/branding-bibliotheek-rotterdam.md); geen logo zonder toestemming |
| Beveiliging | Alles achter login; bcrypt; sessiecookie httpOnly/secure; rollen server-side afgedwongen; HTTPS-only |
| Privacy | Veldenmodel §6 bindend; audit-log; export/delete; dummydata tot FG-akkoord |
| Foutcodes (API/actions) | 400 parse-fout · 422 validatie (Zod) · 401/403 auth/rol |
| Offline | Niet vereist |
| Schaal | ≤ ~25 teamleden, ≤ enkele honderden cliënten — geen cache-/schaalmaatregelen nodig |

## 9. Technische architectuur

### Samenvatting

Een server-gerenderde Next.js-app (App Router) met PostgreSQL via Prisma, sessie-auth met iron-session, gehost in de EU. Alle mutaties via Server Actions met Zod-validatie; geen publieke API. Eén codebase, één database, geen achtergrond-infrastructuur behalve een dagelijkse cron (bewaartermijn, M5).

### Stack

| Laag | Keuze | Rationale |
|---|---|---|
| Framework | Next.js 16 (App Router) + React 19 | SSR past bij sessie-auth en kleine vormfactor; bekend terrein voor de bouwer (zelfde stack als zijn overige projecten) — solo-onderhoud weegt zwaar |
| Taal | TypeScript strict | Veldenmodel-discipline (AVG) wil je compile-time afgedwongen |
| Styling/UI | Tailwind CSS v4 + shadcn/ui + huisstijl-tokens in één `theme.css` | Toegankelijke primitives; tokens centraal zodat een merk-update één bestand raakt |
| DB | PostgreSQL + Prisma v7 | Relationeel model met constraints (uniques, cascades voor F-05-verwijdering); migratie-flow is ook het chat-window-mechanisme |
| Auth | iron-session + bcryptjs; magic links (M3) via ondertekende, kortlevende tokens | Geen externe auth-dienst nodig (AVG: minder verwerkers); wachtwoordloos voor vrijwilligers |
| Validatie | Zod in elke Server Action | 422-conventie |
| Test | Vitest | unit op AVG-regels (veldenmodel, sessieteller, bewaartermijn) + flows |
| E-mail (M3+) | EU-provider met verwerkersovereenkomst, of SMTP van de bibliotheek | open vraag; MVP heeft geen mail nodig |

### Bewust niet gekozen

| Technologie | Waarom niet |
|---|---|
| Supabase (auth/RLS) | Prima product, maar extra verwerker + ander auth-model; server-side rollen op deze schaal eenvoudiger en consistent met bestaande tooling van de bouwer |
| NextAuth / Auth.js | Twee rollen en magic links vragen geen framework; iron-session is hier minder bewegende delen |
| Native app | Responsive web dekt iPad/telefoon; installatiedrempel is juist een tegenargument bij deze doelgroep |
| middleware.ts | Next 16-conventie: route-bescherming in `proxy.ts` |
| Realtime (SSE/websockets) | Geen gelijktijdigheidsbehoefte; wekelijkse cadans |
| Multi-tenant opzet | Eén team, één locatie; uitbreidingsassen zitten in het datamodel, niet in tenancy |

### Auth-flow

1. Medewerker: `/login` → e-mail+wachtwoord → bcrypt-check → iron-session-cookie → `/`
2. `proxy.ts` beschermt alle routes behalve `/login` (en in M3 de magic-link-route)
3. Rolcheck server-side per action/route (`ADMIN`-only: medewerkers, cursus-bewerken, hard delete, chat-bevestiging, audit)
4. M3: vrijwilliger vraagt magic link aan (e-mail) → kortlevend token → beperkte sessie met scope "eigen voorkeur/afwezigheid + rooster"

### Omgevingsvariabelen

| Variabele | Doel |
|---|---|
| `DATABASE_URL` | PostgreSQL-connectie |
| `SESSION_SECRET` | iron-session (≥32 chars) |
| `APP_BASE_URL` | absolute links (magic links, export) |
| *(M3)* `MAIL_*` | e-mailprovider |
| *(M2)* chat-window-config | volgt uit integratiecontract (§10, open vraag) |

### Deployment & kosten

**Opties (open vraag product-spec §10.8):** (a) Vercel (EU-regio) + Neon EU — €0 op hobby/free tiers; (b) eigen Ubuntu-server met Docker + Caddy + Postgres — €0 marginaal, wel zelf beheer. Beide: dagelijkse versleutelde DB-backup, aparte demo-omgeving met dummydata, verwerkersovereenkomst met de hostingpartij vereist vóór echte data. CI: lint + typecheck + test (`npm run verify`) + build vóór elke deploy.

## 10. Chat-window: integratiecontract & guardrails

Het chat-window is een extern component (in ontwikkeling; open vraag product-spec §10.7). Deze spec definieert wat het *moet kunnen aantonen* om in deze app te mogen draaien — onafhankelijk van de implementatie:

**Contract**

1. **Identiteit:** het component erft de app-sessie; chatten kan alleen als ingelogde medewerker, en de agent kent rol + naam van de aanvrager.
2. **Capabilities, getrapt:** (a) vragen beantwoorden over de app/data — elke `STAFF`; (b) wijzigingen zonder schema-impact (UI-tekst, lijstkolom, filter) — voorstel + uitvoering na bevestiging aanvrager; (c) wijzigingen mét schema-/gedragimpact (veld, tabel, regel) — voorstel + verplichte `ADMIN`-bevestiging vóór uitvoering.
3. **Uitvoeringspad:** schemawijzigingen uitsluitend via een gegenereerde Prisma-migratie + code-wijziging die het normale verify- en deploy-pad doorloopt (geen directe `ALTER TABLE` op productie); backup-moment vóór migratie; rollback-pad gedocumenteerd per wijziging.
4. **Audit:** elke uitgevoerde wijziging schrijft een `CHAT_AGENT`-regel in `audit_logs` met verwijzing naar het verzoek.

**AVG-guardrails (hard, niet overschrijfbaar via chat)**

- Weiger velden/feature-verzoeken in strijd met het veldenmodel: BSN, geboortedatum, adres, pasnummer, gezondheids-/afkomst-/religiegegevens, niveau-labels, cliënt-login, export van cliëntdata naar externe diensten.
- Elk nieuw persoonsgegevens-veld vereist: doelomschrijving + bewaartermijn in het verzoek, en wordt gemarkeerd "FG-toets vereist" in het audit-log.
- De guardrail-lijst staat in code/config van de app (niet alleen in de agent-prompt), zodat ook een nieuwe agent-versie eraan gebonden is.

## 11. Implementatie-backlog

**Volgorde op afhankelijkheid.** Elke taak is in één sessie afrondbaar en heeft een toetsbaar "klaar wanneer".

### M0 — Fundament

- [ ] **ST-001 Scaffold** — Next.js 16 + TS strict + Tailwind v4 + shadcn/ui + Vitest; repo + CI (verify + build). *Klaar wanneer:* `npm run dev` en `npm run verify` schoon draaien.
- [ ] **ST-002 Huisstijl-thema** — `theme.css` met de tokens uit de branding-annex (kleuren, Poppins, pill-knoppen, input-radius, plectrum-kaartvariant); basislayout + navigatie. *Klaar wanneer:* voorbeeldpagina toont knoppen/velden/kaarten in huisstijl, contrastcheck gehaald.
- [ ] **ST-003 Database & schema** — Prisma-schema met álle tabellen uit §6 + migratie + seed (2 cursussen, 1 admin). *Klaar wanneer:* migratie + seed draaien op lege DB; unique-constraints aantoonbaar.
- [ ] **ST-004 Auth** — login/logout, iron-session, proxy.ts-bescherming, rolcheck-helper. *Klaar wanneer:* beschermde route zonder sessie redirect; ADMIN/STAFF-onderscheid werkt.

### M1 — De vier tabellen (kern van de MVP)

- [ ] **ST-101 Medewerkersbeheer** (F-01) — CRUD + deactiveren + wachtwoordreset, ADMIN-only. *Klaar wanneer:* alle F-01-criteria groen, incl. laatste-admin-bescherming.
- [ ] **ST-102 Vrijwilligersbeheer** (F-02) — CRUD + voorkeursvinkjes + NDA-indicator + zoeken/filter. *Klaar wanneer:* F-02-criteria groen.
- [ ] **ST-103 Cliëntenbeheer** (F-03) — CRUD met bindend veldenmodel + notitie-instructie + statusfilter. *Klaar wanneer:* F-03-criteria groen; reviewer bevestigt dat er geen verboden velden bestaan.
- [ ] **ST-104 Cursusaanbod** (F-04) — lijst + bewerken (ADMIN), seed-waarden zichtbaar. *Klaar wanneer:* F-04-criteria groen; max-sessies aanpasbaar zonder code.
- [ ] **ST-105 Export & verwijdering** (F-05) — exportpagina + hard delete met bevestiging. *Klaar wanneer:* F-05-criteria groen; cascade geverifieerd met dummytraject.
- [ ] **ST-106 Audit-log** (F-06) — schrijfpad + ADMIN-inzage. *Klaar wanneer:* cliëntmutatie produceert logregel; log-UI filtert.
- [ ] **ST-107 Startscherm** (F-08) + lege staten in B1. *Klaar wanneer:* F-08-criteria groen.

### M2 — Chat-window

- [ ] **ST-201 Inbedding** (F-07) — component achter login, sessie-doorgifte, alleen-STAFF zichtbaar. *Klaar wanneer:* medewerker kan chatten, uitgelogd niemand.
- [ ] **ST-202 Guardrails & bevestigingsflow** — capability-trappen, ADMIN-bevestiging, AVG-weigerlijst in app-config. *Klaar wanneer:* verboden-veld-verzoek wordt aantoonbaar geweigerd; schema-verzoek wacht op ADMIN.
- [ ] **ST-203 Audit-koppeling** — chat-wijzigingen in `audit_logs` incl. verzoek-referentie. *Klaar wanneer:* uitgevoerde chat-wijziging traceerbaar in log.

> **MVP eindigt hier.** Definition of done: zie §12. M3–M5 zijn de directe vervolgfases richting product-spec v1.

### M3 — Rooster

- [ ] **ST-301 Lesmomenten-generator** — alle di/do per kwartaal genereren; vervallen-status + reden. *Klaar wanneer:* Q-generatie idempotent; feestdag markeerbaar.
- [ ] **ST-302 Afwezigheid** — datumbereik invoeren (medewerker namens vrijwilliger; zelfservice in ST-305). *Klaar wanneer:* afwezigheid maakt betrokken inroosteringen `AFGEMELD`/zichtbaar open.
- [ ] **ST-303 Inroostering + conceptrooster** — rooster-week/kwartaalweergave; concept vullen op voorkeursdagen; handmatig (her)toewijzen. *Klaar wanneer:* conceptrooster volgt voorkeuren; coördinator kan alles overrulen.
- [ ] **ST-304 Bezettingsbewaking** — min/max-config; kleurindicatie; onderbezettingssignaal op startscherm. *Klaar wanneer:* gat < min kleurt en verschijnt op startscherm.
- [ ] **ST-305 Vrijwilliger-zelfservice** — magic-link-login; eigen voorkeur/afwezigheid beheren; zichzelf in-/uitschrijven op lesmomenten; rooster inzien. *Klaar wanneer:* Joke-flow (vakantie doorgeven) lukt in <2 min op iPad zonder hulp.
- [ ] **ST-306 (v2-voorschot, optioneel)** — e-mailherinnering + open-plek-oproep. *Klaar wanneer:* mails verstuurd via EU-provider met verwerkersovereenkomst.

### M4 — Leertrajecten & intake

- [ ] **ST-401 Intake-flow** — leerwens → inschatting → traject starten; leerdoel verplicht bij Les op maat. *Klaar wanneer:* Les-op-maat-traject zonder leerdoel onmogelijk.
- [ ] **ST-402 Aanwezigheid & voortgang** — per lesmoment cliënten afvinken + 1-minuut-notitie; `last_attended_on` automatisch. *Klaar wanneer:* registratie van 1 cliënt ≤ 1 minuut (handmatige toets).
- [ ] **ST-403 Sessieteller & maximum** — teller op traject; waarschuwing bij naderen/bereiken `max_sessions`. *Klaar wanneer:* 4e Les-op-maat-sessie toont "maximum bereikt" + afrondflow.
- [ ] **ST-404 Vervolgstap & afronding** — `next_step` vastleggen; traject afronden met uitkomst; doorstroom-suggesties (ander Klik & Tik-programma, Les op maat, extern aanbod). *Klaar wanneer:* afgerond traject toont doel + uitkomst + vervolgstap.
- [ ] **ST-405 Oefenen.nl-werkafspraken** — pseudoniem-generator, checklist (account/koppeling/leerroute), deeplinks per programma. *Klaar wanneer:* cliëntpagina toont checklist + werkende deeplink.

### M5 — Verantwoording & livegang

- [ ] **ST-501 Geaggregeerde rapportage** — per maand/kwartaal: actieve cliënten, sessies, afgeronde trajecten (anoniem, Bibliotheekmonitor-stijl). *Klaar wanneer:* rapport bevat geen persoonsgegevens.
- [ ] **ST-502 Bewaartermijn-opschoning** — dagelijkse job: cliënten > X mnd (default 12) na `last_attended_on` → melden + verwijderen/anonimiseren; notities eerst. *Klaar wanneer:* dummycliënt over termijn wordt gesignaleerd en opgeruimd.
- [ ] **ST-503 Toegankelijkheidspass** — WCAG 2.2 AA-controle alle schermen (toetsenbord, focus, contrast, labels). *Klaar wanneer:* geen AA-fouten op kernflows.
- [ ] **ST-504 Privacyteksten & formulieren** — B1-privacy-uitleg in-app + printbaar informatie-/toestemmingsformulier voor extra's. *Klaar wanneer:* onafhankelijke lezer (bij voorkeur een vrijwilliger) begrijpt de tekst.
- [ ] **ST-505 Governance-gate** — FG-akkoord, verwerkingsregister-opname, verwerkersovereenkomst(en), DPIA-afweging gedocumenteerd; geheimhoudingsverklaringen vrijwilligers geregistreerd. *Klaar wanneer:* checklist afgetekend — **pas hierna echte cliëntdata.**
- [ ] **ST-506 Gebruikerstest** — 1 medewerker + 1 vrijwilliger doorlopen hun kernflows zonder hulp, met dummydata. *Klaar wanneer:* beide flows zonder interventie afgerond; feedback verwerkt of als taak gelogd.

### v2-backlog (na v1)

- No-show-registratie (licht) · doorverwijsbron-veld · ICS-export · rapportage-uitbreiding · oefenen.nl-export-import (indien blijkt te bestaan) · meerdere locaties/diensten (zie product-spec §9).

## 12. Definition of MVP done

- [ ] Alle taken M0–M2 afgerond; `npm run verify` en build groen
- [ ] Een medewerker kan inloggen en alle vier de tabellen volledig beheren (F-01 t/m F-04)
- [ ] Cliënt-export en definitieve verwijdering aantoonbaar gedemonstreerd met dummydata (F-05)
- [ ] Audit-log registreert cliëntmutaties én chat-wijzigingen (F-06)
- [ ] Chat-window bruikbaar voor medewerkers; AVG-guardrails aantoonbaar actief (verboden-veld-test) (F-07, §10)
- [ ] Huisstijl-thema toegepast; NL/B1; geen WCAG-AA-blokkers op de MVP-schermen
- [ ] Er staan **geen echte cliëntgegevens** in enige omgeving (governance-gate ST-505 is een M5-vereiste, geen MVP-vereiste — de MVP is een werkende demo met dummydata waarmee het gesprek met de bibliotheek gevoerd wordt)
