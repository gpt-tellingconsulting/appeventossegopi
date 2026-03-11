import { CompanyForm } from '@/features/companies/components/CompanyForm'

export default function NewCompanyPage() {
  return (
    <div className="p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-display-sm">Nueva Empresa</h1>
        <p className="text-foreground-secondary mt-1">Registrar una nueva empresa en el sistema</p>
      </div>
      <CompanyForm />
    </div>
  )
}
