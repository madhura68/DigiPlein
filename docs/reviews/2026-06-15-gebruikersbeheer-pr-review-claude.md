# PR-review — ST-026 Gebruikersbeheer via uitnodiging + Beheer-navigatie

Reviewer: Claude op mac via `s4m-queue`  
Queue reply: `40ef4ed5-9f00-453d-a003-1f67d08d41d8`  
Status: NO-GO, licht

## Conclusie

De kern is technisch solide en de onafhankelijke verify/build was groen, maar twee expliciete acceptatiecriteria waren nog niet gehaald:

1. `/uitnodiging/[token]` valideerde de token niet in de read-only pagina en slikte de `410` state uit de action in.
2. `PASSWORD_SET` audit ontbrak bij het instellen van het verplichte wachtwoord.

## Blokkerend

### R1 — Uitnodigingspagina toont geen neutrale fout

`app/uitnodiging/[token]/page.tsx` toonde altijd de acceptatieknop. Bij een ongeldig, verlopen of gebruikt token gaf de action wel `{ status: 410 }` terug, maar de pagina toonde die niet. Fix vereist: page read-only valideren of action-state tonen, met neutrale fouttekst en zonder accountdetails.

### R2 — `PASSWORD_SET` audit ontbreekt

`app/account/wachtwoord/actions.ts` schreef geen auditregel na een forced password set. Fix vereist: na succesvolle forced password update een auditregel met `action: 'PASSWORD_SET'`, `entity: 'staff_member'`, `entityId: session.staffId` en een vaste persoonsgegevens-arme summary.

## Aanbevolen Voor Merge

- Schrijf `INVITE_REVOKED` audit wanneer resend openstaande invites intrekt.
- Gebruik `entity: 'staff_member'` voor invite-auditregels, zodat het auditspoor onder de medewerker groepeert.
- Voeg race-regressietest toe voor concurrent accept.
- Lijn invite-retentie uit met de specificatie: 7 dagen in plaats van 24 uur, of documenteer de afwijking.

## Minor

- Schrijf create-audit ook als de maildelivery faalt nadat medewerker en invite al zijn aangemaakt.
- Desktop nav kan nog een expliciete focus-ring krijgen; parent en child hebben nu allebei active-state.
- Breid PII-weigertest uit naar `resent`/`accepted`/`revoked`.

## Geverifieerd Sterk

- Invite-token is niet bruikbaar als wachtwoord.
- Atomische eenmalige consume via guarded `updateMany`.
- Forced-password gate is loopvrij.
- STAFF ziet geen `Beheer`; ADMIN wel.
- Mail-noop logt geen token, link, naam of e-mail.
- `npm run verify` en `npm run build` waren groen bij review.
