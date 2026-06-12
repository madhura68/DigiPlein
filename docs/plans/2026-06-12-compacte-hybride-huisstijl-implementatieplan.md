# Implementatieplan — Compacte hybride huisstijl DigiPlein

> **Status:** ter goedkeuring · **Datum:** 2026-06-12 · **Versie:** 0.1
> **Bron:** design-spec [compacte hybride huisstijl](../superpowers/specs/2026-06-12-digiplein-compacte-hybride-huisstijl-design.md) + [branding-review](../reviews/branding-review-2026-06-12.md). Merk-details: [branding-bijlage](../research/branding-bibliotheek-rotterdam.md) (leidend voor tokens/typografie/hardstops; het design-spec is leidend voor de structuur).
> **Reikwijdte:** UI-herstructurering van de bestaande MVP (M0–M2). Géén nieuwe features, géén datamodel- of auth-wijziging.

---

## 1. Doel & context

Geef de ingelogde DigiPlein-app de herkenbare structuur van een bibliotheeksite — **compacte witte header + volle oranje navigatiebalk + grijze pagina-achtergrond + zoek-/filterblok + witte plectrum-contentkaarten** — zonder de bestaande toegankelijkheids- en Bibliotheek Rotterdam-hardstops te breken. De app blijft een rustige interne beheerapp; geen marketingsite, geen Bootstrap, geen extern logo.

Drie vastgelegde keuzes (design-spec): visuele richting = **hybride met huidige brandregels**; app-shell = **compacte werk-shell**; contentpatroon = **hybride beheerlist**.

## 2. Niet-doelen

- Geen Bootstrap/Angular; de bestaande Next.js + Tailwind v4 + Base UI/shadcn-laag blijft.
- Geen Bibliotheek Rotterdam- of landelijk bibliotheeklogo.
- Geen publieke landingpage/marketingsite.
- Geen wijziging aan datamodel, server-actions, auth of de AVG-borging.

## 3. Hardstops (bindend)

- **Hex alleen in `app/styles/theme.css`** (hex-scan blijft); componenten gebruiken tokens.
- **Oranje `#ee7203` nooit als tekst op wit.** Tekstlinks op wit = `#b35400` (`text-primary-text`, 5,0:1). Wit op oranje alleen voor groot/bold/icon (nav-labels); normale tekst op oranje = zwart.
- **Primaire actie blijft zwart** met witte tekst en pill-radius (geen oranje primaire knop).
- **Plectrum-motief** (één 100px-hoek) op uitgelichte kaarten.
- **Focus-indicator** minstens net zo zichtbaar als nu (de zwarte box-shadow-ring uit de M2-a11y-sweep blijft).
- **Base UI met `render`-prop**, geen `@radix-ui/*`/`asChild`.
- **Semantische `<nav>`** met duidelijke actieve staat; de shell is `print:hidden`.

## 4. Nieuwe/aan te passen bestanden

```
app/
├── (app)/                          # route-group: ingelogde pagina's onder de shell
│   ├── layout.tsx                  # requireStaff + <AppShell> (HS-2)
│   ├── page.tsx                    # Start-overzicht (verhuisd vanaf app/page.tsx)
│   ├── clienten/…                  # verhuisd; export blijft chrome-vrij via print:hidden
│   ├── vrijwilligers/… cursusaanbod/… medewerkers/… audit/…
│   └── stijlgids/page.tsx
├── login/…                         # BLIJFT buiten de group (geen shell)
├── layout.tsx                      # root: alleen <html>/<body>/fonts (header eruit)
components/
├── app-shell.tsx                   # compacte header + utility-items + oranje nav (HS-2)
├── brand-mark.tsx                  # optionele oranje plectrum-"D" (HS-2)
├── page-header.tsx                 # titel + B1-uitleg + primaire actie rechts (HS-3)
├── filter-panel.tsx                # plectrum zoek-/filterblok (HS-3)
├── admin-list.tsx                  # witte plectrum-contentkaart met header + rijen (HS-3)
└── ui/
    ├── status-chip.tsx             # toegankelijke statuskleur-chips (HS-3)
    └── checkbox.tsx                # huisstijl-checkbox, geen native blauw (HS-3)
app/styles/theme.css                # grijze page-bg, success-foreground, on-brand (HS-1)
__tests__/…                         # token-pair-contrasttest + shell/pagina-render (HS-1/7)
```

## 5. Stories

