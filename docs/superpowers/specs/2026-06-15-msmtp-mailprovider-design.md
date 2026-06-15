# msmtp Mailprovider Design

## Doel

DigiPlein kan medewerkeruitnodigingen echt per e-mail versturen zonder eigen SMTP-credentials in de app te beheren. De productiecontainer gebruikt daarvoor een in de image gebundelde `msmtp`-runtime met een sendmail-compatibele entrypoint.

## Gekozen Aanpak

`MAIL_TRANSPORT=smtp` betekent in DigiPlein: roep een sendmail-compatible binary aan met een volledige RFC822-mail op stdin. Standaard blijft dat `/usr/sbin/sendmail -t -oi`; de transport-code hoeft hiervoor niet te wijzigen.

De definitieve deploy-aanpak vertrouwt niet op een vooraf bestaande host-`msmtp-mta` of host-`/usr/sbin/sendmail` shim. Containers zijn geïsoleerd, en de oorspronkelijke runner-image bevatte alleen busybox-sendmail. Daarom bundelt de productie-image zelf `msmtp` en zet `/usr/sbin/sendmail` als symlink naar `/usr/bin/msmtp`. Deze image/deploy-aanpassing hoort bij DigiPlein PR #24.

`MAIL_TRANSPORT=noop` blijft de veilige default voor development/test en verstuurt niets extern.

## Configuratie

- `MAIL_TRANSPORT=noop|smtp`, default `noop`.
- `MAIL_FROM`, verplicht als `MAIL_TRANSPORT=smtp`.
- `MAIL_FROM_NAME`, optioneel, default `DigiPlein`.
- `MAIL_SENDMAIL_PATH`, optioneel, default `/usr/sbin/sendmail`.
- `APP_BASE_URL` blijft de basis voor uitnodigingslinks.

De app configureert geen SMTP-host, gebruikersnaam of wachtwoord. Die horen in de gemounte msmtp-config.

De container moet een read-only msmtp-config krijgen, bijvoorbeeld:

```text
/srv/scrum4me/secrets/digiplein-msmtprc:/etc/msmtprc:ro
```

De msmtp-config komt uit een host-secret en niet uit `~janpeter/.msmtprc`, omdat die user-scoped hostconfig niet zichtbaar is voor de container en niet past bij de `nextjs` runtime-user. Afgesproken hostpad:

```text
/srv/scrum4me/secrets/digiplein-msmtprc
```

Het bestand wordt read-only naar `/etc/msmtprc` gemount, met permissies die msmtp accepteert voor uid `1001` (`nextjs`), of met `passwordeval` als dat beter past.

Voor productie wordt een dedicated relay gebruikt in plaats van de host-Gmail-config. `MAIL_FROM` wordt een dedicated afzender, bijvoorbeeld `noreply@digiplein.<tld>`; host, user, password en `from` staan in het secret.

De go-live stappen staan in PR #24 in:

```text
docs/superpowers/runbooks/2026-06-15-msmtp-deploy-runbook.md
```

## Mailinhoud

De uitnodigingsmail is plain text:

- `From`: `MAIL_FROM_NAME <MAIL_FROM>`.
- `To`: medewerkeradres.
- `Subject`: `Uitnodiging voor DigiPlein`.
- Body bevat een korte Nederlandse instructie, de uitnodigingslink en de geldigheid.

Headers worden veilig opgebouwd zodat newline-injectie in naam, afzender of ontvanger wordt geweigerd. Display-names met RFC 5322-specials worden gequote.

## Logging en Privacy

Applicatielogs mogen aantonen dat de mail aan het transport is aangeboden, maar loggen geen token, uitnodigingslink, naam of e-mailadres.

Bij succes logt de app:

```text
[mail] staff invite accepted by smtp transport
```

Bij fout logt de app alleen exit code en een gesanitiseerde fouttekst zonder mailinhoud.

## Foutgedrag

Als sendmail/msmtp met non-zero exit code eindigt of niet gestart kan worden, retourneert de bestaande server action een fout naar de UI. De uitnodiging blijft bestaan zodat een beheerder later opnieuw kan versturen.

## Acceptatiecriteria

- `MAIL_TRANSPORT=smtp` roept sendmail aan met `-t -oi`.
- De runtime-image bevat `msmtp` en `/usr/sbin/sendmail` wijst naar `/usr/bin/msmtp`.
- De app is niet afhankelijk van host-`msmtp-mta`, host-`/usr/sbin/sendmail` of host-`~/.msmtprc`.
- SMTP-credentials staan alleen in een read-only gemounte `/etc/msmtprc`.
- `MAIL_FROM` gebruikt een dedicated DigiPlein-relay-afzender, niet de host-Gmail-config.
- Een succesvolle sendmail-exit resulteert in `{ transport: 'smtp', skipped: false }`.
- Een non-zero exit resulteert in een exception naar de bestaande action-catch.
- `MAIL_FROM` is verplicht zodra `MAIL_TRANSPORT=smtp`.
- Noop- en smtp-logs lekken geen token, link, naam of e-mailadres.
- `npm run verify && npm run build` is groen.
