---
title: "ADR-0001: @base-ui/react in plaats van Radix UI"
status: active
language: nl
last_updated: 2026-06-11
---

# ADR-0001: @base-ui/react in plaats van Radix UI

## Status

accepted — overgenomen van Scrum4Me ADR-0001 (besluit 2026-05-16), aangepast voor DigiPlein op 2026-06-11.

## Context

DigiPlein gebruikt shadcn/ui (mvp-spec §9), dezelfde stack als de overige projecten van de bouwer. shadcn genereert standaard componenten op Radix UI-primitives met het `asChild`-compositiepatroon. In Scrum4Me zijn de shadcn-wrappers in `components/ui/` omgebouwd naar `@base-ui/react`: dezelfde toegankelijkheidsprimitives, maar compositie via een `render`-prop. `asChild` bestaat niet in de API van `@base-ui/react` en geeft in een TypeScript-strict-setup directe typefouten. Eén patroon over alle codebases van de bouwer weegt zwaar (solo-onderhoud), en het chat-window — dat straks UI genereert — moet op één conventie kunnen bouwen.

## Besluit

DigiPlein gebruikt uitsluitend `@base-ui/react`. Geen enkel `@radix-ui/*`-package wordt geïmporteerd. Compositie altijd via de `render`-prop:

```tsx
// ✅ goed
<TooltipTrigger render={<button />}>…</TooltipTrigger>

// ❌ fout — asChild bestaat niet op @base-ui/react-primitives
<TooltipTrigger asChild><button>…</button></TooltipTrigger>
```

## Consequenties

### Positief

- TypeScript blijft schoon; geen `any`-casts of `asChild`-workarounds.
- Eén compositiepatroon over Scrum4Me én DigiPlein — minder schakelkosten voor de bouwer en voor agents.
- `@base-ui/react` wordt actief onderhouden door het MUI-team, met React 19-ondersteuning.

### Negatief

- shadcn-CLI-output is Radix-gebaseerd en moet bij installatie (ST-001) handmatig worden omgebouwd.
- AI-agents die op Radix-gebaseerde shadcn-documentatie zijn getraind — inclusief de chat-window-agent — grijpen standaard naar `asChild`; daarom bewaakt een lint-/testregel dat er geen `@radix-ui/*`-import en geen `asChild`-gebruik in de codebase staat (deze ADR bestaat om die reden).
