# 📦 Paqueteria Server

Backend del **Sistema de Control de Paquetería**, una aplicación diseñada para
informatizar el flujo completo de gestión de paquetes en una empresa cubana de
mensajería. Construido con NestJS, Prisma y PostgreSQL, integra inteligencia
artificial (Google Gemini) para interpretar guías en Excel y mantener trazabilidad
total de cada bulto, desde su anuncio hasta la entrega.

## ✨ Funcionalidades completadas

- ✅ **Autenticación segura** con JWT (access + refresh tokens) y roles (Admin, Almacenero).
- ✅ **Carga de guías por Excel** – el frontend envía el contenido parseado y el
  servidor lo procesa mediante IA para extraer datos estructurados (nombre, HBL,
  peso, provincia…).
- ✅ **Procesamiento por lotes** de cientos de filas en segundos gracias a la
  división automática y llamadas optimizadas a Gemini.
- ✅ **Manejo de múltiples HBL** por paquete físico, incluso cuando un mismo bulto
  consolida varios envíos.
- ✅ **Recepción de cargamentos** – desde un archivo Excel de escaneos (offline)
  se actualiza automáticamente el estado de los paquetes y se detectan **faltantes**
  y **huérfanos**.
- ✅ **Ciclo de vida completo** del paquete: *En guía → Recibido en almacén →
  En ruta → Entregado*. Cada cambio de estado se refleja junto con la ubicación
  física correspondiente.
- ✅ **Gestión de entidades auxiliares**: destinatarios, provincias, ubicaciones,
  estados (CRUD completo con control de acceso por roles).
- ✅ **Exportación de hojas de ruta** para choferes, filtradas por provincia y
  estado.
- ✅ **Dockerizado** – el entorno de desarrollo y producción se levanta con un solo
  comando.

## 🧱 Stack tecnológico

| Capa                | Herramientas                                      |
|---------------------|---------------------------------------------------|
| Lenguaje            | TypeScript                                        |
| Framework           | [NestJS](https://nestjs.com)                      |
| ORM                 | [Prisma](https://prisma.io)                       |
| Base de datos       | PostgreSQL                                        |
| IA                  | [Google Gemini 1.5 Flash](https://ai.google.dev)  |
| Autenticación       | JWT (jsonwebtoken, bcrypt)                        |
| Validación          | class-validator, class-transformer                |
| Contenedores        | Docker, Docker Compose                            |
| Testing             | Jest (pruebas unitarias y e2e)                    |

## 🚀 Levantar el proyecto localmente

### Requisitos previos

- Node.js ≥ 20
- Docker y Docker Compose (o PostgreSQL local)
- Una API key de [Google Gemini](https://aistudio.google.com/apikey) (gratuita)

### Con Docker (recomendado)

\`\`\`bash
git clone https://github.com/tuusuario/paqueteria-server.git
cd paqueteria-server

# Copiar variables de entorno
cp .env.example .env
# Editar .env con tu GEMINI_API_KEY y ajustes de DB

# Construir y levantar
docker compose up --build
\`\`\`

La API estará disponible en `http://localhost:3000`.

### Instalación manual

\`\`\`bash
pnpm install
npx prisma migrate dev
pnpm start:dev
\`\`\`

### Seed de datos

El proyecto incluye un seed automático con las 16 provincias de Cuba, los 6
estados del paquete y ubicaciones iniciales. Se ejecuta al correr la migración.

## 📁 Estructura del proyecto

\`\`\`
src/
├── auth/            # JWT, guards, roles (Admin / Almacenero)
├── guides/          # Endpoints y lógica para guías (upload, confirm)
├── packages/        # CRUD de paquetes, ciclo de vida y búsqueda por HBL
├── recipients/      # Gestión de destinatarios
├── provinces/       # Provincias (seed + CRUD)
├── locations/       # Ubicaciones físicas
├── statuses/        # Estados del paquete (catálogo)
├── users/           # Administración de usuarios (solo Admin)
├── prisma/          # Cliente Prisma y esquema
└── common/          # Servicios compartidos (IA mapping, parseo Excel en backend)
\`\`\`

## 🔒 Seguridad y roles

- **Almacenero**: acceso completo a la operativa (guías, paquetes, destinatarios,
  provincias, ubicaciones, estados). Puede modificar cualquier dato del negocio.
- **Admin**: todo lo anterior más la gestión de usuarios.

Cada endpoint valida el JWT y los permisos mediante guards personalizados.

## 🧠 Procesamiento inteligente de guías

1. El cliente web convierte el archivo Excel en una lista de strings (celdas
   separadas por `|`).
2. El servidor divide esa lista en lotes de 20 filas y envía cada lote a Gemini
   con un esquema JSON estricto.
3. Gemini devuelve un array de objetos con los campos extraídos (nombre, HBL,
   carnet, teléfono, dirección, peso, contenido, provincia, etc.).
4. El usuario revisa la vista previa y confirma; el sistema guarda la guía,
   crea/actualiza destinatarios, paquetes y HBLs respetando la unicidad de estos
   y el tratamiento de huérfanos.

Todo el proceso de carga y mapeo de una guía de 500 filas tarda alrededor de un
minuto, respetando los límites de la capa gratuita de Gemini.

## 📦 Recepción offline

El personal en almacén (sin conexión) escanea los códigos QR y vuelca los HBL en
un Excel. Al regresar a un punto con internet, se sube ese archivo al sistema y
el backend cruza automáticamente los códigos con las guías activas, actualizando
estados y generando informes de faltantes y huérfanos.

## 🔮 Próximos pasos

El proyecto sigue en evolución. Algunas mejoras planeadas:

- Aplicación móvil offline con sincronización.
- Notificaciones en tiempo real (WebSocket) para el seguimiento de paquetes.
- Dashboard estadístico con métricas de entregas y tiempos.

## 📄 Licencia

Este código es público **solo para evaluación profesional** (portafolio).  
No está permitido su uso comercial, modificación ni redistribución.  
Ver [LICENSE](LICENSE) para más detalles.

## 📬 Contacto

**Osmel Medero Rosales**  
Email: [osmelmr.dev@gmail.com](mailto:osmelmr.dev@gmail.com)  
Teléfono: +53 63967194

---

© 2026 Osmel Medero Rosales – Todos los derechos reservados.
