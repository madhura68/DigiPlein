# Gebruikersbeheer Beheerlaag Specificatie

Datum: 2026-06-15
Product: DigiPlein
Status: herzien na Claude NO-GO review

## Doel

DigiPlein krijgt een beheerlaag voor bibliotheekmedewerkers. Een beheerder kan een medewerker registreren met naam, e-mailadres en rol. De app verstuurt daarna een e-mail met een kortlevende uitnodigingslink. Via die link logt de medewerker eenmalig in en moet die direct een eigen wachtwoord instellen voordat de rest van de app bruikbaar is.

De bestaande pagina's `/medewerkers` en `/audit` worden gegroepeerd onder een nieuw hoofdmenu-item `Beheer`. Het menu-item is alleen zichtbaar voor `ADMIN`; de onderliggende routes blijven server-side beschermd.

## Bestaande Context

- Auth gebruikt `iron-session` en `bcryptjs` volgens ADR-0005.
- Rollen zijn beperkt tot `ADMIN` en `STAFF`.
- `StaffMember` bestaat al met `name`, `email`, `passwordHash`, `role` en `isActive`.
- `/medewerkers` bestaat al als ADMIN-only beheerpagina, maar maakt nu direct een initieel wachtwoord aan.
- `/audit` bestaat al als ADMIN-only auditpagina.
- Navigatie is centraal in `components/nav-items.ts` en wordt op desktop en mobiel met dezelfde rolfiltering gebruikt.
- Auditregels mogen geen gevoelige inhoud bevatten.

## Scope

Wel in scope:

- `ADMIN` kan medewerkers registreren zonder initieel wachtwoord in de UI.
- Registratie maakt een actieve medewerker aan met een tijdelijke niet-bruikbare wachtwoordhash en een eenmalige uitnodiging.
- Registratie verstuurt een e-mail met uitnodigingslink.
- Uitnodigingslink is kortlevend, eenmalig bruikbaar en server-side gehashed opgeslagen.
- `/uitnodiging/<token>` is publiek bereikbaar via een expliciete `proxy.ts`-bypass; tokenvalidatie blijft volledig server-side.
- Eerste login via uitnodigingslink zet een sessie en markeert de sessie als `mustChangePassword`.
- Zolang `mustChangePassword` waar is, mag de medewerker alleen naar `/account/wachtwoord` en logout.
- Wachtwoord wijzigen vanuit die flow vereist geen huidig wachtwoord, maar wel nieuw wachtwoord + bevestiging.
- Gewone wachtwoordwijziging blijft het huidige wachtwoord vereisen.
- Beheerder kan via dezelfde beheerpagina opnieuw een uitnodiging sturen als vervanging voor het huidige reset-met-wachtwoord patroon.
- Medewerkerregistratie, uitnodiging opnieuw versturen en wachtwoord instellen schrijven persoonsgegevens-arme auditregels.
- Navigatie krijgt een hoofditem `Beheer` met onderliggende items `Gebruikersbeheer` en `Audit-log`.

Niet in scope:

- Zelfservice "wachtwoord vergeten".
- SSO/OAuth.
- Cliënt- of vrijwilligeraccounts.
- Nieuwe rollen buiten `ADMIN` en `STAFF`.
- Productiecontract met een specifieke e-mailprovider; de app krijgt wel een mail-adapter en env-configuratie.

## Gebruikersflows

### Nieuwe medewerker registreren

1. Beheerder opent `Beheer` > `Gebruikersbeheer`.
2. Beheerder kiest `Nieuwe medewerker`.
3. Formulier vraagt `Naam`, `E-mailadres` en `Rol`.
4. Server action valideert met Zod `.strict()`, vereist `ADMIN`, normaliseert e-mail via `normalizeStaffEmail()` en weigert dubbele e-mail.
5. App maakt of actualiseert de medewerker niet stilzwijgend; bij dubbele e-mail volgt een 422-validatiefout.
6. App draait opportunistisch invite- en pairing-cleanup, maakt daarna in één transactie de medewerker en een `StaffInvite` met token-hash, vervaltijd en actor.
7. De medewerker krijgt een geldige bcrypt-hash van een niet-gedeelde random placeholder, zodat e-mail+wachtwoord-login niet bruikbaar is vóór de uitnodigingsflow.
8. App commit de medewerker + invite en verstuurt daarna een e-mail met link naar `/uitnodiging/<token>`.
9. Bij succesvolle mail toont de UI: `Uitnodiging verzonden.`
10. Bij mailfout blijft de medewerker + invite bestaan en toont de UI neutraal: `Medewerker aangemaakt, maar de uitnodigingsmail kon niet worden verzonden. Gebruik Nieuwe uitnodiging sturen.`

### Uitnodiging accepteren

