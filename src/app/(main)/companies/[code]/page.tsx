import { notFound } from 'next/navigation'
import { getCompanyByCode } from '@/features/companies/services/companyService'
import { CompanyForm } from '@/features/companies/components/CompanyForm'

export default async function EditCompanyPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const company = await getCompanyByCode(Number(code))
  if (!company) notFound()

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-display-sm">Editar Empresa</h1>
        <p className="text-foreground-secondary mt-1">{company.name}</p>
      </div>
      <CompanyForm company={company} />
    </div>
  )
}
