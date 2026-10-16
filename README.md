# SoftTech Solutions — Sistema de Gestión de Información

Aplicación fullstack desarrollada con React + Vite, Node.js + Express y MySQL.

## Módulos

- Inicio de sesión y gestión de usuarios.
- Clientes: CRUD con validación básica.
- Proveedores: CRUD y relación opcional con productos.
- Productos: CRUD de precios, existencias, categoría y proveedor.
- Empleados y vendedores: CRUD; las facturas se asocian a un empleado.
- Servicios: CRUD de servicios facturables.
- Facturas: selección de cliente, vendedor y varios productos/servicios; calcula subtotales y total y actualiza existencias en una transacción.
- Pagos: CRUD relacionado con una factura.
- Se conservan las secciones originales de información, reportes y configuración.

## Requisitos

- Node.js LTS y npm.
- MySQL 8 o compatible.

## Preparación de la base de datos

1. Abre MySQL Workbench.
2. Crea la base de datos `softtech_solutions` si todavía no existe.
3. Importa `softtech_solutions.sql` en esa base de datos. **El archivo SQL contiene instrucciones `DROP TABLE`; no lo vuelvas a importar sobre una base que tenga información que quieras conservar.**
4. Al iniciar el backend, el sistema crea la tabla `proveedor` y añade a `producto` las columnas `id_proveedor` y `categoria` cuando falten.

## Configurar el backend

1. Entra en `backend`.
2. Copia `.env.example` y ponle el nombre `.env`.
3. Edita `.env` con las credenciales locales de MySQL. No compartas el `.env` ni lo subas a GitHub.
4. En una terminal dentro de `backend`, ejecuta:

```bash
npm install
npm run dev
```

La API estará en `http://localhost:3000`.

## Configurar el frontend

Abre otra terminal, entra en `frontend` y ejecuta:

```bash
npm install
npm run dev
```

Abre la dirección que Vite muestre en la terminal, normalmente `http://localhost:5173`.

Mantén ambas terminales abiertas mientras utilizas la aplicación.

## Endpoints comerciales principales

- `GET/POST /api/proveedores`, `PUT/DELETE /api/proveedores/:id`
- `GET/POST /api/clientes`, `PUT/DELETE /api/clientes/:id`
- `GET/POST /api/productos`, `PUT/DELETE /api/productos/:id`
- `GET/POST /api/empleados`, `PUT/DELETE /api/empleados/:id`
- `GET/POST /api/servicios`, `PUT/DELETE /api/servicios/:id`
- `GET/POST /api/pagos`, `PUT/DELETE /api/pagos/:id`
- `GET /api/facturas`, `GET /api/facturas/:id`, `POST /api/facturas`, `DELETE /api/facturas/:id`

## Seguridad y alcance

- Las credenciales se configuran mediante variables de entorno.
- No incluyas archivos `.env`, `node_modules` ni contraseñas en el repositorio.
- Esta versión es un proyecto académico local. Antes de publicarlo en producción, añade autenticación/autorización obligatoria en cada ruta de API, protección CSRF cuando corresponda, auditoría y pruebas de integración.
- Para facturas se permite eliminar una factura; al hacerlo se eliminan sus detalles/pagos y se restauran las existencias de productos. Evalúa las reglas de negocio antes de usarlo con información real.


## Organización del frontend

El frontend quedó dividido en componentes y pantallas para facilitar su mantenimiento:

- `src/App.jsx`: entrada principal y control de la pantalla de autenticación.
- `src/pages/Login.jsx` y `src/pages/Registro.jsx`: inicio de sesión y registro.
- `src/pages/Dashboard.jsx`: navegación y estructura del panel.
- `src/pages/GestionUsuarios.jsx`: gestión de usuarios.
- `src/pages/GestionInformacion.jsx`: gestión de información.
- `src/pages/GestionReportes.jsx`: reportes.
- `src/pages/Configuracion.jsx`: preferencias y configuración.
- `src/components/AuthComponents.jsx`: iconos SVG reutilizables para autenticación.
- `src/utils/softtechUtils.js`: traducciones, preferencias, tema, fechas y notificaciones.
- `src/ModulosComerciales.jsx`: módulos comerciales existentes.

Se conservaron `App.css`, `index.css`, `ModulosComerciales.css`, los recursos públicos y el backend. Se quitó la entrada duplicada de Configuración del menú empresarial; la entrada original del menú principal permanece.

### Instalación local

No se incluyen `node_modules` ni el archivo real `.env`. En cada carpeta instala las dependencias con `npm install`. En el backend, copia `.env.example` a `.env` y completa las credenciales de tu MySQL local.
