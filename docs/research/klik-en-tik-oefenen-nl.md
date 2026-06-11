# Onderzoeksbijlage — Klik & Tik, oefenen.nl en Les op maat

> **Status:** informatief · webonderzoek d.d. 2026-06-11 · onbevestigde punten zijn in de tekst gemarkeerd.
> Hoort bij: [product-spec.md](../product-spec.md)

## Samenvatting

Klik & Tik is de digivaardigheids-programmaserie van Stichting Expertisecentrum Oefenen.nl (Den Haag): zeven zelfstandig te doorlopen oefenprogramma's (in tien platform-varianten) met korte instructiefilmpjes, oefeningen, punten en per programma een certificaat. Bibliotheken gebruiken het platform gratis via een landelijke licentie die de Koninklijke Bibliotheek (KB) heeft ingekocht, inclusief het Volgsysteem waarmee begeleiders deelnemers aanmaken, leerroutes/huiswerk klaarzetten en voortgang tot op oefening-niveau volgen. Er is **geen publieke API, SSO of webhook-koppeling gevonden** (gericht gezocht, juni 2026); integratie met een eigen app kan dus alleen via handmatige registratie, het Volgsysteem-dashboard als naslagbron, eventueel rapportage-export (bestaan/formaat onbevestigd) of een maatwerkafspraak met de stichting. AVG-technisch is de licentienemer (de bibliotheek) verwerkingsverantwoordelijke en Oefenen.nl verwerker (standaard-verwerkersovereenkomst bij de licentie); het platform verwerkt o.a. naam (optioneel), gebruikersnaam, e-mail, postcode, IP-adres, resultaten en bezoektijden. "Les op maat" bij Bibliotheek Rotterdam is 1-op-1-begeleiding door vrijwilligers op een eigen leervraag (di/do 10:00–12:00, Centrale Bibliotheek); de publieke beschrijving spreekt van "1 tot 6 lessen", de interne werkafspraak van maximaal 4 sessies — dit moet in de specificatie worden vastgepind.

## Bevindingen

### 1. Wat is Klik & Tik?

Klik & Tik is een serie oefenprogramma's voor digitale basisvaardigheden op het platform Oefenen.nl, gericht op (jong)volwassenen die weinig of geen ervaring hebben met computer, internet, tablet of smartphone (in Nederland geschat op 2,5–4 miljoen mensen met beperkte digitale vaardigheden).

**Actuele programma's** (oefenen.nl, geraadpleegd juni 2026) — zeven programma's, waarvan drie in aparte platform-varianten, samen tien items in de serie:

| Programma | Varianten | Indicatie inhoud/niveau |
|---|---|---|
| Klik & Tik. De start | — | Absolute beginners, taalniveau A1; muis, typen, inloggen, basisveiligheid; beschikbaar in Nederlands, Engels, Arabisch en Tigrinya; webhulp "Jomi" |
| Klik & Tik. De basis | — | Nauwelijks/geen computerervaring, taalniveau 1F/B1 (aldus programmapagina); 9 hoofdstukken: aan/uit, typen, account aanmaken, internet, zoeken, online kopen/betalen, e-mail, tekst/formulieren |
| Klik & Tik. Het internet op | — | Wel computer-, weinig internetervaring; 8 hoofdstukken: reis plannen, video kijken, Marktplaats, bankieren, MijnOverheid |
| Klik & Tik. Veilig online | — | 16 hoofdstukken: updates, sterke wachtwoorden, links herkennen, webshops checken, wifi-veiligheid; taalniveau B1 |
| Klik & Tik. Mobiel | Android / iPhone | 6 hoofdstukken: bellen, apps, WhatsApp, berichten, mobiele veiligheid |
| Klik & Tik. De tablet | Android / iPad | 8 hoofdstukken: bediening, apps, e-mail, foto's, wifi |
| Klik & Tik. Toegankelijk | Android / iPhone | Voor mensen met visuele beperking/lage vaardigheid: schermhelderheid, vergroten, contrast, spraakfuncties |

