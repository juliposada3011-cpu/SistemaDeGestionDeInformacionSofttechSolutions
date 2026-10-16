# SoftTech Solutions — Sistema de Gestión de Información

Aplicación fullstack para la gestión de información empresarial, desarrollada con React, Vite, Node.js, Express y MySQL.

## Tabla de contenido

- [Descripción del proyecto](#descripción-del-proyecto)
- [Módulos del sistema](#módulos-del-sistema)
- [Tecnologías utilizadas](#tecnologías-utilizadas)
- [Requisitos previos](#requisitos-previos)
- [Instalación y configuración](#instalación-y-configuración)
- [Endpoints de la API](#endpoints-de-la-api)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Seguridad y consideraciones](#seguridad-y-consideraciones)
- [Solución de problemas](#solución-de-problemas)

## Descripción del proyecto

SoftTech Solutions es una aplicación web que permite administrar información empresarial mediante módulos de usuarios, clientes, proveedores, productos, empleados, servicios, facturas y pagos.

El proyecto separa el frontend y el backend para facilitar el mantenimiento, la organización del código y la evolución de sus funcionalidades.

Esta versión está orientada al desarrollo y uso local.

## Módulos del sistema

- **Autenticación y usuarios:** inicio de sesión, registro y gestión de usuarios.
- **Clientes:** operaciones CRUD y validación básica de datos.
- **Proveedores:** gestión de proveedores y relación opcional con productos.
- **Productos:** administración de precios, existencias, categorías y proveedores.
- **Empleados y vendedores:** gestión de empleados y asociación de facturas con el empleado correspondiente.
- **Servicios:** administración de servicios facturables.
- **Facturas:** selección de clientes, vendedores, productos y servicios; cálculo de subtotales y total.
- **Pagos:** gestión de pagos asociados a facturas.
- **Información:** consulta y gestión de información del sistema.
- **Reportes:** acceso a las funcionalidades de reportes implementadas.
- **Configuración:** acceso a las preferencias y opciones de configuración disponibles.

Las operaciones comerciales y sus reglas de negocio dependen de la implementación del backend y de la estructura de la base de datos.

## Tecnologías utilizadas

| Componente | Tecnología |
|---|---|
| Frontend | React |
| Herramienta de desarrollo frontend | Vite |
| Backend | Node.js |
| Framework de API | Express |
| Base de datos | MySQL |
| Gestor de paquetes | npm |

## Requisitos previos

Antes de iniciar el proyecto, instala y configura:

- Node.js en una versión LTS compatible con las dependencias del proyecto.
- npm.
- MySQL 8 o una versión compatible.
- MySQL Workbench, recomendado para administrar e importar la base de datos.
- Visual Studio Code u otro editor de código.

## Instalación y configuración

### 1. Obtener el proyecto

Descarga o clona el repositorio y abre la carpeta principal `SistemaDeGestionDeInformacionSoftTechSolutions` en tu editor.

La carpeta principal contiene los directorios `backend` y `frontend`, además del archivo SQL y la documentación.

### 2. Configurar la base de datos

1. Abre MySQL Workbench.
2. Crea la base de datos `softtech_solutions` si todavía no existe.
3. Importa el archivo `softtech_solutions.sql` en la base de datos correspondiente.
4. Verifica que las tablas y relaciones se hayan creado correctamente.

**Advertencia:** el archivo SQL contiene instrucciones `DROP TABLE`. Importarlo puede eliminar tablas y sus datos existentes. Antes de ejecutarlo sobre una base de datos que contenga información importante, realiza una copia de seguridad y revisa las instrucciones del archivo.

Al iniciar el backend, el sistema está diseñado para crear la tabla `proveedor` y añadir a `producto` las columnas `id_proveedor` y `categoria` cuando no existan. Este comportamiento debe corresponder al código actual del backend.

### 3. Configurar el backend

Abre una terminal en la carpeta `backend`:

```bash
cd backend
```

Instala las dependencias:

```bash
npm install
```

Copia el archivo `.env.example` y crea un archivo local llamado `.env`. Completa las variables de conexión con las credenciales de tu instalación de MySQL.

No compartas el archivo `.env` ni publiques sus credenciales.

Inicia el servidor:

```bash
npm run dev
```

Si el servidor inicia correctamente, la API estará disponible en:

`http://localhost:3000`

### 4. Configurar el frontend

Abre una segunda terminal en la carpeta principal del proyecto y ejecuta:

```bash
cd frontend
npm install
npm run dev
```

Vite mostrará la dirección local del frontend, normalmente:

`http://localhost:5173`

Abre esa dirección en el navegador.

Mantén abiertas las terminales del backend y del frontend mientras utilizas la aplicación.

### 5. Verificar el funcionamiento

Comprueba que:

- El backend se inicie sin errores.
- La conexión con MySQL funcione.
- El frontend cargue en el navegador.
- El inicio de sesión y el registro funcionen según la configuración del sistema.
- Los módulos disponibles puedan consultar y guardar información correctamente.

## Endpoints principales de la API

Las siguientes rutas corresponden a los endpoints documentados para los módulos comerciales.

| Recurso | Métodos y rutas |
|---|---|
| Proveedores | `GET/POST /api/proveedores`; `PUT/DELETE /api/proveedores/:id` |
| Clientes | `GET/POST /api/clientes`; `PUT/DELETE /api/clientes/:id` |
| Productos | `GET/POST /api/productos`; `PUT/DELETE /api/productos/:id` |
| Empleados | `GET/POST /api/empleados`; `PUT/DELETE /api/empleados/:id` |
| Servicios | `GET/POST /api/servicios`; `PUT/DELETE /api/servicios/:id` |
| Pagos | `GET/POST /api/pagos`; `PUT/DELETE /api/pagos/:id` |
| Facturas | `GET /api/facturas`; `GET /api/facturas/:id`; `POST /api/facturas`; `DELETE /api/facturas/:id` |

Los métodos y rutas anteriores deben contrastarse con las rutas realmente registradas en `backend/server.js` antes de considerar esta tabla como una especificación definitiva de la API.

## Estructura del proyecto

```text
SistemaDeGestionDeInformacionSoftTechSolutions/
├── backend/
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   ├── db.js
│   ├── server.js
│   └── ...
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   └── AuthComponents.jsx
│   │   ├── pages/
│   │   │   ├── Configuracion.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── GestionInformacion.jsx
│   │   │   ├── GestionReportes.jsx
│   │   │   ├── GestionUsuarios.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Registro.jsx
│   │   ├── utils/
│   │   │   └── softtechUtils.js
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── ModulosComerciales.css
│   │   └── ModulosComerciales.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .gitignore
├── README.md
└── softtech_solutions.sql
```

La estructura es orientativa. Los archivos adicionales y su ubicación deben coincidir con los que contiene la versión actual del repositorio.

### Organización del frontend

- `src/App.jsx`: entrada principal y control de la pantalla de autenticación.
- `src/pages/Login.jsx`: inicio de sesión.
- `src/pages/Registro.jsx`: registro.
- `src/pages/Dashboard.jsx`: estructura y navegación del panel.
- `src/pages/GestionUsuarios.jsx`: gestión de usuarios.
- `src/pages/GestionInformacion.jsx`: gestión de información.
- `src/pages/GestionReportes.jsx`: reportes.
- `src/pages/Configuracion.jsx`: configuración.
- `src/components/AuthComponents.jsx`: componentes SVG reutilizables para autenticación.
- `src/utils/softtechUtils.js`: utilidades para traducciones, preferencias, tema, fechas y notificaciones.
- `src/ModulosComerciales.jsx`: módulos comerciales.
- `src/App.css` e `src/index.css`: estilos de la aplicación.

## Seguridad y consideraciones

- No publiques archivos `.env`, contraseñas, tokens ni credenciales privadas.
- No incluyas las carpetas `node_modules` en el repositorio.
- Almacena las contraseñas de usuarios mediante un algoritmo de hash seguro; nunca en texto plano.
- Protege las rutas de la API mediante autenticación y autorización del lado del servidor.
- Valida los datos recibidos antes de procesarlos o almacenarlos.
- Utiliza consultas SQL parametrizadas para reducir el riesgo de inyección SQL.
- Configura CORS de acuerdo con los orígenes permitidos.
- Evalúa la protección CSRF cuando corresponda al mecanismo de autenticación utilizado.
- Añade pruebas de integración, registro de errores y auditoría antes de un despliegue de producción.
- Revisa las reglas de negocio para facturas, pagos y existencias antes de utilizar información real.

**Importante:** este proyecto está documentado como una aplicación académica de uso local. No debe considerarse listo para producción sin las medidas de seguridad, pruebas y validaciones correspondientes.

## Solución de problemas

### El backend no inicia

- Comprueba que estés dentro de `backend`.
- Ejecuta `npm install`.
- Verifica que `package.json` contenga el script `dev`.
- Revisa los mensajes de error que aparecen en la terminal.

### No se conecta a MySQL

- Comprueba que el servicio de MySQL esté iniciado.
- Verifica las credenciales del archivo `.env`.
- Confirma que exista la base de datos `softtech_solutions`.
- Revisa el puerto y los permisos del usuario de MySQL.

### El frontend no carga

- Comprueba que estés dentro de `frontend`.
- Ejecuta `npm install`.
- Inicia Vite con `npm run dev`.
- Abre la dirección exacta que aparece en la terminal.

### Un puerto está ocupado

Si el puerto del backend o frontend está ocupado, identifica qué proceso lo utiliza y configura un puerto alternativo compatible con el proyecto. Asegúrate de que la URL de la API del frontend coincida con el puerto real del backend.

### Faltan dependencias

Si aparecen errores de módulos no encontrados, ejecuta `npm install` en la carpeta correspondiente. El frontend y el backend tienen sus propias dependencias.

## Licencia y contribuciones

No se especifica una licencia de distribución para este proyecto. Antes de permitir su reutilización o redistribución, define la licencia correspondiente y documenta las condiciones de contribución.



**SoftTech Solutions**  
Sistema de Gestión de Información Empresarial.
