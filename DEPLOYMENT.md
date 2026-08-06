# Guía de despliegue (plan gratis: Vercel + Neon + Gemini)

Despliegue del proyecto **paqueteria** (cliente React + servidor NestJS) usando únicamente planes gratuitos:

- **Frontend:** paqueteria-client (React + Vite) → Vercel
- **Backend:** paqueteria-server (NestJS, serverless) → Vercel
- **Base de datos:** PostgreSQL → Neon (free tier)
- **IA (extracción de Excel):** Google Gemini → API Key gratuita

## 0. Prerrequisitos

- Cuentas: [Vercel](https://vercel.com), [Neon](https://neon.tech), [GitHub](https://github.com)
- Repos ya conectados a GitHub:
  - `osmelmr/paqueteria-server`
  - `osmelmr/paqueteria-client`
- Los cambios deben estar commiteados y pusheados (ver sección 1)

## 1. Commits y push

```bash
# Servidor
cd paqueteria-server
git add -A
git commit -m "fix: ronda 2 de seguridad y correcciones, preparación para deploy"
git push origin main

# Cliente
cd paqueteria-client
git add -A
git commit -m "fix: tokens en memoria, rutas y preparación para deploy"
git push origin main
```

## 2. Base de datos en Neon

1. Entra en https://neon.tech → crea un proyecto nuevo (free tier).
2. Copia la connection string del branch principal. Debe incluir `sslmode=require`:
   ```
   postgresql://usuario:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```
3. Opcional pero recomendado para Vercel: usa la **pooled connection string** (con `-pooler` en el host), porque el servidor es serverless.

## 3. Migraciones y seed contra Neon

Ejecuta desde tu máquina (no hace falta tocar la BD local):

```bash
cd paqueteria-server

# 1) Aplicar migraciones
$env:DATABASE_URL="postgresql://usuario:password@ep-xxx...?sslmode=require"
npx prisma migrate deploy

# 2) Sembrar datos demo (admin + statuses + locations + municipios + paquetes)
$env:ADMIN_PASSWORD="tu-contrasena-admin"
node prisma/seed.mjs
```

> `ADMIN_PASSWORD` define la contraseña del usuario `admin`. Si no se define, el seed genera una aleatoria y la imprime en consola.

## 4. Desplegar el backend en Vercel

1. Vercel → **Add New Project** → importa `osmelmr/paqueteria-server`.
2. Framework Preset: **Other** (la config está en `vercel.json`).
3. En **Environment Variables** agrega:

   | Variable | Valor |
   |---|---|
   | `DATABASE_URL` | connection string de Neon (con `?sslmode=require`) |
   | `JWT_SECRET` | el secreto de `.env` local (≥ 32 caracteres) |
   | `GEMINI_API_KEY` | la API key de Gemini (ver sección 6) |
   | `CORS_ORIGIN` | `https://paqueteria-client.vercel.app` (opcional: el cliente ya consume vía proxy same-origin; se mantiene por compatibilidad con llamadas directas) |
   | `ADMIN_PASSWORD` | la misma usada en el seed (solo si vas a re-sembrar) |

4. Deploy. La URL quedará parecida a `https://paqueteria-server.vercel.app`.

> Notas:
> - `vercel.json` ya configura el handler serverless (`dist/src/serverless.js`) con `maxDuration: 60`.
> - El build ejecuta `postinstall` → `prisma generate` automáticamente.
> - La app responde bajo `/api/v1` (ej: `https://paqueteria-server.vercel.app/api/v1/statuses`).

## 5. Desplegar el frontend en Vercel

1. Vercel → **Add New Project** → importa `osmelmr/paqueteria-client`.
2. Framework Preset: **Vite** (build `pnpm build`, output `dist`).
3. **No definas `VITE_API_URL`**: el `vercel.json` del cliente proxya `/api/v1/*` hacia
   `https://paqueteria-server.vercel.app`, de modo que todo es same-origin
   (las cookies `httpOnly` funcionan con `SameSite=Lax` y no hay CORS).

4. Deploy. La URL quedará parecida a `https://paqueteria-client.vercel.app`.

> `vercel.json` del cliente:
> - Proxya `/api/v1/*` → `https://paqueteria-server.vercel.app/api/v1/*`
> - Añade un rewrite SPA: recargar rutas como `/packages` o `/login` no devuelve 404.

## 6. API key de Gemini

1. Entra en https://aistudio.google.com/apikey → crea una API key.
2. **Importante:** si la key anterior se compartió/expuso, genera una nueva (la actual en el repo quedó expuesta en su momento).
3. Pégala como `GEMINI_API_KEY` en Vercel (backend) y actualiza la del `.env` local si quieres probar en local.

## 7. Checklist post-despliegue

- [ ] `GET https://paqueteria-server.vercel.app/api/v1/statuses` responde 401 sin token (API viva)
- [ ] Login en `https://paqueteria-client.vercel.app` con `admin` / `ADMIN_PASSWORD`
- [ ] Recargar la página: la sesión se restaura vía cookie httpOnly (`/auth/refresh`)
- [ ] Dashboard: estadísticas muestran datos del seed
- [ ] Extracción de Excel con IA: subir un archivo y ver el resultado
- [ ] Editar paquete: HBL duplicado → 400; historial registra cambios de estado
- [ ] Logout y volver a entrar

## 8. Límites del plan gratis (cosas a tener en cuenta)

- **Vercel:** 60s por función. Extraer Exceles muy grandes con IA puede agotar el tiempo (para demo está bien).
- **Vercel:** cold starts de 1-3s en la primera petición tras inactividad.
- **Neon:** 0.5 GB de almacenamiento y cómputo limitado por mes.
- **Gemini:** cuota gratuita de peticiones/min y día. El backend ya limita login (10/min), refresh (30/min) y el total (120/min).

## 9. Actualizar después de un cambio

```bash
# En ambos repos
git add -A && git commit -m "mensaje" && git push origin main
```

Vercel redeplega automáticamente con cada push.
