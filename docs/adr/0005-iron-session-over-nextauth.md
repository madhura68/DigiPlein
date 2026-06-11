---
title: "ADR-0005: iron-session voor authenticatie in plaats van NextAuth/Clerk/Supabase Auth"
status: active
language: nl
last_updated: 2026-06-11
---

# ADR-0005: iron-session voor authenticatie in plaats van NextAuth/Clerk/Supabase Auth

## Status

accepted — overgenomen van Scrum4Me ADR-0005 (besluit 2026-05-03), aangepast voor DigiPlein op 2026-06-11. Formaliseert de stack-keuze die mvp-spec §9 al maakte.

## Context

DigiPlein vereist e-mail + wachtwoord-login voor een klein team (≤ ~25 medewerkers), server-side rolafdwinging (`ADMIN`/`STAFF`), en in M3 magic links voor vrijwilligers via eigen ondertekende, kortlevende tokens. AVG-dataminimalisatie weegt zwaar (product-spec §6.4): elke externe auth-dienst is een extra verwerker in de verwerkersovereenkomst-keten. Er is geen behoefte aan OAuth of social login; cliënten loggen nooit in.

## Beslisfactoren

- Zo min mogelijk verwerkers (AVG) — auth blijft in-proces, geen third-party redirect.
- Volledige controle over de sessie-cookie-inhoud (`{ staffId, name, role }`; M3: beperkte vrijwilliger-scope).
- Solo-onderhoud: minimale afhankelijkheden, zelfde patroon als Scrum4Me.

## Overwogen opties

- NextAuth / Auth.js v5 — credentials-provider wordt in v5 ontmoedigd; sessievorm opaque; eigen velden vereisen callbacks.
- Clerk — volledig beheerd, maar third-party redirect én een extra verwerker (AVG-min).
- Supabase Auth — tweede database-afhankelijkheid alleen voor auth; e-mailloze flows zijn niet de hoofdroute.
- **iron-session + bcryptjs** — minimaal, expliciet, TypeScript-native; sessie-payload volledig in eigen beheer.

## Besluit

iron-session + bcryptjs. `lib/session.ts` definieert het sessietype; `proxy.ts` leest de cookie synchroon voor routebescherming; rolchecks gebeuren server-side per action/route. Magic links (M3) zijn eigen ondertekende, kortlevende tokens — geen auth-framework.

## Consequenties

- Goed: sessievorm volledig in eigen hand; geen externe dienst, werkt offline en in CI; geen extra verwerker in de AVG-keten.
- Goed: synchroon cookie-lezen in `proxy.ts` is triviaal.
- Slecht: hashing, sessierotatie en CSRF-bescherming zijn eigen verantwoordelijkheid (bcryptjs + httpOnly/secure/sameSite-cookie dekken de basis).
- Slecht: OAuth/SSO vergt zelfbouw — heroverwegen als de bibliotheek ooit SSO eist.
