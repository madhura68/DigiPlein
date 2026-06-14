# Digiplein — Productspecificatie

> **Versie:** 0.1 — 2026-06-11 · **Status:** concept, ter review door JP en (daarna) de coördinator van Bibliotheek Rotterdam
> **Werknaam:** "Digiplein" is een placeholder (knipoog naar het Ontwikkelplein van de Centrale Bibliotheek). Naamgeving is een open vraag — kies bewust een **neutrale** naam (zie §6.1: de app niet presenteren als "register laaggeletterden").
> **Documentfamilie:** deze productspecificatie (het wat & waarom + randvoorwaarden) · [mvp-spec.md](mvp-spec.md) (het hoe: functionele spec, datamodel, architectuur, backlog) · [research/](research/) (vijf onderzoeksbijlagen met bronnen).

## 1. Samenvatting

Digiplein is een interne web-app voor het digivaardigheidsteam van Bibliotheek Rotterdam (Centrale Bibliotheek / Ontwikkelplein). De app regelt twee dingen die nu ad hoc lopen:

1. **Vrijwilligersrooster** voor de twee vaste lesochtenden (dinsdag en donderdag, 10:00–12:00): voorkeursdagen, vakanties/afwezigheid en bezetting per lesmoment.
2. **Cliëntregistratie** voor de twee lesvormen — **Klik & Tik** (begeleid zelfstandig oefenen via oefenen.nl, doorlopend, vrijwilliger schat de volgende stap in) en **Les op maat** (1-op-1 met een vooraf bepaald leerdoel, maximaal 4 sessies van 2 uur) — inclusief intake (welke lesvorm past), leerdoel en sessiebewaking, binnen strikte AVG-kaders.

De minimale eerste versie (MVP) is bewust klein: de vier kerntabellen (medewerkers, vrijwilligers, cliënten, cursusaanbod) met beheer-UI, plus het **chat-window** (apart in ontwikkeling) waarmee medewerkers de app via natuurlijke taal kunnen aanpassen en uitbreiden. Het rooster en de leertrajecten volgen direct daarna als begeleide uitbreidingen — zie de backlog in de MVP-spec.

## 2. Probleemstelling

### Het probleem

De coördinatie van de digivaardigheidslessen op de Centrale Bibliotheek draait op losse middelen: wie van de vrijwilligers er op een dinsdag of donderdag staat, wie op vakantie is, welke cliënt met welk leerdoel bezig is en hoeveel van de maximaal vier "Les op maat"-sessies al gebruikt zijn, zit in hoofden, mailtjes, appjes en losse lijstjes. Dat kost de coördinator tijd, maakt overdracht tussen vrijwilligers moeilijk (een cliënt heeft niet elke week dezelfde begeleider) en geeft geen betrouwbaar beeld van bezetting en voortgang.

### De doelgebruiker

Het vaste team rond de lesochtenden: één of enkele **bibliotheekmedewerkers** (coördinatie, intake, verantwoording) en een groep van grofweg **5–20 vrijwilligers** die de begeleiding doen. **Cliënten gebruiken de app niet zelf** — zij zijn onderwerp van registratie, geen gebruiker (zie persona-spanning in §4).

### Hoe het nu gaat

