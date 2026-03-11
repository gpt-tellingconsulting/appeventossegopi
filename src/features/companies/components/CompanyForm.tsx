'use client'

import { useState } from 'react'
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
    smtp_host: string | null
    smtp_port: number | null
    smtp_user: string | null
    smtp_pass: string | null
    smtp_from: string | null
  }
}

function EyeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.64 0 8.577 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.64 0-8.577-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  )
}

const inputClass = "w-full px-4 py-3 rounded-xl border border-border bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"

export function CompanyForm({ company }: Props) {
  const isEdit = !!company
  const [showSmtpPass, setShowSmtpPass] = useState(false)

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
    <form action={formAction} className="space-y-8 max-w-2xl">
      {state?.error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {state.error}
        </div>
      )}

      {/* Datos generales */}
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
            className={`${inputClass} disabled:bg-gray-100 disabled:text-gray-500`}
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
            className={inputClass}
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
          className={inputClass}
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
          className={inputClass}
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
          className={inputClass}
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
          className={inputClass}
          placeholder="Calle, CP Ciudad"
        />
      </div>

      {/* Configuracion SMTP */}
      <div className="border-t border-border pt-6">
        <h2 className="text-lg font-semibold mb-1">Configuracion SMTP</h2>
        <p className="text-sm text-foreground-secondary mb-4">
          Servidor de correo para enviar emails desde esta empresa
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="smtp_host" className="block text-sm font-medium mb-1.5">
              Servidor SMTP
            </label>
            <input
              id="smtp_host"
              name="smtp_host"
              type="text"
              defaultValue={company?.smtp_host ?? ''}
              className={inputClass}
              placeholder="mail.empresa.es"
            />
          </div>
          <div>
            <label htmlFor="smtp_port" className="block text-sm font-medium mb-1.5">
              Puerto
            </label>
            <input
              id="smtp_port"
              name="smtp_port"
              type="number"
              defaultValue={company?.smtp_port ?? 465}
              className={inputClass}
              placeholder="465"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div>
            <label htmlFor="smtp_user" className="block text-sm font-medium mb-1.5">
              Usuario SMTP
            </label>
            <input
              id="smtp_user"
              name="smtp_user"
              type="text"
              defaultValue={company?.smtp_user ?? ''}
              className={inputClass}
              placeholder="eventos@empresa.es"
            />
          </div>
          <div>
            <label htmlFor="smtp_pass" className="block text-sm font-medium mb-1.5">
              Contrasena SMTP
            </label>
            <div className="relative">
              <input
                id="smtp_pass"
                name="smtp_pass"
                type={showSmtpPass ? 'text' : 'password'}
                defaultValue={company?.smtp_pass ?? ''}
                className={`${inputClass} pr-12`}
                placeholder="********"
              />
              <button
                type="button"
                onClick={() => setShowSmtpPass(!showSmtpPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showSmtpPass ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="smtp_from" className="block text-sm font-medium mb-1.5">
            Remitente (From)
          </label>
          <input
            id="smtp_from"
            name="smtp_from"
            type="text"
            defaultValue={company?.smtp_from ?? ''}
            className={inputClass}
            placeholder="Eventos EMPRESA <eventos@empresa.es>"
          />
        </div>
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
