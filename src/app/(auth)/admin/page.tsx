import Image from 'next/image'
import Link from 'next/link'
import { LoginForm } from '@/features/auth/components'

export default function LoginPage() {
  return (
    <div className="space-y-8">
      {/* Logo movil */}
      <div className="lg:hidden flex items-center justify-center mb-8">
        <span className="inline-flex items-center bg-primary-500 rounded-xl px-4 py-2">
          <Image src="/logo-segopi.png" alt="Eventos SEGOPI" width={140} height={50} className="h-12 w-auto brightness-0 invert" />
        </span>
      </div>

      <div className="text-center lg:text-left">
        <h1 className="text-display-xs text-foreground">Bienvenido de vuelta</h1>
        <p className="mt-2 text-foreground-secondary">Inicia sesión en tu cuenta para continuar</p>
      </div>

      <LoginForm />

      <p className="text-center text-sm text-foreground-secondary">
        ¿No tienes una cuenta?{' '}
        <Link href="/signup" className="font-medium text-accent-500 hover:text-accent-600 hover:underline">
          Regístrate
        </Link>
      </p>
    </div>
  )
}
