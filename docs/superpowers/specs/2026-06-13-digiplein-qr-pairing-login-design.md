---
title: "DigiPlein QR-pairing login"
status: active
design_status: approved-design
date: 2026-06-13
product_id: cmq9hybds0003v27r99zvo92k
source: "Scrum4Me QR-pairing login flow"
---

# DigiPlein QR-pairing login

## Doel

DigiPlein krijgt QR-pairing als extra loginpad naast de bestaande
e-mail+wachtwoord-login. Een medewerker die al op een mobiel apparaat is
ingelogd kan een desktop-browser inloggen door een QR-code te scannen en de
aanmelding te bevestigen. De desktop krijgt daarna een normale DigiPlein
iron-session met `{ staffId, name, role }`.

De bestaande wachtwoord-login, rollen (`ADMIN`/`STAFF`) en server-side
autorisatie blijven ongewijzigd.

## Gekozen aanpak

Neem de Scrum4Me QR-pairing flow vrijwel een-op-een over, maar pas de
identiteit aan van `User` naar `StaffMember`.

De flow bestaat uit:

1. Desktop klikt op `/login` op `Inloggen via mobiel`.
2. `POST /api/auth/pair/start` maakt een pending pairing aan.
3. De desktop krijgt een HttpOnly pre-auth cookie en toont een QR-code.
4. De QR-code opent mobiel `/m/pair#id=...&s=...`.
5. De mobiele route vereist een bestaande DigiPlein-sessie.
6. De medewerker ziet browser/IP-context en bevestigt of annuleert.
7. De desktop luistert via SSE op pairing-status.
8. Bij `approved` claimt de desktop de pairing met zijn HttpOnly cookie.
9. `POST /api/auth/pair/claim` zet de normale DigiPlein iron-session en
   redirect naar `/`.
10. Als een paired desktop-sessie verloopt, redirect `requireStaff()` naar een
    route handler die de session-cookie wist en daarna naar `/login` gaat.

## Overwogen opties

### 1. Scrum4Me-flow met SSE en LISTEN/NOTIFY

Voorkeur. Dit behoudt het bewezen securitymodel uit Scrum4Me:
gescheiden mobile secret en desktop token, alleen hashes in de database,
HttpOnly path-scoped cookie voor desktop, QR-fragment voor het mobiele secret,
en een atomische claim-stap.

Nadeel: iets meer infrastructuur dan polling, inclusief Postgres
LISTEN/NOTIFY en een SSE-route.

### 2. Polling-variant

Zelfde secrets en database, maar desktop pollt status. Simpeler, maar minder
trouw aan Scrum4Me en minder netjes voor de desktop-ervaring.

### 3. Alleen QA/test-login

Niet gekozen. De gewenste functionaliteit is een normaal extra loginpad voor
DigiPlein-medewerkers, niet een test-only bypass.

## Data

Voeg een `LoginPairing` model toe aan Prisma, gemapt naar `login_pairings`.
De tabel is gebaseerd op Scrum4Me, met `staff_id` in plaats van `user_id`.

Velden:

- `id`: cuid primary key.
- `secret_hash`: sha256-hash van het mobiele secret.
- `desktop_token_hash`: sha256-hash van het desktop-token.
- `status`: Prisma-enum `PairingStatus` met `pending`, `approved`,
  `consumed` en `cancelled`.
- `staff_id`: optionele foreign key naar `staff_members.id`, `ON DELETE SET NULL`.
  Het scalarveld is `@db.Uuid`, omdat `StaffMember.id` ook uuid is.
- `desktop_ua`: browser user-agent, maximaal 255 tekens.
- `desktop_ip`: IP-adres, maximaal 45 tekens.
- `created_at`, `expires_at`, `approved_at`, `consumed_at`.

Indexes:

- `expires_at`.
- `(status, expires_at)`.

Migratie:

- Maak de tabel aan.
- Voeg een Postgres trigger toe die bij insert/update een JSON-payload op
  kanaal `digiplein_pairing` publiceert.
- Voeg een cleanup-pad toe voor verlopen of afgehandelde pairings. MVP-keuze:
  een route handler of cron-pad verwijdert `consumed`/`cancelled` pairings en
  verlopen `pending` pairings na maximaal 24 uur.

