# DigiPlein

Interne web-app voor het digivaardigheidsteam van Bibliotheek Rotterdam: vrijwilligersrooster en cliëntregistratie voor de lessen **Klik & Tik** (begeleid oefenen via oefenen.nl) en **Les op maat** (1-op-1 met leerdoel, max. 4×2 uur) op dinsdag- en donderdagochtend, plus een chat-window waarmee medewerkers de app zelf kunnen uitbreiden.

> Status: specificatiefase. Er is nog geen code — de volledige specificatie-set staat in [docs/](docs/README.md). "DigiPlein" is een werknaam.

## Snel starten

1. Lees [docs/README.md](docs/README.md) (leeswijzer in vijf regels).
2. [docs/product-spec.md](docs/product-spec.md) — het wat & waarom, met bindende randvoorwaarden (AVG §6.1!) en open vragen (§10).
3. [docs/mvp-spec.md](docs/mvp-spec.md) — het hoe: MVP = vier kerntabellen + AVG-basis + chat-window; daarna rooster (M3) en leertrajecten (M4) via de backlog.

## Belangrijkste kaders

- **AVG by design:** minimaal veldenmodel, export & verwijdering per cliënt vanaf de MVP, dummydata totdat de FG van Bibliotheek Rotterdam akkoord is.
- **Geen oefenen.nl-API** (bestaat niet, geverifieerd juni 2026) — koppeling via werkafspraken, pseudoniemen en deeplinks.
- **Huisstijl** afgeleid uit de live site van Bibliotheek Rotterdam (Poppins, oranje, zwarte pill-knoppen, "plectrum"-vorm) — zie de branding-bijlage.