Vergelijkbare teams (IDO Bibliotheek Deventer, Bibliotheek Salland) zijn van mail/app/Excel overgestapt op zelfroosteren binnen kaders, met aantoonbaar minder geregel; Probiblio noemt een registratie- en roostersysteem expliciet een randvoorwaarde voor professionele vrijwilligersinzet in bibliotheken (zie [research/vrijwilligersplanning.md](research/vrijwilligersplanning.md)). Voor de cliëntkant bestaat het Volgsysteem van oefenen.nl (voortgang ín de programma's), maar niets dat rooster, intake, leerdoel en sessiebewaking samenbrengt.

### Wat de app doet

Medewerkers beheren vrijwilligers, cliënten en het cursusaanbod op één plek. Vrijwilligers geven hun voorkeursdag(en) en afwezigheid door en zien wie er per lesochtend staat. Bij een nieuwe cliënt wordt een korte intake vastgelegd (leerwens → inschatting Klik & Tik of Les op maat); bij Les op maat bewaakt de app het leerdoel en het sessiemaximum, bij Klik & Tik legt de vrijwilliger per keer kort de voortgang en de ingeschatte volgende stap vast. Het chat-window laat medewerkers de app gaandeweg aanpassen zonder tussenkomst van een ontwikkelaar.

### Wat de app NIET is

- **Geen cliëntportaal** — cliënten loggen niet in; de app is een werkinstrument voor team en coördinator.
- **Geen leerplatform** — oefenen.nl blijft de plek waar geoefend en gevolgd wordt; de app dupliceert die voortgang niet (AVG: verwijzen, niet kopiëren).
- **Geen vrijwilligers-HR-systeem** — werving, overeenkomsten en uren blijven waar ze zijn (vermoedelijk deels bij UVV Rotterdam — open vraag §10).
- **Geen openbaar systeem** — niets van de app is publiek; geen koppeling met het bibliotheek-ledensysteem.
- **Geen register van "laaggeletterden" of niveau-labels** — alleen functionele leerdoelen (AVG, §6.1).

### Succes-signaal

Na één kwartaal gebruik: het rooster voor di/do wordt volledig in de app bijgehouden (geen parallel lijstje meer), elke actieve cliënt heeft een traject met actueel leerdoel/voortgang in de app, en de coördinator kan in één scherm zien (a) of de komende twee weken bezet zijn en (b) welke Les-op-maat-trajecten hun maximum naderen.

## 3. Context: de twee lesvormen

Feitenbasis uit [research/klik-en-tik-oefenen-nl.md](research/klik-en-tik-oefenen-nl.md) en [research/aanbod-bibliotheek-rotterdam.md](research/aanbod-bibliotheek-rotterdam.md):

| | **Klik & Tik** (site: "Computercursus") | **Les op maat** |
|---|---|---|
| Vorm | Begeleid zelfstandig oefenen op oefenen.nl, in eigen tempo | 1-op-1 (soms klein groepje) op eigen leervraag |
| Duur | Doorlopend; intake bepaalt wat iemand wil leren en hoeveel sessies nodig zijn — **geen vast maximum**; de vrijwilliger schat in wanneer iemand toe is aan een volgende stap | **Maximaal 4 sessies van 2 uur** met vooraf bepaald leerdoel (werkafspraak; de site zegt "1 tot 6 lessen" — **discrepantie, te bevestigen**, §10) |
| Inhoud | Klik & Tik-programmaserie: De start, De basis, Het internet op, Veilig online, Mobiel (Android/iPhone), De tablet (Android/iPad), Toegankelijk; per programma een certificaat | Smartphone, tablet, Windows, Word, e-mail, DigiD, SeniorWeb-trainingen, … |
| Wanneer/waar | di + do 10:00–12:00, Centrale Bibliotheek (tijdens verbouwing: Librijesteeg 4); Klik & Tik draait óók op 9 andere vestigingen met eigen dagdelen | di + do 10:00–12:00, Centrale Bibliotheek |
| Platform | oefenen.nl — gratis voor bibliotheken via landelijke KB-licentie, incl. Volgsysteem voor begeleiders; **geen publieke API** | n.v.t. (deeplinks naar oefenen.nl/SeniorWeb-materiaal mogelijk) |
| Aanmelding | digitaal@bibliotheek.rotterdam.nl / 010-2816100; intakegesprek | idem |

Relevant voor het ontwerp: beide lesvormen delen **dezelfde lesmomenten** (di/do-ochtend, zelfde ruimte, zelfde vrijwilligerspool). Eén rooster met per lesmoment ingedeelde vrijwilligers volstaat dus; de lesvorm zit op het cliënttraject, niet op het lesmoment. Vrijwilligers zijn er volgens de vacaturetekst van 9:30–12:30 (les 10:00–12:00 plus marge — onbevestigd, §10).

## 4. Persona's

| Naam | Rol | Situatie | Primaire behoefte |
|---|---|---|---|
| Sandra (43) | Bibliotheekmedewerker, coördinator digitaal | Runt het programma naast andere taken; Excel + mail + appgroep | Overzicht zonder geregel; verantwoording kunnen afleggen |
| Joke (68) | Vrijwilliger (dinsdag) | 3 jaar Klik & Tik-begeleider; iPad-gebruiker | Vakantie en voorkeur doorgeven zonder bellen of appen |
| Ahmed (52) | Vrijwilliger (donderdag, valt soms in) | Werkt parttime; flexibel maar niet elke week | In één oogopslag zien waar gaten vallen en zichzelf invullen |
| Wim (74) | Cliënt, Klik & Tik | Nooit met een computer gewerkt; wil e-mailen en foto's van de kleinkinderen zien; via IDO doorverwezen | Elke week verder kunnen waar hij bleef, ook bij een andere begeleider |
| Fatima (58) | Cliënt, Les op maat | Redelijke basis; wil specifiek DigiD gebruiken en bijlagen mailen | Haar doel halen binnen de vier afgesproken sessies |

**Sandra** — coördineert intake, rooster en voortgang. Haar slechte dag: dinsdagochtend 9:40, twee vrijwilligers blijken op vakantie (stond in een appje van drie weken terug), er staan zes cliënten op de lijst en de enige aanwezige vrijwilliger weet niet waar Wim vorige week gebleven was. Zij is **de primaire persona voor het beheerdeel**: elk scherm moet haar vragen "wie staat er, wie komt er, wie zit waar in zijn traject" in seconden beantwoorden. Frustratie om te vermijden: een systeem dat alleen werkt als iedereen het perfect bijhoudt.

**Joke** — wil best iets digitaals gebruiken, maar het moet in twee minuten klaar zijn op haar iPad. Zij is **de lakmoesproef voor alles wat vrijwilligers zelf doen**: vakantie doorgeven = één formulier (van–tot), voorkeur = twee vinkjes (di/do). Wachtwoorden zijn een drempel — inloggen via een e-maillink (magic link) past beter. Frustratie: verplichte registratievelden na elke les ("ik kom voor de mensen, niet voor de administratie") — voortgang vastleggen moet in één minuut kunnen.

**Ahmed** — de inval-dynamiek: hij wil een seintje als er op donderdag een gat valt en zichzelf kunnen inroosteren. Transparantie (iedereen ziet het rooster) vervangt een formele ruil-feature.

**Wim & Fatima** — geen gebruikers, wél de maat der dingen voor de cliëntregistratie: Wims overdraagbaarheid vraagt om een kort, feitelijk voortgangsveld ("hoofdstuk 4 e-mail afgerond; volgende keer: bijlagen"); Fatima's traject vraagt om leerdoel + sessieteller (3 van 4 zichtbaar). Alles wat over hen wordt vastgelegd moet voorleesbaar zijn aan henzelf — letterlijk de AVG-notitieregel "schrijf alsof de cliënt meeleest" (§6.1).

**Spanningen**

| Spanning | De een wil | De ander wil | Keuze |
|---|---|---|---|
| Registratiedruk | Sandra: volledige data | Joke: minimale handelingen | Eenvoud wint: per les één scherm, 1 minuut per cliënt; ontbrekende registratie blokkeert niets |
| Zelfservice vs. controle | Vrijwilligers: zelf regelen | Sandra: kloppend rooster | Zelfroosteren binnen kaders (bewezen model, zie onderzoek): vrijwilligers muteren zichzelf, Sandra kan alles overrulen |
| Vastleggen vs. AVG | "Handig om te weten" | Dataminimalisatie | Minimalisatie wint, altijd; het veldenadvies in §6.1 is bindend |

**Primaire persona:** Sandra voor het MVP (beheer); Joke voor elke vrijwilligersgerichte feature daarna. Bij twijfel over een extra veld of stap: zou Joke het op dinsdagochtend om 9:55 nog doen?

## 5. Concept & featureprioritering

### Kernconcept

Eén kleine, rustige web-app in de huisstijl van Bibliotheek Rotterdam die de wekelijkse werkelijkheid van de lesochtenden spiegelt: een rooster dat zichzelf vult op basis van voorkeuren en afwezigheid, en per cliënt een traject dat precies bijhoudt wat hier afgesproken en bereikt is — niet meer. De app groeit mee met het team: medewerkers vragen uitbreidingen via het chat-window in plaats van via een ontwikkelaar.

### De centrale loop

- **Wekelijks (vrijwilliger):** rooster checken → les geven → per begeleide cliënt in één minuut voortgang + volgende stap noteren.
- **Wekelijks (coördinator):** bezetting komende twee weken checken → gaten oplossen (oproep of zelf indelen) → nieuwe aanmeldingen intaken (leerwens → lesvorm-inschatting → traject starten).
- **Per kwartaal:** lesmomenten genereren voor de nieuwe periode (feestdagen/uitval markeren); trajecten opschonen (bewaartermijn, §6.1).

### Features

**v1 — kern (MVP = eerste drie regels; rest volgt direct, zie backlog in [mvp-spec.md](mvp-spec.md))**

| Feature | Waarom kern |
|---|---|
| Beheer van medewerkers, vrijwilligers, cliënten, cursusaanbod (de vier tabellen) | Het datafundament; zonder dit bestaat er niets om te roosteren of te volgen |
| AVG-basics: veldenmodel, notitie-instructie, export & verwijdering per cliënt, audit-log | Randvoorwaarde om überhaupt met persoonsgegevens te mogen werken (§6.1) |
| Chat-window voor medewerkers (apart in ontwikkeling) | De afgesproken uitbreidingsmotor van de app |
| Lesmomenten di/do + inroostering + afwezigheid + bezettingsbewaking (min/max) | Hoofddoel 1: het rooster |
| Vrijwilliger-zelfservice via magic link (voorkeur, afwezigheid, zelf inroosteren) | "Vrijwilligers plannen hun vakantie en geven hun voorkeur" — de userwens letterlijk |
| Intake → leertraject met leerdoel; sessieteller met maximum (Les op maat); voortgang + vervolgstap (Klik & Tik) | Hoofddoel 2: de cliëntregistratie |

**v2 — daarna**

| Feature | Waarom niet v1 |
|---|---|
| E-mailherinnering vóór je lesdag + oproep bij open plek | Waardevol (no-shows), maar het rooster werkt ook zonder |
| Geaggregeerde rapportage (deelnemers/sessies per maand, afgeronde trajecten — anoniem) | Voor verantwoording richting bibliotheek; eerst data opbouwen |
| No-show-registratie vrijwilligers (licht, signaal — geen sanctie) | Naar voorbeeld Inzetrooster; pas zinvol bij vol gebruik |
| Doorverwijsbron bij cliënt (IDO / Taalinformatiepunt / eigen initiatief) | Sluit aan op bestaande flow; niet nodig voor begeleiding zelf |
| ICS-agenda-export voor vrijwilligers | Standaard in elke roostertool; nice-to-have |

**Later**

| Feature | Notitie |
|---|---|
| Meerdere locaties/diensten (Klik & Tik draait op 10 vestigingen; zie uitbreidingscontext §9) | Pas als de Centrale-pilot staat |
| Oefenen.nl-rapportage-import (indien export blijkt te bestaan) | Eerst navragen bij Oefenen.nl (§7) |
| Web-push-notificaties | E-mail volstaat lang |

**Nooit (binnen deze productvisie)**

| Feature | Waarom nooit |
|---|---|
| Velden voor BSN, gezondheid, afkomst, niveau-labels ("laaggeletterd", NT1/NT2) | AVG-verbod resp. bewuste dataminimalisatie — ook het chat-window mag deze niet aanmaken (§6.5) |
| Cliënt-login / cliëntportaal | Doelgroep en doel van de app maken dit onwenselijk; registratie loopt via het team |
| Koppeling met het bibliotheek-ledensysteem | Niet nodig voor het doel; vergroot AVG-voetafdruk |
| Realtime API-koppeling met oefenen.nl | Bestaat niet (geverifieerd juni 2026); alleen heroverwegen bij een formeel aanbod van Oefenen.nl |

### Risico's

| Risico | Kans | Mitigatie |
|---|---|---|
| Governance niet geregeld (FG/verwerkersovereenkomst) terwijl er al echte cliëntdata in staat | Hoog als genegeerd | Harde regel: **dummydata tot FG-akkoord** (§6.1); vroeg contact via privacy@bibliotheek.rotterdam.nl |
| Vrijwilligers registreren niet (te veel moeite) | Hoog | 1-minuut-regel, niets blokkeert, Joke-toets op elk scherm |
| Chat-window-wijzigingen ondermijnen AVG-kaders of breken data | Middel | Guardrails + audit + migratie-/reviewproces (§6.5, MVP-spec §10) |
| Discrepantie sessiemaximum (4 intern vs. "1 tot 6" op de site) | Zeker | Maximum is per cursus configureerbaar; bevestigen bij coördinator (§10) |
| Bus-factor: app leunt op één bouwende vrijwilliger | Middel | Documentatie in deze docs-familie; eigendom data bij de Stichting; exit-afspraak in verwerkersovereenkomst |
| Huisstijl is net vernieuwd (mei/juni 2026) en kan nog schuiven | Middel | Tokens centraal in één theme-bestand; afgeleid van live CSS, geen logo-gebruik zonder toestemming (§6.2) |

## 6. Randvoorwaarden

### 6.1 AVG & privacy (bindend)

Volledige onderbouwing en bronnen: [research/avg-privacy-clientgegevens.md](research/avg-privacy-clientgegevens.md). Kernregels die het ontwerp afdwingen:

1. **Rolverdeling.** Stichting Bibliotheek Rotterdam is verwerkingsverantwoordelijke; de bouwende/hostende vrijwilliger (JP) is verwerker. Vóór er echte cliëntgegevens in de app komen: FG betrekken (privacy@bibliotheek.rotterdam.nl / 010-2816291), verwerking opnemen in het verwerkingsregister van de bibliotheek, DPIA-afweging documenteren (kwetsbare doelgroep!), verwerkersovereenkomst sluiten (JP + hostingprovider als subverwerker). **Tot die tijd draait de app uitsluitend met testdata.**
2. **Grondslag.** Kerngegevens (naam, contact, leerwens/doel, aanwezigheid, traject) op grond van *uitvoering overeenkomst* + *gerechtvaardigd belang* (conform AVG-register Rijksoverheid voor cursusadministratie). Toestemming alleen voor extra's (foto's, doorverwijzing naar derden) — vrij, specifiek, aantoonbaar geregistreerd, en in B1-taal (kort papieren formulier + mondelinge toelichting).
3. **Dataminimalisatie — bindend veldenmodel.** Wél: naam, één contactkanaal, lesvorm, functioneel leerdoel, aanwezigheid/sessieteller, functionele voortgangsnotities, gekoppelde vrijwilliger. Niet: BSN (verboden), gezondheids-/afkomst-/religiegegevens (art. 9), niveau-labels ("laaggeletterd", NT1/NT2), geboortedatum, adres, pasnummer. Notitievelden krijgen een vaste UI-instructie: *feitelijk, cursusgericht, schrijf alsof de cliënt meeleest.*
4. **Bewaartermijnen.** Voorstel (te bekrachtigen door FG): cliëntgegevens tot 12 maanden na laatste deelname, daarna verwijderen; notities als eerste; statistiek alleen geaggregeerd en anoniem (IDO-/Bibliotheekmonitor-model). Termijn motiveren en vastleggen in privacytekst + verwerkingsregister.
5. **Rechten van betrokkenen.** Inzage-export en definitieve verwijdering per cliënt zijn ingebouwde functies vanaf de MVP; verzoeken kunnen mondeling via de begeleider binnenkomen; afhandeling binnen één maand.
6. **Organisatorisch.** Geheimhoudingsverklaring voor alle vrijwilligers (Probiblio-model); datalekprocedure (melder → coördinator → FG; AP-melding binnen 72 uur is aan de bibliotheek); oefenen.nl-voortgang niet dupliceren — verwijzen (deeplink/pseudoniem) in plaats van kopiëren.
7. **Presentatie.** De app heet en oogt neutraal ("cursusplanning"), nooit "register" van wat dan ook; het bestaan van een record onthult al dat iemand lessen volgt — beveiliging en toegang zijn daarnaar ingericht (alleen ingelogde teamleden, geen publieke routes).

