'use client'

import { useState, useRef, useEffect, useCallback, use } from 'react'
import Link from 'next/link'
import { BarcodeDetector as BarcodeDetectorPolyfill } from 'barcode-detector'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CheckinResultData {
  success: boolean
  alreadyCheckedIn?: boolean
  registration?: {
    id: string
    firstName: string
    lastName: string
    email: string
    company: string | null
    attendanceStatus: string
    checkedInAt: string | null
    event: { id: string; title: string; event_date: string; slug: string }
  }
  error?: string
}

type ScanState = 'idle' | 'scanning' | 'processing' | 'result'

// ---------------------------------------------------------------------------
// BarcodeDetector: use native if available, otherwise polyfill
// ---------------------------------------------------------------------------

const getBarcodeDetector = (): typeof BarcodeDetectorPolyfill => {
  if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
    return window.BarcodeDetector as unknown as typeof BarcodeDetectorPolyfill
  }
  return BarcodeDetectorPolyfill
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function extractToken(raw: string): string | null {
  try {
    // If it looks like a URL, parse the `token` query param
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      const url = new URL(raw)
      return url.searchParams.get('token')
    }
  } catch {
    // Not a URL — fall through
  }
  // Otherwise treat the whole string as the token itself
  const trimmed = raw.trim()
  return trimmed.length > 0 ? trimmed : null
}

// ---------------------------------------------------------------------------
// Result overlay component
// ---------------------------------------------------------------------------

interface ResultOverlayProps {
  result: CheckinResultData
  countdown: number
  onDismiss: () => void
}

