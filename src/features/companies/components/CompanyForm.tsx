'use client'

import { useActionState } from 'react'
import { createCompanyAction, updateCompanyAction } from '@/actions/companies'

interface Props {
  company?: {
    company_code: number
    name: string
    cif: string
    fiscal_address: string | null
    physical_address: string | null
    email: string | null
  }
}

export function CompanyForm({ company }: Props) {
  const isEdit = !!company
  const [state, formAction, isPending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      if (isEdit) {
        return await updateCompanyAction(company!.company_code, formData)
      }
      return await createCompanyAction(formData)
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="company_code" className="block text-sm font-medium mb-1.5">
            Codigo Empresa
          </label>
          <input
            id="company_code"
            name="company_code"
            type="number"
            required
            disabled={isEdit}
            defaultValue={company?.company_code}
            className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all disabled:bg-gray-100 disabled:text-gray-500"
            placeholder="1"
          />
        </div>
        <div>
          <label htmlFor="cif" className="block text-sm font-medium mb-1.5">
            CIF
          </label>
          <input
            id="cif"
            name="cif"
            type="text"
            required
            defaultValue={company?.cif ?? ''}
            className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
            placeholder="B12345678"
          />
        </div>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1.5">
          Nombre Empresa
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={company?.name ?? ''}
          className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
          placeholder="EMPRESA, S.L."
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1.5">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={company?.email ?? ''}
          className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
          placeholder="eventos@empresa.es"
        />
      </div>

      <div>
        <label htmlFor="fiscal_address" className="block text-sm font-medium mb-1.5">
          Direccion Fiscal
        </label>
        <textarea
          id="fiscal_address"
          name="fiscal_address"
          rows={2}
          defaultValue={company?.fiscal_address ?? ''}
          className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
          placeholder="Calle, CP Ciudad"
        />
      </div>

      <div>
        <label htmlFor="physical_address" className="block text-sm font-medium mb-1.5">
          Ubicacion Fisica
        </label>
        <textarea
          id="physical_address"
          name="physical_address"
          rows={2}
          defaultValue={company?.physical_address ?? ''}
          className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
          placeholder="Calle, CP Ciudad"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary px-6 py-3 rounded-xl font-medium disabled:opacity-50"
        >
          {isPending ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Crear Empresa'}
        </button>
        <a href="/companies" className="btn-secondary px-6 py-3 rounded-xl font-medium">
          Cancelar
        </a>
      </div>
    </form>
  )
}
