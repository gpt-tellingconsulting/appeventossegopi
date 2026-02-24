'use client'

import { useState, useEffect, useCallback } from 'react'

interface GitFile {
  status: string
  path: string
}

type DeployStage = 'idle' | 'deploying' | 'done' | 'error'

interface DeployModalProps {
  isOpen: boolean
  onClose: () => void
}

function statusBadge(code: string): { text: string; className: string } {
  switch (code) {
    case 'M': return { text: 'Modificado', className: 'text-amber-700 bg-amber-100' }
    case 'A': return { text: 'Nuevo', className: 'text-emerald-700 bg-emerald-100' }
    case 'D': return { text: 'Eliminado', className: 'text-red-700 bg-red-100' }
    case 'R': return { text: 'Renombrado', className: 'text-blue-700 bg-blue-100' }
    case '??': return { text: 'Sin tracking', className: 'text-gray-700 bg-gray-100' }
    default: return { text: code, className: 'text-gray-700 bg-gray-100' }
  }
}

const steps = [
  { label: 'git add', active: 'Agregando archivos...' },
  { label: 'commit', active: 'Creando commit...' },
  { label: 'push', active: 'Subiendo a GitHub...' },
]

export function DeployModal({ isOpen, onClose }: DeployModalProps) {
  const [files, setFiles] = useState<GitFile[]>([])
  const [branch, setBranch] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [stage, setStage] = useState<DeployStage>('idle')
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(0)

  const resetState = useCallback(() => {
    setStage('idle')
    setError(null)
    setCurrentStep(0)
    setMessage('')
  }, [])

  // Fetch git status on open
  useEffect(() => {
    if (!isOpen) return
    resetState()
    setLoading(true)

    fetch('/api/deploy')
      .then(r => r.json())
      .then(data => {
        setFiles(data.files ?? [])
        setBranch(data.branch ?? '')
      })
      .catch(() => setError('Error al obtener estado de git'))
      .finally(() => setLoading(false))
  }, [isOpen, resetState])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && stage !== 'deploying') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, stage, onClose])

  async function handleDeploy() {
    if (!message.trim() || stage === 'deploying') return

    setStage('deploying')
    setError(null)
    setCurrentStep(1)

    const stepTimer = setTimeout(() => setCurrentStep(2), 1000)
    const stepTimer2 = setTimeout(() => setCurrentStep(3), 2000)

    try {
      const res = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() }),
      })

      const data = await res.json()

      clearTimeout(stepTimer)
      clearTimeout(stepTimer2)

      if (!res.ok) {
        setStage('error')
        setError(data.error ?? 'Error desconocido')
        return
      }

      setCurrentStep(3)
      setStage('done')
      setTimeout(() => onClose(), 3000)
    } catch {
      clearTimeout(stepTimer)
      clearTimeout(stepTimer2)
      setStage('error')
      setError('Error de conexion')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={stage !== 'deploying' ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-3 p-6 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <RocketIconLarge className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Deploy a Produccion</h2>
            {branch && (
              <p className="text-sm text-gray-500">
                Branch: <span className="font-mono text-indigo-600">{branch}</span>
              </p>
            )}
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* File list */}
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500">No hay cambios pendientes</p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                {files.length} archivo{files.length !== 1 ? 's' : ''} modificado{files.length !== 1 ? 's' : ''}
              </p>
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100">
                {files.map((file, i) => {
                  const badge = statusBadge(file.status)
                  return (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 text-sm">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${badge.className}`}>
                        {badge.text}
                      </span>
                      <span className="font-mono text-gray-600 truncate text-xs">{file.path}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Commit message */}
          {files.length > 0 && stage !== 'done' && (
            <div>
              <label htmlFor="commit-msg" className="block text-sm font-medium text-gray-700 mb-1.5">
                Mensaje de commit
              </label>
              <textarea
                id="commit-msg"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Ej: feat: add new feature..."
                rows={2}
                disabled={stage === 'deploying'}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 resize-none"
              />
            </div>
          )}

          {/* Progress steps */}
          {stage !== 'idle' && (
            <div className="flex items-center justify-center gap-2 py-2">
              {steps.map((step, i) => {
                const stepNum = i + 1
                const isDone = stage === 'done' || currentStep > stepNum
                const isActive = stage === 'deploying' && currentStep === stepNum
                const isFailed = stage === 'error' && currentStep === stepNum

                return (
                  <div key={i} className="flex items-center gap-2">
                    {i > 0 && (
                      <div className={`w-6 h-0.5 ${isDone ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                    )}
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                        isDone ? 'bg-emerald-100 text-emerald-600' :
                        isActive ? 'bg-indigo-100 text-indigo-600' :
                        isFailed ? 'bg-red-100 text-red-600' :
                        'bg-gray-100 text-gray-400'
                      }`}>
                        {isDone ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : isActive ? (
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : isFailed ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        ) : (
                          stepNum
                        )}
                      </div>
                      <span className="text-[10px] text-gray-500">{step.label}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Success message */}
          {stage === 'done' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
              <p className="text-sm font-medium text-emerald-700">
                Deploy iniciado correctamente
              </p>
              <p className="text-xs text-emerald-600 mt-1">
                El webhook de GitHub disparara el build automaticamente
              </p>
            </div>
          )}

          {/* Error message */}
          {error && stage === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 p-6 pt-4 border-t border-gray-100">
          {stage !== 'done' && (
            <button
              onClick={onClose}
              disabled={stage === 'deploying'}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
          )}
          {stage !== 'done' && files.length > 0 && (
            <button
              onClick={handleDeploy}
              disabled={!message.trim() || stage === 'deploying'}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {stage === 'deploying' ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Desplegando...
                </>
              ) : (
                <>
                  <RocketIconLarge className="w-4 h-4" />
                  Deploy
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function RocketIconLarge({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.63 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.841m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
    </svg>
  )
}
