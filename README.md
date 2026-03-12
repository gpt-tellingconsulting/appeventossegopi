# AppEventosSegopi

Plataforma de gestion de eventos para Profesionales de la Pintura y la Construcción. Desarrollada para TELLING CONSULTING, S.L.

## Stack

- **Framework**: Next.js 16 + React 19 + TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Estilos**: Tailwind CSS 3.4
- **Email**: Resend
- **Validacion**: Zod

## Desarrollo

```bash
npm install
cp .env.local.example .env.local  # Configurar variables
npm run dev
```

## Produccion (Docker)

```bash
docker build -t appeventossegopi .
docker run -p 3000:3000 --env-file .env.production appeventossegopi
```

## Variables de Entorno

Ver `.env.local.example` para la lista completa.
