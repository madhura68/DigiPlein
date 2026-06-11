import { Button } from '@/components/ui/button'
import { logout } from './logout/actions'

export default function Home() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col justify-center gap-4 p-8">
      <h1 className="text-3xl font-bold">DigiPlein</h1>
      <p className="text-base text-muted-foreground">
        Het fundament staat. De huisstijl, het datamodel en de schermen volgen in
        de komende stories.
      </p>
      <form action={logout}>
        <Button type="submit" variant="secondary">
          Uitloggen
        </Button>
      </form>
    </main>
  )
}