### 6.2 Branding & huisstijl

Volledige analyse en tokens: [research/branding-bibliotheek-rotterdam.md](research/branding-bibliotheek-rotterdam.md). De site is in mei/juni 2026 gerelaunched met een eigen merk (zwart woordmerk + oranje "plectrum"-beeldmerk); er is geen publieke merkgids — onderstaande tokens zijn afgeleid uit de live CSS en bindend voor de app tot de bibliotheek een officiële gids levert:

- **Kleur:** primair oranje `#ee7203` (focus/accenten), container-tint `#fac494`, donkergrijs `#38383a`, vlakken `#eeeff5`/`#f8f8f8`, accenten geel `#e2b41d` / teal `#65baa8` / lichtblauw `#79c4e3` / indigo `#585f98` / bordeaux `#962737`; succesgroen `#28a84f`/`#155927`. **Oranje als tekst op wit haalt geen contrast (2,98:1)** — gebruik dan `#b35400` (de site maakt deze fout zelf; wij niet).
- **Componenten:** pill-knoppen (radius 100px), primaire knop zwart→inverteert naar wit met zwarte rand bij hover; invoervelden radius ~25px met oranje focus-rand; signatuur: één 100px-hoek ("plectrum") op uitgelichte kaarten.
- **Typografie:** Poppins 400/500/700 voor alles (headings 700), body 16→18px fluid, fallback Arial.
- **Toon:** Nederlands, je-vorm, korte activerende zinnen, B1-niveau; u-vorm alleen in juridische teksten.
- **Logo:** het beeldmerk/woordmerk van Bibliotheek Rotterdam **niet gebruiken zonder schriftelijke toestemming** van de bibliotheek; tot die tijd alleen de kleur-/vormtaal ("geïnspireerd op"), met appnaam in Poppins.

