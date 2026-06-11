# Onderzoeksbijlage — AVG & privacy bij cliëntregistratie

> **Status:** informatief · webonderzoek d.d. 2026-06-11 · **geen juridisch advies** — passages gemarkeerd met "(interpretatie)" of "(onbevestigd)" behoeven toetsing door de FG/privacyjurist van Bibliotheek Rotterdam.
> Hoort bij: [product-spec.md](../product-spec.md)

## Samenvatting

Voor de registratie van cursisten van gratis digivaardigheidslessen is **toestemming niet de aangewezen hoofdgrondslag**: de registratie van kerngegevens (naam, contact, leerdoel, aanwezigheid) kan rusten op **uitvoering van een overeenkomst** (de afspraak tot kosteloze begeleiding) en/of **gerechtvaardigd belang** — zo doet ook het AVG-register van de Rijksoverheid dat voor cursusadministratie. Toestemming blijft nodig voor extra's (foto's, doorverwijzing naar derden) en moet dan vrij, specifiek, geïnformeerd en ondubbelzinnig zijn, in B1-taal en bij voorkeur op papier met mondelinge toelichting. **BSN is verboden** (geen wettelijke basis), bijzondere categorieën (gezondheid, afkomst, religie) zijn verboden behoudens uitzonderingen; het label "laaggeletterd" is formeel geen bijzonder gegeven maar wel gevoelig en stigmatiserend — vermijd het als veld en bewaak vrije-tekstnotities. Er is geen wettelijke bewaartermijn: zelf bepalen, motiveren en vastleggen (Rijksoverheid hanteert 3 jaar voor cursusadministratie). **Stichting Bibliotheek Rotterdam is verwerkingsverantwoordelijke**, de bouwende/hostende vrijwilliger is verwerker (verwerkersovereenkomst verplicht), en de bibliotheek heeft een eigen Functionaris Gegevensbescherming die vooraf betrokken moet worden. Sectorbronnen (Probiblio-AVG-toolkit, KB/Bibliotheeknetwerk, IDO-praktijk) wijzen op: persoonsgegevens alleen voor begeleiding, statistiek geaggregeerd/anoniem.

## Bevindingen

### 1. Grondslagen en toestemming

De AVG kent zes grondslagen (art. 6): toestemming, uitvoering overeenkomst, wettelijke verplichting, vitaal belang, taak van algemeen belang en gerechtvaardigd belang. Voor cursus- en bijeenkomstenadministratie gebruikt het AVG-register van de Rijksoverheid zelf de combinatie **"Uitvoering overeenkomst. Gerechtvaardigd Belang"** — niet toestemming — met als doel "communicatie tussen deelnemer en organisatie" en het kunnen voeren van een goede administratie (deelnemerslijsten).

