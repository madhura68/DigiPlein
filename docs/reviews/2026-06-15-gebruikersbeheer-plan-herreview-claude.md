# Herreview — Gebruikersbeheer Beheerlaag Implementatieplan

Datum: 2026-06-15
Reviewer: Claude via `s4m-queue`
Queue-id: `6df0ee33-0b97-4633-8853-ce9d3cf05aa3`
Review van: `docs/superpowers/plans/2026-06-15-gebruikersbeheer-beheerlaag.md`

## Conclusie

**GO.**

Claude heeft bevestigd dat de drie eerdere planblokkers zijn opgelost:

- De placeholder-footgun is dicht: `createUnusablePasswordPlaceholder()` is onafhankelijk van de raw invite-token en tests bewijzen dat de raw uitnodigingstoken niet als wachtwoord werkt.
- De app-shell assertions zijn concreet: ADMIN ziet parent `Beheer` met child-links `Gebruikersbeheer` en `Audit-log`; STAFF ziet geen beheergebied.
- De bestaande `createStaff` tests worden zonder oud `password` payload herschreven en de oude wachtwoordlengte-test verdwijnt.

Ook de niet-blokkerende notes zijn verwerkt:

- Migratie-apply/diff is onderdeel van de verificatie.
- Inactive-staff invite accept consumeert de token bewust neutraal.
- Cleanup draait best-effort buiten de accept-transactie.
- `requireStaff({ allowPasswordChange: true })` staat in zowel wachtwoordpagina als action.

## Vervolg

Het implementatieplan is vrijgegeven voor uitvoering. Na implementatie en groene `npm run verify` + `npm run build` volgt de gevraagde PR-review via `s4m-queue`.
