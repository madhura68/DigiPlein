# Onderzoeksbijlage — Vrijwilligersplanning & roosteren

> **Status:** informatief · webonderzoek d.d. 2026-06-11 · onbevestigde punten zijn in de tekst gemarkeerd.
> Hoort bij: [product-spec.md](../product-spec.md)

## Samenvatting

Nederlandse vrijwilligersorganisaties verschuiven van coördinator-gestuurd plannen naar **zelfroosteren binnen kaders**: de coördinator zet diensten en bezettingseisen uit, vrijwilligers schrijven zichzelf in, melden afwezigheid en regelen wissels onderling. Dit model wordt expliciet beschreven bij het IDO van Bibliotheek Deventer (kwartaalplanning op basis van opgegeven beschikbaarheid) en bij Bibliotheek Salland (zelfroosteren met "Het Rooster", aanbevolen door de VOB). Probiblio benoemt een registratie- en roostersysteem als onderdeel van een "professionele inrichting" van vrijwilligersinzet in bibliotheken; een kant-en-klare rooster-handreiking van NOV of Movisie is **niet gevonden** — wel een NOV-forumdiscussie waarin Spond, Het Rooster en InPlanning worden aanbevolen. De NL-toolmarkt is volwassen (Inzetrooster, Roostermaat, Het Rooster, Ons Rooster/InPlanning, SuperSaaS, TopRooster) met prijzen van gratis tot ca. €1.000/jaar; meerdere gratis tiers dekken een team van 5–20 vrijwilligers al af. Standaardfeatures overal: zelf inschrijven, afwezigheid/uitroosteren, automatische herinneringen, ruilen/overdragen, en realtime bezettingsinzicht. Voor de MVP betekent dit: terugkerende lesmomenten (di/do 10:00–12:00), voorkeursdagen, afwezigheidsperiodes, min/max-bezetting met signalering, en mailherinneringen — meer niet.

## Bevindingen

### 1. Hoe organiseren vrijwilligersorganisaties het roosteren?

**Zelfroosteren binnen kaders is de dominante best practice.** De IDO-coördinator van Bibliotheek Deventer (ruim 300 vrijwilligers naast 80 medewerkers) beschrijft de werkwijze zo: *"Vrijwilligers geven aan wanneer ze wél en niet kunnen, en daarna regelen ze onderling de wissels"* en *"Ik plan per kwartaal."* Ze benadrukt dat dit "veel verantwoordelijkheid, maar ook veel vertrouwen" combineert en "hartstikke goed" werkt (Rijnbrink). De VOB citeert Bibliotheek Salland over zelfroosteren: het is *"veel transparanter geworden voor de hele organisatie en vrijwilligers wie wanneer en waar werkt. Mensen kunnen zichzelf vooruit uitroosteren en anderen kunnen de dienst overnemen"* — met aanzienlijk minder mail- en appverkeer als gevolg. Vrijwilligerscentrale Wassenaar vat het samen als win-win: maximale invloed van de vrijwilliger op het rooster, transparantie, en minder werk voor de coördinator.

**Concrete praktijken die terugkomen:**

- **Beschikbaarheid/voorkeuren**: per periode (bv. kwartaal) opgeven wanneer iemand wel/niet kan; daarna zelf inschrijven op diensten.
- **Vakantie/afwezigheid**: vrijwilligers roosteren zichzelf vooraf uit; anderen kunnen de opengevallen dienst overnemen (VOB/Salland).
- **Ruilen en invallers**: diensten onderling overdragen zonder tussenkomst van de coördinator, maar wel zichtbaar voor iedereen; "last-minute bezetting via directe notificaties" is een standaardfeature (Het Rooster); Inzetrooster kent "inschrijfverzoeken" voor open plekken.
- **Herinneringen**: automatische e-mailherinneringen op instelbare momenten (bij Inzetrooster bv. 10 dagen en 1 dag vooraf) gelden breed als hét middel tegen no-shows.
- **No-shows**: Inzetrooster biedt expliciet "verzuimbijhouding" (registratie van no-shows). Generiek advies (uit event-context, niet vrijwilligers-specifiek — aanmelder.nl): maak afmelden zo makkelijk mogelijk, dan melden mensen zich af in plaats van weg te blijven, en vul gaten via een wachtlijst/invalpool.
- **Minimale bezetting**: tools tonen realtime de bezetting per dienst zodat de coördinator gaten ziet (Roostermaat, TopRooster); capaciteit per slot begrenzen kan o.a. bij SuperSaaS.
- **Rol coördinator**: Movisie signaleert dat de vrijwilligerscoördinator onder toenemende druk staat (takenpakket dijt uit, vaak nevenfunctie) — administratieve ontlasting is dus een doel op zich. Movisie wijst ook op de flexibilisering van vrijwillige inzet: vrijwilligers hebben een lossere binding en flexibelere agenda dan vroeger, wat planning bemoeilijkt.