### HS-1 — Thema-correcties
- **Aanpak.** `theme.css`: (a) pagina-achtergrond grijs — `body` naar `--surface-container` (#f8f8f8) of een nieuw `--page` token, contentkaarten blijven wit (`--card` #fff); (b) `--success-foreground` naar **zwart** (wit op #28a84f = 3,1:1, faalt AA) en statuslabels via `text-success-text` op lichte container; (c) een expliciet **`on-brand` = zwart**-uitgangspunt vastleggen, plus een token voor de oranje nav-achtergrond + de donkerder actieve-staat (`--brand-hover` #d56603 bestaat al). Stijlgids-swatch die wit-op-oranje toont corrigeren (`app/stijlgids/page.tsx`).
- **Bestanden.** `app/styles/theme.css`, `app/globals.css` (evt. `bg-page`/`text-on-brand`-utilities), `app/stijlgids/page.tsx`, `__tests__/theme-hex-scan.test.ts` of nieuw `__tests__/theme-contrast.test.ts`.
- **Testaanpak.** **Token-pair-contrasttest**: bereken voor elk `bg-*`/`text-*-foreground`-paar de ratio uit de hex in theme.css en eis ≥ 4,5:1 (normale tekst) — vangt success-, brand- en toekomstige paren. Hex-scan blijft.
- **Klaar wanneer.** Grijze pagina-achtergrond, witte kaarten; geen tokenpaar onder AA; contrasttest groen.

### HS-2 — AppShell + navigatie + route-group
- **Aanpak.** `components/app-shell.tsx`: bovenrij = DigiPlein-woordmerk links (Poppins; optioneel `brand-mark.tsx` met oranje plectrum-"D") + utility-items rechts (rol/naam + uitloggen). Daaronder een **volle oranje `<nav>`** met items **Start · Cliënten · Vrijwilligers · Cursusaanbod**, en **Audit-log alleen voor ADMIN**. Actieve link (via `usePathname`) = donkerder oranje overlay + witte onderrand; nav horizontaal scrollbaar op smal scherm. Hele shell `print:hidden`. **Route-group `app/(app)/`** met `layout.tsx` = `requireStaff()` + `<AppShell>`; alle ingelogde routes verhuizen daarheen (`git mv`, URLs blijven gelijk). `app/layout.tsx` wordt teruggebracht tot `<html>/<body>`/fonts (de globale header verdwijnt). `/login` blijft buiten de group. De cliënt-export blijft chrome-vrij dankzij `print:hidden`.
- **Bestanden.** `components/app-shell.tsx`, `components/brand-mark.tsx` (optioneel), `app/(app)/layout.tsx`, `app/layout.tsx`, verplaatsing van `clienten/ vrijwilligers/ cursusaanbod/ medewerkers/ audit/ stijlgids/ page.tsx` naar `app/(app)/`. `app/page.tsx` → `app/(app)/page.tsx`.
- **Testaanpak.** Render-test shell: ADMIN ziet Audit-link, STAFF niet; actieve link gemarkeerd; uitloggen aanwezig; nav is een `<nav>`-landmark.
- **Afhankelijkheden.** HS-1. Vervangt de tegel-navigatie uit ST-107 (zie HS-6).
- **Klaar wanneer.** Ingelogde pagina's tonen de shell; `/login` en de print-export niet; verify + build groen.

### HS-3 — Content-componenten (PageHeader, FilterPanel, AdminList, StatusChip, Checkbox)
- **Aanpak.** `page-header.tsx` (titel + korte B1-beschrijving + optionele primaire actie rechts). `filter-panel.tsx` (plectrum-kaart met zoek-/filtervelden boven een lijst). `admin-list.tsx` (witte plectrum-contentkaart met koprij + datarijen; kolommen blijven zichtbaar; eerste kolom = naam/titel als `text-primary-text`-link + korte secundaire regel; rij-acties rechts als kleine secundaire pill-knoppen/tekstlinks). `ui/status-chip.tsx` (vaste toegankelijke tokenparen per status). `ui/checkbox.tsx` (Base UI of native met `accent-color: var(--brand)`, 4px-radius, gedeelde focus-ring) — vervangt alle native checkboxen.
- **Bestanden.** de vijf componenten + tests; `__tests__/app/…` render-tests.
- **Testaanpak.** Render-test per component (PageHeader toont actie; FilterPanel rendert velden; AdminList rendert koppen + rijen + acties; StatusChip toont label met juiste tokenparen; Checkbox heeft label-associatie + focus-ring).
- **Afhankelijkheden.** HS-1, HS-2.
- **Klaar wanneer.** Componenten renderen los; toegankelijk (labels, focus, contrast).

### HS-4 — Cliëntenpagina als referentiescherm
- **Aanpak.** `/clienten` omzetten naar `PageHeader` (+ "Nieuwe cliënt"-actie) → `FilterPanel` (zoek + status-filter) → `AdminList`. Kolommen: **naam** (donker-oranje link + leerwens/laatste-stap als detailregel), **lesvorm**, **status** (chip), **actie**. Het cliëntformulier blijft een rustig wit vlak (gebruikt de nieuwe `Checkbox` waar van toepassing).
- **Bestanden.** `app/(app)/clienten/page.tsx`, evt. `clienten-form.tsx` (checkbox), `query.ts`.
- **Testaanpak.** Bestaande cliënten-tests bijwerken; render-test: PageHeader + FilterPanel + AdminList aanwezig, naam is link, status-chip rendert.
- **Afhankelijkheden.** HS-3.
- **Klaar wanneer.** `/clienten` volgt het nieuwe patroon; verify groen. Dit scherm is de **referentie** voor HS-5.

### HS-5 — Vrijwilligers, cursusaanbod, medewerkers, audit-log
- **Aanpak.** Zelfde patroon als HS-4 per scherm: Vrijwilligers (naam/contact · voorkeursdagen · geheimhouding/status · actie), Cursusaanbod (naam/code · sessies/duur · lesdagen · status · actie), Medewerkers (naam/e-mail · rol · status · actie), Audit-log (mag dichter bij tabelvorm blijven, maar binnen dezelfde shell + contentkaart). Alle native checkboxen → `Checkbox`.
- **Bestanden.** de respectieve `app/(app)/…/page.tsx` + forms.
- **Testaanpak.** Bestaande tests per scherm bijwerken; rendercontroles.
- **Afhankelijkheden.** HS-4.
- **Klaar wanneer.** Alle beheerschermen volgen het patroon; verify groen.

### HS-6 — Startscherm, detail/formulierpagina's & stijlgids
- **Aanpak.** **Startscherm** (`app/(app)/page.tsx`): de navigatietegels uit ST-107 worden vervangen door de shell-nav; "Start" wordt een rustig overzicht (begroeting + ruimte gereserveerd voor het latere "vandaag"-overzicht, M3/M4 — YAGNI) met de chat-affordance. Detail-/[id]- en formulierpagina's draaien onder dezelfde shell maar krijgen geen grote zoekkaart — rustige witte vlakken met labels en afgeronde velden. **Stijlgids** bijwerken naar de compacte hybride richting (shell, nav, PageHeader, FilterPanel, AdminList, StatusChip, Checkbox tonen).
- **Bestanden.** `app/(app)/page.tsx`, `app/(app)/stijlgids/page.tsx`, de `[id]`-detailpagina's, `components/tile.tsx` (mogelijk uitgefaseerd of beperkt tot het Start-overzicht).
- **Testaanpak.** Startscherm-rendertest bijwerken (geen tegel-navigatie meer; begroeting + chat-slot); stijlgids bouwt.
- **Afhankelijkheden.** HS-2, HS-3.
- **Klaar wanneer.** Startscherm + details + stijlgids volgen de nieuwe richting.

### HS-7 — Verificatie & toegankelijkheid
- **Aanpak.** Volledige sweep: render/DOM-tests bijgewerkt, token-pair-contrasttest, hex-scan, geen radix/asChild. Handmatig: desktop + smalle viewport visueel; toetsenbordnavigatie door shell → nav → filters → lijstacties; oranje nav scrollt/klapt in zonder tekstoverlap. `npm run verify && npm run build`.
- **Klaar wanneer.** Alle acceptatiecriteria (zie §7) gehaald; verify + build groen; handmatige a11y-check gedocumenteerd.

## 6. Risico's & aandachtspunten

- **Route-group-verhuizing (HS-2)** is de grootste structurele wijziging: import-paden van verplaatste pagina's controleren; `proxy.ts`-matcher en de `/api/*`-uitzondering blijven ongewijzigd (route-groups veranderen geen URL's). De cliënt-export moet chrome-vrij blijven (`print:hidden` op de shell — verifiëren in print-preview).
- **Wit-op-oranje nav**: nav-labels zijn bold/large genoeg voor wit-op-#ee7203? Anders donkerder oranje-vlak of zwarte labels. Contrast narekenen in HS-1.
- **Tegel-navigatie vervalt** (ST-107): de shell-nav neemt het over; het Start-overzicht mag niet "leeg" aanvoelen — reserveer ruimte voor M3/M4 zonder te bouwen.
- **Mobiel**: oranje nav horizontaal scrollen of inklappen; geen tekstoverlap.
- **Tests die de oude layout aannemen** (smoke/startscherm) moeten mee.

## 7. Acceptatiecriteria (uit het design-spec)

- [ ] Compacte witte header met DigiPlein-branding + volle oranje navigatiebalk (semantische `<nav>`, actieve staat).
- [ ] Beheerpagina's met zoek-/filterblok en witte plectrum-contentkaart.
- [ ] Primaire acties zwart (niet oranje); tekstlinks op wit donker-oranje `#b35400`.
- [ ] Geen Bibliotheek Rotterdam-logo; geen oranje tekst op wit; geen tokenpaar onder AA (success gecorrigeerd).
- [ ] Huisstijl-checkbox i.p.v. native blauw.
- [ ] Bruikbaar op desktop, tablet en telefoon; toetsenbordtoegankelijk.
- [ ] `npm run verify` en `npm run build` slagen.

## 8. Aanpak na goedkeuring

Conform Scrum4Me-methodiek + ADR-0003: **na goedkeuring** een sprint + PBI/stories aanmaken (HS-1…HS-7) op een nieuwe branch `feat/huisstijl-compacte-hybride` (afgetakt van de laatste MVP-branch), per story bouwen + verifiëren + committen, en als één PR opleveren. **Nu niet uitvoeren** — eerst akkoord op dit plan.