### 6.3 Toegankelijkheid & taal

- **WCAG 2.2 AA** als doel voor alle schermen — strenger dan de bron-site (die heeft nog geen toegankelijkheidsverklaring). Het team zelf (vrijwilligers van o.a. 68+) én de context (digivaardigheid!) maken dit een kernrandvoorwaarde, geen vinkje: toetsenbordnavigatie, zichtbare focus, contrast ≥ 4,5:1, grote klikdoelen, geen tijdsdruk-interacties.
- Alle UI-tekst Nederlands, B1; formulieren die cliënten te zien krijgen (print: privacy-uitleg, toestemmingsformulier) extra eenvoudig, met mondelinge toelichting als werkwijze.
- Responsive: desktop voor Sandra, tablet (iPad — Joke) en telefoon volwaardig bruikbaar.

### 6.4 Techniek, beveiliging & hosting

- **Stack** (details + rationale in [mvp-spec.md](mvp-spec.md) §9): Next.js (App Router) + TypeScript strict, Tailwind + shadcn/ui met de huisstijl-tokens, Prisma + PostgreSQL, sessie-gebaseerde auth. Bewust dezelfde stack als de overige tooling van de bouwer — bekend terrein, en het chat-window wordt in dit ecosysteem ontwikkeld.
- **Beveiliging:** alles achter login (geen enkele publieke route met data), rollen (beheerder/medewerker; vrijwilliger met beperkte zelfservice-scope), wachtwoord-hashing (bcrypt), magic-link met korte geldigheid voor vrijwilligers, HTTPS-only, audit-log op cliëntmutaties en chat-wijzigingen, back-ups versleuteld.
- **Hosting:** EU-regio verplicht (EER-verwerking); opties: Vercel (EU-functions) + Neon (EU) óf de eigen Ubuntu-server (Docker + Caddy) — keuze is een open vraag (§10), maar in beide gevallen met verwerkersovereenkomst en in beheer overdraagbaar aan de bibliotheek.
- **Omgevingen:** een demo-/testomgeving met dummydata staat los van productie; productie pas gevuld na §6.1-akkoord.