**Niet gevonden / onzeker:** een specifieke handreiking "vrijwilligers roosteren" van NOV (Platform Vrijwillige Inzet) of Movisie. Wel relevant: een NOV-forumdiscussie ("Rooster app") waarin een adviseur vraagt om een gebruiksvriendelijke, gratis/goedkope rooster-app voor niet-digivaardige vrijwilligers met inschrijven op losse klussen, ruilen en annuleren; in de reacties worden Spond, Het Rooster en InPlanning genoemd (reacties grotendeels via zoekresultaat, niet integraal gelezen — deels onbevestigd). NOV-gelieerd bestaat verder **Stichting Vrijwilligers Digitaal** ("100% door en voor vrijwilligers"), die vrijwilligersorganisaties helpt bij implementatie van het zelfroosterplatform InPlanning van Intus, en het NOV-keurmerk "Vrijwillige Inzet Goed Geregeld" voor vrijwilligersbeleid in den brede.

### 2. Welke software/tools worden gebruikt?

De Nederlandse markt kent een ruim aanbod aan vrijwilligersrooster-tools; vrijwilligerscentrales verwijzen er actief naar (Wassenaar noemt Ons Rooster, Het Rooster, Inzetrooster en Spond). Gedeelde feature-set: zelf inschrijven, diensten ruilen/overdragen, automatische herinneringen, beschikbaarheid/afwezigheid, urenoverzicht, agenda-synchronisatie en realtime bezettingsinzicht. Zie de tooltabel hieronder voor details en prijzen. Opvallend voor onze schaal (5–20 vrijwilligers): **Roostermaat is gratis tot 15 vrijwilligers**, Inzetrooster geeft het eerste jaar gratis, SuperSaaS heeft een gratis tier en Spond is gratis. Internationale tools (SignUpGenius, Volgistics, Timecounts, Rosterfy) zijn functioneel rijker maar Engelstalig en op grotere organisaties gericht; voor deze context bieden ze geen voordeel.

### 3. Doen openbare bibliotheken dit al?

**Ja — vrijwilligersmanagement is in de bibliotheeksector een erkend en groeiend vraagstuk, en er worden commerciële roostertools gebruikt; een zelfgebouwde bibliotheek-rooster-app is niet gevonden.**

