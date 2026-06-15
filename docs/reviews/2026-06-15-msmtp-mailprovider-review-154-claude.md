# Review msmtp-mailprovider — 154/server Claude

Queue message: `c0ddc23e-e87e-4529-81d0-d88f9bede097`  
Request: `df50e540-bd9e-4b8d-8bad-0184420efc6e`  
Result: **NO-GO**

De server/Docker-review meldt dat de app-code-aanpak op zichzelf redelijk is, maar niet werkt in de huidige DigiPlein-container.

## Blocker

Host-msmtp is niet zichtbaar in de app-container. In de draaiende DigiPlein-container is `/usr/sbin/sendmail` een symlink naar busybox, niet de msmtp-shim. `msmtp` is niet geïnstalleerd en `/etc/msmtprc` bestaat niet. Busybox sendmail probeert localhost:25 en faalt met connection refused.

## Vereiste Fix

1. Installeer `msmtp` in de runtime/container.
2. Gebruik expliciet `/usr/bin/msmtp` als `MAIL_SENDMAIL_PATH`, of maak `/usr/sbin/sendmail` een symlink naar msmtp.
3. Mount een read-only msmtprc, bijvoorbeeld `/srv/scrum4me/secrets/digiplein-msmtprc:/etc/msmtprc:ro`.
4. Let op permissies: msmtp weigert configs met wachtwoord als die te breed leesbaar zijn. Het bestand moet passen bij de container-UID of via `passwordeval` werken.
5. Controleer outbound netwerk naar de smarthost, bijvoorbeeld smtp.gmail.com:587.

## Productiechecks

```bash
docker exec digiplein msmtp --version
printf 'To: jij@x\nSubject: test\n\nbody\n' | docker exec -i digiplein /usr/bin/msmtp -t -oi
docker logs --since 1h digiplein 2>&1 | grep -F '[mail] staff invite accepted by smtp transport'
```

## Conclusie

**NO-GO** voor `MAIL_TRANSPORT=smtp` in de huidige image. Na Dockerfile/deploy-fix en egress-check kan dit GO worden.
