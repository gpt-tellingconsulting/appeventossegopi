import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getEventStats } from '@/features/analytics/services/analyticsService'
import type { AttendanceStatus, LeadStatus } from '@/types/database'

interface PageProps {
  params: Promise<{ id: string }>
}

const attendanceBadge: Record<AttendanceStatus, { label: string; className: string }> = {
  registered: { label: 'Registrado', className: 'badge-registered' },
  confirmed: { label: 'Confirmado', className: 'badge-confirmed' },
  attended: { label: 'Acudió', className: 'badge-attended' },
  no_show: { label: 'NO Acudió', className: 'badge-no-show' },
  cancelled: { label: 'Cancelado', className: 'badge-cancelled' },
}

const leadBadge: Record<LeadStatus, { label: string; className: string }> = {
  new: { label: 'Nuevo', className: 'bg-gray-100 text-gray-700' },
  contacted: { label: 'Contactado', className: 'bg-blue-50 text-blue-700' },
  qualified: { label: 'Calificado', className: 'bg-indigo-50 text-indigo-700' },
  converted: { label: 'Convertido', className: 'bg-green-50 text-green-700' },
  lost: { label: 'Perdido', className: 'bg-red-50 text-red-700' },
}

function ProgressBar({ value, max, color = 'bg-[#4F46E5]' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-medium text-foreground w-8 text-right">{value}</span>
    </div>
  )
}

export default async function EventAnalyticsPage({ params }: PageProps) {
  const { id } = await params
  const stats = await getEventStats(id)
  if (!stats) notFound()

  const { event, totalRegistrations, confirmed, attended, noShow, cancelled, recentRegistrations } = stats

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-6">
        <Link href="/analytics" className="text-sm text-foreground-secondary hover:text-foreground flex items-center gap-1 mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a Analytics
        </Link>
        <h1 className="heading text-2xl text-foreground">{event.title}</h1>
        <p className="text-foreground-secondary mt-1">
          {new Date(event.event_date).toLocaleDateString('es-ES', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
          })} — {event.city}
        </p>
      </div>

      {/* Registration Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="stat-card text-center">
          <p className="text-foreground-secondary text-xs mb-1">Total</p>
          <p className="text-2xl font-bold text-foreground">{totalRegistrations}</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-foreground-secondary text-xs mb-1">Confirmados</p>
          <p className="text-2xl font-bold text-purple-600">{confirmed}</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-foreground-secondary text-xs mb-1">Asistieron</p>
          <p className="text-2xl font-bold text-green-600">{attended}</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-foreground-secondary text-xs mb-1">No asistieron</p>
          <p className="text-2xl font-bold text-yellow-600">{noShow}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Attendance Breakdown */}
        <div className="card-elevated p-6">
          <h2 className="heading text-base mb-5">Desglose de Asistencia</h2>
          <div className="space-y-4">
            {([
              { label: 'Acudió', value: attended, color: 'bg-green-500' },
              { label: 'Confirmado', value: confirmed, color: 'bg-purple-500' },
              { label: 'Registrado', value: totalRegistrations - confirmed - attended - noShow - cancelled, color: 'bg-blue-500' },
              { label: 'NO Acudió', value: noShow, color: 'bg-yellow-500' },
              { label: 'Cancelado', value: cancelled, color: 'bg-red-400' },
            ] as { label: string; value: number; color: string }[]).map(({ label, value, color }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-foreground-secondary">{label}</span>
                  <span className="text-foreground-muted text-xs">
                    {totalRegistrations > 0 ? Math.round((value / totalRegistrations) * 100) : 0}%
                  </span>
                </div>
                <ProgressBar value={value} max={totalRegistrations} color={color} />
              </div>
            ))}
          </div>
        </div>

        {/* Lead Status */}
        <div className="card-elevated p-6">
          <h2 className="heading text-base mb-5">Estado de Leads</h2>
          <div className="space-y-4">
            {([
              { label: 'Nuevos', value: stats.leadNew, color: 'bg-gray-400' },
              { label: 'Contactados', value: stats.leadContacted, color: 'bg-blue-500' },
              { label: 'Calificados', value: stats.leadQualified, color: 'bg-indigo-500' },
              { label: 'Convertidos', value: stats.leadConverted, color: 'bg-green-500' },
            ] as { label: string; value: number; color: string }[]).map(({ label, value, color }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-foreground-secondary">{label}</span>
                  <span className="text-foreground-muted text-xs">
                    {totalRegistrations > 0 ? Math.round((value / totalRegistrations) * 100) : 0}%
                  </span>
                </div>
                <ProgressBar value={value} max={totalRegistrations} color={color} />
              </div>
            ))}
          </div>

          {/* Email + NPS */}
          <div className="mt-6 pt-5 border-t border-border-light grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-foreground-secondary mb-1">Apertura de email</p>
              <p className="text-xl font-bold text-[#4F46E5]">{stats.openRate}%</p>
              <p className="text-xs text-foreground-muted">{stats.emailsOpened}/{stats.emailsSent} emails</p>
            </div>
            <div>
              <p className="text-xs text-foreground-secondary mb-1">NPS Promedio</p>
              <p className="text-xl font-bold text-[#F97316]">
                {stats.avgNps !== null ? stats.avgNps.toFixed(1) : '—'}
              </p>
              <p className="text-xs text-foreground-muted">satisfaccion</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Registrations */}
      <div className="card-elevated overflow-hidden">
        <div className="px-6 py-4 border-b border-border-light flex items-center justify-between">
          <h2 className="heading text-base">Inscripciones Recientes</h2>
          <Link
            href={`/events/${id}/registrations`}
            className="text-sm text-[#4F46E5] hover:text-indigo-700 font-medium"
          >
            Ver todas
          </Link>
        </div>
        {recentRegistrations.length === 0 ? (
          <div className="p-6 text-center text-foreground-secondary text-sm">
            Sin inscripciones todavia
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-light bg-gray-50/50">
                <th className="text-left px-6 py-3 text-xs font-medium text-foreground-secondary uppercase tracking-wide">Nombre</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-foreground-secondary uppercase tracking-wide">Empresa</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-foreground-secondary uppercase tracking-wide">Asistencia</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-foreground-secondary uppercase tracking-wide">Lead</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-foreground-secondary uppercase tracking-wide">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {recentRegistrations.map((reg) => {
                const attCfg = attendanceBadge[reg.attendance_status]
                const leadCfg = leadBadge[reg.lead_status]
                return (
                  <tr key={reg.id} className="border-b border-border-light hover:bg-primary-50/20 transition-colors">
                    <td className="px-6 py-3">
                      <p className="font-medium text-sm">{reg.first_name} {reg.last_name}</p>
                      <p className="text-xs text-foreground-muted">{reg.email}</p>
                    </td>
                    <td className="px-6 py-3 text-sm text-foreground-secondary">
                      {reg.company ?? '—'}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${attCfg.className}`}>
                        {attCfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${leadCfg.className}`}>
                        {leadCfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-xs text-foreground-muted">
                      {new Date(reg.created_at).toLocaleDateString('es-ES', {
                        day: 'numeric', month: 'short',
                      })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
