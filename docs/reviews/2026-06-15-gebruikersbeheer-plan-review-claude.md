# Review — Gebruikersbeheer Beheerlaag Implementatieplan

Datum: 2026-06-15
Reviewer: Claude via `s4m-queue`
Queue-id: `b2022129-20da-47cf-9669-a9040ea342ff`
Review van: `docs/superpowers/plans/2026-06-15-gebruikersbeheer-beheerlaag.md`

## Conclusie

**NO-GO** — drie concrete planwijzigingen vereist.

## Blokkers

1. **Placeholder-wachtwoord mag nooit de uitnodigingstoken zijn.**  
   Het plan liet ruimte om `createStaffInviteToken()` voor zowel de gemailde uitnodigingstoken als het bcrypt-placeholder-wachtwoord te gebruiken. Dat zou login met e-mail + token mogelijk maken. Plan moet een onafhankelijke random placeholder eisen en testen dat `verifyStaff(email, rawInviteToken)` `null` geeft.

2. **App-shell testupdates ontbreken.**  
   Het plan wijzigt navigatie naar een parent `Beheer` met child-links, maar specificeert de nieuwe `app-shell.test.tsx` assertions niet concreet genoeg. Plan moet expliciet testen dat ADMIN `Beheer` plus child-links ziet en STAFF geen `Beheer`.

3. **Bestaande `createStaff` tests blijven oude `password` payloads gebruiken.**  
   Dubbel-email- en rolcheck-tests moeten zonder `password` draaien; de oude wachtwoord-lengte-test moet verdwijnen of vervangen worden door een test dat een extra `password`-veld door `.strict()` wordt geweigerd.

## Niet-Blokkerend Voor Implementatie

- Voeg migratie-apply/drift-check toe voor smoke, omdat `verify` en `build` Prisma migraties niet toepassen.
- Maak expliciet of gedeactiveerde medewerker-uitnodigingen bij accept verbruikt worden; het huidige plan verbrandt de token na guarded update.
- Overweeg cleanup buiten de accept-transactie, zodat cleanup-fouten een geldige accept niet blokkeren.
- Houd `requireStaff({ allowPasswordChange: true })` zowel in de wachtwoordpagina als in de action.

## Verwerking

De drie blockers worden in het plan verwerkt en daarna opnieuw naar Claude gestuurd voor GO/NO-GO.
