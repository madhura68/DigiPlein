---
title: "ADR-0003: Eén branch per milestone, push pas na gebruikerstest"
status: active
language: nl
last_updated: 2026-06-11
---

# ADR-0003: Eén branch per milestone, push pas na gebruikerstest

## Status

accepted — overgenomen van Scrum4Me ADR-0003 (besluit 2026-05-03), aangepast voor DigiPlein op 2026-06-11.

## Context

Forgejo (`git.jp-visser.nl`) is de leidende forge. De hostingkeuze is nog open (plan-aanname A2); wordt het Vercel, dan kost elke push naar een feature-branch een preview-build (Hobby-plan: eindig en betaald). De AI-gedreven werkwijze commit frequent in kleine logische lagen — een push per commit of per story zou builds verspillen. Gebruikersacceptatie gebeurt interactief per milestone, niet per story.

## Overwogen opties

- Branch per story — kleine PR's, maar N stories = N preview-builds per milestone.
- **Branch per milestone** — één branch voor alle stories van een milestone, één PR na de gebruikerstest.
- Trunk-based — vereist feature-flags om half werk te verbergen; te veel infrastructuur voor deze schaal.

## Besluit

Eén branch per milestone: `feat/m0-fundament`, `feat/m1-kerntabellen`, `feat/m2-chat-window`. Commits accumuleren lokaal per taak/laag. `git push` is nooit geautomatiseerd en gebeurt pas na expliciete bevestiging van JP, ná de gebruikerstest van het milestone. Eén PR per milestone, op Forgejo (nooit `gh pr create`).

## Consequenties

- Goed: preview-/CI-builds schalen met milestones, niet met stories; de PR-historie leest als milestones.
- Goed: verenigbaar met de bestaande Forge-hardstop in CLAUDE.md (push alleen na expliciete bevestiging).
- Slecht: branches leven langer; merge-conflicten zijn zeldzamer maar groter.
- Slecht: één falende story blokkeert de milestone-PR.

## Heroverwegen

Bij een Vercel Pro-account (onbeperkte preview-builds) of wanneer milestone-PR's onhanteerbaar groot blijken, wordt branch-per-story het voorkeursmodel. Werk dan deze ADR bij.
