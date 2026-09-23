# CLAUDE.md — DigiPlein

Interne web-app voor het digivaardigheidsteam van Bibliotheek Rotterdam (Centrale Bibliotheek): vrijwilligersrooster + cliëntregistratie voor **Klik & Tik** en **Les op maat** (di/do 10:00–12:00), met een chat-window waarmee medewerkers de app via natuurlijke taal uitbreiden. "DigiPlein" is de werknaam.

## Scrum4Me-product

- **Naam:** DigiPlein
- **product_id:** `cmq9hybds0003v27r99zvo92k`
- **Definition of Done** *(geregistreerd in Scrum4Me door JP, 2026-06-11 — licht geredigeerde weergave, inhoudelijk identiek)*: een bibliotheekmedewerker kan inloggen en de UI van DigiPlein volledig gebruiken. Heeft de gebruiker scrum-rechten (product owner, scrum master of scrum-teamlid), dan kan hij de Scrum4Me-functionaliteit zien en gebruiken — chat, docs, ideas, jobs — en gebruikt hij die om de app te verfijnen.
  - NB: de scrum-rechten-rollen zitten nog niet in het MVP-rollenmodel (mvp-spec §3: ADMIN/STAFF); uitwerking hoort bij de chat-window-integratie (slotstap M2, contract mvp-spec §10).
  - Werkwijze-gates per story (verify+build groen, acceptatiecriteria aantoonbaar, AVG-hardstops, a11y-check, Scrum4Me-logging): zie de hardstops + het gedeelde patroon in [docs/plans/M0-M2-mvp-implementatieplan.md](docs/plans/M0-M2-mvp-implementatieplan.md)
- **Bouwvolgorde:** sprint S-2026-06-11-1 (M0) → -2 (M1) → -3 (M2; chat-integratie als slotstap). Behoud de bouwvolgorde vanaf M0/ST-001 (story-codes ST-001 t/m ST-004 in sprint -1), uitsluitend binnen de actuele opdracht; volg voor context het standaardblok hieronder.

- **Verify:** `npm run verify && npm run build`

<!-- BEGIN scrum4me-agent-workflow v1 -->
## Scrum4Me-methodiek en MCP-queue

Volgt de globale Scrum4Me-methodiek (`~/.claude/rules/scrum4me-methodiek.md` voor Claude; de "Scrum4Me-methodiek"-sectie in `~/.codex/AGENTS.md` voor Codex). Niet-triviaal werk: plan → Sprint/PBI/Story/Taak via de `scrum4me` MCP → `update_task_status` per laag → docs in de DB. Volg de bestaande goedkeuring en hardstop na materialisatie; voor alleen documentatie/instructies geldt de doc-only-uitzondering.

**Context.** Lees `product_id` uit het Scrum4Me-productblok in de repo-`CLAUDE.md`/`AGENTS.md`. Ontbreekt het, werk normaal zonder een product-ID te raden.
`mcp__scrum4me__get_context({ product_id })` → product, alle `active_sprints` en `agent_guide`. Kies de sprint binnen de actuele opdracht; lees `get_sprint_context({ sprint_id })` voor stories/taken en voeg `task_id` alleen toe voor het volledige taakplan. Gebruik `get_ideas_context({ product_id })` alleen voor ideeën. Geef expliciet bekende `agent.runtime` en `agent.model_id` mee (CLAUDE/CODEX + exact model-ID); laat onbekende gegevens weg. Ontbreekt de guide, gebruik `get_agent_guide` met dezelfde agentinvoer. Context autoriseert geen volgende story.

**Queue gebruiken.** Volg de `s4m-queue`-skill bij queue-handelingen. Gebruik de `mcp__scrum4me__queue_*`-tools met je eigen identiteit; de CLI is fallback bij ontbrekende MCP-toegang of identiteit.
- Stuur een geautoriseerde opdracht/vraag met `queue_push({ to, type, body, ... })`: `task`, `info` of `review_request`. Voor `task`/`review_request`: `cwd` op de ontvangende host en `meta.task: { objective, verification, response_format }`; geef `meta.task.repo` expliciet mee als die niet uit `cwd` kan worden afgeleid.
- Koppel bestaand werk met het meest specifieke `task_id`, `story_id` of `sprint_id` als toolparameter. Gebruik echte IDs uit de context, geen zichtbare codes. De tool leidt `product_id` en bovenliggende IDs af naar `meta.work_item`; geef geen losse `product_id`-parameter aan `queue_push`. Zonder bestaand werkitem geen ID verzinnen.
- Bewaar `message_id`; lees antwoorden met `queue_wait_reply({ message_ids: [...] })`. Ontvang werk via `queue_next`, lees body én metadata en werk binnen `meta.task.cwd`. Rond af via `queue_done`/`queue_fail` met `message_id` en `claim_token`; sluit CLI-claims via de CLI af.

