import Image from 'next/image'
import Link from 'next/link'
import { SignupForm } from '@/features/auth/components'

export default function SignupPage() {
  return (
    <div className="space-y-8">
      {/* Logo movil */}
      <div className="lg:hidden flex items-center justify-center mb-8">
        <span className="inline-flex items-center bg-primary-500 rounded-xl px-4 py-2">
          <Image src="/logo-segopi.png" alt="Eventos SEGOPI" width={140} height={50} className="h-12 w-auto brightness-0 invert" />
        </span>
      </div>

      <div className="text-center lg:text-left">
        <h1 className="text-display-xs text-foreground">Crea tu cuenta</h1>
        <p className="mt-2 text-foreground-secondary">Registrate para gestionar eventos y ferias profesionales</p>
      </div>

      <SignupForm />

      <p className="text-center text-sm text-foreground-secondary">
        ¿Ya tienes una cuenta?{' '}
        <Link href="/admin" className="font-medium text-accent-500 hover:text-accent-600 hover:underline">
          Inicia sesión
        </Link>
      </p>

      <p className="text-center text-xs text-foreground-muted">
        Al registrarte, aceptas nuestros{' '}
        <Link href="/terms" className="underline hover:text-foreground-secondary">
          Términos de Servicio
        </Link>{' '}
        y{' '}
        <Link href="/privacy" className="underline hover:text-foreground-secondary">
          Política de Privacidad
        </Link>
      </p>
    </div>
  )
}
