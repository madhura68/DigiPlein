# Bibliotheek Rotterdam — app voor digivaardigheidslessen ("Digiplein", werknaam)

Specificatie-set voor een interne web-app voor het digivaardigheidsteam van Bibliotheek Rotterdam (Centrale Bibliotheek): vrijwilligersrooster + cliëntregistratie voor **Klik & Tik** en **Les op maat** (di/do 10:00–12:00), met een chat-window waarmee medewerkers de app zelf kunnen uitbreiden.

> Aangemaakt 2026-06-11 op basis van webonderzoek + de werkpraktijk van JP (vrijwilliger Klik & Tik / Les op maat). Status: **concept ter review** — zie de open vragen in de productspec (§10).

## Leeswijzer

| Document | Wat staat erin | Voor wie |
|---|---|---|
| [product-spec.md](product-spec.md) | Het **wat & waarom**: probleem, persona's, featureprioritering, bindende randvoorwaarden (AVG, huisstijl, toegankelijkheid, governance/chat-window), oefenen.nl-koppeling, build-vs-buy, uitbreidingscontext, open vragen | Iedereen; startpunt voor het gesprek met de coördinator/bibliotheek |
| [mvp-spec.md](mvp-spec.md) | Het **hoe**: MVP-afbakening (vier tabellen + AVG-basis + chat-window), feature-specs met acceptatiecriteria, volledig datamodel, architectuur, chat-window-integratiecontract, backlog M0–M5 | Bouwer (JP / Claude Code) |
| [research/vrijwilligersplanning.md](research/vrijwilligersplanning.md) | Hoe anderen vrijwilligers roosteren (zelfroosteren-model, tools, bibliotheeksector) | Onderbouwing rooster-ontwerp |
| [research/klik-en-tik-oefenen-nl.md](research/klik-en-tik-oefenen-nl.md) | Klik & Tik-programma's, oefenen.nl/Volgsysteem, géén publieke API, Les op maat | Onderbouwing cliënt-/koppelontwerp |
| [research/branding-bibliotheek-rotterdam.md](research/branding-bibliotheek-rotterdam.md) | Huisstijl-analyse van de (mei/juni 2026 vernieuwde) site, concrete design tokens uit de live CSS | Thema/styling |
| [research/aanbod-bibliotheek-rotterdam.md](research/aanbod-bibliotheek-rotterdam.md) | Volledig dienstenaanbod + 23 locaties + vormvarianten | Uitbreidingscontext |
| [research/avg-privacy-clientgegevens.md](research/avg-privacy-clientgegevens.md) | AVG: grondslagen, bindend veldenadvies, bewaartermijnen, FG/governance | Randvoorwaarden; gesprek met FG |

## Kern in vijf regels

1. **MVP** = beheer van medewerkers, vrijwilligers, cliënten en cursusaanbod + AVG-basics (export/verwijdering, audit-log, notitie-discipline) + chat-window. Daarna: rooster (M3) en leertrajecten met sessiebewaking (M4).
2. **AVG is ontwerpkader, geen bijlage**: minimaal veldenmodel (geen BSN, gezondheid, labels), grondslag = uitvoering overeenkomst, dummydata tot FG-akkoord; Stichting Bibliotheek Rotterdam is verwerkingsverantwoordelijke, de bouwer verwerker.
3. **Oefenen.nl heeft geen API** — koppeling is organisatorisch: eigen registratie leidend, pseudonieme accounts, deeplinks naar het Volgsysteem.
4. **Huisstijl** is afgeleid uit de live CSS van de nieuwe site (Poppins, oranje `#ee7203`, zwarte pill-knoppen, "plectrum"-hoek); logo niet gebruiken zonder toestemming.
5. **Belangrijkste open vraag** voor de coördinator: sessiemaximum Les op maat (intern 4, site zegt "1 tot 6") en de governance-route via de FG.
