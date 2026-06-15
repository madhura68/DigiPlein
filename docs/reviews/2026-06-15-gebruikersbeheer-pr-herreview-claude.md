# PR-herreview — ST-026 Gebruikersbeheer

Reviewer: Claude op mac via `s4m-queue`  
Queue reply: `2e63b6ad-81da-4394-8dea-a149f7ad375f`  
Status: GO

## Conclusie

GO. Beide blockers uit de eerdere NO-GO review zijn verwerkt en opnieuw geverifieerd:

- R1: `/uitnodiging/[token]` valideert de invite read-only en toont een neutrale fout zonder knop bij ongeldige, verlopen, gebruikte of inactieve invites.
- R2: forced password set schrijft `PASSWORD_SET` audit op `staff_member`.

## Geverifieerde Fixes

- Invite page gebruikt een token-hash lookup en selecteert alleen statusvelden plus `staff.isActive`.
- Stale `410` uit de accept-action wordt zichtbaar via `StaffInviteAcceptForm` met `useActionState`.
- Invite-audits gebruiken `entity: 'staff_member'`.
- Invite actions zijn `INVITE_CREATED`, `INVITE_RESENT` en `INVITE_REVOKED`.
- Resend schrijft `INVITE_REVOKED` wanneer open invites worden ingetrokken.
- Invite-retentie is uitgelijnd op 7 dagen.
- Concurrent accept met `updateMany.count === 0` blijft neutraal en zet geen sessie.
- `INVITE_CREATED` wordt ook geschreven wanneer maildelivery na commit faalt.

## Verificatie Door Claude

- `npm run verify`: groen, 47 testbestanden / 246 tests.
- `npm run build`: groen.

## Niet-Blokkerende P3-Risico's

- `PASSWORD_SET` audit gebeurt voor `session.save()`. Een zeldzame audit-fout kan de forced-change vlag laten staan terwijl het wachtwoord al is gezet.
- Resend-concurrency is niet expliciet getest.
- Desktop nav kan extra `focus-visible` polish gebruiken; `aria-current` staat op parent en actief kind.
- `staffInviteAuditSummary('accepted')` blijft ongebruikt; dit is niet blokkerend omdat het mandaat `PASSWORD_SET` is.
