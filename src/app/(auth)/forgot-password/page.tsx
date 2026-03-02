import Image from 'next/image'
import Link from 'next/link'
import { ForgotPasswordForm } from '@/features/auth/components'

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-8">
      {/* Logo móvil */}
      <div className="lg:hidden flex items-center justify-center mb-8">
        <span className="inline-flex items-center bg-primary-500 rounded-xl px-4 py-2">
          <Image src="/logo-segopi.png" alt="Eventos SEGOPI" width={140} height={50} className="h-12 w-auto brightness-0 invert" />
        </span>
      </div>

      <div className="text-center lg:text-left">
        <h1 className="text-display-xs text-foreground">Recupera tu contraseña</h1>
        <p className="mt-2 text-foreground-secondary">Ingresa tu correo y te enviaremos un enlace para restablecerla</p>
      </div>

      <ForgotPasswordForm />

      <Link
        href="/admin"
        className="flex items-center justify-center gap-2 text-sm font-medium text-foreground-secondary hover:text-foreground"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Volver al inicio de sesión
      </Link>
    </div>
  )
}
