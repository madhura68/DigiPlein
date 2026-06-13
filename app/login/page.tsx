import { APP_NAME } from '@/lib/app-name'
import { Card } from '@/components/ui/card'
import { LoginForm } from './login-form'
import { QrLoginButton } from './qr-login-button'

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6">
      <Card className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl">Inloggen</h1>
          <p className="text-muted-foreground">{APP_NAME} — cursusplanning</p>
        </div>
        <LoginForm />
        <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground">
          <span className="h-px flex-1 bg-outline-variant" />
          <span>of</span>
          <span className="h-px flex-1 bg-outline-variant" />
        </div>
        <QrLoginButton />
      </Card>
    </main>
  )
}
