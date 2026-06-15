// Eager pre-registratie van een DigiPlein-medewerker als copilot-gebruiker bij de
// centrale scrum4me-copilot-service. We hergebruiken het bestaande sessions-pad: een
// GET /v1/sessions met de app-key + de staffId als app-user laat de service (membership.ts)
// een PENDING CopilotAppUser upserten. Zo verschijnt de medewerker meteen in de
// product-settings i.p.v. pas nadat hij zelf de copilot-drawer opent.
//
// Best-effort en server-side: er verlaat alleen de opaque staffId DigiPlein (geen PII).
// De functie gooit nooit en mag de medewerker-aanmaak nooit blokkeren.

const TIMEOUT_MS = 3000

export async function preRegisterCopilotAppUser(
  staffId: string
): Promise<{ registered: boolean }> {
  const serviceUrl = process.env.S4M_COPILOT_URL
  const appKey = process.env.S4M_COPILOT_APP_KEY
  // Geen binding geconfigureerd (bv. lokale dev) → stil overslaan; het lazy-pad
  // (medewerker opent zelf de copilot) blijft de fallback.
  if (!serviceUrl || !appKey) return { registered: false }

  try {
    const res = await fetch(`${serviceUrl}/v1/sessions`, {
      method: 'GET',
      headers: {
        'X-S4M-App-Key': appKey,
        'X-S4M-App-User': staffId,
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    // 200 = al gekoppeld (LINKED); 403 = not_linked → PENDING net aangemaakt. In beide
    // gevallen bestaat de CopilotAppUser-rij nu. 401 (onbekende app-key) / 503 (binding
    // niet beschikbaar) / overige → niet als geregistreerd beschouwen.
    return { registered: res.status === 200 || res.status === 403 }
  } catch {
    // Netwerkfout of timeout: niet geregistreerd, maar nooit gooien.
    return { registered: false }
  }
}
