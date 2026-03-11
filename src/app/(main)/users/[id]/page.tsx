import { notFound } from 'next/navigation'
import { getUserById } from '@/features/users/services/userService'
import { getAllCompanies } from '@/features/companies/services/companyService'
import { UserForm } from '@/features/users/components/UserForm'

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [user, companies] = await Promise.all([
    getUserById(id),
    getAllCompanies(),
  ])
  if (!user) notFound()

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-display-sm">Editar Usuario</h1>
        <p className="text-foreground-secondary mt-1">{user.first_name} {user.last_name}</p>
      </div>
      <UserForm
        user={{
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          user_type: user.user_type,
          company_access: user.company_access ?? [],
          is_active: user.is_active,
        }}
        companies={companies.map(c => ({ company_code: c.company_code, name: c.name }))}
      />
    </div>
  )
}