### 6.5 Governance & het chat-window

Het chat-window is het **Scrum4Me-Copilot**-component (ingebed achter een feature-flag). Medewerkers passen de app aan via natuurlijke taal — een AI-agent voert uit. Dat is de uitbreidingsstrategie van dit product; de AVG-kaders worden door het Copilot-platform afgedwongen, *op productniveau*, in twee lagen:

- **Preventief — content-policy-gate (per product).** De Copilot weigert idee-/feature-verzoeken die een verboden veld/feature uit §6.1 noemen (BSN, art. 9-gegevens, niveau-labels, cliëntdata naar externe diensten), *fail-closed*, vóór er iets wordt vastgelegd. De weigerlijst is de bron `lib/avg.ts`, gecureerd geseed in de Scrum4Me-DB als het product-`content_policy`. Elk nieuw persoonsgegevens-veld vereist doel + bewaartermijn en wordt gemarkeerd voor FG-toets.
- **Correctief — job-flow-approval.** Structurele wijzigingen (schema/gedrag) lopen via een plan→review→uitvoer-flow waarin een beheerder (RW/PO) plan/PR/deploy expliciet bevestigt; schemawijzigingen gaan via migraties met reviewmoment en backup, en zijn terug te draaien. Zonder die bevestiging wordt niets uitgevoerd.
- **Audit:** elke chat-geïnitieerde wijziging (wie, wat, wanneer, welke migratie) staat in het audit-log.