## Security

De pairing gebruikt twee onafhankelijke 256-bit secrets.

- `mobileSecret`: gaat alleen naar de desktop-JS en in het QR-fragment. Het
  fragment wordt niet naar de server gestuurd bij navigatie.
- `desktopToken`: wordt alleen als HttpOnly cookie gezet met path
  `/api/auth/pair`. De cookie krijgt een DigiPlein-specifieke naam, niet de
  Scrum4Me-naam `s4m_pair`.
- De database bewaart alleen sha256-hashes.
- Secret-verificatie gebruikt timing-safe compare.
- Pending pairings verlopen na 5 minuten.
- Approved pairings blijven kort claimbaar, ook 5 minuten.
- De claim is atomisch: alleen een rij met `status='approved'`, matching
  desktop-token-hash en niet-verlopen `expires_at` wordt `consumed`.
- Paired desktop-sessies krijgen een marker `paired` en `pairedExpiresAt`; bij
  claim wordt `pairedExpiresAt` gezet op 8 uur na claim, gelijk aan het
  Scrum4Me-patroon.
- Verlopen paired sessions worden niet in `requireStaff()` zelf vernietigd,
  omdat Server Components geen cookies mogen muteren. `requireStaff()`
  redirect naar een route handler, bijvoorbeeld
  `/api/auth/logout?reason=paired-expired`, die de sessie vernietigt en daarna
  naar `/login` redirect.
- Client-IP voor `desktop_ip` en rate limiting komt alleen uit trusted proxy
  context. De route vertrouwt geen spoofbare `X-Forwarded-For` van willekeurige
  clients; Caddy-forwarded headers worden alleen gebruikt wanneer de request
  daadwerkelijk via de bekende proxy komt.
- De QR-pairing flow kan worden misbruikt als phishingprompt wanneer een
  aanvaller zijn eigen desktoppairing laat scannen. Daarom is de mobiele
  bevestigingskaart een security-control: browser/IP-context moet prominent
  zijn en de tekst moet expliciet zeggen dat de medewerker alleen bevestigt als
  hij of zij de desktop-login zojuist zelf startte.
- Demo-mode uit Scrum4Me wordt niet overgenomen, omdat DigiPlein geen
  demo-accountmodel heeft.

AVG-impact is beperkt: er worden geen clientgegevens opgeslagen. De tabel bevat
alleen technische loginstatus, staff-id na bevestiging, browser en IP voor
bevestigingscontext. Omdat IP-adres en user-agent medewerker-persoonsgegevens
kunnen zijn, worden afgehandelde/verlopen pairingrijen kort bewaard en daarna
opgeruimd.

## API En Actions

Nieuwe helpers:

- `lib/auth/pairing.ts`: secrets genereren, hash/verificatie,
  `isPairedSessionExpired`.
- `lib/auth/pair-cookie.ts`: path-scoped HttpOnly cookie zetten, lezen en
  wissen.
- `lib/rate-limit.ts`: eenvoudige in-memory limiter voor `pair-start`.
- `lib/request-ip.ts` of vergelijkbaar: trusted client-IP bepalen achter Caddy.

Nieuwe routes:

- `POST /api/auth/pair/start`: anoniem, rate-limited, maakt pending pairing,
  zet desktop-cookie en retourneert `pairingId`, `expiresAt` en `qrUrl`.
  De rate-limit gebruikt alleen de trusted client-IP.
- `GET /api/auth/pair/stream/[pairingId]`: vereist desktop-cookie, valideert
  token-hash en streamt status via SSE. De implementatie gebruikt een dedicated
  directe `pg`-client, activeert `LISTEN` vóór de definitieve status-read,
  leest daarna de status opnieuw om de approve-race te dichten, stuurt
  heartbeats, sluit hard na 240 seconden en sluit de `pg`-client bij abort,
  terminale status of fout.
- `POST /api/auth/pair/claim`: vereist desktop-cookie, claimt atomisch en zet
  `{ staffId, name, role, paired, pairedExpiresAt }` in de iron-session.
- `GET /api/auth/logout?reason=paired-expired`: vernietigt de session-cookie in
  een route handler en redirect naar `/login`.
