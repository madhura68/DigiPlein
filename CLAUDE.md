# CLAUDE.md — DigiPlein

Interne web-app voor het digivaardigheidsteam van Bibliotheek Rotterdam (Centrale Bibliotheek): vrijwilligersrooster + cliëntregistratie voor **Klik & Tik** en **Les op maat** (di/do 10:00–12:00), met een chat-window waarmee medewerkers de app via natuurlijke taal uitbreiden. "DigiPlein" is de werknaam.

## Scrum4Me-product

- **Naam:** DigiPlein
- **product_id:** `cmq9hybds0003v27r99zvo92k`
- **Definition of Done** *(voorstel — `definition_of_done` van het product in Scrum4Me is nog leeg; na akkoord van JP ook daar registreren)*:
  1. `npm run verify && npm run build` groen (vanaf ST-001; verify = lint + typecheck + test)
  2. Acceptatiecriteria van de story aantoonbaar groen (testbewijs of demo-stap benoemd)
  3. AVG-hardstops gerespecteerd: bindend veldenmodel (product-spec §6.1), uitsluitend dummydata, auditregel waar van toepassing
  4. Huisstijl-tokens toegepast; geen WCAG 2.2 AA-blokkers op geraakte schermen; UI-tekst NL/B1
  5. Scrum4Me bijgewerkt: taakstatus + `log_implementation`/`log_commit`/`log_test_result`; nieuwe patronen/besluiten als product-doc

Volgt de globale Scrum4Me-methodiek (`~/.claude/rules/scrum4me-methodiek.md` voor Claude; de "Scrum4Me-methodiek"-sectie in `~/.codex/AGENTS.md` voor Codex). Niet-triviaal werk: plan → Sprint/PBI/Story/Taak via de `scrum4me` MCP → `update_task_status` per laag → docs in de DB.

- **Verify:** nog geen code in deze repo — vanaf de scaffold (ST-001, zie backlog) geldt `npm run verify && npm run build`

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
