import { Tile } from '@/components/tile'

// Pure presentatie van het chat-integratiepunt (F-07), los van sessie/env zodat
// elke toestand direct testbaar is.
//  - niet-ingelogd  → niets (chat is nooit zichtbaar voor uitgelogden)
//  - flag uit/geen URL → "binnenkort"-tegel (gedeeld met het ST-107-startscherm)
//  - flag aan + URL    → het externe component ingebed (zelfde-origin, A3)
export function ChatWindowView({
  authenticated,
  enabled,
  url,
}: {
  authenticated: boolean
  enabled: boolean
  url?: string
}) {
  if (!authenticated) return null

  if (!enabled || !url) {
    return (
      <Tile
        title="Chat"
        badge="Binnenkort"
        description="Straks stel je hier in het Nederlands je vraag over de app."
      />
    )
  }

  return (
    <iframe
      src={url}
      title="DigiPlein-chat"
      className="h-full min-h-72 w-full rounded-card border border-outline-variant"
    />
  )
}