Dit vervangt de eerdere bespoke in-app guardrails (ST-202): de ingebedde Copilot-chat raakt DigiPlein's eigen check/confirm-endpoints niet meer. De **form-level** AVG-borging in de cliëntregistratie (Zod `.strict()` + Prisma-model + `lib/avg.ts`) blijft ongewijzigd. Het integratiecontract (hoe het component technisch aanhaakt) staat in [mvp-spec.md](mvp-spec.md) §10.

## 7. Koppeling met oefenen.nl

Conclusie uit [research/klik-en-tik-oefenen-nl.md](research/klik-en-tik-oefenen-nl.md): er is **geen publieke API, SSO of webhook** (geverifieerd juni 2026). De koppeling is daarom organisatorisch, niet technisch:

1. **Eigen registratie is leidend** — de vrijwilliger noteert per sessie programma/module, voortgang en de ingeschatte volgende stap in de app (dit is precies de "inschatting van de vrijwilliger" uit de werkwijze).
2. **Pseudonieme proces-koppeling** — de app genereert per cliënt een pseudonieme oefenen.nl-gebruikersnaam (geen echte naam op het platform nodig; dataminimalisatie) en biedt een checklist: account aangemaakt → gekoppeld aan de groep → leerroute toegekend.
3. **Volgsysteem als naslag** — knop/deeplink per cliënt naar het Volgsysteem-dashboard (certificaten, oefen-voortgang); overnemen in de app blijft beperkt tot status, niet tot oefendata.
4. **Deeplinks naar programma's** bij het leerdoel (bv. `oefenen.nl/programma/serie/klik_en_tik`).
5. **Uitzoekpunt:** bestaat er een rapportage-export in het Volgsysteem? Navragen bij info@oefenen.nl; pas dan wordt optie "periodieke import" reëel (later-feature).