- **Schaal**: het aantal vrijwilligers in Nederlandse bibliotheken steeg van ruim 22.000 (2019) naar ca. **27.800 (2024)**, gemiddeld 3,4 vrijwilligers per betaalde kracht; 91% van de organisaties zet vrijwilligers in bij activiteiten/programmering en 81% biedt scholing rond basisvaardigheden voor volwassenen (Bibliotheeknetwerk).
- **Probiblio** (themapublicatie Zuid-Holland 2020) benoemt als randvoorwaarde letterlijk: *"Dit betekent dat de bibliotheek haar administratieve processen goed op orde heeft, kan beschikken over een registratie- en roostersysteem en dat er voldoende uren zijn vrijgemaakt voor de begeleiding van vrijwilligers."* Dezelfde publicatie constateert dat de inzet van vrijwilligers nu vaak "ad hoc geregeld wordt", dat aansturing getrapt en onduidelijk belegd is, en dat afspraken over o.a. roosteren meestal in een vrijwilligershandboek staan. Probiblio biedt verder een Toolkit Vrijwilligersmanagement (formats voor beleid en handboek, rekenmodel kosten) en faciliteert een netwerk van vrijwilligerscoördinatoren in Noord- en Zuid-Holland — geen roostertool.
- **IDO**: bij Bibliotheek Deventer werkt de IDO-coördinatie met kwartaalplanning op beschikbaarheid en onderlinge wissels (Rijnbrink). Eén vrijwilliger draait er spreekuren op vier locaties.
- **Taalhuis/digiTaalhuis**: de Probiblio-brochure "Taalvrijwilligers, het digiTaalhuis en de Bibliotheek" laat zien dat de (betaalde) Taalhuis-coördinator matching, planning en begeleiding doet, vaak met vrijwillige coördinatoren per programmalijn eronder (De Boekenberg: 1 coördinator stuurt 11 vrijwillige coördinatoren in 5 programmalijnen aan; Den Haag: 1 coördinator met 20 baliedienst-vrijwilligers ma–zo; Bollenstreek: 188 taalvrijwilligers met 6 vrijwillige Taalpunt-coördinatoren). Klik & Tik en Digisterker worden in een van de beschreven bibliotheken uitgevoerd door de coördinator "samen met zes vrijwilligers" — vergelijkbaar met de Rotterdamse schaal per locatie.
- **Tools in bibliotheken**: de **VOB** beveelt zelfroosteren actief aan en werkt samen met **Het Rooster** (gratis kennissessie voor leden, t.w.v. €297); Bibliotheek Salland gebruikt het voor medewerkers én vrijwilligers. **Inzetrooster** heeft een landingspagina voor bibliotheken (use-case gastvrouw/gastheer, met o.a. verzuimbijhouding en smoelenboek). **Rijnbrink** publiceerde een gids "Werken met vrijwilligers" voor bibliotheken (visie → planning → praktijk → evaluatie, met voorbeeldprofielen en -overeenkomsten), zonder specifiek rooster-hoofdstuk.
- **Rotterdam zelf**: Bibliotheek Rotterdam werft "Digivrijwilligers Klik&Tik" en kent daarnaast "Les op maat" (1-op-1 of kleine groepjes, smartphone/tablet/Windows/Word/e-mail). Volgens zoekresultaten zijn op de Centrale vrijwilligers nodig op **dinsdag en donderdag 9:30–12:30** (lessen 10:00–12:00 plus marge), en doet de **Unie Van Vrijwilligers (UVV)** de vrijwilligersadministratie en -werving. **Let op: onbevestigd** — de vacaturepagina zelf was tijdens dit onderzoek niet bereikbaar (403/404), dus deze details komen uit zoekresultaat-snippets.
- **Niet gevonden**: publicaties van KB of Cubiss specifiek over vrijwilligers-*roosteren*, en enig voorbeeld van een bibliotheek met een eigen (zelfgebouwde) rooster-app. Het aantal IDO-locaties landelijk (genoemd: ~680) is evenmin geverifieerd.

### 4. Functionele kern van een minimale rooster-app voor deze context

Uit de praktijkvoorbeelden (IDO Deventer, Salland) en de gedeelde feature-set van alle tools, toegespitst op 5–20 vrijwilligers en 2 vaste dagdelen per week:

1. **Lesmomenten als terugkerende diensten**: di + do 10:00–12:00 automatisch gegenereerd per planperiode (kwartaal/semester), met uitzonderingen (feestdagen, schoolvakanties, uitval).
2. **Voorkeuren + beschikbaarheid**: per vrijwilliger structurele voorkeursdag(en) (di/do/beide, evt. frequentie zoals "om de week"); daaruit volgt een conceptrooster dat vrijwilligers zelf bijstellen.
3. **Afwezigheid melden**: vakantie/afwezigheid als datumbereik, zelf in te voeren; betrokken lesmomenten vallen automatisch open.
4. **Bezettingsbewaking**: min/max per lesmoment (bv. min. 2, max. 4 vrijwilligers), visueel (kleur) en met signaal aan de coördinator bij onderbezetting; open plekken zichtbaar voor iedereen zodat invallen laagdrempelig is.
5. **Herinneringen**: automatische e-mail vooraf (bv. 1–2 dagen), plus notificatie/oproep bij opengevallen plekken.
6. **Coördinatorrol**: rooster publiceren, handmatig (her)toewijzen, vrijwilligers beheren, afwezigheid namens iemand invoeren; vrijwilligers houden maximale eigen regie (het "win-win"-principe).
7. **Transparantie**: iedereen ziet wie wanneer staat — dit vervangt mail/appverkeer en maakt onderling ruilen mogelijk zonder aparte ruil-feature.

