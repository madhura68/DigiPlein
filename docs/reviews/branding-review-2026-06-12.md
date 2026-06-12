# Code review — branding Bibliotheek Rotterdam

Datum: 2026-06-12

Scope: toetsing van DigiPlein tegen de branding- en huisstijlregels uit `docs/research/branding-bibliotheek-rotterdam.md` en `docs/product-spec.md` §6.2/§6.3. De in Scrum4Me opgegeven product-id `cmpe99x5x0001vh7r6yf29cmz` was niet toegankelijk; de repo is in Scrum4Me geregistreerd als DigiPlein met product-id `cmq9hybds0003v27r99zvo92k`, en die productdocs zijn gebruikt.

## Samenvatting

De branding is grotendeels goed toegepast. De themalaag centraliseert hexwaarden in `app/styles/theme.css`, gebruikt Poppins, zet de primaire knop terecht op zwart, houdt oranje uit normale tekstkleur, en implementeert het plectrum-motief via kaarten/tegels. De belangrijkste afwijkingen zitten in contrastparen die de huidige test niet vangt en in native checkboxen die buiten het huisstijlcomponentensysteem vallen.

## Bevindingen

### P2 — Brand-swatch gebruikt wit op merk-oranje met onvoldoende contrast

- Locatie: `app/stijlgids/page.tsx:31` en `app/stijlgids/page.tsx:32`
- Bronkader: `docs/research/branding-bibliotheek-rotterdam.md:102` t/m `:103`; `docs/product-spec.md:176` t/m `:178`

De stijlgids combineert `bg-brand` met `text-primary-foreground`, dus wit op `#ee7203`. Dat contrast is 2,98:1. De brandingbijlage staat wit op oranje alleen toe voor grote/bold tekst en iconen; voor gewone tekst op oranje moet zwart worden gebruikt. De product-spec vraagt WCAG 2.2 AA en contrast minimaal 4,5:1 voor normale tekst. Deze swatchtekst is normale UI-tekst en haalt dat niet.

Aanbevolen fix: gebruik `text-foreground` op `bg-brand`, of maak expliciet een `on-brand` token met zwart. Laat `text-primary-foreground` gekoppeld blijven aan de zwarte primaire knop, niet aan merk-oranje.

### P2 — Success foreground-token zet witte tekst op groen onder AA-contrast

- Locatie: `app/styles/theme.css:64` t/m `:66`; gebruik zichtbaar in `app/stijlgids/page.tsx:92`
- Bronkader: `docs/research/branding-bibliotheek-rotterdam.md:38` en `:114`; `docs/product-spec.md:170` en `:178`

`--success` is `#28a84f`, maar `--success-foreground` is wit. Wit op dit groen is 3,09:1 en haalt WCAG AA voor normale tekst niet. De brandingbijlage beschrijft `#28a84f` als statusdot en `#155927` als statustekst, niet als groen vlak met witte tekst. De app gebruikt gelukkig meestal `text-success-text`, maar het tokenpaar zelf is misleidend en de stijlgids demonstreert de fout.

Aanbevolen fix: vervang `--success-foreground` door zwart of gebruik voor statuslabels `bg-success/lichte container + text-success-text`. Voeg een token-pair contrasttest toe, zodat `bg-* text-*-foreground` combinaties minimaal 4,5:1 halen.

### P2 — Checkboxen vallen buiten het huisstijlcomponentensysteem

- Locaties: `app/clienten/page.tsx:58`, `app/cursusaanbod/cursus-form.tsx:122`, `app/cursusaanbod/cursus-form.tsx:130`, `app/vrijwilligers/page.tsx:60`, `app/vrijwilligers/vrijwilliger-form.tsx:95`, `app/vrijwilligers/vrijwilliger-form.tsx:103`
- Bronkader: `docs/research/branding-bibliotheek-rotterdam.md:29`, `:42` en `:48`; `docs/product-spec.md:171`

De app gebruikt native `<input type="checkbox">` zonder huisstijlklassen. Daardoor bepaalt de browser/het OS de checkboxkleur, checked-state en soms focusweergave. Dat kan standaard blauw worden en breekt met de Bibliotheek Rotterdam-tokens, waar checkbox/radio-borders, kleine radius en oranje interactiestates expliciet zijn genoemd.

Aanbevolen fix: voeg een gedeelde `Checkbox` toe met `accent-color: var(--brand)`, `border-color: var(--outline)`, radius 4px en dezelfde focus-ring als knoppen/velden. Gebruik die component in alle filter- en dagkeuzevelden.

## Wat Goed Gaat

- `app/styles/theme.css` is een sterke bron van waarheid: hexwaarden zijn gecentraliseerd en de comments leggen de hardstops goed vast.
- `__tests__/theme-hex-scan.test.ts` borgt dat componenten geen losse hexwaarden introduceren en dat oranje niet als normale tekstkleur wordt gebruikt.
- `components/ui/button.tsx` volgt de huisstijl: zwarte primaire pill-knop, witte tekst, hover-inversie.
- `components/ui/input.tsx` en de select/textarea-klassen volgen afgeronde velden met oranje focusrand.
- `components/ui/card.tsx` en `components/tile.tsx` gebruiken het plectrum-motief met een sterk afgeronde hoek.
- Het logo van Bibliotheek Rotterdam wordt niet gebruikt; dat klopt met de toestemmingseis.

## Verificatie

- `npm run verify` — geslaagd: lint, typecheck en 125 tests groen.
- `npm run build` — geslaagd.
- Visuele browsercheck: geprobeerd via de in-app Browser op `localhost:3020`, `127.0.0.1:3020` en `192.168.0.50:3020`; alle varianten werden door de browser geblokkeerd met `ERR_BLOCKED_BY_CLIENT`. De review is daarom gebaseerd op broncode, productdocs en de groene test/build-gate.

## Openstaande Context

Er zijn geen app-codewijzigingen gedaan voor deze review. Alleen dit rapport is toegevoegd.