**Reviewdocumenten via metadata.** Voeg bij `review_request` de beoordeelde bronnen toe als `meta.review_documents: { version: 1, items: [...] }`, naast `meta.task`.
- Iedere referentie bevat `key`, `title`, `product_id` en `sha256` van de exacte documentinhoud. Gebruik `source: "product_doc"` met `doc_id` + `revision_id`, of `source: "git"` met relatief `.md`-`path` + volledige gepubliceerde `commit_sha`.
- Lees als reviewer de gekoppelde exacte revisie/commit en controleer de SHA-256; alleen de body of de nieuwste versie lezen volstaat niet. Ontbreekt de gepinde bron of wijkt de hash af, voer de review niet uit: meld de fout en rond een geclaimd verzoek af met `queue_fail`.
- Rapporteer tegen deze pins en antwoord via `queue_done`; het `reviewed`-antwoord blijft via `in_reply_to` gekoppeld aan de reviewdocumenten van het verzoek.
<!-- END scrum4me-agent-workflow v1 -->

## Oriëntatie

| Bestand | Waarvoor |
|---|---|
| [docs/README.md](docs/README.md) | Leeswijzer van de hele specificatie-set — begin hier |
| [docs/product-spec.md](docs/product-spec.md) | Productspecificatie — **§6 randvoorwaarden zijn bindend** (AVG, huisstijl, toegankelijkheid, chat-window-governance); §10 open vragen |
| [docs/mvp-spec.md](docs/mvp-spec.md) | MVP-specificatie — feature-specs, volledig datamodel, architectuur, backlog M0–M5 |
| [docs/research/](docs/research/) | Vijf onderzoeksbijlagen met bronnen (vrijwilligersplanning, oefenen.nl, branding, aanbod, AVG) |
| [docs/adr/](docs/adr/) | ADR-0001–0005 — bindende tech-keuzes, overgenomen van Scrum4Me (base-ui, sort_order, branch-per-milestone, enum-mapping, iron-session) |

## Hardstop-regels (samengevat uit de specs)

- **AVG-veldenmodel is bindend** (product-spec §6.1): geen BSN, geen gezondheids-/afkomstgegevens, geen niveau-labels ("laaggeletterd", NT1/NT2), geen geboortedatum/adres/pasnummer — ook niet via chat-window-wijzigingen. Notitievelden krijgen de vaste instructie "schrijf alsof de cliënt meeleest".
- **Dummydata tot FG-akkoord:** geen echte cliëntgegevens in welke omgeving dan ook vóórdat de FG van Bibliotheek Rotterdam akkoord is en de verwerkersovereenkomst rond is (mvp-spec ST-505).
- **Huisstijl:** tokens uit [docs/research/branding-bibliotheek-rotterdam.md](docs/research/branding-bibliotheek-rotterdam.md); oranje `#ee7203` nooit als tekstkleur op wit (contrast — gebruik `#b35400`); het logo van Bibliotheek Rotterdam niet gebruiken zonder schriftelijke toestemming.
- **Chat-window:** schemawijzigingen alleen via migratie + ADMIN-bevestiging + audit-log (mvp-spec §10); de AVG-weigerlijst staat in app-config, niet alleen in de agent-prompt.
- **UI:** shadcn-componenten op `@base-ui/react` met `render`-prop; geen `@radix-ui/*`-imports of `asChild` (ADR-0001). Enum-conversie uitsluitend via `lib/enums.ts` (ADR-0004).
- **Forge:** Forgejo (`git.jp-visser.nl`) is leidend; push alleen naar `origin`; PR's via Forgejo, nooit `gh pr create`; push pas na expliciete gebruikersbevestiging. Eén branch + PR per milestone (ADR-0003).
