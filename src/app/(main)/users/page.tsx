import Link from 'next/link'
import { getAllUsers } from '@/features/users/services/userService'
import { getAllCompanies } from '@/features/companies/services/companyService'

export default async function UsersPage() {
  const [users, companies] = await Promise.all([
    getAllUsers(),
    getAllCompanies(),
  ])

  const companyMap = new Map(companies.map(c => [c.company_code, c.name]))

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-display-sm">Usuarios</h1>
          <p className="text-foreground-secondary mt-1">{users.length} usuarios registrados</p>
        </div>
        <Link href="/users/new" className="btn-primary px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 w-fit">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Usuario
        </Link>
      </div>

      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-4 text-sm font-medium text-foreground-secondary">Usuario</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-foreground-secondary hidden sm:table-cell">Tipo</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-foreground-secondary hidden md:table-cell">Empresas</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-foreground-secondary hidden lg:table-cell">Estado</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-foreground-secondary">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0 hover:bg-primary-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium">{u.first_name ?? ''} {u.last_name ?? ''}</p>
                    <p className="text-sm text-foreground-secondary">{u.email}</p>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      u.user_type === 'admin'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {u.user_type === 'admin' ? 'Administrador' : 'Usuario'}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    {u.user_type === 'admin' ? (
                      <span className="text-sm text-foreground-secondary italic">Todas</span>
                    ) : u.company_access && u.company_access.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {u.company_access.map(code => (
                          <span key={code} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-foreground-secondary">
                            {code} - {companyMap.get(code)?.split(',')[0] ?? '?'}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-foreground-secondary">Ninguna</span>
                    )}
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      u.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {u.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/users/${u.id}`}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
