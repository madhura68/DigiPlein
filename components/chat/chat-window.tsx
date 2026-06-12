import { env } from '@/lib/env'

import { ChatWindowView } from './chat-window-view'

// Integratiepunt voor het externe chat-component (F-07). Wordt alleen in
// geauthenticeerde context geplaatst (het startscherm is requireStaff-gated),
// vandaar `authenticated` als expliciete prop; de feature-flag/URL komen uit env.
// Identiteit loopt niet via dit component maar via /api/chat/session (contract §10.1).
export function ChatWindow({ authenticated }: { authenticated: boolean }) {
  return (
    <ChatWindowView
      authenticated={authenticated}
      enabled={env.CHAT_WINDOW_ENABLED}
      url={env.CHAT_WINDOW_URL}
    />
  )
}
