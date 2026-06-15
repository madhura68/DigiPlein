# msmtp Mailprovider Design

## Doel

DigiPlein kan medewerkeruitnodigingen echt per e-mail versturen zonder eigen SMTP-credentials in de app te beheren. De productiecontainer gebruikt daarvoor de sendmail-compatibele interface van `msmtp-mta`.

## Gekozen Aanpak

`MAIL_TRANSPORT=smtp` betekent in DigiPlein: roep een sendmail-compatible binary aan met een volledige RFC822-mail op stdin. Standaard is dat `/usr/sbin/sendmail -t -oi`. Op de server is `/usr/sbin/sendmail` een msmtp-shim, waardoor relay/TLS/providerconfig buiten de app in `/etc/msmtprc` of `~/.msmtprc` blijft.

`MAIL_TRANSPORT=noop` blijft de veilige default voor development/test en verstuurt niets extern.

## Configuratie

- `MAIL_TRANSPORT=noop|smtp`, default `noop`.
- `MAIL_FROM`, verplicht als `MAIL_TRANSPORT=smtp`.
- `MAIL_FROM_NAME`, optioneel, default `DigiPlein`.
- `MAIL_SENDMAIL_PATH`, optioneel, default `/usr/sbin/sendmail`.
- `APP_BASE_URL` blijft de basis voor uitnodigingslinks.

De app configureert geen SMTP-host, gebruikersnaam of wachtwoord. Die horen in msmtp.

## Mailinhoud

De uitnodigingsmail is plain text:

- `From`: `MAIL_FROM_NAME <MAIL_FROM>`.
- `To`: medewerkeradres.
- `Subject`: `Uitnodiging voor DigiPlein`.
- Body bevat een korte Nederlandse instructie, de uitnodigingslink en de geldigheid.

Headers worden veilig opgebouwd zodat newline-injectie in naam, afzender of ontvanger wordt geweigerd.

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
- Een succesvolle sendmail-exit resulteert in `{ transport: 'smtp', skipped: false }`.
- Een non-zero exit resulteert in een exception naar de bestaande action-catch.
- `MAIL_FROM` is verplicht zodra `MAIL_TRANSPORT=smtp`.
- Noop- en smtp-logs lekken geen token, link, naam of e-mailadres.
- `npm run verify && npm run build` is groen.