Randvoorwaarde: de KB-licentie (gratis voor bibliotheken, onbeperkt accounts) loopt via de bibliotheek; de app gaat ervan uit dat begeleider-accounts voor het Volgsysteem bestaan.

## 8. Zelf bouwen vs. bestaande tools

Eerlijke toets (zie [research/vrijwilligersplanning.md](research/vrijwilligersplanning.md)): voor alléén het rooster bestaan passende, goedkope tools — Roostermaat is gratis ≤15 vrijwilligers, Inzetrooster het eerste jaar gratis. Zelf bouwen is hier toch verdedigbaar omdat (1) rooster en **cliëntregistratie met AVG-maatwerk** in één systeem moeten samenkomen — dat biedt geen enkele roostertool; (2) het **chat-window-concept** (app die meegroeit via natuurlijke taal) een eigen platform vereist; (3) huisstijl, B1 en eenvoud op deze specifieke doelgroep zijn af te stemmen; (4) de bouwcapaciteit als vrijwilliger beschikbaar is. De spec benoemt dit expliciet zodat de bibliotheek een geïnformeerde keuze maakt — en als alleen het rooster ooit losgetrokken wordt, is "buy" het redelijke alternatief.

## 9. Uitbreidingscontext (na v1)

Bibliotheek Rotterdam heeft 23 locaties en een breed educatief aanbod ([research/aanbod-bibliotheek-rotterdam.md](research/aanbod-bibliotheek-rotterdam.md)). De app start bewust smal (2 lesvormen, 1 locatie, 2 dagdelen), maar het datamodel en de architectuur houden de volgende uitbreidingsassen open — dit is de context waarbinnen latere chat-window-verzoeken en releases moeten passen:

- **Meer diensten/vormvarianten.** Het aanbod kent zeven vormen: open inloop (Hulp bij digitale vragen, Taalcafé, IDO), cursusreeks met vaste groep (klassikaal 10 lessen, smartphone 6, DigiD 3), open-einde-traject met intake (Klik & Tik), 1-op-1 binnen een groepstijdslot (Les op maat), eenmalige workshops, seizoenscampagnes (belastinghulp) en aan-huis-trajecten (Bibliotheek aan Huis, VoorleesExpress). De `courses`-tabel is daarop voorbereid (vorm-type-veld als latere uitbreiding); v1 implementeert er twee.
- **Meer locaties en tijdsloten.** Klik & Tik draait op 10 vestigingen met elk eigen dagdelen; dienst↔locatie is veel-op-veel met eigen weekrooster, locaties kunnen tijdelijk verhuizen (Centrale → Librijesteeg tot 2029). v1 hardcodet di/do op één locatie; het lesmoment-model (losse datumrecords) maakt locatie + tijdslot later toevoegbaar zonder migratiepijn.
- **Rebranding-bestendige naamgeving.** De bibliotheek hernoemt diensten regelmatig (Taalcafé → "Samen Nederlands praten", Digicafé → "Hulp bij digitale vragen", Digisterker → "Oefenen met DigiD"); cursusrecords hebben daarom een stabiele `code` naast een wijzigbare weergavenaam, en aliassen zijn een geplande uitbreiding voor meerjarige rapportage.
- **Rollen & partners.** Veel aanbod draait met partnerorganisaties (SeniorWeb, Nationaal Ouderenfonds, UVV, Rechtswinkel010, Taalhuis-partners); een `partner`-attribuut bij dienst of begeleider is een natuurlijke uitbreiding.
- **Doorverwijzing & rapportage.** IDO en Taalinformatiepunt verwijzen warm door naar deze lessen; een verwijsbron-veld plus geaggregeerde output-rapportage (Bibliotheekmonitor-stijl: aantallen, anoniem) sluiten aan op hoe de sector verantwoordt.
- **Chat-window als groeimotor.** Kleine uitbreidingen (een veld, een filter, een lijstje) lopen via het chat-window binnen de guardrails van §6.5; structurele uitbreidingen (nieuwe vormvariant, multi-locatie) blijven release-werk met deze productspec als toetskader.

