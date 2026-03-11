'use client'

import { useActionState } from 'react'
import { createUserAction, updateUserAction } from '@/actions/users'

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
}

interface Props {
  user?: UserData
  companies: Company[]
}

export function UserForm({ user, companies }: Props) {
  const isEdit = !!user
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

      {/* Email + Password (solo crear) */}
      {!isEdit && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1.5">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
              placeholder="usuario@empresa.es"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1.5">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
              placeholder="Min. 6 caracteres"
            />
          </div>
        </div>
      )}

      {isEdit && (
        <div className="p-3 bg-gray-50 rounded-xl text-sm text-foreground-secondary">
          Email: <span className="font-medium text-foreground">{user.email}</span>
        </div>
      )}

      {/* Nombre + Apellido */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="first_name" className="block text-sm font-medium mb-1.5">
            Nombre
          </label>
          <input
            id="first_name"
            name="first_name"
            type="text"
            required
            defaultValue={user?.first_name ?? ''}
            className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
          />
        </div>
        <div>
          <label htmlFor="last_name" className="block text-sm font-medium mb-1.5">
            Apellido
          </label>
          <input
            id="last_name"
            name="last_name"
            type="text"
            required
            defaultValue={user?.last_name ?? ''}
            className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
          />
        </div>
      </div>

      {/* Tipo de usuario */}
      <div>
        <label htmlFor="user_type" className="block text-sm font-medium mb-1.5">
          Tipo de Acceso
        </label>
        <select
          id="user_type"
          name="user_type"
          defaultValue={user?.user_type ?? 'user'}
          className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
        >
          <option value="user">Usuario</option>
          <option value="admin">Administrador</option>
        </select>
      </div>

      {/* Empresas (multi-select con checkboxes) */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Empresas con Acceso
        </label>
        <p className="text-xs text-foreground-secondary mb-3">
          Los administradores tienen acceso a todas las empresas automaticamente.
        </p>
        <div className="space-y-2 max-h-60 overflow-y-auto p-3 border border-border rounded-xl">
          {companies.map((c) => (
            <label key={c.company_code} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                name="company_access"
                value={c.company_code}
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
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary px-6 py-3 rounded-xl font-medium disabled:opacity-50"
        >
          {isPending ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Crear Usuario'}
        </button>
        <a href="/users" className="btn-secondary px-6 py-3 rounded-xl font-medium">
          Cancelar
        </a>
      </div>
    </form>
  )
}
