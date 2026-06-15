# Beheer Overzicht

## Doel

Beheerders krijgen een eenvoudige beheer-startpagina met twee duidelijke
navigatietegels: Gebruikersbeheer en Audit-log.

## Ontwerp

- De route `/beheer` is alleen beschikbaar voor `ADMIN` via `requireAdmin()`.
- Het hoofdmenu-item `Beheer` wijst naar `/beheer` en blijft admin-only.
- De bestaande dropdown onder `Beheer` blijft beschikbaar met:
  - `Gebruikersbeheer` naar `/medewerkers`
  - `Audit-log` naar `/audit`
- De beheerpagina gebruikt de bestaande `PageHeader` en `Tile`-componenten,
  zodat de pagina visueel aansluit op het account-overzicht en de DigiPlein
  huisstijl.

## Testdekking

Tests bewaken dat `Beheer` een eigen route heeft, actief wordt op `/beheer`,
dat de dropdownlinks blijven bestaan, en dat `/beheer` alleen via
`requireAdmin()` rendert.
