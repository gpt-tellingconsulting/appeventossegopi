import { getAllCompanies } from '@/features/companies/services/companyService'
import { UserForm } from '@/features/users/components/UserForm'

export default async function NewUserPage() {
  const companies = await getAllCompanies()

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-display-sm">Nuevo Usuario</h1>
        <p className="text-foreground-secondary mt-1">Crear un nuevo usuario de acceso al sistema</p>
      </div>
      <UserForm companies={companies.map(c => ({ company_code: c.company_code, name: c.name }))} />
    </div>
  )
}
