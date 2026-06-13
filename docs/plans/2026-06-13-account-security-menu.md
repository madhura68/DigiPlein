---
title: "Accountmenu: wachtwoord wijzigen en QR-login starten"
status: "approved"
date: "2026-06-13"
product: "DigiPlein"
---

# Accountmenu: wachtwoord wijzigen en QR-login starten

## Doel

Ingelogde medewerkers krijgen een duidelijke accountplek om hun eigen
wachtwoord te wijzigen en om de bestaande QR-pairing loginflow te starten.
De bestaande e-mail/wachtwoord-login en QR-login op `/login` blijven werken.

## Gekozen aanpak

Voeg een hoofdmenu-item `Account` toe. De accountpagina bundelt twee acties:

1. `Wachtwoord wijzigen`
   - Route: `/account/wachtwoord`
   - Vereist een geldige medewerker-sessie.
   - Vraagt huidig wachtwoord, nieuw wachtwoord en bevestiging.
   - Verifieert het huidige wachtwoord met bcrypt.
   - Slaat alleen een nieuwe bcrypt-hash op.
   - Toont neutrale foutmeldingen en geen extra accountinformatie.

2. `QR-login starten`
   - Route: `/account/qr-pairing`
   - Hergebruikt de bestaande `QrLoginButton`.
   - Tekst maakt duidelijk dat de gebruiker dit opent op de desktop waarop hij
     wil inloggen en scant met een mobiel apparaat waarop hij al is ingelogd.

## Reden

Een apart `Account` menu-item houdt security-acties bij elkaar en voorkomt dat
de hoofdnavigatie twee losse account-acties krijgt. Dit past beter bij de
bestaande compacte app-shell.

## Afbakening

- Geen wachtwoord-reset-selfservice per e-mail.
- Geen wijziging aan het admin-pad voor wachtwoordreset.
- Geen wijziging aan de bestaande QR-login op `/login`.
- Geen extra persoonsgegevens of auditinhoud nodig; dit is accountbeheer voor
  de ingelogde medewerker zelf.

## Tests

- AppShell toont `Account` als menu-item en markeert het actief op
  `/account/*`.
- Accountpagina toont links/acties voor wachtwoord wijzigen en QR-login.
- Wachtwoordactie:
  - vereist sessie;
  - weigert fout huidig wachtwoord neutraal;
  - weigert te kort nieuw wachtwoord;
  - weigert mismatch tussen nieuw wachtwoord en bevestiging;
  - hasht en bewaart het nieuwe wachtwoord bij succes.
- QR-accountpagina rendert de bestaande QR-login component met accounttekst.
- `npm run verify` en `npm run build` zijn groen.
