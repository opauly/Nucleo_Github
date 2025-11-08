# Núcleo - Iglesia Cristiana

Sitio web moderno para la iglesia Núcleo, construido con Next.js, React, Tailwind CSS, shadcn/ui y Supabase.

## 🚀 Tecnologías

- **Framework**: Next.js 14 (App Router)
- **UI**: React, Tailwind CSS, shadcn/ui
- **Base de datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Tipografía**: Inter + Poppins (Google Fonts)
- **Despliegue**: Vercel

## 🎨 Diseño

- **Paleta de colores**: Azul profundo, verde bosque, dorado cálido
- **Tipografía**: Inter para texto, Poppins para títulos
- **Responsive**: Mobile-first design
- **Accesibilidad**: WCAG AA compliant

## 📁 Estructura del Proyecto

```
src/
├── app/                    # App Router (Next.js 14)
│   ├── (auth)/            # Rutas de autenticación
│   │   ├── iniciar-sesion/
│   │   └── registro/
│   ├── (public)/          # Rutas públicas
│   │   ├── anuncios/
│   │   ├── eventos/
│   │   ├── equipos/
│   │   ├── quienes-somos/
│   │   └── contacto/
│   ├── admin/             # Panel de administración
│   └── globals.css        # Estilos globales
├── components/            # Componentes React
│   └── ui/               # Componentes shadcn/ui
├── lib/                  # Utilidades y configuración
│   ├── supabase/         # Configuración de Supabase
│   └── utils.ts          # Utilidades generales
└── middleware.ts         # Middleware de Next.js
```

## 🛠️ Configuración

### Prerrequisitos

- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd nucleo-web
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Editar `.env.local` con tus credenciales de Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   SITE_URL=http://localhost:3000
   ```

4. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

5. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 📋 Funcionalidades

### Páginas Principales
- **Home**: Página de bienvenida con CTAs principales
- **Quiénes Somos**: Visión, misión, valores y equipo
- **Anuncios**: Lista de anuncios con filtros y búsqueda
- **Eventos**: Calendario de eventos con registro
- **Equipos**: Ministerios y equipos de servicio
- **Contacto**: Formulario de contacto

### Autenticación
- Registro de usuarios
- Inicio de sesión
- Gestión de perfiles
- Roles: admin, editor, miembro, invitado

### Eventos
- Registro a eventos
- Control de capacidad
- Lista de espera
- Cancelación de registros

### Administración
- Panel de administración
- CRUD de anuncios, eventos, equipos
- Gestión de registros de eventos
- Estadísticas básicas

## 🗄️ Base de Datos

### Tablas Principales
- `profiles` - Perfiles de usuario
- `announcements` - Anuncios
- `events` - Eventos
- `event_registrations` - Registros de eventos
- `teams` - Equipos/Ministerios
- `contact_messages` - Mensajes de contacto

### Seguridad
- Row Level Security (RLS) habilitado
- Políticas de acceso por rol
- Validación de datos con Zod

## 🎯 Scripts Disponibles

```bash
npm run dev          # Desarrollo
npm run build        # Construcción
npm run start        # Producción
npm run lint         # Linting
npm run type-check   # Verificación de tipos
```

## 🚀 Despliegue

### Vercel (Recomendado)

1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Desplegar automáticamente

### Variables de Entorno Requeridas

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SITE_URL=
```

## 📝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🤝 Soporte

Para soporte técnico o preguntas sobre el proyecto, contacta al equipo de desarrollo.

---

**Núcleo** - Una comunidad cristiana acogedora donde encontrarás amor, esperanza y propósito.
