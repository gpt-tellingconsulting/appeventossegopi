import { EventForm } from '@/features/events/components/EventForm'
import { getAllCompanies } from '@/features/companies/services/companyService'

export default async function NewEventPage() {
  const companies = await getAllCompanies()

  return (
    <div className="p-4 sm:p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-display-sm">Nuevo Evento</h1>
        <p className="text-foreground-secondary mt-1">Crea un nuevo evento o feria</p>
      </div>

      <EventForm companies={companies.map(c => ({ company_code: c.company_code, name: c.name }))} />
    </div>
  )
}