Toepassing op deze casus *(interpretatie)*: wie zich aanmeldt voor "Les op maat" of Klik & Tik-begeleiding sluit feitelijk een (kosteloze) dienstverleningsafspraak; de gegevens die strikt nodig zijn om die afspraak uit te voeren (naam, bereikbaarheid, leerdoel, aanwezigheid binnen het sessiemaximum) vallen onder **uitvoering overeenkomst**; beperkte interne coördinatie (welke vrijwilliger begeleidt wie) onder **gerechtvaardigd belang** met gedocumenteerde belangenafweging. Diverse privacyjuristen waarschuwen dat toestemming als grondslag vaak onterecht wordt gekozen: toestemming is **intrekbaar** (dan vervalt je verwerkingsbasis terwijl je de administratie nog nodig hebt) en is bij een afhankelijke of kwetsbare doelgroep al snel niet "vrij". Gebruik toestemming dus alleen voor optionele verwerkingen (foto's, nieuwsbrief, doorverwijzing/gegevensdeling met derden — vergelijk het IDO-toestemmingsformulier bij doorverwijzing dat Bibliotheek Veenendaal hanteert).

Geldige toestemming vereist (AP; EDPB Richtsnoeren 05/2020): **vrij** (geen druk, geen nadeel bij weigeren — deelname aan de les mag dus niet afhangen van toestemming voor niet-noodzakelijke verwerkingen), **specifiek** (per doel), **geïnformeerd** (vooraf, begrijpelijk: wie, wat, waarvoor, hoe lang, welke rechten), **ondubbelzinnig** (actieve handeling — geen vooraf aangevinkt hokje), **aantoonbaar** (vastleggen wanneer/hoe gegeven) en **even makkelijk intrekbaar als gegeven**.

Vormgeving voor laaggeletterde/digitaal minder vaardige deelnemers: art. 12 AVG eist informatie "in een beknopte, transparante, begrijpelijke en gemakkelijk toegankelijke vorm en in duidelijke en eenvoudige taal", waarbij volgens de EDPB-transparantierichtsnoeren de communicatie moet worden **aangepast aan de doelgroep**, óók aan kwetsbare groepen. In de praktijk wordt **B1-taalniveau** aanbevolen voor privacyverklaringen (korte, actieve zinnen, alledaagse woorden). Praktische invulling *(interpretatie, sluit aan bij sectorpraktijk)*: een kort papieren formulier op B1-niveau, mondeling toegelicht door de begeleider (mondelinge toestemming is geldig maar moeilijk aantoonbaar — combineer dus mondelinge uitleg met papieren ondertekening of aangeklikte bevestiging die de coördinator registreert), gelaagde informatie (eerst de kern in 5 regels, details op verzoek) en eventueel pictogrammen.

### 2. Dataminimalisatie

Verdedigbaar voor dit doel zijn gegevens die direct nodig zijn voor begeleiding en planning: **naam, één contactkanaal (telefoon en/of e-mail), cursustype, leerwens/leerdoel, aanwezigheid per sessie, korte functionele voortgangsnotities, gekoppelde begeleider/locatie**. Zie het veldenadvies hieronder.

**BSN — verbod.** Organisaties buiten de overheid mogen het BSN alleen verwerken als een specifieke wet dat voorschrijft (art. 46 UAVG). **Toestemming kan dit niet repareren.** De AP heeft actief gehandhaafd, onder meer tegen een congresorganisator en een sportschool die BSN bij inschrijving vroegen. Een bibliotheek heeft voor cursusregistratie geen wettelijke basis → BSN nooit opnemen, ook geen veld ervoor bouwen.

**Bijzondere categorieën (art. 9 AVG)** — gegevens over ras/etnische afkomst, politieke opvattingen, religie/levensovertuiging, vakbondslidmaatschap, genetische en biometrische gegevens, **gezondheid** en seksuele gerichtheid — zijn verboden om te verwerken, tenzij een van de tien uitzonderingen geldt (zoals uitdrukkelijke toestemming). Voor deze app geldt: niet registreren en er geen velden voor inrichten.

**Is "laaggeletterd" of cursusdeelname zelf gevoelig?** Laaggeletterdheid en beperkte digitale vaardigheid staan **niet** in de limitatieve art. 9-lijst en zijn dus formeel geen bijzondere persoonsgegevens *(interpretatie — geen expliciete AP-uitspraak hierover gevonden)*. Maar: het zijn wél maatschappelijk gevoelige, potentieel stigmatiserende gegevens over een **kwetsbare groep** — een factor die de EDPB expliciet meeweegt als risicocriterium (zie DPIA onder §5). Bovendien onthult het enkele feit "staat in dit systeem" al dat iemand digitaal minder vaardig is; dat verhoogt de impact van elk datalek. Consequentie: houd de datafootprint minimaal, gebruik **geen classificerende labels** ("laaggeletterd", "NT1/NT2", taalniveau) als datavelden — voor de begeleiding volstaat een functioneel leerdoel ("wil leren e-mailen en DigiD gebruiken") — en presenteer de app extern neutraal (bijv. "cursusplanning"), niet als "register laaggeletterden".

**Vrije-tekstvelden (notities)** zijn het grootste lekrisico voor bijzondere gegevens: een goedbedoelde notitie als "slechtziend, trilt door Parkinson" is een gezondheidsgegeven en daarmee in beginsel verboden. Richtlijnen voor notitievelden *(best practice, afgeleid van dataminimalisatie-beginsel en inzagerecht)*:

- alleen **feitelijke, cursusgerichte** informatie ("oefening 3 afgerond; volgende keer: bijlagen mailen");
- **geen** gezondheid, afkomst, religie, financiële of gezinsproblemen — ook niet "tussen de regels";
- praktische ondersteuningsbehoeften alleen functioneel noteren op verzoek van de cliënt ("groter lettertype nodig"), zonder medische duiding;
- schrijf alsof de cliënt **meeleest** — die heeft inzagerecht;
- zet deze instructie als hint/placeholder in de UI bij het veld en neem haar op in de vrijwilligersinstructie;
- schoon notities periodiek en verwijder ze als eerste bij einde traject.

Sectorpraktijk ondersteunt dit: Probiblio publiceerde een model-**geheimhoudingsverklaring voor bibliotheekvrijwilligers** (Bibliotheeknetwerk, 2022) — laat alle begeleidende vrijwilligers zo'n verklaring tekenen.

### 3. Bewaartermijnen

De AVG bevat **geen vaste bewaartermijnen**: de organisatie bepaalt ze zelf op basis van noodzaak voor het doel, legt ze vast (verwerkingsregister, privacyverklaring) en **motiveert** ze; de AP toetst of de onderbouwing redelijk is. Hoe groter het mogelijke nadeel voor de betrokkene, hoe sterker de motivering moet zijn.

Referentiepunten voor cursist-/deelnemersadministratie: het AVG-register van de Rijksoverheid hanteert **3 jaar** voor cursus- en bijeenkomstenadministratie; Stichting Lezen en Schrijven hanteert "niet langer dan noodzakelijk". Een verdedigbare lijn voor deze app *(interpretatie)*: actieve gegevens gedurende het traject, daarna een korte natermijn (bijv. 6–12 maanden, gemotiveerd met "terugkerende cursisten en vervolgvragen"), vervolgens **verwijderen of anonimiseren**. Aanwezigheids-/outputcijfers voor verantwoording (aantallen deelnemers, certificaten) kunnen **geaggregeerd en anoniem** onbeperkt bewaard worden — precies zoals de landelijke IDO-registratie via de Bibliotheekmonitor werkt (output in aantallen, geen persoonsdossiers). Let op: vrije-tekstnotities zijn nauwelijks te anonimiseren — die verwijder je; je anonimiseert alleen telbare gegevens.

### 4. Organisatorisch

**Verwerkingsregister.** De uitzondering voor organisaties <250 medewerkers vervalt zodra de verwerking "niet incidenteel" is — en een doorlopende cursistenregistratie is per definitie structureel. Praktisch moet dus vrijwel elke organisatie, ook een kleine of vrijwilligersorganisatie, een register bijhouden; de naleving blijft de verantwoordelijkheid van de **organisatie**, niet van individuele vrijwilligers. Bibliotheek Rotterdam voert al een verwerkingsregister (Probiblio-interview); deze app moet daarin als verwerking worden opgenomen (doel, categorieën gegevens en betrokkenen, ontvangers, bewaartermijnen, beveiligingsmaatregelen).

**Rechten van betrokkenen.** Inzage, rectificatie, verwijdering, beperking, bezwaar en overdraagbaarheid; reactie **binnen één maand**. Praktisch voor deze doelgroep: maak een verzoek mogelijk via de eigen begeleider of coördinator (mondeling volstaat als startpunt), houd identificatie licht en proportioneel, leg een vaste interne werkwijze vast, en zorg dat verwijdering in álle plekken doorwerkt (app, exports, back-ups binnen redelijke termijn). Bouwtip *(interpretatie)*: een "toon alles van deze cliënt"-export en een hard-deletefunctie maken inzage- en wisverzoeken triviaal.

**Verwerkersovereenkomst.** Verplicht (art. 28 AVG) met iedere partij die ten behoeve van de verantwoordelijke persoonsgegevens verwerkt — dus met de hostingpartij zodra die toegang tot data heeft (logging, support, beheer) en met eventuele subverwerkers. Minimale inhoud: onderwerp, duur, aard en doel van de verwerking, soorten gegevens, categorieën betrokkenen, beveiligingsmaatregelen, geheimhouding, bijstand bij privacyverzoeken en datalekken, regels voor subverwerkers, en teruggave/verwijdering bij einde dienstverlening.

**Datalekken.** Melden bij de AP **binnen 72 uur** na ontdekking als er risico is voor betrokkenen; betrokkenen zelf informeren bij **hoog** risico (niet nodig als de gegevens onleesbaar waren, bijv. door versleuteling). Gezien de gevoelige context is bij een lek uit deze app al snel sprake van risico. De verwerker (host) moet leks onverwijld aan de verantwoordelijke melden — leg dat vast in de verwerkersovereenkomst en richt een eenvoudige interne procedure in (wie constateert → coördinator → FG).

### 5. Rolverdeling: bibliotheek vs. bouwende vrijwilliger

De **verwerkingsverantwoordelijke** is wie **doel en middelen** van de verwerking bepaalt; een **verwerker** verwerkt slechts ten behoeve van de verantwoordelijke. Hier bepaalt de bibliotheek(-vrijwilligersgroep) het doel — cursistenbegeleiding binnen een dienst van de bibliotheek — dus is **Stichting Bibliotheek Rotterdam** verwerkingsverantwoordelijke, ook als een vrijwilliger de app bouwt en host. De keuze van techniek (hard-/software) mag bij de verwerker liggen; dat maakt de bouwer nog geen verantwoordelijke. De bouwende/hostende vrijwilliger is dus **verwerker** en er moet een verwerkersovereenkomst (of gelijkwaardige interne regeling) komen; diens hostingprovider is subverwerker. *(Interpretatie:)* risico-scenario is dat de vrijwilliger zelfstandig doelen gaat bepalen (eigen analyses, hergebruik van data, eigen beheer zonder afspraken) — dan schuift hij op richting (gezamenlijke) verantwoordelijkheid (art. 26) met persoonlijke aansprakelijkheidsrisico's; vermijd dat met heldere schriftelijke afspraken: data is en blijft van de Stichting, toegang op need-to-know, geen eigen gebruik, exit-afspraak (overdracht + verwijdering).

**Waarom de FG erbij moet.** Bibliotheek Rotterdam heeft een Functionaris Gegevensbescherming: het privacystatement van bibliotheek.rotterdam.nl vermeldt een FG (bezoekadres Librijesteeg 4, 010-2816291; algemeen privacycontact privacy@bibliotheek.rotterdam.nl), en in een Probiblio-interview treedt **Rinke van Brenkelen** op als FG van Bibliotheek Rotterdam *(naamsvermelding mogelijk verouderd — actueel statement raadplegen; de pagina zelf blokkeerde geautomatiseerde toegang tijdens dit onderzoek)*. De AVG (art. 38) eist dat de FG "naar behoren en tijdig" wordt betrokken bij **alle** aangelegenheden rond persoonsgegevens — dus vóór de bouw, niet erna. Concreet moet de FG: de grondslagkeuze en het veldenmodel toetsen, de verwerking in het register (laten) opnemen, de verwerkersovereenkomst beoordelen, en de **DPIA-afweging** maken. Een DPIA is verplicht bij waarschijnlijk hoog risico; de EDPB hanteert negen criteria waarvan er hier minimaal één raak is (**gegevens over kwetsbare betrokkenen**) en afhankelijk van de invulling een tweede (gevoelige gegevens) — bij twee of meer criteria is een DPIA aangewezen. Kleinschaligheid kan dat matigen, maar die afweging zelf moet gedocumenteerd worden en is precies FG-werk *(interpretatie)*. Een door een vrijwilliger privé gehoste schaduw-app búiten de bibliotheek-governance om zou de Stichting direct in overtreding brengen van haar eigen verantwoordingsplicht.

### 6. Sector-specifieke handreikingen

- **Probiblio** (POI voor Noord- en Zuid-Holland, dus relevant voor Rotterdam) biedt de **"Toolkit Informatiebeveiliging en privacy in de bibliotheek"** (AVG-toolkit met richtlijnen, checklists en modeldocumenten; gratis op te vragen via privacy@probiblio.nl), een gratis e-learning "De basis van privacy" voor bibliotheekmedewerkers, een eigen Privacy Officer als vraagbaak, en recente handreikingen (bijv. "AVG-proof werken met Whize", 2024). Ook publiceerde Probiblio een **model-geheimhoudingsverklaring voor vrijwilligers** (via Bibliotheeknetwerk).
- **VOB** onderhoudt een AVG-dossier met juridisch getoetste modeldocumenten (o.a. verwerkersovereenkomst KB–bibliotheek) en had een werkgroep governance AVG; Rijnbrink's Privacy Portal staat open voor alle openbare bibliotheken. Een formele, door de AP goedgekeurde **gedragscode (art. 40 AVG) voor bibliotheken is niet gevonden** — er bestaat dus geen "landelijke gedragslijn AVG" in juridische zin, wel landelijke modeldocumenten en afspraken tussen KB en lokale bibliotheken *(onbevestigd negatief: gebaseerd op afwezigheid in zoekresultaten)*.
- **IDO-praktijk (KB/Bibliotheeknetwerk):** de landelijke IDO-registratie via de Bibliotheekmonitor is **output-registratie in aantallen** (bezoekers, soorten vragen, certificaten), geen persoonsregistratie; individuele toestemmingsformulieren verschijnen pas bij doorverwijzing naar derden (voorbeeld: privacyreglement Bibliotheek Veenendaal). Dat bevestigt de sectorlijn: **persoonsgegevens alleen voor de begeleiding zelf; verantwoording/statistiek geaggregeerd en anoniem**.
- **Klik & Tik / Oefenen.nl:** deelnemers werken in een eigen account op Oefenen.nl; voortgang en certificaten zitten al in het **Volgsysteem van Oefenen.nl** (Stichting Expertisecentrum Oefenen.nl), waarvoor begeleidershandleidingen bestaan. De Rotterdamse app hoeft die voortgang dus **niet te dupliceren** — verwijzen volstaat; minder kopieën = minder risico. *(De actuele privacyverklaring van Oefenen.nl was tijdens dit onderzoek niet direct bereikbaar; check die bij implementatie, o.a. voor de vraag wie verantwoordelijke is voor het volgsysteem — zie ook de bijlage [klik-en-tik-oefenen-nl.md](klik-en-tik-oefenen-nl.md), die de verwerkersovereenkomst wél heeft gevonden.)*
- **Taalhuizen:** lokale privacyprotocollen en intake-/toestemmingsformulieren zijn gangbaar (vrijwilligers vullen intakeformulieren in en zijn aan geheimhouding gebonden), maar een landelijk uniform Taalhuis-privacyprotocol is niet aangetroffen; het programma Tel mee met Taal is per 1 januari 2025 beëindigd en de bijbehorende kanalen zijn offline *(onbevestigd negatief)*.

## Veldenadvies

| Gegeven | Mag / niet / let op | Voorwaarde of grondslag |
|---|---|---|
| Voor- en achternaam | Mag | Uitvoering overeenkomst — nodig voor afspraken en begeleiding |
| Telefoonnummer en/of e-mail (één kanaal) | Mag | Uitvoering overeenkomst — alleen voor lesafspraken; vraag wat de cliënt zelf gebruikt |
| Cursustype (Klik & Tik / Les op maat) | Mag | Uitvoering overeenkomst — bepaalt het begeleidingsaanbod |
| Leerwens/leerdoel | Mag, mits functioneel | Uitvoering overeenkomst — formuleer als doel ("wil leren videobellen"), nooit als diagnose of niveau-label |
| Aanwezigheid / sessieteller (datum, sessie *n* van max) | Mag | Uitvoering overeenkomst — bewaking sessiemaximum |
| Voortgangsnotities (vrije tekst) | Let op | Alleen feitelijk en cursusgericht; UI-instructie; geen gezondheid/privéomstandigheden; schrijf alsof de cliënt meeleest; als eerste verwijderen na afloop |
| Gekoppelde vrijwilliger/locatie | Mag | Gerechtvaardigd belang — roosterindeling; vrijwilliger tekent geheimhoudingsverklaring |
| Toestemmingsregistratie (wat, wanneer, hoe) | Mag (verplicht bij toestemming) | Verantwoordingsplicht art. 7 AVG |
| Label "laaggeletterd" / taal-/diginiveau | Vermijden | Niet noodzakelijk voor begeleiding; stigmatiserend; verhoogt risicoprofiel *(interpretatie)* |
| Geboortedatum / leeftijd | Vermijden | Niet noodzakelijk; voor statistiek hooguit anonieme leeftijdscategorie |
| Adres | Vermijden | Niet nodig — lessen vinden in de bibliotheek plaats |
| Bibliotheekpasnummer | Let op | Alleen bij aantoonbare noodzaak tot koppeling met het ledensysteem; anders weglaten |
| BSN | **Niet — verboden** | Art. 46 UAVG: alleen met specifieke wettelijke basis; toestemming repareert dit niet |
| Gezondheid (ook indirect: "slechtziend", "Parkinson") | **Niet** | Art. 9-verbod; praktische aanpassing desnoods functioneel noteren op eigen verzoek ("groot lettertype nodig"), zonder medische duiding *(interpretatie)* |
| Etnische afkomst, religie, politieke opvattingen e.d. | **Niet** | Art. 9-verbod; nooit nodig voor dit doel |
| Foto's van deelnemers | Alleen met aparte toestemming | Vrij, specifiek, intrekbaar; los van cursusdeelname |
| Voortgang uit Oefenen.nl kopiëren | Vermijden | Zit al in het Volgsysteem van Oefenen.nl; verwijzen i.p.v. dupliceren |

## Do's & don'ts

- **Do:** baseer kerngegevens op uitvoering overeenkomst / gerechtvaardigd belang; reserveer toestemming voor extra's (foto's, doorverwijzing, nieuwsbrief).
- **Do:** gebruik een kort papieren informatie-/toestemmingsformulier op B1-niveau, mondeling toegelicht; registreer datum en wijze van akkoord.
- **Do:** betrek de FG van Bibliotheek Rotterdam (privacy@bibliotheek.rotterdam.nl) vóór de bouw; laat de verwerking opnemen in het verwerkingsregister en maak samen de DPIA-afweging.
- **Do:** sluit een verwerkersovereenkomst met de bouwende/hostende vrijwilliger én diens hostingprovider; leg eigendom van de data bij de Stichting en maak exit-afspraken.
- **Do:** laat alle begeleidende vrijwilligers een geheimhoudingsverklaring tekenen (Probiblio-model beschikbaar).
- **Do:** leg per veld doel en bewaartermijn vast; verwijder of anonimiseer na afloop (bijv. 6–12 maanden na laatste contact, gemotiveerd); bewaar statistiek alleen geaggregeerd.
- **Do:** bouw inzage-export en hard-delete per cliënt in; reageer binnen één maand op verzoeken, ook mondeling gedaan via de begeleider.
- **Do:** zet bij het notitieveld een vaste instructie: feitelijk, cursusgericht, "schrijf alsof de cliënt meeleest".
- **Don't:** geen BSN — geen veld, geen kopie-ID, nooit.
- **Don't:** geen velden of labels voor gezondheid, afkomst, religie, "laaggeletterd" of taalniveau; geen diagnoses in vrije tekst.
- **Don't:** geen privé-schaduwsysteem van de vrijwilliger buiten de bibliotheek-governance; geen eigen hergebruik van cliëntdata door de bouwer.
- **Don't:** dupliceer geen Oefenen.nl-voortgang en deel niets met derden zonder aparte, vastgelegde toestemming.

