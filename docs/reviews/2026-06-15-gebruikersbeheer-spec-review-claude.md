# Review — Gebruikersbeheer Beheerlaag Specificatie

Datum: 2026-06-15
Reviewer: Claude via `s4m-queue`
Queue-id: `06ae26e9-6461-4808-bafa-1ca65b315f5c`
Review van: `docs/superpowers/specs/2026-06-15-gebruikersbeheer-beheerlaag-design.md`

## Conclusie

**NO-GO** — licht. Het ontwerp is gezond en AVG-bewust, maar vijf mechanismen moeten concreter worden gespecificeerd voordat implementatie mag starten.

## Blokkerende Wijzigingen

1. **Publieke uitnodigingsroute ontbreekt in `proxy.ts`.**  
   `/uitnodiging/<token>` zou zonder sessie nu naar `/login` redirecten. De spec moet expliciet eisen dat `/uitnodiging/` publiek door de proxy mag, terwijl tokenvalidatie server-side blijft.

2. **Accept-invite mag geen muterende page-render zijn.**  
   Een App Router page kan tijdens render geen sessiecookie schrijven. De spec moet een read-only uitnodigingspagina plus server action/POST-route of een GET route handler kiezen voor consume + login + redirect.

3. **Token-consume moet atomisch zijn.**  
   De spec moet guarded `updateMany` eisen met `usedAt: null`, `revokedAt: null`, `expiresAt > now` en `count === 1`, plus actieve-medewerker-check in dezelfde transactie/guard. Test twee gelijktijdige accepts.

4. **`mustChangePassword`-afdwinging moet loop-vrij zijn.**  
   `requireStaff()` heeft nu geen pathname en zou naïef een self-redirect-loop op `/account/wachtwoord` veroorzaken. De spec moet één concreet mechanisme kiezen met expliciete vrijstelling voor wachtwoordpagina/action en logout.

5. **E-mailnormalisatie moet gedeeld en consistent zijn.**  
   Login en update lowercasen nu niet. De spec moet één gedeelde normalisatie vóór elke schrijf en lookup eisen, plus tests voor casing.

## Vereist Voor Merge

- Vaste staff-audit summary builder; geen vrije tekst met e-mail, link of token.
- Retentie/purge voor `StaffInvite`; tegelijk de bestaande pairing-cleanup call-site repareren.
- Recursieve navigatiefiltering en parent-active state voor `Beheer` met children op desktop en mobiel.
- Forced-password mode ruimt `session.mustChangePassword` op met `session.save()`.
- Mailtransport via env, default `noop` in dev/test, zonder token/link logging.
- Accept-flow wist pairingvelden om sessiefixatie te voorkomen.
- Mailfout na DB-create retourneert neutrale UI-tekst en laat beheerder opnieuw uitnodigen.
- Edge-tests voor resend naar actief account en gelijktijdige resends.

## Verwerking

Deze review wordt verwerkt in dezelfde spec en daarna opnieuw via `s4m-queue` naar `mac:claude` gestuurd voor GO/NO-GO.
