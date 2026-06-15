# Review msmtp-mailprovider — mac Claude

Queue message: `51e8e793-4765-40f3-b5b9-fd7249c5edb4`  
Request: `7239e264-1d97-4693-b325-5ca6c2e05c4c`  
Result: **GO**

De code-review vindt de sendmail/msmtp-integratie correct en veilig opgezet: geen command-injectie, header-injectie afgedekt, privacy-veilige logging, nette foutafhandeling en heldere env-validatie met `noop` als veilige default.

## Geverifieerd

- `spawn(path, ['-t', '-oi'])` zonder shell voorkomt command-injectie.
- Headers `From` en `To` weigeren newline-injectie.
- `staffName` staat alleen in de body.
- Logs bevatten geen e-mail, token of uitnodigingslink.
- Non-zero exit en spawn errors vallen terug naar de bestaande 502-afhandeling.
- `MAIL_FROM` is verplicht bij `MAIL_TRANSPORT=smtp`.

## Niet-blokkerend

- P2: runtime moet msmtp/sendmail en config beschikbaar hebben voordat `MAIL_TRANSPORT=smtp` live kan.
- P3: vang ook `child.stdin` stream errors af voor EPIPE/early close.
- P3: quote `MAIL_FROM_NAME` als display-name wanneer die RFC 5322-specials bevat.
- P3: CRLF is strikter dan LF, al normaliseren msmtp/sendmail doorgaans zelf.

## Conclusie

**GO** voor de app-code, met deployment-randvoorwaarde dat msmtp in de runtime aanwezig en geconfigureerd is.