1. Medewerker opent `/uitnodiging/<token>`.
2. `proxy.ts` laat `/uitnodiging/` zonder sessie door; alle andere data-routes blijven achter login.
3. `/uitnodiging/[token]` is een read-only page: hij schrijft geen cookies en muteert geen database. De page controleert token-hash, vervaltijd, gebruiksstatus en actieve medewerker en toont óf een neutrale fout óf een knop `Uitnodiging accepteren`.
4. De knop submit naar een server action `acceptStaffInvite(token)`.
5. `acceptStaffInvite` draait opportunistisch invite- en pairing-cleanup.
6. `acceptStaffInvite` consumeert de token atomisch met guarded `updateMany` binnen een transactie: `tokenHash`, `usedAt: null`, `revokedAt: null`, `expiresAt: { gt: now }` en actieve medewerker moeten tegelijk gelden. Alleen `count === 1` is succes.
7. Pas na succesvolle consume zet de action de sessie volledig opnieuw: `staffId`, `name`, `role`, `mustChangePassword: true`; pairingvelden `paired` en `pairedExpiresAt` worden gewist.
8. De action redirect naar `/account/wachtwoord`.
9. De wachtwoordpagina ziet `session.mustChangePassword` en toont alleen `Nieuw wachtwoord` en `Nieuw wachtwoord herhalen`.
10. Na succesvolle wijziging wordt de bcrypt-hash opgeslagen, `mustChangePassword` op `undefined` gezet, `session.save()` aangeroepen en de medewerker naar `/` gestuurd.

### Wachtwoord resetten door beheerder

1. Beheerder kiest bij een medewerker `Nieuwe uitnodiging sturen`.
2. App trekt in dezelfde transactie oudere open uitnodigingen voor die medewerker in en maakt precies één nieuwe uitnodiging.
3. App verstuurt een nieuwe e-mail.
4. De medewerker volgt dezelfde verplichte-wachtwoord-flow.
5. Keuze: opnieuw uitnodigen is toegestaan voor actieve medewerkers, ook als ze al een wachtwoord hebben. De nieuwe uitnodiging dwingt na accept opnieuw `mustChangePassword` af.

## Datamodel

Nieuw model:

```prisma
model StaffInvite {
  id          String      @id @default(cuid())
  tokenHash   String      @unique @map("token_hash")
  staffId     String      @map("staff_id") @db.Uuid
  createdById String      @map("created_by_id") @db.Uuid
  createdAt   DateTime    @default(now()) @map("created_at") @db.Timestamptz
  expiresAt   DateTime    @map("expires_at") @db.Timestamptz
  usedAt      DateTime?   @map("used_at") @db.Timestamptz
  revokedAt   DateTime?   @map("revoked_at") @db.Timestamptz
  staff       StaffMember @relation("StaffInviteTarget", fields: [staffId], references: [id], onDelete: Cascade)
  createdBy   StaffMember @relation("StaffInviteCreator", fields: [createdById], references: [id], onDelete: Restrict)

  @@index([staffId, expiresAt])
  @@index([expiresAt])
  @@map("staff_invites")
}
```

Aanpassing aan `StaffMember`:

- Voeg relatie `invites StaffInvite[] @relation("StaffInviteTarget")` toe.
- Voeg relatie `createdStaffInvites StaffInvite[] @relation("StaffInviteCreator")` toe.
- Geen nieuw rolmodel.
- Geen persoonsgegevens buiten naam/e-mail.

Sessie-aanpassing:

```ts
interface SessionData {
  staffId: string
  name: string
  role: StaffRole
  paired?: boolean
  pairedExpiresAt?: number
  mustChangePassword?: boolean
}
```

## Token- en Mailontwerp

- Token is minimaal 32 bytes random, URL-safe.
- Alleen SHA-256 token-hash wordt opgeslagen.
- Geldigheid: 72 uur.
- Open uitnodigingen voor dezelfde medewerker worden ingetrokken bij het maken van een nieuwe uitnodiging.
- Linkbasis komt uit `APP_BASE_URL`.
- Mailboundary: `sendStaffInviteEmail({ to, name, inviteUrl, expiresAt })`.
- Mailtransport komt uit Zod-env `MAIL_TRANSPORT`; default in development/test is `noop`.
- `noop` en tests versturen niets extern en loggen nooit token of inviteUrl.
- Productie gebruikt env-configuratie voor SMTP of een bibliotheekprovider zodra die bekend is.
- Tot EU/AVG-passende provider, verwerkersovereenkomst en FG-akkoord rond zijn, gaan er geen echte medewerker-e-mailadressen naar een externe provider.
- Retentie: pending invites worden verwijderd na `expiresAt`; gebruikte en ingetrokken invites worden na 7 dagen verwijderd.
- Cleanup-call-sites: `createStaff`, `resendStaffInvite` en `acceptStaffInvite` roepen opportunistisch `cleanupExpiredStaffInvites()` aan. In dezelfde cleanup-laag wordt de bestaande `cleanupExpiredPairings()` ook aangeroepen, zodat de al bestaande pairing-cleanup geen dode code blijft.
- E-mailnormalisatie staat in één gedeelde helper `normalizeStaffEmail(value): string`, minimaal `trim().toLowerCase()`. Deze helper wordt gebruikt in `createStaff`, `updateStaff`, `verifyStaff` en alle toekomstige staff-email-lookups.

