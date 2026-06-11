# Onderzoeksbijlage — Branding & huisstijl Bibliotheek Rotterdam

> **Status:** informatief · webonderzoek d.d. 2026-06-11 · alle tokens komen uit de live site-assets, tenzij gemarkeerd als afgeleid/schatting.
> Hoort bij: [product-spec.md](../product-spec.md)

## Merkanalyse

Bibliotheek Rotterdam (Stichting Bibliotheek Rotterdam) voert een warm, energiek merk rond één dominante kleur: **oranje**. De website `bibliotheek.rotterdam.nl` is **zeer recent vernieuwd**: Wayback-snapshots tonen tot en met 13 mei 2026 nog een Joomla-site met het landelijke "de Bibliotheek"-logo en de titel "Bibliotheek Rotterdam | Informatie en ontmoeting"; op 11 juni 2026 draait er een nieuw headless platform (Drupal-CMS bij Hoppinger + React-frontend). De relaunch valt dus tussen 13 mei en 11 juni 2026.

De nieuwe site draait op een **gedeeld white-label bibliotheekplatform** ("bkw"): in de JS-bundle staan naast Rotterdam ook tenant-configuraties voor o.a. Bibliotheek Kennemerwaard, FlevoMeer Bibliotheek en Bibliotheek Twente/Oldenzaal. Rotterdam heeft daarbinnen een eigen thema (`style.rdam.min.css`, `fonts/rdam/`, `images/rdam/logo.svg`).

Stijlkenmerken: grote kleurvlakken (geel, perzik, teal, lichtblauw) met zwarte tekst, pill-vormige knoppen, en als signatuur-motief **één sterk afgeronde hoek (100px) per vlak** — in het CMS wordt beeldkadering letterlijk "Gekaderd in 'plectrum' vorm" genoemd. Herotitels krijgen witte blokken achter elk woord (marker-/sticker-effect). Primaire knoppen zijn opvallend **zwart**, oranje is reserve voor accenten, focus en interactiestaten.

## Design tokens

Alle waarden komen uit `https://www.bibliotheek.rotterdam.nl/bkw/css/style.rdam.min.css` (hierna "CSS"), de homepage-HTML of de logo-SVG's, tenzij anders vermeld.