Expliciet *niet* nodig op deze schaal (wel aanwezig in grote tools): urenregistratie, betalingen, skills-matching, multi-locatie, wachtlijsten, native apps, formele ruil-workflows.

## Bestaande tools

| Tool | Doelgroep | Kernfeatures | Prijsindicatie |
|---|---|---|---|
| **Inzetrooster** (NL) | verenigingen, musea, zorg, buurthuizen, bibliotheken | zelf inschrijven, inschrijfverzoeken, diensten overdragen, automatische herinneringen (instelbaar, bv. 10 d + 1 d vooraf), verzuim-/no-show-registratie, urenoverzicht, smoelenboek | 1e jaar gratis; daarna €265–€795/jr excl. btw (Basic ≤100 pers. t/m Corporate) |
| **Roostermaat** (NL) | kerken, sportclubs, stichtingen, voedselbanken | zelfroosteren, realtime bezettingsinzicht, e-mailherinneringen, agenda-sync (Google/Apple/Outlook), responsive web (geen app nodig) | **gratis ≤15 vrijwilligers**; Starter €15/mnd (≤50), Groei €35/mnd (≤150), jaarlijks gefactureerd |
| **Ons Rooster / InPlanning** (NL — Stichting Vrijwilligers Digitaal + Intus) | vrijwilligersorganisaties van 6 tot 300+ | zelfroosteren ("maximale invloed"), vaste dienstpatronen per periode, web + mobiele app | €1/vrijwilliger/jr (eerste 250, daarboven €0,25) + eenmalig €2/vrijwilliger implementatie; geen gratis tier |
| **Het Rooster** (NL — VOB-partner) | organisaties met vrijwilligers én betaalde krachten (musea, bibliotheken, zorg, festivals) | zelfroosteren binnen kaders, ruilen, last-minute notificaties, herinneringen, uren-/verlofregistratie, API (o.a. AFAS) | vrijwilligersplan ±€81,50/mnd bij jaarbetaling (onbeperkt vrijwilligers), excl. btw; VOB-leden gratis kennissessie |
| **SuperSaaS** (NL/int.) | generiek reserverings-/dienstrooster | capaciteit per tijdslot, zelf inschrijven, herinneringen via mail/SMS, agenda-sync, terugkerende sessies | gratis tier (≤50 afspraken, met advertenties); betaald vanaf €7/mnd |
| **Spond** (int., NL-talig) | sportclubs en verenigingen | events/diensten, aan-/afmelden, herinneringen, beschikbaarheidspeilingen, groepschat | gratis; verdienmodel via betalingsverwerking en premium "Spond Club" |
| **TopRooster** (NL) | kerken, musea, bibliotheken, zorg, goede doelen | zelf inschrijven op diensten, beschikbaarheid, automatische herinneringen, realtime cloud-rooster | gratis proefperiode; tarieven niet op site gevonden |
| **Roosterplaats** (NL) | vrijwilligersorganisaties | roosteren met vrijwilligers (features niet in detail onderzocht) | niet gevonden |
| **Checks** (NL) | vrijwilligersorganisaties | handmatig, automatisch of zelfroosteren | niet gevonden |
| **SignUpGenius** (int.) | events, kleine teams, scholen | online intekenlijsten per slot, automatische bevestigingen/herinneringen, templates | gratis basis; Starter ±$8,99/mnd, Essentials ±$22,49/mnd (blogbron) |
| **Volgistics** (int.) | breed vrijwilligersmanagement | profielen, VicNet-selfservice (zelf inschrijven), vereisten-checklists | vanaf ±$9/mnd per 50 vrijwilligers, plus add-ons (blogbron) |
| **Timecounts** (int.) | nonprofits | kleurgecodeerde roosterkalender, skills/beschikbaarheid, team-inbox, onboarding-checklists | betaald vanaf ±$59/mnd (blogbron) |
| **Rosterfy** (int.) | grote events/enterprise | self-rostering via app, skills-matching, rapportage, integraties | enterprise, indicatief ±$5.000+/jr (blogbron, **onbevestigd**) |