- Cleanup-route of cron-pad: verwijdert pairingrijen volgens de 24-uurs
  retentie-afspraak.

Nieuwe server actions:

- `getPairingForApproval(pairingId, mobileSecret)`: mobiel read-only, vereist
  bestaande staff-sessie.
- `approvePairing(pairingId, mobileSecret)`: mobiel, vereist bestaande
  staff-sessie en actief staff-account.
- `cancelPairing(pairingId, mobileSecret)`: mobiel, vereist bestaande
  staff-sessie.

## UI

Desktop:

- `/login` behoudt het bestaande formulier.
- Onder het formulier komt een scheiding met `of` en een knop
  `Inloggen via mobiel`.
- Bij starten verschijnt een QR-code met afteller.
- Bij verlopen toont de UI een vernieuw-knop.
- Bij goedkeuring redirect de desktop naar `/`.

Mobiel:

- Nieuwe route `/m/pair`.
- De route is beschermd door de bestaande DigiPlein-sessie.
- De bevestigingskaart toont browser/IP-context, de naam van de ingelogde
  medewerker en knoppen `Bevestig` en `Annuleer`.
- De bevestigingskaart toont expliciet: bevestig alleen als je deze login
  zojuist zelf op dit desktopapparaat startte. Browser en IP staan prominent
  genoeg om een onbekende aanvraag op te merken.
- Na bevestiging wordt de URL-hash gewist en toont de pagina een klaar-status.

De UI gebruikt bestaande DigiPlein componenten en huisstijl. Er komen geen
Radix-imports en geen `asChild`-patroon bij.

## Foutafhandeling

- Start zonder rate-limitruimte: 429.
- Stream zonder desktop-cookie: 401.
- Stream met verlopen pairing: 410.
- Mobiel zonder sessie: terug naar login via bestaande routebescherming.
  Het URL-fragment gaat daarbij verloren; voor MVP scant de medewerker daarna
  opnieuw.
- Ongeldig mobile secret: neutrale fout in de mobiele bevestiging.
- Tweede claim of geannuleerde pairing: 410 en desktop-cookie wissen.
- Cookie/hash mismatch: 401 en desktop-cookie wissen.
- Verlopen paired desktop-sessie: server-side redirect naar de logout-route die
  de cookie wist, daarna `/login`. Geen destroy in een Server Component.

## Tests

Unit en route-tests:

- Crypto helpers: secrets, hashing, timing-safe verificatie en paired-expiry.
- Pair-cookie helpers: juiste cookie-naam, path, max-age en secure-flag.
- Trusted client-IP helper: vertrouwt geen spoofbare forwarded-header buiten de
  bekende proxy-context.
- `pair/start`: maakt pairing, hasht secrets, zet cookie, rate-limit op trusted
  IP en schrijft `staff_id` nooit vóór mobiele approve.
- `pair/stream`: weigert zonder cookie, onbekende/verlopen/mismatch pairing.
  Test ook de approve-race, hard-close en cleanup van de dedicated `pg`-client.
- `pair/claim`: success zet DigiPlein sessie; missing cookie, invalid body,
  double claim, mismatch en staff zonder geldig account.
- Mobile actions: require sessie, validate secret, approve/cancel transitions.
- Paired-expiry: `requireStaff()` redirect naar logout-route; de route handler
  wist de cookie; gewone wachtwoordsessies blijven werken.
- Cleanup: verlopen/afgehandelde pairingrijen worden verwijderd volgens
  retentie-afspraak.

Render-tests:

- Loginpagina toont bestaande login plus QR-login optie.
- QR-login desktop-component toont idle, loading, QR, expired en claiming state.
- Mobiele pairing-pagina toont loading, invalid, ready, approved en cancelled.

Verificatie:

- `npm run verify`.
- `npm run build`.
- Lichte a11y-check op desktop login en mobiele bevestigingsflow:
  toetsenbordbediening, zichtbare focus, labels, contrast en klikdoelgrootte.

## Buiten Scope

- Wachtwoord-login vervangen.
- Vrijwilliger-login of magic links.
- Cliënt-login.
- Device-management of overzicht van gekoppelde apparaten.
- E-mailnotificaties bij pairing.
- Redis/distributed rate limiting; in-memory is voldoende voor het MVP-pad.