| Token | Waarde | Vindplaats/bron | Zekerheid |
|---|---|---|---|
| **Primair oranje** | `#ee7203` | CSS: `input:focus` border, `.menu__link:hover/:focus`, `.menu__link--active` (onderrand), skip-link-achtergrond (`.sr-text:focus`), radio-dot, `.announcement__inner` rand, datepicker selected | gezien in CSS |
| Oranje, tint (container) | `#fac494` | CSS: `.jumbotron--small`, `.teaser--audience`, `.collection-page .form--search`, `.card__visual`, `.pager__item--active`, `.subscription__right` | gezien in CSS |
| Oranje, hover/licht | `#f79136` | CSS: `.text--styled a:hover` (linkkleur), `.jumbotron--erasmus-dp` | gezien in CSS |
| Oranje, donker (active) | `#d56603` | CSS: datepicker hover/keyboard-selected | gezien in CSS |
| Logo-oranje (header) | `#DD5F00` | `/bkw/images/rdam/logo.svg` (vlak van beeldmerk) | gezien in SVG |
| Logo-oranje (footer/pinned tab) | `#FF7320` | `/bkw/images/bkw/logo-aanzet.svg` + `<link rel="mask-icon" color="#FF7320">` in HTML | gezien in SVG/HTML |
| Logo-perzik (chevron) | `#fbcba1` | `/bkw/images/bkw/logo-aanzet.svg` | gezien in SVG |
| **Tekst (body)** | `#000` | CSS: `body{…color:#000}` | gezien in CSS |
| Donkergrijs (footer-vlak) | `#38383a` | CSS: `.footer{background-color:#38383a;color:#fff}`, `.teaser__tip`, datepicker-tekst | gezien in CSS |
| Placeholder-grijs | `#565656`, `#868686`, `#979797` | CSS: `::placeholder`, `.collection__queryfield`-placeholder, checkbox/radio-borders | gezien in CSS |
| Licht grijsblauw (borders/velden) | `#eeeff5` | CSS: `input/select/textarea` border, `select` achtergrond, `.header` onderrand (2px), `.button--active` | gezien in CSS |
| Subtiele vlakken | `#ededed` (secondary-hover), `#f8f8f8` (placeholders/scheidingslijnen) | CSS: `.button--secondary:hover`, `.a-item` | gezien in CSS |
| **Accent geel/oker** | `#e2b41d` | CSS: `.jumbotron--large .jumbotron__outer`, `.book::after` | gezien in CSS |
| Accent teal | `#65baa8` | CSS: `.jumbotron--news .jumbotron__outer` | gezien in CSS |
| Accent lichtblauw | `#79c4e3` | CSS: `.block--collections .block__inner` | gezien in CSS |
| Accent indigo | `#585f98` | CSS: `.quote .quote__inner` | gezien in CSS |
| Accent bordeaux | `#962737` | CSS: `.cta__inner` | gezien in CSS |
| Accent roze | `#e499bb` | CSS: `.cta--block` | gezien in CSS |
| Status: beschikbaar | dot `#28a84f`, tekst `#155927`, icoon `#009d00` | CSS: `.c-item__availability--availableHere` e.o. | gezien in CSS |
| Status: uitgeleend/niet beschikbaar | tekst `#b35400`, dot `#ee7203` | CSS: `.c-item__availability--onLoan/--notAvailable` | gezien in CSS |
| **Radius knoppen** | `100px` (pill) | CSS: `.button{border-radius:100px}` | gezien in CSS |
| Radius invoervelden | `25px` | CSS: `input,select,textarea{border-radius:25px}` | gezien in CSS |
| Radius klein (checkbox, datepicker) | `4px` | CSS: `.form__label--checkbox:before`, `.react-datepicker` | gezien in CSS |
| Signatuurhoek (asymmetrisch) | `100px` op één hoek | CSS: `.teaser__visual`/`.teaser__link` (rechtsonder), `.cta__inner` (rechtsonder), `.quote__inner` (linksonder), `.block--collections` (linksboven), `.jumbotron--erasmus-dp__content` (linksboven + rechtsonder) | gezien in CSS |
| **Knop primair** | zwart vlak, witte tekst, `border:2px solid transparent`; hover/focus: wit vlak, zwarte tekst, zwarte rand | CSS: `.button--primary` + `:hover/:focus` | gezien in CSS |
| Knop secundair | wit vlak, zwarte tekst, `2px solid #000`; hover: `#ededed` | CSS: `.button--secondary` | gezien in CSS |
| Knop-typografie | Poppins 700, `padding:.625rem 18px` | CSS: `.button` | gezien in CSS |
| Tekstlink (in lopende tekst) | zwart, **bold**, onderrand `1px solid #000`; hover: `#f79136`, onderrand transparant | CSS: `.text--styled a:not(.button)` | gezien in CSS |
| Focus-stijl | `border-color:#ee7203; outline:0` op velden; skip-link: oranje pill met witte tekst | CSS: `input:focus`, `.sr-text:focus` | gezien in CSS |
| Breakpoints/grid | `--xs-min:30rem`, `--sm-min:48rem`, `--md-min:64rem`, `--lg-min:75rem`, `--gutter-width:20px` | CSS custom properties | gezien in CSS |
| Hero-titel-effect | wit blok achter elk woord | CSS: `.title--bg>span:before{background:#fff}` | gezien in CSS |

Opmerking: de drie oranjes `#ee7203` (UI), `#DD5F00` (header-logo) en `#FF7320` (footer-beeldmerk/mask-icon) bestaan naast elkaar in de live assets; er is dus geen één-op-één "officiële" hex publiek gedocumenteerd (geen merkgids gevonden).

## Typografie

