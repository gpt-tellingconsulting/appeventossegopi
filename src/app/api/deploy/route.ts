import { NextRequest, NextResponse } from 'next/server'
import { execSync } from 'child_process'

function isDev(): boolean {
  return process.env.NODE_ENV !== 'production'
}

export async function GET() {
  if (!isDev()) {
    return NextResponse.json({ error: 'No disponible en produccion' }, { status: 403 })
  }

  try {
    const cwd = process.cwd()
    const opts = { cwd, encoding: 'utf-8' as const, timeout: 10000 }

    const status = execSync('git status --porcelain', opts)
    const branch = execSync('git branch --show-current', opts).trim()

    const files = status
      .split('\n')
      .filter(Boolean)
      .map(line => ({
        status: line.substring(0, 2).trim(),
        path: line.substring(3),
      }))

    return NextResponse.json({
      branch,
      files,
      hasChanges: files.length > 0,
    })
  } catch (error) {
    console.error('Deploy GET error:', error)
    return NextResponse.json(
      { error: 'Error al obtener estado de git' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  if (!isDev()) {
    return NextResponse.json({ error: 'No disponible en produccion' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { message } = body

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Mensaje de commit requerido' },
        { status: 400 }
      )
    }

    const cwd = process.cwd()
    const opts = { cwd, encoding: 'utf-8' as const, timeout: 30000 }

    // Stage 1: git add all
    execSync('git add -A', opts)

    // Stage 2: git commit
    const safeMessage = message.trim().replace(/"/g, '\\"')
    execSync(`git commit -m "${safeMessage}"`, opts)

    // Stage 3: git push to deploy remote
    execSync('git push gpt-telling main', { ...opts, timeout: 60000 })

    // Stage 4: trigger N8N deploy webhook directly (GitHub webhook has DNS issues)
    try {
      await fetch('https://n8n.segopi.es/webhook/deploy-eventos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ref: 'refs/heads/main' }),
      })
    } catch {
      // Non-blocking: deploy continues even if N8N trigger fails
    }

    return NextResponse.json({
      success: true,
      message: 'Commit + push completado. Pipeline de deploy disparado.',
    })
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Error desconocido'
    console.error('Deploy POST error:', errMsg)

    if (errMsg.includes('nothing to commit')) {
      return NextResponse.json(
        { error: 'No hay cambios para commitear' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: `Error en deploy: ${errMsg.split('\n')[0]}` },
      { status: 500 }
    )
  }
}