function ResultOverlay({ result, countdown, onDismiss }: ResultOverlayProps) {
  let bgClass: string
  let borderClass: string
  let iconBg: string
  let iconColor: string
  let label: string
  let icon: React.ReactNode

  if (!result.success || result.error) {
    bgClass = 'bg-error-50'
    borderClass = 'border-error-500'
    iconBg = 'bg-error-100'
    iconColor = 'text-error-600'
    label = 'Token invalido'
    icon = (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
      </svg>
    )
  } else if (result.alreadyCheckedIn) {
    bgClass = 'bg-warning-50'
    borderClass = 'border-warning-500'
    iconBg = 'bg-warning-100'
    iconColor = 'text-warning-700'
    label = 'Ya registrado'
    icon = (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  } else {
    bgClass = 'bg-success-50'
    borderClass = 'border-success-500'
    iconBg = 'bg-success-100'
    iconColor = 'text-success-700'
    label = 'Acceso concedido'
    icon = (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    )
  }

  const reg = result.registration

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-6 animate-fade-in ${bgClass}`}
      role="alertdialog"
      aria-modal="true"
      aria-label={label}
    >
      <div className={`w-full max-w-sm bg-white rounded-3xl shadow-modal border-2 ${borderClass} p-8 text-center animate-scale-in`}>
        {/* Icon */}
        <div className={`${iconBg} ${iconColor} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5`}>
          {icon}
        </div>

        {/* Status label */}
        <p className={`text-sm font-semibold uppercase tracking-widest mb-2 ${iconColor}`}>{label}</p>

        {reg ? (
          <>
            {/* Name */}
            <h2 className="text-display-sm text-foreground leading-tight mb-1">
              {reg.firstName} {reg.lastName}
            </h2>
            {/* Company */}
            {reg.company && (
              <p className="text-foreground-secondary text-body-lg mb-4">{reg.company}</p>
            )}
            {/* Check-in time */}
            <div className="bg-background rounded-xl px-4 py-3 inline-block">
              <p className="text-xs text-foreground-muted uppercase tracking-wide mb-0.5">
                {result.alreadyCheckedIn ? 'Accedio a las' : 'Registrado a las'}
              </p>
              <p className="text-lg font-semibold text-foreground font-heading">
                {formatTime(reg.checkedInAt)}
              </p>
            </div>
          </>
        ) : (
          <p className="text-foreground-secondary text-body-lg mt-2">
            {result.error ?? 'Invitacion no valida o no encontrada'}
          </p>
        )}

        {/* Countdown dismiss */}
        <div className="mt-6 flex flex-col items-center gap-3">
          <div className="relative w-10 h-10">
            <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18" cy="18" r="15.9"
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="3"
              />
              <circle
                cx="18" cy="18" r="15.9"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${(countdown / 4) * 100} 100`}
                strokeLinecap="round"
                className={iconColor}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground-secondary">
              {countdown}
            </span>
          </div>
          <button
            onClick={onDismiss}
            className="text-sm text-foreground-muted hover:text-foreground transition-colors underline underline-offset-2"
          >
            Continuar ahora
          </button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Scanner overlay corners decoration
// ---------------------------------------------------------------------------

function ScannerOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {/* Dark vignette frame */}
      <div className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, transparent 30%, rgba(0,0,0,0.55) 100%)',
        }}
      />
      {/* Corner brackets */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-56 h-56 sm:w-72 sm:h-72">
          {/* Top-left */}
          <span className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-white rounded-tl-lg" />
          {/* Top-right */}
          <span className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-white rounded-tr-lg" />
          {/* Bottom-left */}
          <span className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-white rounded-bl-lg" />
          {/* Bottom-right */}
          <span className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-white rounded-br-lg" />
          {/* Scanning line */}
          <div className="absolute inset-x-0 top-0 h-0.5 bg-primary-400 opacity-80 animate-[scanLine_2s_ease-in-out_infinite]" />
        </div>
      </div>
      {/* Hint text */}
      <div className="absolute bottom-8 inset-x-0 text-center">
        <p className="text-white text-sm font-medium opacity-90 drop-shadow">
          Apunta la camara al codigo QR
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

interface PageProps {
  params: Promise<{ id: string }>
}

export default function CheckinPage({ params }: PageProps) {
  const { id } = use(params)

  // Event name (fetched client-side to keep page 'use client')
  const [eventTitle, setEventTitle] = useState<string>('')

  // Camera & scanning
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [cameraError, setCameraError] = useState<string | null>(null)
  const [barcodeSupported, setBarcodeSupported] = useState<boolean | null>(null)
  const [scanState, setScanState] = useState<ScanState>('idle')
  const [result, setResult] = useState<CheckinResultData | null>(null)
  const [countdown, setCountdown] = useState(4)
  const [sessionCount, setSessionCount] = useState(0)

  // Manual input
  const [manualToken, setManualToken] = useState('')
  const [manualLoading, setManualLoading] = useState(false)

  // Deduplication — avoid processing the same QR twice in quick succession
  const lastScannedRef = useRef<string | null>(null)

  // -------------------------------------------------------------------------
  // Fetch event name
  // -------------------------------------------------------------------------

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`/api/events/${id}`)
        if (res.ok) {
          const data = await res.json()
          setEventTitle(data.title ?? '')
        }
      } catch {
        // Non-critical — page still works without the title
      }
    }
    fetchEvent()
  }, [id])

  // -------------------------------------------------------------------------
  // Check BarcodeDetector support
  // -------------------------------------------------------------------------

  useEffect(() => {
    // Always supported now thanks to the polyfill
    setBarcodeSupported(true)
  }, [])

  // -------------------------------------------------------------------------
  // Check-in API call
  // -------------------------------------------------------------------------

  const performCheckin = useCallback(async (token: string) => {
    setScanState('processing')
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data: CheckinResultData = await res.json()
      if (!res.ok) {
        setResult({ success: false, error: data.error ?? 'Error desconocido' })
      } else {
        setResult(data)
        if (data.success && !data.alreadyCheckedIn) {
          setSessionCount((c) => c + 1)
        }
      }
    } catch {
      setResult({ success: false, error: 'Error de red. Comprueba la conexion.' })
    }
    setScanState('result')
  }, [])

  // -------------------------------------------------------------------------
  // Dismiss result and reset scanner
  // -------------------------------------------------------------------------

  const dismiss = useCallback(() => {
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current)
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
    setResult(null)
    setCountdown(4)
    lastScannedRef.current = null
    setScanState('scanning')
  }, [])

  // -------------------------------------------------------------------------
  // Auto-dismiss countdown after result
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (scanState !== 'result') return

    setCountdown(4)
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(countdownIntervalRef.current!)
          return 0
        }
        return c - 1
      })
    }, 1000)

    dismissTimerRef.current = setTimeout(() => {
      dismiss()
    }, 4000)

    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current)
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
    }
  }, [scanState, dismiss])

  // -------------------------------------------------------------------------
  // Scan loop (runs when scanState === 'scanning')
  // -------------------------------------------------------------------------

  const startScanLoop = useCallback(() => {
    if (!barcodeSupported || !videoRef.current || !canvasRef.current) return

    const Detector = getBarcodeDetector()
    const detector = new Detector({ formats: ['qr_code'] })
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    scanIntervalRef.current = setInterval(async () => {
      if (video.readyState < 2 || video.videoWidth === 0) return

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0)

      try {
        const codes = await detector.detect(canvas)
        if (codes.length === 0) return

        const raw = codes[0].rawValue
        const token = extractToken(raw)
        if (!token) return

        // Deduplicate
        if (lastScannedRef.current === token) return
        lastScannedRef.current = token

        // Stop scanning interval while we process
        if (scanIntervalRef.current) clearInterval(scanIntervalRef.current)

        await performCheckin(token)
      } catch {
        // BarcodeDetector may throw on some frames — ignore
      }
    }, 500)
  }, [barcodeSupported, performCheckin])

  const stopScanLoop = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
  }, [])

  // -------------------------------------------------------------------------
  // Camera start / stop
  // -------------------------------------------------------------------------

  const startCamera = useCallback(async () => {
    setCameraError(null)
    setScanState('scanning')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      startScanLoop()
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('Permission') || msg.includes('NotAllowed')) {
        setCameraError('Permiso de camara denegado. Usa la entrada manual.')
      } else if (msg.includes('NotFound')) {
        setCameraError('No se encontro camara en este dispositivo.')
      } else {
        setCameraError(`Error de camara: ${msg}`)
      }
      setScanState('idle')
    }
  }, [startScanLoop])

  const stopCamera = useCallback(() => {
    stopScanLoop()
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setScanState('idle')
    lastScannedRef.current = null
  }, [stopScanLoop])

  // Restart scan loop when scanState transitions back to 'scanning'
  useEffect(() => {
    if (scanState === 'scanning' && streamRef.current) {
      startScanLoop()
    }
    return () => {
      if (scanState !== 'scanning') {
        stopScanLoop()
      }
    }
  }, [scanState, startScanLoop, stopScanLoop])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current)
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // -------------------------------------------------------------------------
  // Manual submit
  // -------------------------------------------------------------------------

  const handleManualSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const token = extractToken(manualToken)
      if (!token) return
      setManualLoading(true)
      await performCheckin(token)
      setManualToken('')
      setManualLoading(false)
    },
    [manualToken, performCheckin]
  )

  // -------------------------------------------------------------------------
  // Derived state
  // -------------------------------------------------------------------------

  const isCameraActive = scanState === 'scanning' || scanState === 'processing'

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <>
      {/* Scanning-line keyframe (injected once) */}
      <style>{`
        @keyframes scanLine {
          0%   { top: 0; opacity: 1; }
          48%  { top: calc(100% - 2px); opacity: 1; }
          50%  { top: calc(100% - 2px); opacity: 0; }
          52%  { top: 0; opacity: 0; }
          54%  { top: 0; opacity: 1; }
          100% { top: 0; opacity: 1; }
        }
      `}</style>

      <div className="p-4 sm:p-8 min-h-screen">

        {/* ----------------------------------------------------------------- */}
        {/* Header                                                              */}
        {/* ----------------------------------------------------------------- */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-foreground-secondary mb-2">
            <Link href="/events" className="hover:text-primary-600 transition-colors">
              Eventos
            </Link>
            <span>/</span>
            {eventTitle ? (
              <Link href={`/events/${id}`} className="hover:text-primary-600 transition-colors truncate max-w-[160px] sm:max-w-xs">
                {eventTitle}
              </Link>
            ) : (
              <span className="text-foreground-muted">Cargando...</span>
            )}
            <span>/</span>
            <span className="text-foreground">Control de Acceso</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-display-sm">Control de Acceso</h1>
              {eventTitle && (
                <p className="text-foreground-secondary mt-0.5 text-body-sm truncate max-w-xs sm:max-w-none">
                  {eventTitle}
                </p>
              )}
            </div>

            {/* Session counter badge */}
            <div className="flex items-center gap-2 bg-success-50 border border-success-500 rounded-xl px-4 py-2 self-start sm:self-auto">
              <svg className="w-4 h-4 text-success-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <div className="text-left">
                <p className="text-xs text-success-700 font-semibold leading-none">{sessionCount}</p>
                <p className="text-[10px] text-success-600 leading-tight">accesos esta sesion</p>
              </div>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* Main content: camera + sidebar                                      */}
        {/* ----------------------------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

          {/* Camera panel */}
          <div className="card-elevated overflow-hidden">

            {/* Camera viewport */}
            <div className="relative bg-black w-full aspect-video">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
                aria-label="Vista de camara para escaneo QR"
              />
              {/* Hidden canvas for frame capture */}
              <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

              {/* Overlay when camera is active */}
              {isCameraActive && <ScannerOverlay />}

              {/* Processing spinner */}
              {scanState === 'processing' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 animate-fade-in">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    <p className="text-white text-sm font-medium">Verificando...</p>
                  </div>
                </div>
              )}

              {/* Placeholder when camera is off */}
              {!isCameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gray-900">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  {cameraError ? (
                    <div className="text-center px-6">
                      <p className="text-error-400 text-sm font-medium mb-1">Error de camara</p>
                      <p className="text-white/60 text-xs">{cameraError}</p>
                    </div>
                  ) : (
                    <p className="text-white/60 text-sm">Camara inactiva</p>
                  )}
                </div>
              )}
            </div>

            {/* Camera controls */}
            <div className="p-4 border-t border-border flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                {/* Status dot */}
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                  scanState === 'scanning' ? 'bg-success-500 animate-pulse' :
                  scanState === 'processing' ? 'bg-warning-500 animate-pulse' :
                  'bg-gray-300'
                }`} />
                <span className="text-sm text-foreground-secondary">
                  {scanState === 'scanning' ? 'Escaneando...' :
                   scanState === 'processing' ? 'Procesando QR...' :
                   cameraError ? 'Camara no disponible' : 'Camara detenida'}
                </span>
              </div>

              {!isCameraActive ? (
                <button
                  onClick={startCamera}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Activar camara
                </button>
              ) : (
                <button
                  onClick={stopCamera}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-xl transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Detener
                </button>
              )}
            </div>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* Right panel: info + manual input                                  */}
          {/* ---------------------------------------------------------------- */}
          <div className="flex flex-col gap-4">

            {/* BarcodeDetector not supported notice */}
            {barcodeSupported === false && (
              <div className="card-elevated p-4 border-l-4 border-warning-500 bg-warning-50">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-warning-700">Escaneo automatico no disponible</p>
                    <p className="text-xs text-warning-600 mt-0.5">
                      Tu navegador no soporta escaneo automatico. Usa Chrome o Edge, o introduce el token manualmente.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Manual input */}
            <div className="card-elevated p-5">
              <h2 className="text-display-xs mb-1">Entrada manual</h2>
              <p className="text-xs text-foreground-muted mb-4">
                Pega la URL del QR o el token directamente si la camara no funciona.
              </p>
              <form onSubmit={handleManualSubmit} className="flex flex-col gap-3">
                <label htmlFor="manual-token" className="sr-only">Token o URL del QR</label>
                <input
                  id="manual-token"
                  type="text"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  placeholder="URL del QR o token..."
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-sm transition-all font-mono"
                  autoComplete="off"
                  spellCheck={false}
                  disabled={manualLoading || scanState === 'processing'}
                  aria-label="Token o URL del QR"
                />
                <button
                  type="submit"
                  disabled={!manualToken.trim() || manualLoading || scanState === 'processing'}
                  className="w-full px-4 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {manualLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Validar acceso
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* How it works */}
            <div className="card-elevated p-5">
              <h2 className="text-sm font-semibold text-foreground mb-3">Como funciona</h2>
              <ol className="space-y-2.5">
                {[
                  { step: '1', text: 'Activa la camara y apuntala al codigo QR del asistente' },
                  { step: '2', text: 'El sistema detecta y valida el codigo automaticamente' },
                  { step: '3', text: 'Aparece una pantalla verde (valido), amarilla (ya registrado) o roja (invalido)' },
                  { step: '4', text: 'La pantalla se cierra sola a los 4 segundos para el siguiente escaneo' },
                ].map(({ step, text }) => (
                  <li key={step} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {step}
                    </span>
                    <p className="text-xs text-foreground-secondary leading-relaxed">{text}</p>
                  </li>
                ))}
              </ol>
            </div>

            {/* Back to registrations link */}
            <Link
              href={`/events/${id}/registrations`}
              className="flex items-center gap-2 text-sm text-foreground-secondary hover:text-primary-600 transition-colors p-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Ver lista de inscripciones
            </Link>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* Result overlay                                                        */}
      {/* ------------------------------------------------------------------- */}
      {scanState === 'result' && result && (
        <ResultOverlay
          result={result}
          countdown={countdown}
          onDismiss={dismiss}
        />
      )}
    </>
  )
}
