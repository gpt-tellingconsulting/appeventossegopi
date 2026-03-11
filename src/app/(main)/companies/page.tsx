import Link from 'next/link'
import { getAllCompanies } from '@/features/companies/services/companyService'

export default async function CompaniesPage() {
  const companies = await getAllCompanies()

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-display-sm">Empresas</h1>
          <p className="text-foreground-secondary mt-1">{companies.length} empresas registradas</p>
        </div>
        <Link href="/companies/new" className="btn-primary px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 w-fit">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nueva Empresa
        </Link>
      </div>

      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-4 text-sm font-medium text-foreground-secondary">Codigo</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-foreground-secondary">Empresa</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-foreground-secondary hidden sm:table-cell">CIF</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-foreground-secondary hidden md:table-cell">Email</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-foreground-secondary hidden lg:table-cell">Estado</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-foreground-secondary">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.company_code} className="border-b border-border last:border-0 hover:bg-primary-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono font-medium text-primary-600">{company.company_code}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium">{company.name}</p>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell text-foreground-secondary text-sm">
                    {company.cif}
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell text-foreground-secondary text-sm">
                    {company.email ?? '-'}
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      company.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {company.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/companies/${company.company_code}`}
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