**Vervallen:** "Klik & Tik. Samen op 't web" (social media: Facebook, WhatsApp, destijds ook Twitter/Skype) is **per 1 september 2025 gestopt** omdat de inhoud verouderd was; de WhatsApp-lessen zijn verhuisd naar "Klik & Tik. Mobiel". In oudere bibliotheekteksten komt de naam nog voor.

**Didactiek:** zelfstandig oefenen op eigen tempo en niveau — korte videofragmenten (in De basis met de personages Ed en Marjan) direct gevolgd door interactieve oefeningen; gamification met punten/badges. De programma's zijn los of na elkaar te volgen. Bij meerdere programma's hoort een papieren werkboek (Uitgeverij Eenvoudig Communiceren) met uitleg en extra opdrachten voor de praktijk.

**Duur:** het platform zelf kent **geen vaste duur**; bibliotheken organiseren er cursusreeksen omheen van doorgaans 5–10 bijeenkomsten van ±2 uur (zie vraag 6). Een door Oefenen.nl voorgeschreven "typische duur" per programma is niet gevonden (onbevestigd).

**Afronding:** wie alle oefeningen van een programma afrondt, ontvangt per programma een **certificaat**. In het Volgsysteem-dashboard is per deelnemer met een icoon zichtbaar of een programma met certificaat is afgerond.

### 2. Oefenen.nl organisatorisch

- **Organisatie:** Stichting Expertisecentrum Oefenen.nl, Koninginnegracht 15, Den Haag (adres per handleiding 2021); ANBI-status. Ruim 40 programma's over zes thema's: taal (tot B1/2F, NT1 én NT2), digitale vaardigheden, rekenen & geld, gezond leven, samenleving, werk. Samenwerkingen o.a. ING Nederland Fonds, gemeente Den Haag, openbare bibliotheken, Uitgeverij Eenvoudig Communiceren.
- **Accounts — drie smaken:**
  1. **Gratis individueel account** (zelf aanmaken via oefenen.nl/register) voor thuisgebruik. Beperking: **maximaal 1 gratis account per IP-adres**; bij meer gelijktijdige gratis gebruikers op één locatie (zoals een bibliotheekzaal) volgt een blokkade — daarom werken organisaties met licentie-accounts.
  2. **Licentie-account**, aangemaakt door de organisatie in het Volgsysteem.
  3. **Gekoppeld account**: een bestaand (gratis) account dat via een koppelverzoek aan de licentie/groep van een organisatie wordt gehangen, mét behoud van eerdere resultaten.
