'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { createUserAction, updateUserAction } from '@/actions/users'

const EyeIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const EyeOffIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
)

interface Company {
  company_code: number
  name: string
}

interface UserData {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  user_type: string
  company_access: number[]
  is_active: boolean
  admin_set_password: string | null
}

interface Props {
  user?: UserData
  companies: Company[]
}

export function UserForm({ user, companies }: Props) {
  const isEdit = !!user
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [showCreatePw, setShowCreatePw] = useState(false)

  const [state, formAction, isPending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      if (isEdit) {
        return await updateUserAction(user!.id, formData)
      }
      return await createUserAction(formData)
    },
    undefined
  )

  return (
    <form action={formAction} className="space-y-6 max-w-2xl">
      {state?.error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {state.error}
        </div>
      )}

      {/* --- MODO CREAR --- */}
      {!isEdit && (
        <>
          {/* Email + Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5">Email</label>
              <input
                id="email" name="email" type="email" required
                className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                placeholder="usuario@empresa.es"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5">Password</label>
              <div className="relative">
                <input
                  id="password" name="password" type={showCreatePw ? 'text' : 'password'}
                  required minLength={6}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-border bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  placeholder="Min. 6 caracteres"
                />
                <button type="button" onClick={() => setShowCreatePw(!showCreatePw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-secondary hover:text-foreground" tabIndex={-1}>
                  {showCreatePw ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* --- MODO EDITAR --- */}
      {isEdit && (
        <>
          {/* Fila 1: Email + Tipo de Acceso */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <div className="px-4 py-3 rounded-xl border border-border bg-gray-50 text-sm text-foreground">
                {user.email}
              </div>
            </div>
            <div>
              <label htmlFor="user_type" className="block text-sm font-medium mb-1.5">Tipo de Acceso</label>
              <select
                id="user_type" name="user_type" defaultValue={user.user_type}
                className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
              >
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>
        </>
      )}

      {/* Nombre + Apellido (ambos modos) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="first_name" className="block text-sm font-medium mb-1.5">Nombre</label>
          <input
            id="first_name" name="first_name" type="text" required
            defaultValue={user?.first_name ?? ''}
            className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
          />
        </div>
        <div>
          <label htmlFor="last_name" className="block text-sm font-medium mb-1.5">Apellido</label>
          <input
            id="last_name" name="last_name" type="text" required
            defaultValue={user?.last_name ?? ''}
            className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
          />
        </div>
      </div>

      {/* Contraseña actual + Nueva contraseña (solo editar) */}
      {isEdit && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Contraseña actual */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Contraseña Actual</label>
            {user.admin_set_password ? (
              <div className="flex items-center gap-2">
                <div className="flex-1 px-4 py-3 rounded-xl border border-border bg-gray-50 text-sm font-mono truncate">
                  {showCurrentPw ? user.admin_set_password : '••••••••'}
                </div>
                <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="px-3 py-3 rounded-xl border border-border bg-white hover:bg-gray-50 text-foreground-secondary hover:text-foreground transition-colors flex-shrink-0"
                  title={showCurrentPw ? 'Ocultar' : 'Mostrar'}>
                  {showCurrentPw ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            ) : (
              <div className="px-4 py-3 rounded-xl border border-border bg-gray-50 text-sm text-foreground-secondary italic">
                No registrada
              </div>
            )}
          </div>
          {/* Nueva contraseña */}
          <div>
            <label htmlFor="new_password" className="block text-sm font-medium mb-1.5">Nueva Contraseña</label>
            <div className="relative">
              <input
                id="new_password" name="new_password" type={showNewPw ? 'text' : 'password'}
                minLength={6} autoComplete="new-password"
                className="w-full px-4 py-3 pr-12 rounded-xl border border-border bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                placeholder="Dejar vacio para no cambiar"
              />
              <button type="button" onClick={() => setShowNewPw(!showNewPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-secondary hover:text-foreground" tabIndex={-1}>
                {showNewPw ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tipo de Acceso (solo crear - en editar ya está arriba) */}
      {!isEdit && (
        <div>
          <label htmlFor="user_type" className="block text-sm font-medium mb-1.5">Tipo de Acceso</label>
          <select
            id="user_type" name="user_type" defaultValue="user"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
          >
            <option value="user">Usuario</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
      )}

      {/* Empresas (multi-select con checkboxes) */}
      <div>
        <label className="block text-sm font-medium mb-1.5">Empresas con Acceso</label>
        <p className="text-xs text-foreground-secondary mb-3">
          Los administradores tienen acceso a todas las empresas automaticamente.
        </p>
        <div className="space-y-2 max-h-60 overflow-y-auto p-3 border border-border rounded-xl">
          {companies.map((c) => (
            <label key={c.company_code} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox" name="company_access" value={c.company_code}
                defaultChecked={user?.company_access?.includes(c.company_code)}
                className="w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm">
                <span className="font-medium text-foreground-secondary mr-2">{c.company_code}</span>
                {c.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={isPending}
          className="btn-primary px-6 py-3 rounded-xl font-medium disabled:opacity-50">
          {isPending ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Crear Usuario'}
        </button>
        <a href="/users" className="btn-secondary px-6 py-3 rounded-xl font-medium">Cancelar</a>
      </div>
    </form>
  )
}
