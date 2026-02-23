# Deploy AppEventosSegopi - Docker Swarm + Portainer

## Arquitectura

```
                    INTERNET
                       |
                [NPM - red_global]
                       |
            +----------+----------+
            |          |          |
     eventos-app  eventos-kong  eventos-studio
     (Next.js)    (API Gateway)  (Dashboard)
            |          |          |
            +--- eventos_internal ---+
                       |
         +------+------+------+------+------+
         |      |      |      |      |      |
       db    auth    rest  realtime storage meta
                                      |
                                   imgproxy
```

## Configuracion NPM (Nginx Proxy Manager)

Crear 3 Proxy Hosts en NPM:

### 1. eventos.segopi.es (App Next.js)

| Campo | Valor |
|-------|-------|
| Domain | eventos.segopi.es |
| Scheme | http |
| Forward Hostname | eventos-app |
| Forward Port | 3000 |
| SSL | Let's Encrypt, Force SSL |
| WebSocket | No |

### 2. supabase-api.segopi.es (API Gateway) - WEBSOCKET REQUIRED

| Campo | Valor |
|-------|-------|
| Domain | supabase-api.segopi.es |
| Scheme | http |
| Forward Hostname | eventos-kong |
| Forward Port | 8000 |
| SSL | Let's Encrypt, Force SSL |
| **WebSocket** | **Si (activar toggle)** |

**Advanced tab** - agregar:
```nginx
proxy_read_timeout 86400s;
proxy_send_timeout 86400s;
```

### 3. supabase.segopi.es (Studio Dashboard)

| Campo | Valor |
|-------|-------|
| Domain | supabase.segopi.es |
| Scheme | http |
| Forward Hostname | eventos-studio |
| Forward Port | 3000 |
| SSL | Let's Encrypt, Force SSL |
| WebSocket | No |

---

## Pasos de Deploy

### 1. Generar secrets

```bash
# Generar password de PostgreSQL
openssl rand -base64 32

# Generar JWT secret (min 32 chars)
openssl rand -base64 32

# Generar SECRET_KEY_BASE para Realtime
openssl rand -base64 48

# Generar ANON_KEY y SERVICE_ROLE_KEY
# Ir a: https://supabase.com/docs/guides/self-hosting/docker#generate-api-keys
# Usar el JWT_SECRET generado arriba
# ANON_KEY payload: {"role":"anon","iss":"supabase","iat":1735689600,"exp":2209032000}
# SERVICE_ROLE_KEY payload: {"role":"service_role","iss":"supabase","iat":1735689600,"exp":2209032000}
```

### 2. Editar .env

Reemplazar todos los `<GENERAR-*>` en `deploy/.env` con los valores generados.

### 3. Crear Docker config para Kong

```bash
docker config create eventos_kong_config deploy/volumes/api/kong.yml
```

### 4. Build imagen Next.js

```bash
cd /path/to/AppEventosSegopi

docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://supabase-api.segopi.es \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu-ANON_KEY> \
  --build-arg NEXT_PUBLIC_SITE_URL=https://eventos.segopi.es \
  -t eventos-app:latest .
```

### 5. Deploy stack

```bash
cd deploy
docker stack deploy -c docker-compose.yml --with-registry-auth eventos
```

O desde Portainer: Stacks > Add Stack > Upload docker-compose.yml + .env

### 6. Verificar que la BD arranca

```bash
# Esperar ~30 segundos y verificar
docker service logs eventos_eventos-db
```

### 7. Aplicar migraciones SQL

```bash
# Obtener el container ID de la DB
DB_CONTAINER=$(docker ps -q -f name=eventos_eventos-db)

# Aplicar migraciones en orden
docker exec -i $DB_CONTAINER psql -U supabase_admin -d postgres < ../supabase/migrations/001_create_events_schema.sql
docker exec -i $DB_CONTAINER psql -U supabase_admin -d postgres < ../supabase/migrations/002_fix_rls_recursion.sql
docker exec -i $DB_CONTAINER psql -U supabase_admin -d postgres < ../supabase/migrations/003_add_qr_token.sql
docker exec -i $DB_CONTAINER psql -U supabase_admin -d postgres < ../supabase/migrations/005_add_venue_image.sql
```

### 8. Configurar NPM

Crear los 3 proxy hosts como se indica arriba.

### 9. Verificar

- https://eventos.segopi.es - App Next.js
- https://supabase-api.segopi.es - API (deberia responder JSON)
- https://supabase.segopi.es - Studio Dashboard

---

## Servicios y puertos internos (NO expuestos)

| Servicio | Puerto interno | Protocolo | Red |
|----------|---------------|-----------|-----|
| eventos-db | 5432 | TCP | eventos_internal |
| eventos-auth | 9999 | HTTP | eventos_internal |
| eventos-rest | 3000 | HTTP | eventos_internal |
| eventos-realtime | 4000 | HTTP/WS | eventos_internal |
| eventos-storage | 5000 | HTTP | eventos_internal |
| eventos-imgproxy | 8080 | HTTP | eventos_internal |
| eventos-meta | 8080 | HTTP | eventos_internal |
| eventos-kong | 8000 | HTTP/WS | eventos_internal + red_global |
| eventos-studio | 3000 | HTTP | eventos_internal + red_global |
| eventos-app | 3000 | HTTP | eventos_internal + red_global |

Ningun puerto esta expuesto al host. NPM accede via red_global por nombre de servicio.

---

## Migracion desde Supabase Cloud

Si necesitas migrar datos existentes desde Supabase Cloud:

```bash
# 1. Export datos del cloud
pg_dump --data-only --no-owner \
  -h db.miymyomckhazcrdvgfqa.supabase.co \
  -U postgres -d postgres > data_dump.sql

# 2. Import en self-hosted (despues de aplicar migraciones)
docker exec -i $DB_CONTAINER psql -U supabase_admin -d postgres < data_dump.sql

# 3. Migrar usuarios de auth
# Los usuarios estan en auth.users con passwords bcrypt, se transfieren directamente
```