## Bronnen

- Autoriteit Persoonsgegevens — Grondslagen AVG uitgelegd: https://www.autoriteitpersoonsgegevens.nl/en/themes/basic-gdpr/gdpr-basics/legal-bases-from-the-gdpr-explained
- Autoriteit Persoonsgegevens — Grondslag toestemming: https://www.autoriteitpersoonsgegevens.nl/en/themes/basic-gdpr/gdpr-basics/legal-basis-of-consent
- EDPB — Richtsnoeren 05/2020 inzake toestemming (NL): https://www.edpb.europa.eu/sites/default/files/files/file1/edpb_guidelines_202005_consent_nl.pdf
- AVG-register Rijksoverheid — Cursus- en bijeenkomstenadministratie: https://avgregisterrijksoverheid.nl/verwerkingen/cursus-en-bijeenkomstenadministratie-
- Autoriteit Persoonsgegevens — Eisen voor gebruik van het BSN: https://www.autoriteitpersoonsgegevens.nl/en/themes/identification/citizen-service-number-bsn/requirements-for-use-of-the-bsn
- Autoriteit Persoonsgegevens — AP treedt op tegen verboden gebruik BSN: https://autoriteitpersoonsgegevens.nl/nl/nieuws/ap-treedt-op-tegen-verboden-gebruik-bsn
- AVG art. 9 (bijzondere categorieën, NL-tekst): https://www.privacy-regulation.eu/nl/artikel-9-verwerking-van-bijzondere-categorieen-van-persoonsgegevens-EU-AVG.htm
- KCBR — Categorieën persoonsgegevens en uitzonderingen: https://www.kcbr.nl/ontwikkelen-beleid-en-regelgeving/avg-proof-wetgeven/categorieen-persoonsgegevens-en-uitzonderingen
- Autoriteit Persoonsgegevens — Bewaren van persoonsgegevens: https://www.autoriteitpersoonsgegevens.nl/en/themes/basic-gdpr/privacy-and-personal-data/retention-of-personal-data
- Autoriteit Persoonsgegevens — Recht op informatie (transparantie): https://www.autoriteitpersoonsgegevens.nl/en/themes/basic-gdpr/privacy-rights-under-the-gdpr/right-to-information
- Autoriteit Persoonsgegevens — Recht op inzage: https://www.autoriteitpersoonsgegevens.nl/en/themes/basic-gdpr/privacy-rights-under-the-gdpr/right-of-access
- EDPB — Richtsnoeren 01/2022 rechten van betrokkenen (NL): https://www.edpb.europa.eu/system/files/2024-04/edpb_guidelines_202201_data_subject_rights_access_v2_nl.pdf
- Autoriteit Persoonsgegevens — Datalek melden of niet: https://www.autoriteitpersoonsgegevens.nl/en/themes/security/data-breaches/reporting-or-not-reporting-a-data-breach
- Autoriteit Persoonsgegevens — Lijst verplichte DPIA: https://www.autoriteitpersoonsgegevens.nl/documenten/lijst-verplichte-dpia (besluit: https://wetten.overheid.nl/BWBR0042812)
- Ondernemersplein — Verwerkingsregister opstellen: https://ondernemersplein.overheid.nl/wetten-en-regels/verwerkingsregister-opstellen/
- KVK — Dit betekent privacywet AVG voor je vereniging of stichting: https://www.kvk.nl/wetten-en-regels/ga-als-vereniging-goed-om-met-privacy-en-avg/
- Europa decentraal — Verwerkingsverantwoordelijke, verwerker en verwerkersovereenkomst: https://europadecentraal.nl/onderwerp/digitale-overheid/avg/verwerkingsverantwoordelijke-verwerker-en-verwerkersovereenkomst/
- AVG-Helpdesk Zorg en Welzijn — Verwerkingsverantwoordelijke: wanneer ben je dat: https://www.avghelpdeskzorg.nl/onderwerpen/v/verwerkingsverantwoordelijke-wanneer-ben-je-dat
- Bibliotheek Rotterdam — Privacy Statement: https://www.bibliotheek.rotterdam.nl/privacystatement
- Probiblio — "Zie privacy niet als een last…" (interview FG Bibliotheek Rotterdam): https://www.probiblio.nl/bibliotheek-rotterdam-zie-privacy-niet-als-een-last-maar-als-service-naar-je-leden-toe/
- Probiblio — Toolkit Informatiebeveiliging en privacy in de bibliotheek: https://www.probiblio.nl/producten/management-organisatie/informatiebeveiliging-en-privacy-in-de-bibliotheek
- Probiblio/Bibliotheeknetwerk — Geheimhoudingsverklaring vrijwilligers: https://www.bibliotheeknetwerk.nl/sites/default/files/documents/bbv-Geheimhoudingsverklaring-vrijwilligers-Probiblio22.pdf
- VOB — Algemene verordening gegevensbescherming (AVG): https://www.debibliotheken.nl/informatie/algemene-verordening-gegevensbescherming-avg/
- KB/Bibliotheeknetwerk — Dashboard IDO: https://www.bibliotheeknetwerk.nl/dashboard-ido en Vernieuwd IDO-registratieformulier: https://www.bibliotheeknetwerk.nl/nieuws/vernieuwd-ido-registratieformulier-in-bibliotheekmonitor
- KB/Bibliotheeknetwerk — Klik & Tik. De basis (leermiddelengids): https://www.bibliotheeknetwerk.nl/basisvaardigheden-volwassenen/leermiddelengids-basisvaardigheden/leermiddelengids/klik-tik-de-basis
- Oefenen.nl — Volgsysteem (begeleiders): https://overoefenen.nl/begeleiders/volgsysteem/
- Bibliotheek Veenendaal — Privacyreglement (IDO-toestemmingsformulier): https://www.bibliotheekveenendaal.nl/over-ons/klantenservice/privacyreglement.html
- Stichting Lezen en Schrijven — Een Taalhuis opzetten: https://www.lezenenschrijven.nl/een-taalhuis-opzetten
