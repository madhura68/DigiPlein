# Design-spec — responsive sidebar-menu DigiPlein

Status: approved_by_user  
Datum: 2026-06-13  
Branch: `codex/responsive-sidebar-menu`

## Doel

DigiPlein moet beter bruikbaar worden op telefoon en tablet. De eerste stap is
een responsive menu dat de huidige hoofdnavigatie toegankelijk maakt op kleine
schermen zonder de bestaande desktopervaring te verstoren.

## Scope

In scope:

- Telefoon/tablet krijgen altijd een overlay-drawer als menu.
- Desktop houdt voorlopig de bestaande compacte header met oranje horizontale
  navigatiebalk.
- De drawer gebruikt dezelfde navigatiebron als de desktopnav:
  `Start`, `Cliënten`, `Vrijwilligers`, `Cursusaanbod`, `Account`, en
  `Audit-log` alleen voor `ADMIN`.
- Actieve route werkt gelijk aan de huidige nav, inclusief `/account/*`.
- De drawer sluit na navigeren, via sluitknop, Escape en backdrop.

Out of scope:

- Een vaste desktop-sidebar.
- Nieuwe navigatie-items.
- Herstructureren van routes of pagina-layouts.
- Nieuwe iconenset of externe UI-library.

## Branding- en themevoorwaarden

De responsive sidebar volgt de bestaande DigiPlein-huisstijl:

- WCAG 2.2 AA blijft doel: toetsenbordbediening, zichtbare focus, gekoppelde
  labels/landmarks, contrast minimaal 4,5:1 voor normale tekst en klikdoelen
  van minimaal 44px.
- Merk-oranje `#ee7203` wordt niet als normale tekstkleur op wit gebruikt.
  Oranje mag als vlak, rand, focus of accent. Tekst op oranje is zwart.
- De bestaande compacte werk-shell blijft leidend: witte utility-header,
  Bibliotheek-oranje navigatievlak, Poppins en rustige beheerapp-uitstraling.
- Componenten blijven bij `@base-ui/react`; geen Radix-imports en geen
  `asChild`.
- De shell blijft `print:hidden`, zodat export-/printpagina's schoon blijven.

## Gekozen ontwerp

Op schermen onder desktopbreedte toont de witte header links het DigiPlein-merk
en rechts een knop `Menu`. De oranje horizontale navigatiebalk wordt op deze
breedtes verborgen. De knop opent een overlay-drawer vanaf links.

De drawer is een Base UI `Dialog` met:

- een titel `Menu`;
- een duidelijke sluitknop;
- een semantische nav-landmark voor de menu-items;
- dezelfde rolfiltering als de desktopnav;
- actieve linkmarkering;
- een korte accountregel met naam en rol;
- de bestaande uitlogactie.

Op desktop blijft de huidige horizontale navigatie zichtbaar. De drawerknop is
dan verborgen. Daarmee is deze stap klein en laag-risico, terwijl het mobiele
gebruik direct verbetert.

## Alternatieven

### 1. Overlay-drawer op telefoon/tablet, desktop blijft gelijk

Aanbevolen en gekozen. Dit raakt de bestaande desktop-layout minimaal en past
goed bij kleine schermen. De implementatie kan zich beperken tot de app-shell.

### 2. Overlay-drawer op telefoon/tablet plus vaste sidebar op desktop

Consistenter als navigatieconcept, maar groter qua wijziging. Alle pagina's
krijgen minder horizontale ruimte en moeten opnieuw visueel worden beoordeeld.
Niet nodig voor de eerste mobiele stap.

### 3. Drawer overal, ook desktop

Technisch eenvoudig, maar minder efficiënt voor een beheerapp. Desktopgebruikers
verliezen directe scanbare navigatie.

## Componentgrenzen

`components/app-shell.tsx` blijft de plek voor shell en navigatie. Als het
bestand te druk wordt, wordt de drawer als kleine private subcomponent in
hetzelfde bestand of als `components/mobile-nav-drawer.tsx` afgesplitst.

De `NAV`-lijst en `isActive()` blijven de enige bron voor navigatiegedrag. De
desktopnav en drawer gebruiken allebei dezelfde gefilterde `items`.

## Gedrag en states

- Menu openen: knop `Menu` opent de drawer.
- Menu sluiten: sluitknop, Escape, backdrop en navigatieklik sluiten de drawer.
- Route actief: link krijgt `aria-current="page"` op dezelfde manier als de
  desktopnav.
- Rolgedrag: `Audit-log` staat alleen in drawer en desktopnav voor `ADMIN`.
- Geen sessie: `AppShell` wordt niet gerenderd, dus ook geen drawer.

## Testaanpak

Unit/render-tests:

- `AppShell` toont een `Menu`-knop voor de responsive drawer.
- Drawer bevat dezelfde nav-items voor `ADMIN`.
- Drawer verbergt `Audit-log` voor `STAFF`.
- Actieve route werkt in de drawer op `/account/wachtwoord`.
- Desktopnav blijft aanwezig en bestaande tests blijven groen.
- Uitloggen blijft minimaal 44px klikhoogte; drawerknoppen ook.

Verificatie:

- `npm run verify`
- `npm run build`
- Browsercheck op 390px en desktop:
  - geen horizontale overflow;
  - drawer opent/sluit;
  - focus en klikdoelen zijn bruikbaar;
  - desktopnav blijft zichtbaar op desktop;
  - mobiele horizontale nav is verborgen.

## Open punten

Geen blokkerende open punten. Een vaste desktop-sidebar blijft een mogelijke
latere uitbreiding en wordt bewust niet meegenomen in deze eerste stap.
