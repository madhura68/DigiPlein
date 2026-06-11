---
title: "ADR-0002: Float sort_order voor herordenbare lijsten"
status: active
language: nl
last_updated: 2026-06-11
---

# ADR-0002: Float sort_order voor herordenbare lijsten

## Status

accepted — overgenomen van Scrum4Me ADR-0002 (besluit 2026-05-16), aangepast voor DigiPlein op 2026-06-11.

## Context

De DigiPlein-MVP (M0–M2) heeft géén herordenbare collecties: alle lijsten in het datamodel (mvp-spec §6) sorteren op datum, naam of status. Maar de app groeit via het chat-window en de vervolgfases (M3 rooster, M4 trajecten), en de kans is reëel dat er een door de gebruiker te ordenen lijst bijkomt (bv. prioritering van cliënten op een lesochtend). Scrum4Me bewees het patroon: integer-posities vereisen bij invoegen een O(N)-hernummering van alle volgende rijen; floats niet.

## Besluit

Elke herordenbare collectie die DigiPlein ooit krijgt — ook wanneer het chat-window die toevoegt — gebruikt een `Float`-kolom `sort_order`. Invoegen tussen twee items: `sort_order = (prev + next) / 2`. Toevoegen aan het einde: `last + 1.0`.

## Consequenties

### Positief

- Herordenen is O(1) — alleen de verplaatste rij wordt geschreven.
- Optimistic-UI-updates gebruiken exact dezelfde midpoint-berekening.
- Geen lock-contention op aangrenzende rijen.

### Negatief

- Herhaald invoegen tussen dezelfde twee items geeft float-precisiedrift; mitigatie: compactie (normaliseren naar integers × 1000) zodra het gat onder `0.001` komt. In Scrum4Me is dit in de praktijk nog nooit nodig geweest.
- Query's op volgorde moeten altijd expliciet `ORDER BY sort_order` doen — er is geen impliciete ordening.
- Voor de MVP is dit besluit nog niet van toepassing (geen enkele tabel heeft `sort_order`); het geldt als bindende richtlijn voor chat-window-uitbreidingen en M3+.
