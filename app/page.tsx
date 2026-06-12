import { ChatWindow } from '@/components/chat/chat-window'
import { Button } from '@/components/ui/button'
import { requireStaff } from '@/lib/auth'

import { logout } from './logout/actions'
import { StartTiles } from './start-tiles'

export default async function Home() {
  const session = await requireStaff()

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl">Welkom terug, {session.name}.</h1>
          <p className="text-muted-foreground">
            Kies waar je mee aan de slag wilt.
          </p>
        </div>
        <form action={logout}>
          <Button type="submit" variant="secondary">
            Uitloggen
          </Button>
        </form>
      </header>

      <StartTiles role={session.role} chatSlot={<ChatWindow authenticated />} />
    </main>
  )
}