| Aspect | Waarde | Bron |
|---|---|---|
| Font (alles) | **Poppins** — self-hosted woff2 (`/bkw/fonts/rdam/poppins-v23-latin-*.woff2`), gewichten **400, 500, 700, 900** | gezien in CSS `@font-face` |
| Fallback-stack | `Poppins, Poppins-fallback, Arial, sans-serif`; `Poppins-fallback` = lokale Arial met `size-adjust:112.5%` en `ascent-override:108%` (CLS-arme fallback) | gezien in CSS |
| Body | 400, `1rem`, line-height 1.556; vloeiend via `calc(1rem + .125*(100vw - 320px)/880)` tot `1.125rem` (≈16→18px; interpolatiebereik 320–1200px is afgeleid uit de formule) | gezien in CSS / bereik afgeleid |
| Headings | h1–h6 allemaal Poppins **700** | gezien in CSS |
| h1 / `.title--xl` | `3rem`, lh 1; fluid naar `3.75rem` op groot scherm | gezien in CSS |
| h2 / `.title--l` | `2rem`, lh 1.3; fluid naar `2.5rem` | gezien in CSS |
| h3 / `.title--m` | `1.75rem`, lh 1.3125 | gezien in CSS |
| h4 / `.title--s` | `1.25rem`, lh 1.5 | gezien in CSS |
| h5–h6 / `.title--xs` | `1.125rem`, lh 1 | gezien in CSS |
| Knoppen/links | 700 (bold is het interactie-signaal, naast de onderrand) | gezien in CSS |
| Gewicht 900 | wordt wél geladen maar komt in de CSS alleen in de `@font-face` voor (vermoedelijk voor incidenteel display-gebruik — schatting) | gezien in CSS / gebruik = schatting |

Er is dus **geen apart heading- vs. body-font**: alles is Poppins, hiërarchie ontstaat door grootte en gewicht.

## Logo & beeldtaal

- **Woordmerk:** "Bibliotheek Rotterdam" op twee regels, in **zwart**, geometrische sans (passend bij Poppins), zonder lidwoord "de" (`/bkw/images/rdam/logo.svg`, alt-tekst "Bibliotheek Rotterdam").
- **Beeldmerk:** een organische, asymmetrisch afgeronde "kei"/plectrum-vorm in oranje (`#DD5F00` in de header-versie) met daarin in wit: een chevron met de punt omhoog, een cirkel in het midden en een chevron met de punt omlaag — leesbaar als abstracte figuur (hoofd + armen/boek; die duiding is een schatting, de vormen zelf zijn feitelijk). In de footer-variant (`logo-aanzet.svg`) is het vlak `#FF7320` en de bovenste chevron perzikkleurig (`#fbcba1`).
- **Historie (belangrijk):** tot de relaunch (≥13 mei 2026) voerde de site het **landelijke "de Bibliotheek"-logo**: woordmerk "de Bibliotheek" in warmgrijs `#60604d` met "Rotterdam" eronder in oranje `#ee7203`, plus hetzelfde type oranje kei-beeldmerk (gezien in Wayback-logo en in de Wikimedia Commons-SVG van okt 2023, kleuren `#ee7203`/`#fac494`/`#60604d`). Het nieuwe logo behoudt dus het beeldmerk-concept en het oranje, maar vervangt het landelijke woordmerk door een eigen, zwart woordmerk "Bibliotheek Rotterdam".
- **Fotografie:** documentair en mensgericht — Rotterdammers die lezen, leren en elkaar ontmoeten; veel kinderen/gezinnen ("Vrouw leest kind voor uit prentenboek", "Lezende kinderen in de bibliotheek" — alt-teksten uit de CMS-content). Portretseries met naamsvermelding van fotografen ("Foto van Benzokarim door Ashley Röttjers"). Incidenteel stock (bestandsnaam "Pexels voorlezen peuters.jpg" gezien). Beelden worden gekaderd in de "plectrum"-vorm (CMS-veld "Weergave: Gekaderd in 'plectrum' vorm").
- **Grafische taal:** kleurvlak-jumbotrons (geel `#e2b41d`, perzik `#fac494`, teal `#65baa8`), announcement-balk met oranje kader en oranje zijvlak, witte woordblokken achter herotitels, één 100px-hoek per kaart/vlak.

## Tone of voice

- **Aanspreekvorm: consequent "je"** — telling over alle 79 CMS-pagina's: 1.647× je/jij/jouw tegenover 25× u/uw; de u-vorm staat vrijwel alleen in juridische pagina's (Privacy Statement, Algemene voorwaarden) en citaten.
- **Activerend en direct:** "Word lid", "Schrijf je in voor onze nieuwsbrief en blijf op de hoogte van alle ontwikkelingen in de bibliotheek!", "Lid worden van Bibliotheek Rotterdam? Vanaf 1 mei kun je kiezen uit twee abonnementen."
- **Helder en laagdrempelig taalniveau** (korte zinnen, vraag-antwoordstructuur in klantenservice; inschatting: B1-niveau — dit niveau is een schatting, niet door de site geclaimd). Er is een aparte "Makkelijk Lezen"-pagina.
- **Rotterdams en maatschappelijk:** de missie spreekt expliciet over "Rotterdammers" ("Bibliotheek Rotterdam helpt Rotterdammers om bewust, kritisch en actief deel te nemen aan de samenleving"); contentseries als "Verhalen van de stad" en de Stadsdichter verankeren het merk in de stad. Kernwoorden uit de missie: leren, ontwikkelen, ontmoeten, verwonderen; open, betrouwbaar en toegankelijk voor iedereen.

