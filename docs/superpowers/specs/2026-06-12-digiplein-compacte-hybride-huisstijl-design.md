# Design-spec — compacte hybride huisstijl DigiPlein

Datum: 2026-06-12

Status: goedgekeurde ontwerprichting, nog niet geimplementeerd.

## Context

De huidige DigiPlein-app volgt de Bibliotheek Rotterdam-brandingdoc: Poppins, Bibliotheek-oranje als accent/focus, zwarte primaire knoppen, plectrum-hoeken en geen oranje tekst op wit. De gebruiker leverde daarnaast een voorbeeldrichting aan gebaseerd op een Bootstrap 5/Angular-achtige site: grijze pagina-achtergrond, witte contentkaarten, compacte utility-header, logozone, volle oranje navigatiebalk, zoekblok en lijst/contentkaart.

Tijdens de visuele afstemming zijn drie keuzes gemaakt:

- Visuele richting: **hybride met huidige brandregels**.
- App-shell: **compacte werk-shell**.
- Contentpatroon: **hybride beheerlist**.

## Doel

Geef DigiPlein duidelijker de structuur van de voorbeeldsite zonder de bestaande toegankelijkheids- en Bibliotheek Rotterdam-hardstops te breken. De app moet meer aanvoelen als een herkenbare bibliotheeksite, maar blijven werken als een rustige interne beheerapp voor medewerkers.

## Niet-Doelen

- Geen Bootstrap introduceren. De app blijft Next.js/Tailwind/shadcn-achtig en gebruikt de bestaande componentlaag.
- Geen Bibliotheek Rotterdam-logo of landelijk bibliotheeklogo gebruiken zonder toestemming.
- Geen oranje tekst op wit met onvoldoende contrast.
- Geen volledige marketingwebsite of publieke landingpage bouwen.

## Visuele Richting

De voorbeeldsite is leidend voor de hoofdstructuur:

- lichtgrijze pagina-achtergrond;
- witte header;
- compacte utility-items rechtsboven;
- volle oranje hoofdnavigatie;
- zoek-/filterblok boven lijsten;
- witte contentkaart voor resultaten.

De DigiPlein/Bibliotheek Rotterdam-brandregels blijven leidend voor de details:

- Poppins blijft de primaire fontfamilie;
- primaire acties blijven zwart met witte tekst en pill-radius;
- oranje wordt gebruikt als vlak, navigatieachtergrond, focus en accent;
- tekstlinks op wit gebruiken donker oranje `#b35400`;
- contentkaarten mogen het plectrum-motief gebruiken;
- focusindicatoren blijven WCAG 2.2 AA zichtbaar.

## App-Shell

Gebruik een compacte shell op ingelogde pagina's:

- Bovenste rij: DigiPlein-woordmerk links, utility-items rechts.
- Utility-items: minimaal account/rol en uitloggen; taal kan later worden toegevoegd als er echte taalfunctionaliteit is.
- Onder de top-rij: een volle oranje navigatiebalk.
- Navigatie-items: Start, Clienten, Vrijwilligers, Cursusaanbod; Audit-log alleen voor beheerders.
- Actieve nav-link krijgt donkerder oranje overlay en witte onderrand.
- Shell is `print:hidden`, zodat export/printpagina's schoon blijven.

Logo/woordmerk:

- Geen extern bibliotheeklogo.
- DigiPlein-woordmerk in Poppins.
- Optioneel een eenvoudige DigiPlein-markering in oranje plectrum-vorm met "D", zolang dit geen Bibliotheek Rotterdam-logo suggereert.

## Pagina-Layout

Ingelogde beheerpagina's gebruiken:

- `body`/page background: lichtgrijs of surface-container, niet puur wit.
- Contentbreedte blijft beheersbaar: ongeveer de huidige `max-w-5xl` of iets ruimer als lijsten dat nodig hebben.
- Paginaheader met titel, korte B1-uitleg en primaire actie rechts.
- Zoek-/filterblok direct onder de paginaheader.
- Resultaten in een witte plectrum-contentkaart.

Voor detail- en formulierpagina's geldt dezelfde shell, maar niet elk formulier hoeft een grote zoekkaart te krijgen. Formulieren blijven rustige witte vlakken met duidelijke labels en afgeronde velden.