*Prijzen gepeild juni 2026 van de productpagina's, tenzij "blogbron" vermeld (dan uit vergelijkingsartikelen en mogelijk verouderd).*

## Aanbevelingen voor onze MVP

- **Volg het bewezen model "coördinator zet kaders, vrijwilliger vult in"**: terugkerende lesmomenten (di/do 10:00–12:00) per planperiode genereren; vrijwilligers schrijven zichzelf in/uit — dit is de werkwijze die bij IDO Deventer en Bibliotheek Salland aantoonbaar werkt.
- **Voorkeursdagen als basis, geen weekinvoer**: vrijwilliger kiest eenmalig di/do/beide (+ evt. frequentie); de app zet dat om in een conceptrooster per kwartaal.
- **Afwezigheid = datumbereik**: één formulier "ik ben afwezig van–tot", waarna betrokken lesmomenten automatisch openvallen en zichtbaar worden als gat.
- **Min/max-bezetting per lesmoment** (bv. min. 2, max. 4) met kleurindicatie en een melding aan de coördinator bij onderbezetting — dit is de kernwaarde t.o.v. een gedeelde spreadsheet.
- **Automatische e-mailherinnering** 1–2 dagen vooraf plus een oproep-mail naar niet-ingeroosterde vrijwilligers bij een open plek; geen aparte ruil-feature nodig (afmelden + open plek + transparant rooster volstaat op deze schaal).
- **Registreer no-shows licht** (vinkje door coördinator achteraf), naar voorbeeld van Inzetrooster's "verzuimbijhouding" — alleen als signaal, geen sanctie-workflow.
- **Maak het extreem drempelvrij**: responsive webapp zonder installatie, grote knoppen, weinig stappen — meerdere bronnen benadrukken dat (ook deze) vrijwilligers beperkt digivaardig kunnen zijn; magic-link login overwegen i.p.v. wachtwoorden.
- **Coördinator kan alles overrulen**: namens een vrijwilliger inschrijven/afmelden, rooster publiceren, vrijwilligers beheren — Probiblio benadrukt ontlasting van de (vaak overbelaste) coördinator als doel.
- **Schrap bewust**: urenregistratie, skills-matching, multi-locatie, betalingen, native app en wachtlijsten zijn op 5–20 vrijwilligers en 2 dagdelen niet nodig (YAGNI); agenda-export (ICS) is de enige "nice to have" die vrijwel elke bestaande tool biedt.
- **Wees eerlijk over build vs. buy in de spec**: Roostermaat (gratis ≤15), Inzetrooster (1e jaar gratis) en SuperSaaS (gratis tier) dekken deze schaal al af; de meerwaarde van zelf bouwen zit in maatwerk (vaste 2 dagdelen, NL-eenvoud, eigen huisstijl/integratie), niet in features. Check daarbij ook de rolverdeling met de Unie Van Vrijwilligers (administratie ligt daar mogelijk al — onbevestigd).

## Bronnen

