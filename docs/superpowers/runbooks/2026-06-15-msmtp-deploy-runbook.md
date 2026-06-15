# Runbook — msmtp-mailprovider go-live (server/Docker, host 154)

Server-side stappen om `MAIL_TRANSPORT=smtp` werkend te krijgen in de DigiPlein-container.
Achtergrond: de app spawnt `/usr/sbin/sendmail -t -oi`, maar de runner-image (node:22-alpine)
had daar standaard de **busybox** sendmail-applet (kan niet relayen, leest geen msmtp-config).
PR #24 installeert msmtp in het image en wijst de sendmail-shim ernaar.

## Voorwaarden
- [ ] App-code merged: `codex/msmtp-mailprovider` (env.ts / staff-invite.ts / actions.ts).
- [ ] Image-enabler merged: DigiPlein PR #24 (`apk add msmtp ca-certificates` + symlink).

## Server-artefacten (op 154 — al voorbereid)
1. **msmtprc-secret** `/srv/scrum4me/secrets/digiplein-msmtprc` — bestaat als template
   (mode 600, owner uid 1001=nextjs). **Vul de `<TODO>`-velden** met de dedicated relay:
   `host`, `port`, `from`, `user`, `password`. Mode/owner NIET wijzigen (msmtp weigert
   anders een config met wachtwoord).
2. **compose-mount** — voeg aan de `digiplein`-service in
   `/srv/scrum4me/compose/docker-compose.yml` toe:
   ```yaml
       volumes:
         - /srv/scrum4me/secrets/digiplein-msmtprc:/etc/msmtprc:ro
   ```
3. **env** — in `/srv/scrum4me/secrets/digiplein.env`:
   ```
   MAIL_TRANSPORT=smtp
   MAIL_FROM=<noreply@digiplein.TLD>     # = `from` uit het msmtprc
   # MAIL_SENDMAIL_PATH niet nodig: default /usr/sbin/sendmail is nu de msmtp-shim.
   ```

## Uitrollen
4. Rebuild + recreate via de ops-agent flow `update_digiplein`
   (`POST /agent/v1/flow`, secret `/etc/ops-agent/secret`). Die pullt de clone, bouwt
   het image (nu mét msmtp) en recreate de container (pakt de compose-mount + env).

## Verificatie (bewijs vóór "klaar")
5. `docker exec digiplein msmtp --version`              → msmtp aanwezig.
6. `docker exec digiplein ls -l /usr/sbin/sendmail`     → symlink → /usr/bin/msmtp.
7. Verstuur-test:
   `printf 'To: jij@example.com\nSubject: digiplein test\n\nhi\n' | docker exec -i digiplein /usr/sbin/sendmail -t -oi; echo exit=$?`
   → exit 0; `docker exec digiplein cat /tmp/msmtp.log` toont een geaccepteerde mail.
8. Echte staff-invite triggeren in de UI → ontvangst bevestigen + msmtp-log checken.
9. Egress-sanity (indien stap 7 hangt/faalt): bevestig dat de container de relay bereikt
   (`docker exec digiplein sh -c 'nc -z -w5 <relay-host> 587 && echo ok'`).

## Rollback
- Zet `MAIL_TRANSPORT` terug naar `noop` (of verwijder de regel) in `digiplein.env` +
  recreate → mailverzending uit, app verder ongewijzigd.