## 10. Open vragen & aannames

| # | Vraag / aanname | Aan wie | Blokkeert |
|---|---|---|---|
| 1 | **Sessiemaximum Les op maat:** intern "max 4×2 uur", site zegt "1 tot 6 lessen". Wat is het afgesproken maximum? (App maakt het per cursus configureerbaar; default 4.) | Coördinator | Niets — configureerbaar |
| 2 | **Governance-route:** wordt dit een officieel bibliotheek-traject (FG, verwerkersovereenkomst, register) — en wie is de interne opdrachtgever? Aanname: pilot bouwt met dummydata; livegang pas na akkoord. | Coördinator → FG (privacy@bibliotheek.rotterdam.nl) | Livegang met echte data |
| 3 | **Rol UVV Rotterdam:** doet UVV de vrijwilligersadministratie (werving/overeenkomsten)? Dan beheert de app alléén rooster-relevante gegevens — geen dubbeling. (Onbevestigd uit onderzoek.) | Coördinator | Veldenscope `volunteers` |
| 4 | **Scope locatie:** alleen Centrale (Librijesteeg 4), of vanaf het begin rekening houden met een tweede vestiging? Aanname: alleen Centrale in v1. | Coördinator | Niets — model is voorbereid |
| 5 | **Aanwezigheidstijden vrijwilligers:** 9:30–12:30 (vacaturetekst, onbevestigd) vs. lestijd 10:00–12:00. Toont het rooster de marge? Aanname: rooster toont lesmoment 10:00–12:00. | Coördinator | Niets |
| 6 | **Schaal & bezetting:** hoeveel actieve vrijwilligers en cliënten zijn er nu; wat is min/max bezetting per lesmoment? Aanname: 5–20 vrijwilligers, min 2 / max 4 per ochtend (configureerbaar). | Coördinator | Defaults |
| 7 | **Chat-window:** welk component is dit precies (repo/status), wat is het deploymodel en welk agent-account voert wijzigingen uit? Spec definieert alleen het integratiecontract (mvp-spec §10). | JP | M2 in de backlog |
| 8 | **Hosting:** Vercel EU + Neon, of eigen Ubuntu-server? Wie betaalt/beheert op termijn (overdraagbaarheid aan de bibliotheek)? | JP + bibliotheek | M0-keuze, niet de bouwstart |
| 9 | **Naamgeving app:** "Digiplein" als werknaam akkoord, of kiest het team iets anders (neutraal, geen "register"-lading)? | Team | Niets |
| 10 | **Oefenen.nl-export:** bestaat er een rapportage-export in het Volgsysteem? Navragen via info@oefenen.nl. | JP (mailtje) | Alleen de later-feature "import" |

## 11. Bronnen

Alle beweringen in dit document zijn herleidbaar via de vijf onderzoeksbijlagen (met URL's en expliciete onzekerheidsmarkeringen):

- [research/vrijwilligersplanning.md](research/vrijwilligersplanning.md) — roosterpraktijken, tools, bibliotheeksector
- [research/klik-en-tik-oefenen-nl.md](research/klik-en-tik-oefenen-nl.md) — Klik & Tik, oefenen.nl, Volgsysteem, Les op maat
- [research/branding-bibliotheek-rotterdam.md](research/branding-bibliotheek-rotterdam.md) — huisstijl/design tokens (live CSS, juni 2026)
- [research/aanbod-bibliotheek-rotterdam.md](research/aanbod-bibliotheek-rotterdam.md) — dienstenaanbod, locaties, vormvarianten
- [research/avg-privacy-clientgegevens.md](research/avg-privacy-clientgegevens.md) — AVG-grondslagen, veldenadvies, governance