- Rijnbrink — *In het zonnetje: vrijwilligers van het IDO* (werkwijze IDO-rooster Bibliotheek Deventer) — https://www.rijnbrink.nl/actueel/nieuws/in-het-zonnetje-vrijwilligers-van-het-ido/
- VOB (Vereniging Openbare Bibliotheken) — *Zelfroosteren* (incl. casus Bibliotheek Salland, partnerschap Het Rooster) — https://www.debibliotheken.nl/informatie/zelfroosteren/
- Probiblio — *De inzet van vrijwilligers bij de Zuid-Hollandse bibliotheken* (themapublicatie 2020, PDF) — https://www.bibliotheeknetwerk.nl/sites/default/files/documents/bbv-De%20inzet%20van%20vrijwilligers%20bij%20de%20Zuid-Hollandse%20bibliotheken-themapublicatie-Probiblio%202020.pdf
- Probiblio — *Taalvrijwilligers, het digiTaalhuis en de Bibliotheek* (brochure, PDF) — https://www.bibliotheeknetwerk.nl/sites/default/files/documents/bbv_taalvrijwilligers-digitaalhuis-en-de-bibliotheek-probiblio.pdf
- Probiblio — *Toolkit Vrijwilligersmanagement* — https://www.probiblio.nl/toolkit-vrijwilligersmanagement/
- Bibliotheeknetwerk (KB) — *Vrijwilligers in de bibliotheek* (kerncijfers 2019–2024) — https://www.bibliotheeknetwerk.nl/artikel/vrijwilligers-in-de-bibliotheek
- Rijnbrink — *Handige gids beschikbaar voor werken met vrijwilligers* — https://www.rijnbrink.nl/actueel/nieuws/handige-gids-beschikbaar-voor-werken-met-vrijwilligers/
- Movisie — *De vrijwilligerscoördinator onder druk: jongleren kun je leren* — https://www.movisie.nl/artikel/vrijwilligerscoordinator-onder-druk-jongleren-kun-je-leren
- NOV / VrijwilligerswerkNL — forumtopic *Rooster app* — https://www.vrijwilligerswerk.nl/community/open-forum/2772359.aspx
- NOV / VrijwilligerswerkNL — *Vrijwilligers Digitaal* (InPlanning-implementatiehulp) — https://www.vrijwilligerswerk.nl/zoek-vrijwilligerswerk/zoek-direct/1768265.aspx
- Vrijwilligerscentrale Wassenaar — *Vrijwilligersroosters* (tooladvies) — https://www.vrijwilligerscentralewassenaar.nl/paginas/3/163/Vrijwilligersroosters
- Inzetrooster — homepage, pakketten, bibliotheekpagina, beheerdersdocumentatie — https://inzetrooster.nl/ · https://inzetrooster.nl/pakketten · https://inzetrooster.nl/bibliotheken-met-vrijwilligers · https://inzetrooster.nl/rooster-maken/beheerder
- Roostermaat — https://roostermaat.nl/
- Ons Rooster / InPlanning (Stichting Vrijwilligers Digitaal & Intus) — https://onsrooster.nl/
- Het Rooster — https://www.hetrooster.nl/ · prijzen: https://www.hetrooster.nl/prijzen/
- SuperSaaS — *Gratis online vrijwilligersrooster* — https://www.supersaas.nl/info/buurtverenigingen-en-vrijwilligerswerk-planningssysteem
- Spond — https://www.spond.com/nl/
- TopRooster — *Vrijwilligersrooster* — https://toprooster.nl/diensten/vrijwilligersrooster/
- Bibliotheek Rotterdam — *Digivrijwilliger Klik&Tik* (pagina tijdens onderzoek niet bereikbaar; details uit zoekresultaten, onbevestigd) — https://www.bibliotheek.rotterdam.nl/werkenbij/vrijwilligers/digivrijwilliger-klik-tik
- Bloomerang — *15 volunteer scheduling software tools* (internationale prijzen, blogbron) — https://bloomerang.com/blog/volunteer-scheduling
- WildApricot — *Top 25 volunteer management software* (internationale prijzen, blogbron) — https://www.wildapricot.com/blog/volunteer-management-software
- aanmelder.nl — *No-shows: wat zijn dat en hoe voorkom je ze?* (generieke no-show-tips, event-context) — https://www.aanmelder.nl/nl/blog/no-shows-wat-zijn-dat-en-hoe-voorkom-je-ze-tips-strategieen/

**Expliciet onbevestigd/onzeker:** (1) de Rotterdamse details (di/do 9:30–12:30 op de Centrale; rol Unie Van Vrijwilligers) komen uit zoekresultaat-snippets — de bronpagina was niet bereikbaar; (2) de inhoud van de NOV-forumreacties (aanbeveling Spond/Het Rooster/InPlanning) is deels uit zoekresultaten gereconstrueerd; (3) internationale prijzen (Volgistics, Timecounts, Rosterfy, SignUpGenius) komen uit vergelijkingsblogs, niet van de leveranciers zelf; (4) een formele NOV- of Movisie-handreiking specifiek over roosteren is niet gevonden — mogelijk bestaat materiaal achter het besloten NOVi-netwerk; (5) het landelijke aantal IDO's (~680) is niet geverifieerd; (6) geen enkel gevonden voorbeeld van een bibliotheek met een zelfgebouwde rooster-app — afwezigheid van bewijs is hier geen bewijs van afwezigheid.