## Navigatie en UI

Nieuw navigatiemodel:

```ts
type NavItem = {
  href?: string
  label: string
  adminOnly?: boolean
  children?: NavItem[]
}
```

Desktop:

- `Beheer` verschijnt als admin-only hoofditem.
- Subitems `Gebruikersbeheer` en `Audit-log` zijn zichtbaar als tweede niveau volgens het bestaande compacte shell-patroon.
- `navItemsForRole()` filtert recursief: een parent zonder zichtbare children verdwijnt.
- `isActive()` markeert een parent actief als een child actief is. `Beheer` heeft geen eigen `href`; `/medewerkers`, `/medewerkers/nieuw` en `/audit` markeren `Beheer` actief.
- `app-shell.tsx` rendert het tweede niveau op desktop zonder hover-only afhankelijkheid; toetsenbordgebruikers kunnen de links direct bereiken.

Mobiel:

- Drawer toont `Beheer` met de twee subitems eronder.
- Alle klikdoelen blijven minimaal 44px.
- Dezelfde rolfiltering wordt gebruikt als desktop.
- `mobile-nav-drawer.tsx` rendert hetzelfde twee-niveau-model en sluit na een child-navigatieklik.

Paginahernoeming:

- `/medewerkers` behoudt de route, maar UI-label wordt `Gebruikersbeheer`.
- `/audit` behoudt label `Audit-log`.

## Beveiliging

- Alle mutaties gebruiken `requireAdmin()`.
- `proxy.ts` krijgt een expliciete publieke bypass voor `pathname.startsWith('/uitnodiging/')`. Uitnodiging accepteren is de enige publieke page-route voor medewerkers naast `/login`; bestaande `/api/*`-routes blijven hun eigen auth afhandelen.
- Tokenfouten zijn neutraal: geen onderscheid tussen onbekend, verlopen, gebruikt of gedeactiveerd.
- `mustChangePassword` wordt server-side afgedwongen door `requireStaff(options?: { allowPasswordChange?: boolean })`.
- Standaard redirect `requireStaff()` bij `session.mustChangePassword` naar `/account/wachtwoord`.
- Alleen `/account/wachtwoord` page/action gebruiken `requireStaff({ allowPasswordChange: true })`; logout heeft geen `requireStaff()` nodig en blijft bereikbaar.
- `requireAdmin()` blijft op `requireStaff()` bouwen, dus beheer- en audit-routes zijn automatisch geblokkeerd zolang het wachtwoord nog verplicht gewijzigd moet worden.
- Laatste-admin-bescherming blijft gelden bij rolwijziging en deactiveren.
- E-mail bevat geen tijdelijk wachtwoord.
- Auditregels bevatten alleen actie, entiteit en technische samenvatting, geen uitnodigingstoken en geen inhoudelijke persoonsgegevens buiten actor/entity-id.
- `acceptStaffInvite` zet alle sessievelden opnieuw en wist pairingvelden om sessiefixatie tussen QR-pairing en uitnodigingsflow te voorkomen.

## Audit

Nieuwe auditacties:

- `INVITE_CREATED` op entity `staff_member`: `Medewerkeruitnodiging verzonden`.
- `INVITE_REVOKED` op entity `staff_member`: `Oude medewerkeruitnodiging ingetrokken`.
- `PASSWORD_SET` op entity `staff_member`: `Medewerker heeft wachtwoord ingesteld`.

De summary bevat geen naam, e-mailadres, token of link.

Implementatie-eis:

- Voeg een parameter-arme builder toe, bijvoorbeeld `staffInviteAuditSummary(action)`, die alleen de drie vaste teksten hierboven kan teruggeven.
- Staff-uitnodigingsacties roepen `writeAuditLog` aan met `entity: 'staff_member'`, `entityId: staffId`, `actorType: 'STAFF'` en `actorId` van de beheerder of medewerker.
- Tests bewijzen dat staff-auditregels geen e-mailpatroon, `http`, token of inviteUrl bevatten.

## Foutafhandeling