- **Rollen:** per organisatie één **beheerder** (Beheeromgeving: maakt begeleider-accounts en groepen aan, koppelt groepen aan begeleiders) en meerdere **begeleiders** (Volgsysteem: deelnemers, leerroutes, voortgang, berichten).
- **Kosten voor een bibliotheek:** de KB heeft een landelijke licentie met **onbeperkt aantal accounts** ingekocht; het **basispakket is voor bibliotheken gratis** (40 programma's, incl. ~30 taalprogramma's, plus bonusprogramma's Steffie en Oefenen met DigiD). Een **aanvullend pakket** (o.a. Budgetplanner, Taalklas.nl Engels, Zorgen voor 2) kost volgens de FAQ €590,-; WERK-portal.nl-programma's eenmalig €17,75 (bedragen uit de FAQ, datering onzeker — onbevestigd of dit de actuele prijzen zijn). Restrictie: de bibliotheek mag de licentie **niet door externe partners laten gebruiken**. Sinds 2021 hoeven accounts na afloop niet meer ontkoppeld te worden.
- **Kosten voor niet-bibliotheken** (ter referentie): licentie vanaf €12,45 per deelnemer, minimaal 2 accounts, per kwartaal/halfjaar/jaar.
- **Ondersteuning:** gratis online basistraining voor bibliotheken (5 modules), handleidingen, werkbladen, helpdesk (werkdagen 9:00–17:00, info@oefenen.nl, 070-7622762).

### 3. Volgsysteem: wat kan een begeleider zien en kan er gekoppeld worden?

Functionaliteit (Handleiding Volgsysteem v5.2, 2021, aangevuld met dashboard-release 2023 — de UI kan inmiddels gewijzigd zijn):

- **Deelnemersbeheer:** nieuwe deelnemer aanmaken in een groep (unieke gebruikersnaam verplicht; **voor- en achternaam zijn optioneel** — pseudoniem is dus mogelijk), wachtwoord resetten, deelnemers verplaatsen tussen groepen, ontkoppelen (deelnemer houdt eigen account en resultaten).
- **Voortgang & resultaten:** per deelnemer resultaten per programma → per hoofdstuk → per oefening (gemaakt/niet gemaakt; de begeleider ziet **niet wát** een deelnemer fout deed). Verder: punten, laatste bezoek, activiteit/ingelogde tijd.
- **Dashboard** (sinds april 2023): overzicht met groene/rode smileys per deelnemer op basis van punten, oefentijd, percentage afgeronde oefeningen, bezoeken en laatste login; sorteerbaar; individuele detailrapporten; periode "alles" of "laatste 2 weken"; certificaat-iconen per programma; "vanuit het dashboard draai je gemakkelijk rapportages".
- **Leerroutes & huiswerk:** leerroutes aanmaken (op basis van kant-en-klare arrangementen, bv. "Digitale Vaardigheden", of leeg), met lessen, huiswerkonderdelen (hoofdstukken/modules uit programma's) en begin-/einddatum; toekennen aan groep of individu; resultaten per leerroute inzien.
- **Eigen materiaal:** medialinks (video, document, webpagina) toevoegen aan leerroutes.
- **Communicatie:** 1-op-1-berichten met deelnemers, groepsforum.
- **Koppelverzoek-flow:** begeleider deelt een speciale link + groepsnaam; deelnemer logt in met eigen account en stuurt koppelverzoek; begeleider accepteert en ziet daarna óók alle eerder behaalde resultaten.

**Export/rapportage:** de site noemt "resultaten en rapportages bekijken" en rapportages draaien vanuit het dashboard, maar **een exportfunctie (CSV/Excel) is nergens gedocumenteerd gevonden — bestaan en formaat onbevestigd**; navragen bij Oefenen.nl.

**API/technische koppeling — eerlijke conclusie:** er is **geen publieke API, geen SSO, geen webhook en geen koppel-documentatie gevonden** (meerdere gerichte zoekopdrachten in juni 2026 op API, SSO, webhooks, leerlingvolgsysteem-koppeling). Oefenen.nl profileert het Volgsysteem uitsluitend als web-UI voor begeleiders. Afwezigheid van publieke documentatie is geen absoluut bewijs dat er niets bestaat (onbevestigd), maar voor de specificatie moet worden uitgegaan van: **geen technische koppeling beschikbaar**. Wél mogelijk: het Volgsysteem-dashboard als bron naast de eigen app, eventuele rapportage-export (na navraag), en handmatige registratie in de eigen app. Programma's hebben stabiele publieke URL's (bv. `oefenen.nl/programma/serie/klik_en_tik`) die als deeplink in een eigen app bruikbaar zijn.

### 4. AVG-aspecten van oefenen.nl

- **Twee rollen, afhankelijk van accounttype.** Voor gratis thuisaccounts is Oefenen.nl zelf verwerkingsverantwoordelijke (eigen privacyverklaring). Voor deelnemers onder een organisatielicentie geldt de **standaard-verwerkersovereenkomst** (Bijlage 3 bij de licentieovereenkomst, versie 2018/v3): **de licentiehouder — dus de bibliotheek — is verwerkingsverantwoordelijke, Stichting Expertisecentrum Oefenen.nl is verwerker**. Akkoord gaat via een vinkje bij het afsluiten van de licentie. (Kanttekening: gevonden versie is uit 2018; controleer bij Oefenen.nl of er een actuelere versie geldt — onbevestigd.)
- **Persoonsgegevens van deelnemers** (Bijlage I verwerkersovereenkomst, consistent met de privacyverklaring): gebruikersnaam, wachtwoord, e-mailadres, voornaam, achternaam, postcode, IP-adres, **resultaten** en **bezoektijden**. Daarnaast gegevens van begeleiders (naam, e-mail, inlog) en van de klantorganisatie.
- **Kernbepalingen verwerkersovereenkomst:** verwerking uitsluitend binnen de **EER**; subverwerkers toegestaan onder gelijke schriftelijke verplichtingen; geanonimiseerd/geaggregeerd gebruik voor kwaliteitsonderzoek toegestaan; beveiligingsincidenten worden **binnen 24 uur** aan de verantwoordelijke gemeld, maar de **melding aan de Autoriteit Persoonsgegevens en betrokkenen is de taak van de organisatie**; verzoeken van betrokkenen worden doorgestuurd naar de organisatie; vernietiging van gegevens bij einde overeenkomst.
- **Privacyverklaring (platform):** jaarlijkse opschoning — accounts die een jaar niet zijn gebruikt worden verwijderd, back-ups na nóg een jaar; Google Analytics met IP-anonimisering; nieuwsbrief via Mailchimp, webinars via GoToWebinar (VS-partijen); betrokkenenrechten (inzage, correctie, verwijdering, beperking, dataportabiliteit, bezwaar); contact privacy@oefenen.nl.
- **Spanning om te kennen:** de FAQ voor bibliotheken stelt dat een account **persoonsgebonden** is en dat resultaten niet (door de begeleider) verwijderd kunnen worden; bij ontkoppeling van de licentie behoudt de deelnemer account en resultaten. Verwijdering loopt dus via de deelnemer/Oefenen.nl, niet via de bibliotheek-UI.
- **Betekenis voor een bibliotheek die deelnemers aanmeldt:** (a) verwerkersovereenkomst met Oefenen.nl is geregeld via de licentie, maar de bibliotheek draagt als verantwoordelijke de informatieplicht richting deelnemers (privacyverklaring/uitleg bij aanmelding) en handelt rechten-verzoeken af; (b) dataminimalisatie kan goed: naam is optioneel, een pseudonieme gebruikersnaam volstaat; (c) de **eigen rooster-/cliëntregistratie-app staat hier los van**: alles wat vrijwilligers daarin over cliënten en hun voortgang vastleggen valt onder de eigen verantwoordelijkheid van de bibliotheek en vereist een eigen grondslag, doelbinding en bewaartermijnen — ongeacht wat oefenen.nl doet.

### 5. "Les op maat" bij Bibliotheek Rotterdam

De eigen website (bibliotheek.rotterdam.nl) blokkeert geautomatiseerd ophalen (HTTP 403); de beschrijving hieronder komt van de SeniorWeb-locatiepagina van de Centrale Bibliotheek (Ontwikkelplein) en zoekresultaat-snippets van bibliotheek.rotterdam.nl.

- **Les op maat** (letterlijk citaat SeniorWeb-pagina): *"Meer leren over het gebruik van uw Smartphone, Tablet, Windows, Word, Email, Digisterker, Digivitaler, of een online training van SeniorWeb doen? met begeleiding van onze vrijwilligers 1 op 1, 1 tot 6 lessen. dinsdag of donderdag ochtend van 10.00-12.00 uur."* Gratis; aanmelden via digitaal@bibliotheek.rotterdam.nl of 010-2816100; locatie sinds 19 januari 2026: Librijesteeg 4, 2e verdieping. **Let op: de publieke tekst zegt "1 tot 6 lessen", terwijl de interne werkafspraak (projectcontext) "maximaal 4 sessies van 2 uur" is — dit verschil expliciet laten bevestigen door de coördinator en het maximum als configureerbare regel in de app opnemen.**
- **Computer- en smartphonecursus (Klik & Tik-aanbod):** voor beginners; *"Samen met een team van ervaren vrijwilligers ga je met behulp van de website www.oefenen.nl in je eigen tempo aan de slag"* — smartphone, Word, zoeken op internet, e-mail. Dinsdag- en donderdagochtend 10:00–12:00 met "ambassadeurs"/vrijwilligers. De evenementpagina van de bibliotheek beschrijft: meerdere sessies van twee uur, **een intakegesprek bepaalt wat iemand wil leren en hoeveel sessies nodig zijn** (geen vast maximum — consistent met de projectcontext), gratis, werkboek Klik & Tik €13,50.
- **Open oefenmoment:** donderdag 14:00–16:00 zelfstandig oefenen met materiaal van Oefenen.nl en SeniorWeb, vrijwilligers helpen op weg.
- **Vergelijkbaar aanbod elders** (zelfde patroon: gratis, vrijwilliger, eigen leervraag, klein aantal afspraken): **Digitaal Sterk!** (Bibliotheek Zuid-Kennemerland — samen met vrijwilliger bepalen wat nodig is), **Digimaatjes** (Bibliotheek Gooi en meer — vast maatje, plan op basis van je vragen, frequentie in overleg), **DigiTaalhuis** (o.a. NOBB — oefenen met eigen leervraag samen met een vrijwilliger, instroom op elk moment), en SeniorWeb-cursussen in ±500 leslocaties met ±3.000 vrijwilligers, grotendeels in bibliotheken. Namen als "Digitaal op maat"/"Computerhulp op maat" zijn als exacte productnamen niet teruggevonden (onbevestigd); de concepten komen overeen.

### 6. Hoe organiseren andere bibliotheken Klik & Tik?

Gemeenschappelijk patroon uit meerdere bibliotheekwebsites:

| Bibliotheek | Opzet | Kosten | Begeleiding |
|---|---|---|---|
| Kampen | 10 lessen, "in een groepje"; intakegesprek bepaalt passende module | €12,50 bijdrage | Ervaren vrijwilligers; werkboek + oefenen.nl |
| Cultura Ede (Digi-Taalhuis) | 5–6 lessen van 2 uur, kleine groep; eigen laptop/tablet mee (op hoofdlocatie ook vaste computers) | Gratis; werkboek optioneel €15 | Getrainde vrijwilliger |
| Rotterdam | Doorlopend, sessies van 2 uur; intake bepaalt leerdoel en aantal sessies (geen vast aantal) | Gratis; werkboek €13,50 | Team ervaren vrijwilligers ("ambassadeurs") |
| Diverse (Velsen, Eindhoven, NOBB e.a.) | Veelal "10 lessen, leren in een klein groepje, ook van elkaar" | Gratis of kleine bijdrage | Ervaren vrijwilligers; werkboek + oefenen.nl |

Rode draad: kleine groepen (precieze groepsgrootte wordt zelden gepubliceerd — onbevestigd; "klein groepje" is de standaardformulering), zelfstandig oefenen op oefenen.nl met het werkboek, vrijwilliger als begeleider (niet als docent), intake vooraf, vaak ingebed in een (Digi)Taalhuis. **Doorverwijzing:** Informatiepunten Digitale Overheid (IDO, veelal in de bibliotheek) verwijzen bezoekers met structurele leervragen "warm" door naar Klik & Tik- en Digisterker-cursussen; andersom stromen Klik & Tik-deelnemers door naar vervolgaanbod (Digisterker/"omgaan met de digitale overheid", Digivitaler, SeniorWeb-trainingen). Een rooster-/cliëntregistratie-app zou doorverwijsbron (IDO, Taalhuis, eigen initiatief) en vervolgstap als velden moeten kennen.

## Koppel-opties app ↔ oefenen.nl

| # | Optie | Wat het oplevert | Haalbaarheid | Afhankelijkheden |
|---|---|---|---|---|
| 1 | **Handmatige registratie in eigen app** — vrijwilliger legt per sessie vast: programma/variant, hoofdstuk/module, certificaat behaald, inschatting "toe aan volgende stap" | Volledige eigen datamodel-vrijheid; werkt vandaag; voortgang gekoppeld aan rooster en cliëntdossier | Hoog — aanbevolen basis | Geen (alleen eigen AVG-huiswerk); vraagt discipline van vrijwilligers |
| 2 | **Volgsysteem-dashboard als naslagbron** — app toont per cliënt een knop/deeplink "open Volgsysteem"; vrijwilliger/coördinator kijkt daar en neemt status over in de app | Objectieve voortgang (oefeningen, punten, certificaten, laatste login) zonder dubbele administratie van oefendata | Hoog | KB-licentie (gratis), beheerder + begeleider-accounts, deelnemers aangemaakt/gekoppeld in Volgsysteem |
| 3 | **Periodieke rapportage-export importeren** — rapportage uit het dashboard (indien exporteerbaar) inlezen in de app, matching op gebruikersnaam | Semi-automatische voortgangssync (bv. wekelijks); smiley-/certificaatstatus in eigen app | **Onbevestigd** — exportbestaan/formaat niet gedocumenteerd; eerst navragen bij Oefenen.nl (info@oefenen.nl) | Antwoord Oefenen.nl; stabiele gebruikersnaam-conventie (pseudoniem = cliënt-ID uit de app) |
| 4 | **Publieke API / SSO / webhooks** | Realtime voortgang in de app | **Niet beschikbaar** — geen publieke API/SSO/webhook gevonden (juni 2026); alleen denkbaar als maatwerkafspraak met Stichting Expertisecentrum Oefenen.nl | Bereidheid/roadmap Oefenen.nl; contract; niet plannen als MVP-afhankelijkheid |
| 5 | **Proces-koppeling bij aanmelding** — app genereert pseudonieme gebruikersnaam (cliënt-ID), checklist "account aangemaakt / koppelverzoek geaccepteerd / leerroute toegekend", en bewaart de groepsnaam | Sluitende administratie tussen beide systemen zonder techniek; dataminimalisatie (geen echte naam in oefenen.nl nodig) | Hoog | Werkafspraken met begeleiders; KB-licentie |
| 6 | **Deeplinks naar programma's** — programma-/serie-URL's van oefenen.nl opnemen bij het leerdoel in de app | Vrijwilliger opent direct het juiste programma; eenduidige naamgeving van modules in de app | Hoog | URL-stabiliteit oefenen.nl (programma's wisselen soms, zie "Samen op 't web") |

**Aanbevolen lijn voor de specificatie:** optie 1 + 5 + 6 als kern (eigen registratie is leidend), optie 2 als werkwijze voor vrijwilligers, optie 3 als uitzoekpunt richting Oefenen.nl, optie 4 expliciet buiten scope.

## Bronnen

- Klik & Tik-serie (programmaoverzicht) — https://oefenen.nl/programma/serie/klik_en_tik
- Digitale vaardigheden-programma's (overzicht serie) — https://overoefenen.nl/over-oefenen/over-onze-programmas/digitale-vaardigheden/
- Klik & Tik. De start (programmapagina) — https://overoefenen.nl/programmas/klik-tik-de-start/
- Klik & Tik. De basis (programmapagina) — https://overoefenen.nl/programmas/klik-en-tik-de-basis/
- Klik & Tik. Samen op 't web (stopzetting per 1-9-2025) — https://overoefenen.nl/programmas/klik-tik-samen-op-t-web/
- Klik & Tik: digitale vaardigheden voor iedereen (Expertisepunt Basisvaardigheden) — https://basisvaardigheden.nl/kennisbank/klik-tik-digitale-vaardigheden-voor-iedereen
- Over Oefenen.nl (organisatie, ANBI) — https://overoefenen.nl/over-oefenen/
- Hoe werkt het? (licenties, zelfstandig oefenen) — https://overoefenen.nl/hoe-werkt-het/
- Licentie bestellen (prijzen niet-bibliotheken) — https://overoefenen.nl/bestellen/
- Volgsysteem (functieoverzicht) — https://overoefenen.nl/begeleiders/volgsysteem/
- Nieuw: Volgsysteem uitgebreid met dashboard (3-4-2023) — https://overoefenen.nl/nieuws/nieuw-volgsysteem-uitgebreid-dashboard/
- Veelgestelde vragen bibliotheken (KB-licentie, kosten, accounts) — https://overoefenen.nl/contact/veelgestelde-vragen-bibliotheken/
- Handleiding Volgsysteem Oefenen.nl v5.2 (2021, PDF) — https://oefenen.nl/Materials/20211116201111/202111_handleiding_Volgsysteem_v5.2.pdf
- Privacy- en cookieverklaring Oefenen.nl — https://oefenen.nl/privacyverklaring.html
- Verwerkersovereenkomst Oefenen.nl (Bijlage 3 licentieovereenkomst, v3/2018, PDF) — https://oefenen.nl/assets/Over%20ons/Bestellen/Licenties/v3%20Bijlage%203%20Verwerkersovereenkomst%20Oefenen.nl%20.pdf
- Oefenen.nl — licentie voor bibliotheken (Bnetwerk/KB) — https://www.bibliotheeknetwerk.nl/basisvaardigheden-volwassenen/oefenennl-licentie-voor-bibliotheken
- Koppel Oefenen.nl-deelnemers met gratis account (Bnetwerk; 1 gratis account per IP) — https://www.bibliotheeknetwerk.nl/nieuws/koppel-oefenennl-deelnemers-met-gratis-account
- Centrale Bibliotheek Ontwikkelplein Rotterdam (SeniorWeb; Les op maat, computer- en smartphonecursus, oefenmiddag) — https://www.seniorweb.nl/cursussen/computerles-in-de-buurt/rotterdam/rotterdam-bibliotheek-centrum
- Computercursus Klik & Tik — Bibliotheek Rotterdam (evenementpagina, via zoekresultaat; site blokkeert geautomatiseerd ophalen) — https://www.bibliotheek.rotterdam.nl/alle-activiteiten/evenement/66709-computercursus-klik-tik
- Digitale vaardigheden oefenen in de bibliotheek — Bibliotheek Rotterdam (via zoekresultaat) — https://www.bibliotheek.rotterdam.nl/activiteiten/digitaal
- Klik & Tik — Bibliotheek Kampen — https://www.bibliotheekkampen.nl/leren/oefenen-en-hulp/digitaal-meedoen/klik-en-tik.html
- Klik & Tik — Cultura Ede (Digi-Taalhuis) — https://cultura-ede.nl/bibliotheek/digi-taalhuis/computercursussen/klik-tik/
- Cursus Klik & Tik — DigiTaalhuis NOBB — https://www.nobb.nl/leren/DigiTaalhuis/leren-werken-met-computers-en-internet/cursus-klik-en-tik.html
- Informatiepunt Digitale Overheid (doorverwijsfunctie) — https://www.digitaleoverheid.nl/overzicht-van-alle-onderwerpen/overheidsbrede-dienstverlening/informatiepunt-digitale-overheid/
- Digitaal Sterk! — Bibliotheek Zuid-Kennemerland — https://www.bibliotheekzuidkennemerland.nl/bibliotheek/digitaal-sterk.html
- Digimaatjes — Bibliotheek Gooi en meer — https://www.bibliotheekgooiplus.nl/leren/oefenen-en-hulp/digitaal-meedoen/digimaatjes.html
- SeniorWeb helpt ouderen bij digitale vragen (VOB) — https://www.debibliotheken.nl/interviews/seniorweb-helpt-ouderen-bij-digitale-vragen/