## Contentpatroon

Gebruik een hybride beheerlist in plaats van pure Bootstrap-activiteitrijen:

- Kolommen blijven zichtbaar voor scanbaarheid.
- Eerste kolom bevat de naam/titel als donker-oranje tekstlink met korte secundaire regel.
- Statussen gebruiken chips met toegankelijke tokenparen.
- Rij-acties staan rechts als kleine secundaire pill-knoppen of tekstlinks.
- De lijst staat in een witte contentkaart met plectrum-hoek.

Per scherm:

- Clienten: naam, leerwens/laatste stap als detailregel, lesvorm, status, actie.
- Vrijwilligers: naam/contact, voorkeursdagen, geheimhouding/status, actie.
- Cursusaanbod: naam/code, sessies/duur, lesdagen, status, actie.
- Medewerkers: naam/e-mail, rol, status, actie.
- Audit-log: kan dichter bij tabelvorm blijven vanwege log-data; wel binnen dezelfde contentkaart en shell.

## Componenten

Aanpassen of toevoegen:

- `AppShell`: gedeelde compacte shell met brand header en oranje nav.
- `PageHeader`: titel, beschrijving en optionele primaire actie.
- `FilterPanel`: plectrum-zoek/filterblok.
- `DataPanel` of `AdminList`: witte plectrum-contentkaart met header en rijen.
- `StatusChip`: gebruikt vaste toegankelijke statuskleuren.
- `Checkbox`: gedeelde huisstijlcheckbox, zodat native blauwe browseraccenten verdwijnen.

Bestaande componenten blijven bruikbaar:

- `Button` blijft zwarte primaire pill-knop.
- `Input` blijft afgerond met oranje focusrand.
- `Card` blijft de basis voor plectrum-vormen.

## Toegankelijkheid

Hardstops:

- Oranje `#ee7203` niet gebruiken als tekstkleur op wit.
- Wit op oranje alleen voor nav/large-bold/icon-achtige gevallen; normale tekst gebruikt zwart of `#b35400`.
- Success-tokenpaar corrigeren: geen witte tekst op `#28a84f` voor normale tekst.
- Focusindicator blijft minimaal net zo zichtbaar als nu.
- Navigatie heeft semantische `nav` en duidelijke actieve staat.
- Mobiel: oranje nav mag horizontaal scrollen of inklappen, maar tekst mag niet overlappen.

## Teststrategie

Aanpassen/uitbreiden:

- Render-tests voor shell: juiste nav-items per rol, actieve link, uitloggen zichtbaar.
- Snapshot/DOM-tests voor beheerpagina's: paginaheader, filterpanel en adminlist renderen.
- Thema-test uitbreiden met contrastchecks voor tokenparen zoals success en brand-on-brand.
- Hex-scan blijft gelden: hexwaarden alleen in `app/styles/theme.css`.
- Geen `@radix-ui/*` of `asChild`; Base UI/render-prop-regel blijft gelden.

Handmatige verificatie:

- Desktop en smalle viewport visueel checken.
- Toetsenbordnavigatie door shell, nav, filters en lijstacties.
- `npm run verify && npm run build`.

## Implementatievolgorde

1. Thema corrigeren: grijze page-background, success foreground, eventueel brand-on-brand token.
2. Shell-component toevoegen en in `app/layout.tsx`/ingelogde routes gebruiken.
3. PageHeader, FilterPanel en AdminList toevoegen.
4. Clientenpagina omzetten als referentiescherm.
5. Vrijwilligers, cursusaanbod, medewerkers en audit-log volgen.
6. Stijlgids bijwerken naar de nieuwe compacte hybride richting.
7. Tests en build draaien.

## Acceptatiecriteria

- De app heeft een compacte witte header met DigiPlein-branding en een volle oranje navigatiebalk.
- Beheerpagina's gebruiken een zoek-/filterblok en witte plectrum-contentkaart.
- Primaire acties zijn zwart, niet oranje.
- Tekstlinks op wit gebruiken toegankelijke donker-oranje tekst.
- Geen Bibliotheek Rotterdam-logo is gebruikt.
- De UI blijft bruikbaar op desktop, tablet en telefoon.
- `npm run verify` en `npm run build` slagen.