- Ongeldige registratie-invoer: 422 met B1-tekst.
- Dubbel e-mailadres: 422.
- Mailverzending faalt na database-aanmaak: action retourneert status 500 met neutrale UI-tekst en laat de uitnodiging bestaan, zodat beheerder `Nieuwe uitnodiging sturen` kan gebruiken.
- Verlopen uitnodiging: neutrale foutpagina met instructie om de beheerder om een nieuwe uitnodiging te vragen.
- Gedeactiveerde medewerker: uitnodiging kan niet worden geaccepteerd.

## Tests en Verificatie

Automatische tests:

- Prisma schema bevat `StaffInvite` met token-hash, staff-relatie, verval- en gebruiksvelden.
- `proxy.ts` laat onauth `GET /uitnodiging/<token>` door naar de page en redirect niet naar `/login`.
- `/uitnodiging/[token]` schrijft geen cookie tijdens render; accept loopt via server action.
- `createStaff` vereist `ADMIN`, accepteert geen wachtwoordveld meer, maakt medewerker + uitnodiging en roept mailboundary aan.
- `createStaff` normaliseert e-mail met dezelfde helper als `verifyStaff` en `updateStaff`.
- Dubbel e-mailadres blijft 422.
- `resendStaffInvite` trekt bestaande open uitnodigingen in en verstuurt een nieuwe mail.
- Twee gelijktijdige resends leveren maximaal één open uitnodiging op.
- Uitnodiging accepteren weigert verlopen/gebruikt/gedeactiveerd neutraal.
- Uitnodiging accepteren gebruikt guarded `updateMany`; twee gelijktijdige accepts leveren precies één sessie op.
- Uitnodiging accepteren zet `mustChangePassword` in sessie, wist pairingvelden en gebruikt token eenmalig.
- Wachtwoord wijzigen in `mustChangePassword`-flow vereist geen huidig wachtwoord, slaat bcrypt-hash op, zet `session.mustChangePassword = undefined` en roept `session.save()` aan.
- Gewone wachtwoordwijziging blijft huidig wachtwoord eisen.
- Login met andere casing dan opgeslagen e-mail werkt; twee staff-records die alleen in casing verschillen worden geweigerd.
- Navigatie toont voor `ADMIN` het hoofditem `Beheer` met `Gebruikersbeheer` en `Audit-log`; `STAFF` ziet `Beheer` niet; parent-active werkt op childroutes.
- `/medewerkers` en `/audit` blijven server-side `ADMIN`-only.
- Auditregels voor uitnodiging en wachtwoord instellen bevatten geen token, link of e-mailadres.
- `cleanupExpiredStaffInvites()` en `cleanupExpiredPairings()` hebben call-sites en tests.
- `MAIL_TRANSPORT=noop` verstuurt niets extern en logt geen token of inviteUrl.

Handmatige controle:

- Desktop en mobiel menu tonen geen overlap en blijven bruikbaar op 390px breed.
- Eerste-login-flow blokkeert toegang tot `/`, `/clienten`, `/vrijwilligers`, `/cursusaanbod`, `/audit` en `/medewerkers` tot wachtwoordwijziging is afgerond.

Verify-gate:

```bash
npm run verify
npm run build
```

## Acceptatiecriteria

- Een beheerder kan een nieuwe medewerker registreren met naam, e-mail en rol.
- De medewerker ontvangt een uitnodigingslink per e-mail; er wordt geen wachtwoord gedeeld.
- De uitnodigingslink is kortlevend en eenmalig bruikbaar.
- De uitnodigingsroute is publiek bereikbaar zonder sessie maar valideert token server-side en schrijft pas via de accept-action.
- Na openen van de link is de medewerker ingelogd maar moet direct een eigen wachtwoord instellen.
- Zonder ingestelde eigen wachtwoord blijft alle appfunctionaliteit behalve wachtwoord instellen en uitloggen geblokkeerd.
- `Beheer` staat als nieuw admin-only navigatie-item in desktop- en mobiel menu.
- Onder `Beheer` staan `Gebruikersbeheer` en `Audit-log`.
- STAFF ziet het beheermenu niet en kan beheeracties niet direct uitvoeren.
- Audit-log registreert registratie-/uitnodigings- en wachtwoord-instelacties zonder token, link of e-mailadres.
- E-mailadressen worden bij schrijven en login consistent genormaliseerd.
- Er blijft maximaal één open uitnodiging per medewerker over na resend, ook bij gelijktijdige requests.
- Oude invites en verlopen pairings worden opportunistisch opgeschoond.
- `npm run verify && npm run build` is groen.

## Open Beslissing

De productie-mailprovider is nog niet gekozen. De implementatie maakt daarom een kleine adapter met env-configuratie en tests rond de boundary. In productie moet vóór livegang worden vastgelegd welke EU/AVG-passende provider of bibliotheek-SMTP wordt gebruikt.