## Toegankelijkheid

- **Geen toegankelijkheidsverklaring gevonden** voor `bibliotheek.rotterdam.nl`: geen pagina in de sitemap, geen footer-link, `/toegankelijkheid` en `/toegankelijkheidsverklaring` geven 404, en in het register op toegankelijkheidsverklaring.nl is geen vermelding voor Bibliotheek Rotterdam gevonden (ter vergelijking: de KB voor bibliotheek.nl en Bibliotheek AanZet staan er wél in). Mogelijk hangt dit samen met de zeer recente relaunch (afgeleid).
- **Wel zichtbare toegankelijkheidszorg in de code:** `html lang="nl"`, skip-link met duidelijke focusstijl (oranje pill), `sr-text`-labels bij iconen/socials, aria-attributen, beschrijvende alt-teksten in de CMS-content, focus-stijlen op formuliervelden (oranje rand), Google Translate-integratie en het "Makkelijk Lezen"-aanbod.
- **Contrast (berekende ratio's, afgeleid uit de geziene hexwaarden):**
  - Sterk: zwart op wit 21:1; wit op footer `#38383a` 11,7:1; zwart op de vlakkleuren `#fac494` 13,4:1, `#e2b41d` 10,8:1, `#65baa8` 9,1:1, `#79c4e3` 10,8:1; wit op `#962737` 8,0:1; zwart op `#eeeff5` 18,3:1.
  - **Risico's:** oranje `#ee7203` als tekst-/linkkleur op wit (menu-hover/active, boektitels) haalt **2,98:1** — onder de 4,5:1 voor normale tekst en zelfs nipt onder de 3:1 voor groot/UI; link-hover `#f79136` op wit 2,3:1; witte tekst op roze `#e499bb` 2,2:1. De basistekst (zwart) en de zwarte knoppen zitten daarentegen ruim goed.
- De vorige (Joomla-)site had een voorlees-/screenreader-plugin; op de nieuwe site is zo'n widget niet aangetroffen.

## Advies: vertaling naar onze app

Voorstel voor MD3-achtige rollen, gebaseerd op de geziene waarden. Keuzes/afwijkingen zijn als zodanig gemarkeerd.

| M3-rol | Voorstel | Onderbouwing |
|---|---|---|
| `primary` | `#ee7203` | Merk-oranje uit CSS én het (oude+nieuwe) logo-ecosysteem |
| `on-primary` | `#ffffff` — **alleen voor grote/bold tekst en iconen**; voor lopende tekst op oranje liever `#000` (7,0:1) | wit op `#ee7203` = 2,98:1 (berekend) |
| `primary-container` | `#fac494` | site gebruikt dit exact zo (jumbotrons, zoekblok, avatars) |
| `on-primary-container` | `#000000` | 13,4:1 (berekend) |
| `secondary` | `#38383a` | footer/donkere chips op de site |
| `on-secondary` | `#ffffff` | 11,7:1 (berekend) |
| `tertiary` | `#65baa8` (alternatief `#585f98`) | accentvlakken van de site; on-tertiary `#000` resp. `#fff` |
| `surface` | `#ffffff` | site is wit met kleurvlakken |
| `surface-variant` / `surface-container` | `#eeeff5` en `#f8f8f8` | veld-/borderkleur en subtiele vlakken uit CSS |
| `on-surface` | `#000000`; secundair `#565656` (7,3:1) | body-kleur en placeholder-grijs uit CSS |
| `outline` | `#979797`; `outline-variant` `#eeeff5` | border-kleuren uit CSS |
| `error` | niet aangetroffen in de huisstijl → M3-default rood aanhouden, of `#962737` als merkconforme kandidaat | **keuze/schatting** (geen error-rood gezien) |
| Succes/status | groen `#28a84f` (dot) + `#155927` (tekst); "bezet/uitgeleend" `#b35400` | beschikbaarheids-states uit CSS |
| Oranje als tékstkleur op wit | gebruik `#b35400` (5,0:1) of `#d56603` (3,7:1, alleen groot) | berekend; voorkomt het contrastprobleem van de site |

**Vorm & componenten**

- Knoppen: volledig rond (pill, radius 9999px); primaire knop **zwart met witte tekst** die op hover inverteert (wit + zwarte rand) — dit is een herkenbaar huisstijl-element, neem het over in plaats van een oranje primaire knop.
- Invoervelden: sterk afgerond (~24px), rand `#eeeff5`, focus-rand oranje.
- Kaarten/hero's: het "plectrum"-motief overnemen als signatuur — standaardradius klein (4–8px) plus **één hoek 100px** (bv. rechtsonder) op uitgelichte kaarten en beeld-containers.
- Links in lopende tekst: bold + onderlijning, hover naar oranje (maar dan `#b35400`/`#d56603` i.v.m. contrast).

**Typografie**

- Poppins (Google Fonts/self-hosted woff2), gewichten 400/500/700 (900 optioneel voor display); fallback `Arial, sans-serif`, ideaal met dezelfde `size-adjust`-truc (112,5%).
- Schaal: body 16→18px fluid; h1 48–60px lh 1, h2 32–40px, h3 28px, h4 20px — alle headings 700.

**Beeld & toon**

- Documentaire foto's van echte gebruikers (geen geposeerde stock waar vermijdbaar), gekaderd in de plectrum-vorm.
- Nederlands, je-vorm, korte activerende zinnen; u-vorm alleen in juridische teksten. Streef expliciet naar B1.
- Neem direct een toegankelijkheidsverklaring + WCAG-AA-doel op: de bron-site heeft die (nog) niet, en de oranje-op-wit-valkuil laat zien dat contrast bewaakt moet worden.

## Bronnen

- Bibliotheek Rotterdam — homepage: https://www.bibliotheek.rotterdam.nl/
- Hoofd-stylesheet (basis van vrijwel alle tokens): https://www.bibliotheek.rotterdam.nl/bkw/css/style.rdam.min.css?v=qMSFwQTT2UCYolba5UMUb91QjIbe11aR14lPnLTZPuo
- Logo (header): https://www.bibliotheek.rotterdam.nl/bkw/images/rdam/logo.svg
- Beeldmerk (footer-variant): https://www.bibliotheek.rotterdam.nl/bkw/images/bkw/logo-aanzet.svg
- Poppins-webfonts: https://www.bibliotheek.rotterdam.nl/bkw/fonts/rdam/poppins-v23-latin-regular.woff2 (e.v. 500/700/900)
- CMS-content-API (paginateksten, tone of voice): https://www.bibliotheek.rotterdam.nl/api/drupal/api/pages en menu's via https://www.bibliotheek.rotterdam.nl/api/drupal/api/menu_items/main (+ `main-secondary`)
- JS-bundle (tenant-configuraties, footer-links): https://www.bibliotheek.rotterdam.nl/bkw/js/main.js
- Wayback Machine — oude site (Joomla, landelijk logo): snapshots 1 jan 2026, 5 mrt 2026 en 13 mei 2026 via http://web.archive.org/web/*/bibliotheek.rotterdam.nl
- Oud logo "de Bibliotheek Rotterdam" (SVG, okt 2023): https://commons.wikimedia.org/wiki/File:Logo_Bibliotheek_Rotterdam.svg
- VOB — Landelijke huisstijl en beeldmerk "de Bibliotheek": https://www.debibliotheken.nl/informatie/landelijke-huisstijl-en-beeldmerk-de-bibliotheek/ en portal https://www.landelijkehuisstijl.nl/
- Toegankelijkheidsregister (ter vergelijking): KB/bibliotheek.nl https://www.toegankelijkheidsverklaring.nl/register/2422 en Bibliotheek AanZet https://www.toegankelijkheidsverklaring.nl/register/23257
- Probiblio — wettelijk kader digitale toegankelijkheid bibliotheken: https://www.probiblio.nl/dit-zegt-de-wet-over-digitale-toegankelijkheid2/
