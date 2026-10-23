import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import GestionEmpresarial from "./components/GestionEmpresarial.jsx";

const NOTIFICACIONES_KEY =
  "softtech_notificaciones_reales";

const eliminarNotificacion = (id) => {
  try {
    const guardadas = JSON.parse(
      localStorage.getItem(NOTIFICACIONES_KEY) || "[]"
    );

    const restantes = Array.isArray(guardadas)
      ? guardadas.filter(
          (notificacion) =>
            notificacion.id !== id
        )
      : [];

    localStorage.setItem(
      NOTIFICACIONES_KEY,
      JSON.stringify(restantes)
    );

    window.dispatchEvent(
      new Event("softtech:nueva-notificacion")
    );
  } catch (error) {
    console.error(
      "Error al eliminar notificación:",
      error
    );
  }
};

const agregarNotificacion = (tipo, mensaje) => {
  try {
    const preferencias = JSON.parse(
      localStorage.getItem("softtech_notificaciones") || "{}"
    );

    // Si el usuario desactivó este tipo de notificación, no se crea.
    if (preferencias[tipo] === false) {
      return;
    }

    const anteriores = JSON.parse(
      localStorage.getItem(NOTIFICACIONES_KEY) || "[]"
    );

    const nuevaNotificacion = {
      id: Date.now(),
      tipo,
      mensaje,
      fecha: new Date().toISOString(),
      leida: false,
    };

    const nuevas = [
      nuevaNotificacion,
      ...anteriores,
    ].slice(0, 20);

    localStorage.setItem(
      NOTIFICACIONES_KEY,
      JSON.stringify(nuevas)
    );

    window.dispatchEvent(
      new Event("softtech:nueva-notificacion")
    );
  } catch (error) {
    console.error(
      "Error al crear notificación:",
      error
    );
  }
};

/* ================================
   APARIENCIA GLOBAL
================================ */
const SOFTTECH_THEME_STYLE_ID = "softtech-theme-styles";

const aplicarTemaVisual = (temaActual) => {
  const oscuro =
    temaActual === "oscuro" ||
    (temaActual === "sistema" &&
      window.matchMedia?.(
        "(prefers-color-scheme: dark)"
      ).matches);

  document.body.classList.toggle(
    "softtech-dark",
    oscuro
  );

  document.body.classList.toggle(
    "softtech-theme-claro",
    temaActual === "claro"
  );

  document.body.classList.toggle(
    "softtech-theme-sistema",
    temaActual === "sistema"
  );

  let style = document.getElementById(
    SOFTTECH_THEME_STYLE_ID
  );

  if (!style) {
    style = document.createElement("style");
    style.id = SOFTTECH_THEME_STYLE_ID;
    document.head.appendChild(style);
  }

  style.textContent = `
    body.softtech-dark {
      background: #202a36 !important;
      color: #e5e7eb !important;
    }

    body.softtech-dark .dashboard-main,
    body.softtech-dark .dashboard-content,
    body.softtech-dark .configuration-page,
    body.softtech-dark .users-page,
    body.softtech-dark .information-page,
    body.softtech-dark .reports-page {
      background: #202a36 !important;
      color: #e5e7eb !important;
    }

    body.softtech-dark .dashboard-content h1,
    body.softtech-dark .dashboard-content h2,
    body.softtech-dark .dashboard-content h3,
    body.softtech-dark .configuration-card h2,
    body.softtech-dark .configuration-preferences-card h2,
    body.softtech-dark .configuration-label,
    body.softtech-dark .configuration-field label,
    body.softtech-dark .configuration-preferences-card p,
    body.softtech-dark .configuration-card-title p {
      color: #f8fafc !important;
    }

    body.softtech-dark .configuration-card,
    body.softtech-dark .configuration-preferences-card,
    body.softtech-dark .users-reference-card,
    body.softtech-dark .information-table-card,
    body.softtech-dark .records-card,
    body.softtech-dark .stat-card,
    body.softtech-dark .quick-card,
    body.softtech-dark .reports-card,
    body.softtech-dark .report-card,
    body.softtech-dark .notification-dropdown {
      background: #2b3746 !important;
      border-color: #425267 !important;
      color: #e5e7eb !important;
    }

    body.softtech-dark input,
    body.softtech-dark select,
    body.softtech-dark textarea {
      background: #222d3b !important;
      color: #f8fafc !important;
      border-color: #53657a !important;
    }

    body.softtech-dark input::placeholder,
    body.softtech-dark textarea::placeholder {
      color: #94a3b8 !important;
    }

    body.softtech-dark table,
    body.softtech-dark th,
    body.softtech-dark td {
      color: #e5e7eb !important;
      border-color: #425267 !important;
    }

    body.softtech-dark thead {
      background: #263241 !important;
    }

    body.softtech-dark tbody tr:hover {
      background: #344456 !important;
    }

    body.softtech-dark .configuration-theme {
      background: #263241 !important;
      border-color: #53657a !important;
      color: #e5e7eb !important;
    }

    body.softtech-dark .configuration-theme.active {
      background: #304b6d !important;
      border-color: #2563eb !important;
      color: #78b4ff !important;
    }

    body.softtech-dark .configuration-theme strong {
      color: inherit !important;
    }

    body.softtech-dark .configuration-preferences-icon {
      background: #304b6d !important;
      color: #78b4ff !important;
    }

    body.softtech-dark .configuration-saved {
      color: #86efac !important;
    }

    .configuration-saved-text {
      color: #111827 !important;
    }

    body.softtech-dark .configuration-saved-text {
      color: #f8fafc !important;
    }

    body.softtech-dark .dropdown-title,
    body.softtech-dark .notification-item-content strong,
    body.softtech-dark .notification-clear-button {
      color: #f8fafc !important;
    }

    body.softtech-dark .notification-item {
      background: #263241 !important;
      border-color: #425267 !important;
    }

    body.softtech-dark .configuration-switch-list label span {
      color: #e5edf7 !important;
    }

    body.softtech-dark .configuration-switch-list label input:checked + i {
      background: #2f7df4 !important;
    }

    body.softtech-dark .notification-clear-button {
      background: #2b3746 !important;
    }

    body.softtech-dark .reference-table-wrapper,
    body.softtech-dark .information-table-wrapper {
      background: #2b3746 !important;
    }

    body.softtech-dark .reference-message,
    body.softtech-dark .configuration-message {
      border-color: #425267 !important;
    }

    body.softtech-dark .user-modal,
    body.softtech-dark .user-modal-header,
    body.softtech-dark .user-modal-footer {
      background: #2b3746 !important;
      color: #f8fafc !important;
      border-color: #425267 !important;
    }

    body.softtech-dark .user-modal label,
    body.softtech-dark .user-modal h2 {
      color: #f8fafc !important;
    }

    body.softtech-dark .sidebar {
      background: #0b2945 !important;
    }

    body.softtech-dark .topbar {
      background: #222d3b !important;
      border-color: #425267 !important;
    }

    body.softtech-dark .section-title,
    body.softtech-dark .records-header h2,
    body.softtech-dark .stat-info span,
    body.softtech-dark .stat-info small,
    body.softtech-dark .quick-card span {
      color: #e5e7eb !important;
    }

    body.softtech-dark .quick-card strong {
      color: #93c5fd !important;
    }

    /* Notificaciones: texto legible en modo oscuro */
    body.softtech-dark .configuration-switch-list label span {
      color: #e5edf7 !important;
    }

    body.softtech-dark .configuration-switch-list label {
      color: #e5edf7 !important;
    }

    /* Claro: blanco limpio */
    body.softtech-theme-claro {
      background: #f8fafc !important;
    }

    body.softtech-theme-claro .dashboard-main,
    body.softtech-theme-claro .dashboard-content,
    body.softtech-theme-claro .configuration-page,
    body.softtech-theme-claro .users-page,
    body.softtech-theme-claro .information-page,
    body.softtech-theme-claro .reports-page {
      background: #f8fafc !important;
    }

    /* Sistema en modo claro: gris muy suave para distinguirlo
       del tema Claro, manteniendo el estilo del sistema. */
    body.softtech-theme-sistema:not(.softtech-dark) {
      background: #eef2f7 !important;
    }

    body.softtech-theme-sistema:not(.softtech-dark) .dashboard-main,
    body.softtech-theme-sistema:not(.softtech-dark) .dashboard-content,
    body.softtech-theme-sistema:not(.softtech-dark) .configuration-page,
    body.softtech-theme-sistema:not(.softtech-dark) .users-page,
    body.softtech-theme-sistema:not(.softtech-dark) .information-page,
    body.softtech-theme-sistema:not(.softtech-dark) .reports-page {
      background: #eef2f7 !important;
    }

    .configuration-preference-row {
      min-height: 76px;
      padding: 14px 16px;
      border: 1px solid #dbe3ef;
      border-radius: 10px;
      background: #ffffff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .configuration-preference-row > div {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .configuration-preference-row strong {
      font-size: 12px;
      color: #102a43;
    }

    .configuration-preference-row span {
      font-size: 10px;
      color: #6b7280;
    }

    .configuration-preference-row select {
      min-width: 72px;
      padding: 8px 10px;
      border: 1px solid #cbd5e1;
      border-radius: 7px;
      background: #ffffff;
      color: #102a43;
    }

    .configuration-switch {
      width: 42px;
      height: 23px;
      border: 0;
      border-radius: 20px;
      background: #cbd5e1;
      padding: 3px;
      cursor: pointer;
      flex-shrink: 0;
      transition: 0.2s ease;
    }

    .configuration-switch span {
      display: block;
      width: 17px;
      height: 17px;
      border-radius: 50%;
      background: #ffffff;
      transition: 0.2s ease;
    }

    .configuration-switch.active {
      background: #1769e0;
    }

    .configuration-switch.active span {
      transform: translateX(19px);
    }

    body.softtech-dark .configuration-preference-row {
      background: #263241 !important;
      border-color: #425267 !important;
    }

    body.softtech-dark .configuration-preference-row strong {
      color: #f8fafc !important;
    }

    body.softtech-dark .configuration-preference-row span {
      color: #94a3b8 !important;
    }

    body.softtech-dark .configuration-preference-row select {
      background: #222d3b !important;
      color: #f8fafc !important;
      border-color: #53657a !important;
    }
  `;

  document.documentElement.style.colorScheme =
    oscuro ? "dark" : "light";
};

const SOFTTECH_LANGUAGE_KEY = "softtech_idioma";

const softtechTranslations = {
  "Configuración": "Settings",
  "Administra las opciones del sistema y personaliza su funcionamiento.": "Manage system options and customize its behavior.",
  "Perfil de usuario": "User profile",
  "Seguridad": "Security",
  "Notificaciones": "Notifications",
  "Apariencia": "Appearance",
  "Preferencias del sistema": "System preferences",
  "Información del perfil": "Profile information",
  "Actualiza tu información personal.": "Update your personal information.",
  "Nombre completo": "Full name",
  "Correo electrónico": "Email address",
  "Teléfono": "Phone",
  "Cargo": "Position",
  "Área": "Area",
  "Guardar cambios": "Save changes",
  "Cambiar contraseña": "Change password",
  "Mantén tu cuenta segura.": "Keep your account secure.",
  "Contraseña actual": "Current password",
  "Nueva contraseña": "New password",
  "Confirmar nueva contraseña": "Confirm new password",
  "Actualizar contraseña": "Update password",
  "Preferencias de notificaciones": "Notification preferences",
  "Selecciona los eventos sobre los que deseas recibir notificaciones.": "Select the events for which you want to receive notifications.",
  "Nuevos usuarios registrados": "New registered users",
  "Nuevos registros de información": "New information records",
  "Reportes generados": "Generated reports",
  "Actualizaciones del sistema": "System updates",
  "Apariencia del sistema": "System appearance",
  "Personaliza el aspecto visual de la aplicación.": "Customize the visual appearance of the application.",
  "Tema": "Theme",
  "Claro": "Light",
  "Oscuro": "Dark",
  "Sistema": "System",
  "Idioma": "Language",
  "Español": "Spanish",
  "Formato de fecha": "Date format",
  "Registros por página": "Records per page",
  "Define cuántos registros se muestran en las tablas.": "Choose how many records are shown in tables.",
  "Confirmar antes de eliminar": "Confirm before deleting",
  "Solicita confirmación antes de borrar registros.": "Ask for confirmation before deleting records.",
  "Actualización automática": "Automatic refresh",
  "Mantiene actualizados los datos del sistema.": "Keeps system data up to date.",
  "Guardar preferencias automáticamente": "Save preferences automatically",
  "Conserva tus opciones en este dispositivo.": "Keeps your settings on this device.",
  "✓ Preferencias actualizadas correctamente": "✓ Preferences updated successfully",
  "Inicio": "Home",
  "Gestión de Usuarios": "User Management",
  "Gestión de Información": "Information Management",
  "Reportes": "Reports",
  "Cerrar sesión": "Log out",
  "Usuarios": "Users",
  "Información": "Information",
  "Buscar": "Search",
  "Eliminar": "Delete",
  "Editar": "Edit",
  "Registrar usuario": "Register user",
  "Registrar información": "Register information",
  "Generar reporte": "Generate report",
  "Cancelar": "Cancel",
  "Guardar": "Save",
  "Estado": "Status",
  "Activo": "Active",
  "Inactivo": "Inactive",
  "Acciones": "Actions",
  "Fecha de registro": "Registration date",
  "Descripción": "Description",
  "Categoría": "Category",
  "Título": "Title",
  "Contraseña": "Password",
  "Rol": "Role",
  "Usuario": "User",
  "Administrador": "Administrator",
  "No tienes notificaciones nuevas.": "You have no new notifications.",
  "Marcar como leídas": "Mark as read",
  "Eliminar todas": "Delete all",
  "Ver notificación": "View notification",
  "Gestión Empresarial": "Business Management",
  "Proveedores": "Suppliers",
  "Clientes": "Customers",
  "Productos": "Products",
  "Empleados y vendedores": "Employees and Sales Representatives",
  "Empleados": "Employees",
  "Vendedores": "Sales Representatives",
  "Servicios": "Services",
  "Facturación": "Billing",
  "Facturas": "Invoices",
  "Pagos": "Payments",
  "Actividades": "Activities",
  "Proyectos": "Projects",
  "Administración": "Administration",
  "Gestión de Información": "Information Management",
  "Gestión de Usuarios": "User Management",
  "Bienvenido": "Welcome",
  "Bienvenido de nuevo": "Welcome back",
  "Correo": "Email",
  "Correo electrónico": "Email address",
  "Iniciar sesión": "Log in",
  "Iniciar Sesión": "Log In",
  "Registrarse": "Sign up",
  "Registro": "Registration",
  "Nombre": "First name",
  "Apellidos": "Last name",
  "Cédula": "ID number",
  "Dirección": "Address",
  "Ciudad": "City",
  "Buscar...": "Search...",
  "Filtrar": "Filter",
  "Limpiar filtros": "Clear filters",
  "Nuevo": "New",
  "Crear": "Create",
  "Actualizar": "Update",
  "Ver": "View",
  "Detalles": "Details",
  "Volver": "Back",
  "Sí": "Yes",
  "No": "No",
  "Todos": "All",
  "Seleccionar": "Select",
  "Selecciona una opción": "Select an option",
  "Cargando...": "Loading...",
  "Cargando": "Loading",
  "No hay registros": "No records found",
  "No se encontraron resultados": "No results found",
  "Sin resultados": "No results",
  "Obligatorio": "Required",
  "Opcional": "Optional",
  "Fecha": "Date",
  "Hora": "Time",
  "Total": "Total",
  "Cantidad": "Quantity",
  "Precio": "Price",
  "Valor": "Amount",
  "Observaciones": "Notes",
  "Tipo": "Type",
  "Número": "Number",
  "N.º": "No.",
  "Guardar configuración": "Save settings",
  "Preferencias": "Preferences",
  "Ayuda": "Help",
  "Soporte": "Support",
  "Dashboard": "Dashboard",
  "ADMINISTRACIÓN EMPRESARIAL": "BUSINESS ADMINISTRATION",
  "OPERACIÓN COMERCIAL": "BUSINESS OPERATION",
  "Artículos": "Items",
  "Cancelar edición": "Cancel editing",
  "Cargando registros…": "Loading records…",
  "Cliente": "Customer",
  "Completa los campos del formulario.": "Complete the form fields.",
  "Listado de": "List of",
  "Módulo no encontrado": "Module not found",
  "Impuesto (COP)": "Tax (COP)",
  "Facturas registradas": "Registered invoices",
  "Historial de operaciones guardadas": "Saved operations history",
  "Integra clientes, vendedores y productos en una sola operación.": "Integrates customers, sales representatives, and products in a single operation.",
  "Selecciona": "Select",
  "Selecciona cliente": "Select customer",
  "Selecciona factura": "Select invoice",
  "Selecciona vendedor": "Select sales representative",
  "Servicio": "Service",
  "Sin proveedor asignado": "No supplier assigned",
  "Subtotal": "Subtotal",
  "Todavía no hay facturas.": "There are no invoices yet.",
  "Saldo pendiente:": "Outstanding balance:",
  "+ Registrar Información": "+ Register Information",
  "Accesos rápidos": "Quick access",
  "Actualiza tu información personal.": "Update your personal information.",
  "Administra la información registrada en el sistema de manera organizada y segura.": "Manage the information stored in the system in an organized and secure way.",
  "Configura el comportamiento general de la aplicación.": "Configure the general behavior of the application.",
  "Consultando registros reales...": "Checking actual records...",
  "Consultar": "View",
  "Datos del informe:": "Report data:",
  "Descargar Excel (CSV)": "Download Excel (CSV)",
  "Detalle del reporte": "Report details",
  "Documentación": "Documentation",
  "En proceso": "In progress",
  "Finalizado": "Completed",
  "Finanzas": "Finance",
  "Conocimiento": "Knowledge",
  "Planeación": "Planning",
  "Políticas": "Policies",
  "Procesos": "Processes",
  "Inventario": "Inventory",
  "Operaciones": "Operations",
  "Recursos Humanos": "Human Resources",
  "Tecnología": "Technology",
  "Categorías": "Categories",
  "Cerrar": "Close",
  "Descargar": "Download",
  "Estado de los registros": "Record status",
  "Fecha de generación": "Generation date",
  "Fecha fin": "End date",
  "Fecha inicio": "Start date",
  "Generado por": "Generated by",
  "Registros de información": "Information records",
  "Registros del sistema": "System records",
  "Registros por categoría": "Records by category",
  "Tipos registrados": "Registered types",
  "Total de usuarios": "Total users",
  "Ver todos": "View all",
  "Últimos reportes generados": "Latest generated reports",
  "Últimos registros": "Latest records",
  "Tipo de registro": "Record type",
  "Registros por página": "Records per page",
  "No hay información registrada.": "No information has been registered.",
  "No hay registros para mostrar.": "There are no records to display.",
  "No hay registros para mostrar en esta categoría.": "There are no records to display in this category.",
  "No hay usuarios para mostrar": "There are no users to display",
  "No hay reportes registrados.": "No reports have been registered.",
  "No tienes notificaciones nuevas.": "You have no new notifications.",
  "Recordarme": "Remember me",
  "¿Olvidó su contraseña?": "Forgot your password?",
  "Crear una cuenta": "Create an account",
  "Inicia sesión para continuar en": "Log in to continue to",
  "Imprimir / Guardar PDF": "Print / Save PDF",
  "Ver todos ›": "View all ›",
  "✓ Preferencias guardadas automáticamente": "✓ Preferences saved automatically",
  "✓ Preferencias actualizadas correctamente": "✓ Preferences updated successfully",
  "Selecciona una categoría": "Select a category",
  "Tipo de reporte": "Report type",
  "Nombre del reporte": "Report name",
  "Nombre del reporte *": "Report name *",
  "Nombres": "First names",
  "Nombres *": "First names *",
  "Fecha de nacimiento *": "Date of birth *",
  "Fecha de registro *": "Registration date *",
  "Tipo *": "Type *",
  "Rol *": "Role *",
  "Estado *": "Status *",
  "Categoría *": "Category *",
  "Descripción *": "Description *",
  "Título *": "Title *",
  "Correo electrónico *": "Email address *",
  "Cédula *": "ID number *",
  "Apellidos *": "Last name *",
  "Nombres *": "First names *",
  "Total de registros": "Total records",
};

const softtechTranslationsReverse = Object.fromEntries(
  Object.entries(softtechTranslations).map(
    ([es, en]) => [en, es]
  )
);

const traducirValorSoftTech = (valor, idioma) => {
  if (!valor) return valor;
  const diccionario = idioma === "English"
    ? softtechTranslations
    : softtechTranslationsReverse;
  if (diccionario[valor]) return diccionario[valor];

  // Traduce fragmentos conocidos en textos dinámicos (por ejemplo, títulos
  // que incluyen el nombre de una categoría), sin alterar el resto del texto.
  let resultado = valor;
  const claves = Object.keys(diccionario).sort((a, b) => b.length - a.length);
  for (const clave of claves) {
    if (!clave || clave.length < 3 || !resultado.includes(clave)) continue;
    resultado = resultado.split(clave).join(diccionario[clave]);
  }
  return resultado;
};

const aplicarIdiomaVisual = (idioma) => {
  if (!document.body) return;

  const traducirNodo = (nodo) => {
    if (nodo.nodeType === Node.TEXT_NODE) {
      const original = nodo.nodeValue.trim();
      if (!original) return;
      const traducido = traducirValorSoftTech(
        original,
        idioma
      );
      if (traducido !== original) {
        nodo.nodeValue = nodo.nodeValue.replace(
          original,
          traducido
        );
      }
      return;
    }

    if (
      nodo.nodeType !== Node.ELEMENT_NODE ||
      ["SCRIPT", "STYLE", "NOSCRIPT"].includes(
        nodo.tagName
      )
    ) return;

    ["placeholder", "title", "aria-label"].forEach(
      (atributo) => {
        if (nodo.hasAttribute(atributo)) {
          nodo.setAttribute(
            atributo,
            traducirValorSoftTech(
              nodo.getAttribute(atributo),
              idioma
            )
          );
        }
      }
    );

    Array.from(nodo.childNodes).forEach(
      traducirNodo
    );
  };

  traducirNodo(document.body);
};

const iniciarIdiomaVisualSoftTech = (idioma) => {
  aplicarIdiomaVisual(idioma);

  if (window.__softtechLanguageObserver) {
    window.__softtechLanguageObserver.disconnect();
  }

  const observer = new MutationObserver(() => {
    observer.disconnect();

    aplicarIdiomaVisual(
      localStorage.getItem(
        SOFTTECH_LANGUAGE_KEY
      ) || "Español"
    );

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  window.__softtechLanguageObserver = observer;
};

const emitirCambioPreferencias = () => {
  window.dispatchEvent(
    new Event("softtech:preferencias-cambiadas")
  );
};

const formatearFechaSegunPreferencia = (fecha) => {
  if (!fecha) return "—";

  const texto = String(fecha).slice(0, 10);
  const partes = texto.split("-");

  if (partes.length !== 3) {
    return texto;
  }

  const [anio, mes, dia] = partes;
  const formato =
    localStorage.getItem("softtech_formato_fecha") ||
    "dd/mm/aaaa";

  if (formato === "mm/dd/aaaa") {
    return `${mes}/${dia}/${anio}`;
  }

  if (formato === "aaaa-mm-dd") {
    return `${anio}-${mes}-${dia}`;
  }

  return `${dia}/${mes}/${anio}`;
};

/* ================================
   ICONOS
================================ */
function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon">
      <circle cx="12" cy="7.5" r="3.5" />
      <path d="M4.5 20c0-4.2 3.2-7 7.5-7s7.5 2.8 7.5 7" />
    </svg>
  );
}
function UserPlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="icon"
      aria-hidden="true"
    >
      <circle cx="8.5" cy="7.5" r="4" />
      <path d="M2.5 21c0-4.3 2.7-7 6-7s6 2.7 6 7" />
      <line x1="19" y1="10" x2="19" y2="18" />
      <line x1="15" y1="14" x2="23" y2="14" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon">
      <rect x="5" y="10" width="14" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  );
}
function CardIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M7 10h10M7 14h6" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}
function EyeIcon({ visible }) {
  if (visible) {
    return (
      <svg viewBox="0 0 24 24" className="icon">
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
        <circle cx="12" cy="12" r="2.5" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="icon">
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
      <path d="M9.9 5.3A10.8 10.8 0 0 1 12 5c6.5 0 10 7 10 7a17.7 17.7 0 0 1-3.1 3.8" />
      <path d="M6.2 6.2C3.5 8.2 2 12 2 12s3.5 7 10 7c1.2 0 2.3-.2 3.3-.6" />
    </svg>
  );
}
function LoginIcon() {
  return (
    <svg viewBox="0 0 24 24" className="button-icon">
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M13 5h6v14h-6" />
    </svg>
  );
}
function RegisterIcon() {
  return (
    <svg viewBox="0 0 24 24" className="button-icon">
      <circle cx="9" cy="8" r="4" />
      <path d="M2 21c0-4 3-7 7-7" />
      <path d="M19 14v7" />
      <path d="M15.5 17.5h7" />
    </svg>
  );
}
/* ================================
   PANEL DE MARCA
================================ */
function BrandPanel() {
  return (
    <section className="brand-panel">
      <div className="decor-circle top-circle"></div>
      <div className="decor-circle bottom-circle"></div>
      <div className="brand-content">
        <div className="brand-diamond">
          <span>S</span>
        </div>
        <h1>SoftTech</h1>
        <div className="brand-solutions">
          S O L U T I O N S
        </div>
        <div className="brand-divider"></div>
        <p>Sistema de Gestión de Información</p>
      </div>
    </section>
  );
}
/* ================================
   LOGIN
================================ */
function Login({ irRegistro, iniciarSesion }) {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mostrarContrasena, setMostrarContrasena] =
    useState(false);
  const [recordarme, setRecordarme] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [mostrarRecuperacion, setMostrarRecuperacion] = useState(false);
  const [correoRecuperacion, setCorreoRecuperacion] = useState("");
  const [mensajeRecuperacion, setMensajeRecuperacion] = useState("");
  const [errorRecuperacion, setErrorRecuperacion] = useState("");
  const [cargandoRecuperacion, setCargandoRecuperacion] = useState(false);

  const solicitarRecuperacion = async (e) => {
    e.preventDefault();
    setMensajeRecuperacion("");
    setErrorRecuperacion("");
    const correo = correoRecuperacion.trim();
    if (!correo) {
      setErrorRecuperacion("Escribe el correo asociado a tu cuenta.");
      return;
    }
    try {
      setCargandoRecuperacion(true);
      const respuesta = await fetch("http://localhost:3000/api/auth/solicitar-recuperacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo }),
      });
      const datos = await respuesta.json();
      if (!respuesta.ok) throw new Error(datos.mensaje || "No fue posible solicitar la recuperación.");
      setMensajeRecuperacion(datos.mensaje || "Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña.");
    } catch (err) {
      setErrorRecuperacion(err.message || "No fue posible conectar con el servidor.");
    } finally {
      setCargandoRecuperacion(false);
    }
  };

  const manejarLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!usuario.trim() || !contrasena) {
      setError("Por favor, completa todos los campos.");
      return;
    }
    try {
      setCargando(true);
      const respuesta = await fetch(
        "http://localhost:3000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            usuario: usuario.trim(),
            contrasena,
          }),
        }
      );
      const datos = await respuesta.json();
      if (!respuesta.ok) {
        setError(
          datos.mensaje ||
            "Usuario o contraseña incorrectos"
        );
        return;
      }
      if (recordarme) {
        localStorage.setItem(
          "softtech_usuario",
          JSON.stringify(datos.usuario)
        );
      }
      iniciarSesion(datos.usuario);
    } catch (err) {
      console.error(err);
      setError(
        "No fue posible conectar con el servidor. Verifica que el backend esté funcionando."
      );
    } finally {
      setCargando(false);
    }
  };
  return (
    <main className="login-page">
      {mostrarRecuperacion && (
        <div className="recovery-overlay" style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: "rgba(15, 23, 42, 0.48)", backdropFilter: "blur(5px)" }}>
          <section className="recovery-modal" role="dialog" aria-modal="true" aria-labelledby="recovery-title" style={{ position: "relative", width: "100%", maxWidth: 440, padding: "32px 28px", borderRadius: 16, background: "#fff", boxShadow: "0 20px 60px rgba(0,0,0,.22)", textAlign: "center", color: "#1f2937" }}>
            <button type="button" aria-label="Cerrar" onClick={() => setMostrarRecuperacion(false)} style={{ position: "absolute", top: 12, right: 16, border: 0, background: "transparent", fontSize: 28, cursor: "pointer", color: "#64748b" }}>×</button>
            <div className="login-user-icon"><UserIcon /></div>
            <h2 id="recovery-title">Recuperar contraseña</h2>
            <p>Escribe el correo asociado a tu cuenta. Te enviaremos instrucciones para crear una nueva contraseña.</p>
            <form onSubmit={solicitarRecuperacion}>
              <div className="input-container">
                <UserIcon />
                <input type="email" value={correoRecuperacion} onChange={(e) => setCorreoRecuperacion(e.target.value)} placeholder="Correo electrónico" autoComplete="email" required />
              </div>
              {mensajeRecuperacion && <div className="recovery-feedback success" role="status" style={{ margin: "12px 0", color: "#15803d" }}>{mensajeRecuperacion}</div>}
              {errorRecuperacion && <div className="recovery-feedback error" role="alert" style={{ margin: "12px 0", color: "#b91c1c" }}>{errorRecuperacion}</div>}
              <button className="login-button" type="submit" disabled={cargandoRecuperacion}>{cargandoRecuperacion ? "Enviando..." : "Enviar instrucciones"}</button>
              <button className="recovery-back" type="button" onClick={() => setMostrarRecuperacion(false)} style={{ display: "block", margin: "14px auto 0", border: 0, background: "transparent", cursor: "pointer" }}>Volver a iniciar sesión</button>
            </form>
          </section>
        </div>
      )}
      <div className="login-container">
        <BrandPanel />
        <section className="form-panel">
          <div className="form-content">
            <div className="welcome-text">
              <h2>Bienvenido de nuevo</h2>
              <p>
                Inicia sesión para continuar en{" "}
                <strong>SoftTech Solutions</strong>
              </p>
            </div>
            <div className="login-user-icon">
              <UserIcon />
            </div>
            <h3>Iniciar sesión</h3>
            <div className="blue-line"></div>
            <form onSubmit={manejarLogin}>
              <div className="input-container">
                <UserIcon />
                <input
                  type="text"
                  placeholder="Usuario o correo electrónico"
                  value={usuario}
                  onChange={(e) =>
                    setUsuario(e.target.value)
                  }
                  autoComplete="username"
                />
              </div>
              <div className="input-container">
                <LockIcon />
                <input
                  type={
                    mostrarContrasena
                      ? "text"
                      : "password"
                  }
                  placeholder="Contraseña"
                  value={contrasena}
                  onChange={(e) =>
                    setContrasena(e.target.value)
                  }
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="eye-button"
                  onClick={() =>
                    setMostrarContrasena(
                      !mostrarContrasena
                    )
                  }
                >
                  <EyeIcon
                    visible={mostrarContrasena}
                  />
                </button>
              </div>
              <div className="login-options">
                <label className="remember-option">
                  <input
                    type="checkbox"
                    checked={recordarme}
                    onChange={(e) =>
                      setRecordarme(
                        e.target.checked
                      )
                    }
                  />
                  <span>Recordarme</span>
                </label>
                <button
                  type="button"
                  className="forgot-password"
                  onClick={() => {
                    setCorreoRecuperacion("");
                    setMensajeRecuperacion("");
                    setErrorRecuperacion("");
                    setMostrarRecuperacion(true);
                  }}
                >
                  ¿Olvidó su contraseña?
                </button>
              </div>
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
              <button
                type="submit"
                className="login-button"
                disabled={cargando}
              >
                <LoginIcon />
                <span>
                  {cargando
                    ? "Ingresando..."
                    : "Ingresar"}
                </span>
              </button>
            </form>
            <div className="register-separator">
              <span></span>
              <p>¿No tienes cuenta?</p>
              <span></span>
            </div>
            <button
              type="button"
              className="register-button"
              onClick={irRegistro}
            >
              <RegisterIcon />
              <span>Registrarse</span>
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
/* ================================
   REGISTRO
================================ */
function Registro({ volverLogin }) {
  const [mostrarPassword, setMostrarPassword] =
    useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] =
    useState(false);
  const [formulario, setFormulario] = useState({
    nombres: "",
    apellidos: "",
    cedula: "",
    fechaNacimiento: "",
    correo: "",
    contrasena: "",
    confirmar: "",
  });
  const actualizarCampo = (campo, valor) => {
    setFormulario({
      ...formulario,
      [campo]: valor,
    });
  };
  const manejarRegistro = async (e) => {
    e.preventDefault();
    if (
      !formulario.nombres.trim() ||
      !formulario.apellidos.trim() ||
      !formulario.cedula.trim() ||
      !formulario.fechaNacimiento ||
      !formulario.correo.trim() ||
      !formulario.contrasena ||
      !formulario.confirmar
    ) {
      alert("Por favor, completa todos los campos.");
      return;
    }
    if (
      formulario.contrasena !==
      formulario.confirmar
    ) {
      alert("Las contraseñas no coinciden.");
      return;
    }
    try {
      const respuesta = await fetch(
        "http://localhost:3000/api/auth/registro",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombre: formulario.nombres.trim(),
            apellidos:
              formulario.apellidos.trim(),
            cedula: formulario.cedula.trim(),
            fecha_nacimiento:
              formulario.fechaNacimiento,
            correo: formulario.correo.trim(),
            contrasena:
              formulario.contrasena,
          }),
        }
      );
      const datos = await respuesta.json();
      if (!respuesta.ok) {
        alert(
          datos.mensaje ||
            "No fue posible registrar el usuario."
        );
        return;
      }
      alert("¡Usuario registrado correctamente!");
      volverLogin();
    } catch (error) {
      console.error(
        "Error en el registro:",
        error
      );
      alert(
        "No fue posible conectar con el servidor. Verifica que el backend esté funcionando."
      );
    }
  };
  return (
    <main className="login-page">
      <div className="login-container registro-container">
        <BrandPanel />
        <section className="form-panel registro-panel">
          <div className="form-content registro-content">
            <div className="register-user-icon">
              <UserPlusIcon />
            </div>
            <h2 className="registro-title">
              Crear una cuenta
            </h2>
            <p className="registro-subtitle">
              Regístrate para acceder al Sistema de
              Gestión de Información
            </p>
            <form onSubmit={manejarRegistro}>
              {/* FILA 1 */}
              <div className="register-row">
                <div className="register-input">
                  <UserIcon />
                  <input
                    type="text"
                    placeholder="Nombres"
                    value={formulario.nombres}
                    onChange={(e) =>
                      actualizarCampo(
                        "nombres",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="register-input">
                  <UserIcon />
                  <input
                    type="text"
                    placeholder="Apellidos"
                    value={formulario.apellidos}
                    onChange={(e) =>
                      actualizarCampo(
                        "apellidos",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
              {/* FILA 2 */}
              <div className="register-row">
                <div className="register-input">
                  <CardIcon />
                  <input
                    type="text"
                    placeholder="Cédula"
                    value={formulario.cedula}
                    onChange={(e) =>
                      actualizarCampo(
                        "cedula",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="register-input">
                  <CalendarIcon />
                  <input
                    type="date"
                    value={
                      formulario.fechaNacimiento
                    }
                    onChange={(e) =>
                      actualizarCampo(
                        "fechaNacimiento",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
              {/* CORREO */}
              <div className="register-input full">
                <MailIcon />
                <input
                  type="email"
                  placeholder="Usuario o correo electrónico"
                  value={formulario.correo}
                  onChange={(e) =>
                    actualizarCampo(
                      "correo",
                      e.target.value
                    )
                  }
                />
              </div>
              {/* CONTRASEÑAS */}
              <div className="register-row">
                <div className="register-input">
                  <LockIcon />
                  <input
                    type={
                      mostrarPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Contraseña"
                    value={
                      formulario.contrasena
                    }
                    onChange={(e) =>
                      actualizarCampo(
                        "contrasena",
                        e.target.value
                      )
                    }
                  />
                  <button
                    type="button"
                    className="register-eye"
                    onClick={() =>
                      setMostrarPassword(
                        !mostrarPassword
                      )
                    }
                  >
                    <EyeIcon
                      visible={
                        mostrarPassword
                      }
                    />
                  </button>
                </div>
                <div className="register-input">
                  <LockIcon />
                  <input
                    type={
                      mostrarConfirmacion
                        ? "text"
                        : "password"
                    }
                    placeholder="Confirmar contraseña"
                    value={
                      formulario.confirmar
                    }
                    onChange={(e) =>
                      actualizarCampo(
                        "confirmar",
                        e.target.value
                      )
                    }
                  />
                  <button
                    type="button"
                    className="register-eye"
                    onClick={() =>
                      setMostrarConfirmacion(
                        !mostrarConfirmacion
                      )
                    }
                  >
                    <EyeIcon
                      visible={
                        mostrarConfirmacion
                      }
                    />
                  </button>
                </div>
              </div>
              {/* BOTÓN REGISTRARSE */}
              <button
                type="submit"
                className="register-submit"
              >
                <RegisterIcon />
                <span>Registrarse</span>
              </button>
            </form>
            {/* SEPARADOR */}
            <div className="login-separator">
              <span></span>
              <p>¿Ya tienes cuenta?</p>
              <span></span>
            </div>
            {/* VOLVER AL LOGIN */}
            <button
              type="button"
              className="back-login-button"
              onClick={volverLogin}
            >
              <LoginIcon />
              <span>Iniciar sesión</span>
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
/* ================================
   GESTIÓN DE USUARIOS
================================ */
function GestionUsuarios({ usuarioActual }) {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [buscar, setBuscar] = useState("");
  const [filtroRol, setFiltroRol] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modo, setModo] = useState("crear");
  const [usuarioSeleccionado, setUsuarioSeleccionado] =
    useState(null);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [pagina, setPagina] = useState(1);
  const usuariosPorPagina = Number(
    localStorage.getItem(
      "softtech_registros_por_pagina"
    ) || "10"
  );
  const formularioInicial = {
    nombre: "",
    apellidos: "",
    cedula: "",
    fecha_nacimiento: "",
    correo: "",
    contrasena: "",
    rol: "Usuario",
    estado: "Activo",
  };
  const [formulario, setFormulario] =
    useState(formularioInicial);

  /* ========================================
     CONSULTAR USUARIOS
  ======================================== */
  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      setError("");
      const respuesta = await fetch(
        "http://localhost:3000/api/usuarios"
      );
      const texto = await respuesta.text();
      let datos;
      try {
        datos = JSON.parse(texto);
      } catch {
        throw new Error(
          "El servidor no devolvió datos JSON. Verifica que el backend correcto esté ejecutándose en el puerto 3000."
        );
      }
      if (!respuesta.ok) {
        throw new Error(
          datos.mensaje ||
            "No fue posible consultar los usuarios."
        );
      }
      setUsuarios(
        Array.isArray(datos) ? datos : []
      );
    } catch (err) {
      console.error(
        "Error al consultar usuarios:",
        err
      );
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };
  useEffect(() => {
    cargarUsuarios();
  }, []);

  useEffect(() => {
    if (
      localStorage.getItem(
        "softtech_actualizacion_automatica"
      ) !== "true"
    ) {
      return;
    }

    const intervalo = setInterval(() => {
      cargarUsuarios();
    }, 30000);

    return () => clearInterval(intervalo);
  }, []);

  /* ========================================
     FILTROS
  ======================================== */
  useEffect(() => {
    setPagina(1);
  }, [buscar, filtroRol, filtroEstado]);
  const usuariosFiltrados = usuarios.filter(
    (usuario) => {
      const texto =
        buscar.trim().toLowerCase();
      const nombreCompleto =
        `${usuario.nombre || ""} ${
          usuario.apellidos || ""
        }`.toLowerCase();
      const cedula =
        String(usuario.cedula || "")
          .toLowerCase();
      const correo =
        String(usuario.correo || "")
          .toLowerCase();
      const coincideBusqueda =
        !texto ||
        nombreCompleto.includes(texto) ||
        cedula.includes(texto) ||
        correo.includes(texto);
      const coincideRol =
        !filtroRol ||
        usuario.rol === filtroRol;
      const coincideEstado =
        !filtroEstado ||
        usuario.estado === filtroEstado;
      return (
        coincideBusqueda &&
        coincideRol &&
        coincideEstado
      );
    }
  );

  /* ========================================
     PAGINACIÓN
  ======================================== */
  const totalPaginas = Math.max(
    1,
    Math.ceil(
      usuariosFiltrados.length /
        usuariosPorPagina
    )
  );
  const inicio =
    (pagina - 1) *
    usuariosPorPagina;
  const usuariosPagina =
    usuariosFiltrados.slice(
      inicio,
      inicio + usuariosPorPagina
    );

  /* ========================================
     FORMULARIO
  ======================================== */
  const actualizarCampo = (
    campo,
    valor
  ) => {
    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  };
  const abrirCrear = () => {
    setModo("crear");
    setUsuarioSeleccionado(null);
    setFormulario(formularioInicial);
    setMensaje("");
    setError("");
    setMostrarModal(true);
  };
  const abrirEditar = (usuario) => {
    setModo("editar");
    setUsuarioSeleccionado(usuario);
    setFormulario({
      nombre: usuario.nombre || "",
      apellidos: usuario.apellidos || "",
      cedula: usuario.cedula || "",
      fecha_nacimiento:
        usuario.fecha_nacimiento
          ? String(
              usuario.fecha_nacimiento
            ).slice(0, 10)
          : "",
      correo: usuario.correo || "",
      contrasena: "",
      rol: usuario.rol || "Usuario",
      estado: usuario.estado || "Activo",
    });
    setMensaje("");
    setError("");
    setMostrarModal(true);
  };
  const cerrarModal = () => {
    setMostrarModal(false);
    setUsuarioSeleccionado(null);
    setFormulario(formularioInicial);
    setMensaje("");
    setError("");
  };

  /* ========================================
     CREAR / EDITAR
  ======================================== */
  const guardarUsuario = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");
    if (
      !formulario.nombre.trim() ||
      !formulario.apellidos.trim() ||
      !formulario.cedula.trim() ||
      !formulario.fecha_nacimiento ||
      !formulario.correo.trim() ||
      (modo === "crear" &&
        !formulario.contrasena)
    ) {
      setError(
        "Completa todos los campos obligatorios."
      );
      return;
    }
    try {
      const url =
        modo === "crear"
          ? "http://localhost:3000/api/usuarios"
          : `http://localhost:3000/api/usuarios/${usuarioSeleccionado.id_usuario}`;
      const method =
        modo === "crear"
          ? "POST"
          : "PUT";
      const cuerpo = {
        nombre: formulario.nombre.trim(),
        apellidos:
          formulario.apellidos.trim(),
        cedula: formulario.cedula.trim(),
        fecha_nacimiento:
          formulario.fecha_nacimiento,
        correo: formulario.correo.trim(),
        rol: formulario.rol,
        estado: formulario.estado,
      };
      if (formulario.contrasena.trim()) {
        cuerpo.contrasena =
          formulario.contrasena;
      }
      const respuesta = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cuerpo),
      });
      const texto = await respuesta.text();
      let datos;
      try {
        datos = JSON.parse(texto);
      } catch {
        throw new Error(
          "El servidor no devolvió una respuesta JSON válida."
        );
      }
      if (!respuesta.ok) {
        throw new Error(
          datos.mensaje ||
            "No fue posible guardar el usuario."
        );
      }
      setMensaje(
  modo === "crear"
    ? "Usuario registrado correctamente."
    : "Usuario actualizado correctamente."
);

if (modo === "crear") {
  agregarNotificacion(
    "usuarios",
    "Se registró un nuevo usuario en el sistema."
  );
}
      await cargarUsuarios();
      setTimeout(() => {
        cerrarModal();
      }, 600);
    } catch (err) {
      console.error(
        "Error al guardar usuario:",
        err
      );
      setError(
        err.message ||
          "No fue posible conectar con el servidor."
      );
    }
  };

  /* ========================================
     ELIMINAR
  ======================================== */
  const eliminarUsuario = async (usuario) => {
    if (
      Number(usuario.id_usuario) ===
      Number(usuarioActual?.id_usuario)
    ) {
      setError(
        "No puedes eliminar el usuario con el que has iniciado sesión."
      );
      return;
    }
    const debeConfirmar =
      localStorage.getItem(
        "softtech_confirmar_eliminaciones"
      ) !== "false";

    if (
      debeConfirmar &&
      !window.confirm(
        `¿Deseas eliminar al usuario ${usuario.nombre} ${usuario.apellidos || ""}?`
      )
    ) {
      return;
    }

try {
  setMensaje("");
  setError("");

  const respuesta = await fetch(
    `http://localhost:3000/api/usuarios/${usuario.id_usuario}`,
    {
      method: "DELETE",
    }
  );
      const texto = await respuesta.text();
      let datos;
      try {
        datos = JSON.parse(texto);
      } catch {
        throw new Error(
          "El servidor no devolvió una respuesta JSON válida."
        );
      }
      if (!respuesta.ok) {
        throw new Error(
          datos.mensaje ||
            "No fue posible eliminar el usuario."
        );
      }
      setMensaje(
        "Usuario eliminado correctamente."
      );
      await cargarUsuarios();
    } catch (err) {
      console.error(
        "Error al eliminar usuario:",
        err
      );
      setError(
        err.message ||
          "No fue posible eliminar el usuario."
      );
    }
  };

  /* ========================================
     UTILIDADES
  ======================================== */
  const obtenerIniciales = (usuario) => {
    const nombre =
      usuario.nombre || "";
    const apellido =
      usuario.apellidos || "";
    return (
      `${nombre.charAt(0)}${apellido.charAt(0)}`
    ).toUpperCase();
  };
  const formatearFecha = (fecha) => {
    return formatearFechaSegunPreferencia(fecha);
  };
  return (
    <section className="dashboard-content users-page">

      {/* ==================================
          ENCABEZADO
      ================================== */}
      <div className="dashboard-heading users-heading">
        <h1>Gestión de Usuarios</h1>
        <p>
          Administra los usuarios registrados
          en el sistema de manera fácil y segura.
        </p>
      </div>

      {/* ==================================
          TARJETA PRINCIPAL
      ================================== */}
      <div className="users-reference-card">
        {/* CABECERA */}
        <div className="users-reference-header">
          <div>
            <h2>Usuarios</h2>
            <p>
              Registra, consulta, actualiza y
              elimina usuarios del sistema.
            </p>
          </div>
          <button
            type="button"
            className="reference-register-button"
            onClick={abrirCrear}
          >
            <span>＋</span>
            Registrar usuario
          </button>
        </div>
        {/* MENSAJES */}
        {error && (
          <div className="reference-message error">
            {error}
          </div>
        )}
        {mensaje && (
          <div className="reference-message success">
            {mensaje}
          </div>
        )}

        {/* ==================================
            FILTROS
        ================================== */}
        <div className="reference-filters">
          <div className="reference-search">
            <span>⌕</span>
            <input
              type="text"
              placeholder="Buscar usuario por nombre, correo o cédula..."
              value={buscar}
              onChange={(e) =>
                setBuscar(e.target.value)
              }
            />
          </div>
          <div className="reference-filter">
            <label>Rol</label>
            <select
              value={filtroRol}
              onChange={(e) =>
                setFiltroRol(e.target.value)
              }
            >
              <option value="">
                Todos
              </option>
              <option value="Administrador">
                Administrador
              </option>
              <option value="Usuario">
                Usuario
              </option>
            </select>
          </div>
          <div className="reference-filter">
            <label>Estado</label>
            <select
              value={filtroEstado}
              onChange={(e) =>
                setFiltroEstado(e.target.value)
              }
            >
              <option value="">
                Todos
              </option>
              <option value="Activo">
                Activo
              </option>
              <option value="Inactivo">
                Inactivo
              </option>
              <option value="Pendiente">
                Pendiente
              </option>
            </select>
          </div>
          <button
type="button"
  className="reference-filter-button"
  onClick={() => {
    setBuscar("");
    setFiltroRol("");
    setFiltroEstado("");
  }}
>
  <svg
    viewBox="0 0 24 24"
    className="filter-icon"
    aria-hidden="true"
  >
    <path d="M4 6h16L14 13v5l-4 2v-7L4 6z" />
  </svg>
  Filtrar
</button>
        </div>
        
        {/* ==================================
            TABLA
        ================================== */}
        {cargando ? (
          <div className="reference-loading">
            Cargando usuarios...
          </div>
        ) : (
          <div className="reference-table-wrapper">
            <table className="reference-users-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombres</th>
                  <th>Apellidos</th>
                  <th>Cédula</th>
                  <th>
                    Correo electrónico
                  </th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>
                    Fecha de registro
                  </th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosPagina.length > 0 ? (
                  usuariosPagina.map(
                    (usuario, index) => (
                      <tr
                        key={
                          usuario.id_usuario
                        }
                      >
                        <td>
                          {inicio + index + 1}
                        </td>
                        <td className="reference-name">
                          <span className="reference-avatar">
                            {obtenerIniciales(
                              usuario
                            )}
                          </span>
                          {usuario.nombre}
                        </td>
                        <td>
                          {usuario.apellidos ||
                            "—"}
                        </td>
                        <td>
                          {usuario.cedula ||
                            "—"}
                        </td>
                        <td>
                          {usuario.correo}
                        </td>
                        <td>
                          {usuario.rol ||
                            "Usuario"}
                        </td>
                        <td>
                          <span
                            className={`reference-status ${
                              String(
                                usuario.estado ||
                                  "Activo"
                              ).toLowerCase()
                            }`}
                          >
                            {usuario.estado ||
                              "Activo"}
                          </span>
                        </td>
                        <td>
                          {formatearFecha(
                            usuario.fecha_registro
                          )}
                        </td>
                        <td>
                          <div className="reference-actions">
                            <button
                              type="button"
                              className="reference-edit"
                              title="Editar"
                              onClick={() =>
                                abrirEditar(
                                  usuario
                                )
                              }
                            >
                              ✎
                            </button>
                          <button
                          type="button"
                          className="reference-delete"
                          title="Eliminar"
                          onClick={() =>
                            eliminarUsuario(
                              usuario
                            )
                            }
                            >
                              🗑
                              </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )
                ) : (
                  <tr>
                    <td
                      colSpan="9"
                      className="reference-empty"
                    >
                      <div>
                        <span className="reference-empty-icon">
                          ♟
                        </span>
                        <strong>
                          No hay usuarios para mostrar
                        </strong>
                        <p>
                          Registra un usuario o
                          cambia los filtros de
                          búsqueda.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {/* ==================================
            PIE DE TABLA
        ================================== */}
        <div className="reference-table-footer">
          <span>
            {usuariosFiltrados.length > 0
              ? `Mostrando ${
                  inicio + 1
                } a ${Math.min(
                  inicio +
                    usuariosPagina.length,
                  usuariosFiltrados.length
                )} de ${
                  usuariosFiltrados.length
                } usuarios`
              : "Mostrando 0 usuarios"}
          </span>
          <div className="reference-pagination">
            <button
              type="button"
              disabled={pagina === 1}
              onClick={() =>
                setPagina(
                  (actual) => actual - 1
                )
              }
            >
              ‹
            </button>
            {Array.from(
              {
                length: totalPaginas,
              },
              (_, index) => index + 1
            ).map((numero) => (
              <button
                type="button"
                key={numero}
                className={
                  pagina === numero
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setPagina(numero)
                }
              >
                {numero}
              </button>
            ))}
            <button
              type="button"
              disabled={
                pagina === totalPaginas
              }
              onClick={() =>
                setPagina(
                  (actual) => actual + 1
                )
              }
            >
              ›
            </button>
          </div>
        </div>
      </div>
      {/* ==================================
          MODAL
      ================================== */}
      {mostrarModal && (
        <div className="user-modal-overlay">
          <div className="user-modal">
            <div className="user-modal-header">
              <h2>
                {modo === "crear"
                  ? "Registrar usuario"
                  : "Editar usuario"}
              </h2>
              <button
                type="button"
                className="user-modal-close"
                onClick={cerrarModal}
              >
                ×
              </button>
            </div>
            <form
              onSubmit={guardarUsuario}
            >
              <div className="user-modal-body">
                {error && (
                  <div className="user-message error">
                    {error}
                  </div>
                )}
                <div className="user-form-grid">
                  <div className="user-form-group">
                    <label>
                      Nombres *
                    </label>
                    <input
                      type="text"
                      value={formulario.nombre}
                      onChange={(e) =>
                        actualizarCampo(
                          "nombre",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className="user-form-group">
                    <label>
                      Apellidos *
                    </label>
                    <input
                      type="text"
                      value={
                        formulario.apellidos
                      }
                      onChange={(e) =>
                        actualizarCampo(
                          "apellidos",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className="user-form-group">
                    <label>
                      Cédula *
                    </label>
                    <input
                      type="text"
                      value={formulario.cedula}
                      onChange={(e) =>
                        actualizarCampo(
                          "cedula",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className="user-form-group">
                    <label>
                      Fecha de nacimiento *
                    </label>
                    <input
                      type="date"
                      value={
                        formulario.fecha_nacimiento
                      }
                      onChange={(e) =>
                        actualizarCampo(
                          "fecha_nacimiento",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className="user-form-group full">
                    <label>
                      Correo electrónico *
                    </label>
                    <input
                      type="email"
                      value={formulario.correo}
                      onChange={(e) =>
                        actualizarCampo(
                          "correo",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className="user-form-group">
                    <label>
                      Contraseña{" "}
                      {modo === "crear"
                        ? "*"
                        : "(opcional)"}
                    </label>
                    <input
                      type="password"
                      value={
                        formulario.contrasena
                      }
                      onChange={(e) =>
                        actualizarCampo(
                          "contrasena",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className="user-form-group">
                    <label>
                      Rol *
                    </label>
                    <select
                      value={formulario.rol}
                      onChange={(e) =>
                        actualizarCampo(
                          "rol",
                          e.target.value
                        )
                      }
                    >
                      <option value="Usuario">
                        Usuario
                      </option>
                      <option value="Administrador">
                        Administrador
                      </option>
                    </select>
                  </div>
                  <div className="user-form-group">
                    <label>
                      Estado *
                    </label>
                    <select
                      value={formulario.estado}
                      onChange={(e) =>
                        actualizarCampo(
                          "estado",
                          e.target.value
                        )
                      }
                    >
                      <option value="Activo">
                        Activo
                      </option>
                      <option value="Inactivo">
                        Inactivo
                      </option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="user-modal-footer">
                <button
                  type="button"
                  className="user-cancel-button"
                  onClick={cerrarModal}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="user-save-button"
                >
                  {modo === "crear"
                    ? "Registrar usuario"
                    : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
/* ================================
   GESTIÓN DE INFORMACIÓN
================================ */
function GestionInformacion() {
  const [informacion, setInformacion] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [buscar, setBuscar] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [pagina, setPagina] = useState(1);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modo, setModo] = useState("crear");
  const [informacionSeleccionada, setInformacionSeleccionada] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const formularioInicial = {
    titulo: "",
    descripcion: "",
    categoria: "",
    fecha_registro: new Date().toISOString().slice(0, 10),
    estado: "Activo",
  };

  const [formulario, setFormulario] = useState(formularioInicial);
  const registrosPorPagina = Number(
    localStorage.getItem(
      "softtech_registros_por_pagina"
    ) || "10"
  );

  const cargarInformacion = async () => {
    try {
      setCargando(true);
      setError("");

      const respuesta = await fetch(
        "http://localhost:3000/api/informacion"
      );
      const texto = await respuesta.text();
      let datos;

      try {
        datos = JSON.parse(texto);
      } catch {
        throw new Error(
          "El servidor no devolvió datos JSON. Verifica que el backend esté funcionando en el puerto 3000."
        );
      }

      if (!respuesta.ok) {
        throw new Error(
          datos.mensaje ||
            "No fue posible consultar la información."
        );
      }

      setInformacion(Array.isArray(datos) ? datos : []);
    } catch (err) {
      console.error("Error al consultar información:", err);
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarInformacion();
  }, []);

  useEffect(() => {
    if (
      localStorage.getItem(
        "softtech_actualizacion_automatica"
      ) !== "true"
    ) {
      return;
    }

    const intervalo = setInterval(() => {
      cargarInformacion();
    }, 30000);

    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    setPagina(1);
  }, [buscar, filtroCategoria, filtroEstado]);

  const informacionFiltrada = informacion.filter((registro) => {
    const texto = buscar.trim().toLowerCase();

    const coincideBusqueda =
      !texto ||
      String(registro.titulo || "")
        .toLowerCase()
        .includes(texto) ||
      String(registro.descripcion || "")
        .toLowerCase()
        .includes(texto) ||
      String(registro.categoria || "")
        .toLowerCase()
        .includes(texto);

    const coincideCategoria =
      !filtroCategoria ||
      registro.categoria === filtroCategoria;

    const coincideEstado =
      !filtroEstado || registro.estado === filtroEstado;

    return (
      coincideBusqueda &&
      coincideCategoria &&
      coincideEstado
    );
  });

  const totalPaginas = Math.max(
    1,
    Math.ceil(
      informacionFiltrada.length / registrosPorPagina
    )
  );

  const inicio = (pagina - 1) * registrosPorPagina;

  const informacionPagina = informacionFiltrada.slice(
    inicio,
    inicio + registrosPorPagina
  );

  const actualizarCampo = (campo, valor) => {
    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  };

  const abrirCrear = () => {
    setModo("crear");
    setInformacionSeleccionada(null);
    setFormulario({
      ...formularioInicial,
      fecha_registro: new Date().toISOString().slice(0, 10),
    });
    setMensaje("");
    setError("");
    setMostrarModal(true);
  };

  const abrirEditar = (registro) => {
    setModo("editar");
    setInformacionSeleccionada(registro);
    setFormulario({
      titulo: registro.titulo || "",
      descripcion: registro.descripcion || "",
      categoria: registro.categoria || "",
      fecha_registro: registro.fecha_registro
        ? String(registro.fecha_registro).slice(0, 10)
        : "",
      estado: registro.estado || "Activo",
    });
    setMensaje("");
    setError("");
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setInformacionSeleccionada(null);
    setFormulario({
      ...formularioInicial,
      fecha_registro: new Date().toISOString().slice(0, 10),
    });
    setMensaje("");
    setError("");
  };

  const guardarInformacion = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    if (
      !formulario.titulo.trim() ||
      !formulario.descripcion.trim() ||
      !formulario.categoria.trim() ||
      !formulario.fecha_registro
    ) {
      setError("Completa todos los campos obligatorios.");
      return;
    }

    try {
      const url =
        modo === "crear"
          ? "http://localhost:3000/api/informacion"
          : `http://localhost:3000/api/informacion/${informacionSeleccionada.id_informacion}`;

      const method = modo === "crear" ? "POST" : "PUT";

      const respuesta = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titulo: formulario.titulo.trim(),
          descripcion: formulario.descripcion.trim(),
          categoria: formulario.categoria.trim(),
          fecha_registro: formulario.fecha_registro,
          estado: formulario.estado,
        }),
      });

      const texto = await respuesta.text();
      let datos;

      try {
        datos = JSON.parse(texto);
      } catch {
        throw new Error(
          "El servidor no devolvió una respuesta JSON válida."
        );
      }

      if (!respuesta.ok) {
        throw new Error(
          datos.mensaje ||
            "No fue posible guardar la información."
        );
      }

      setMensaje(
        modo === "crear"
          ? "Información registrada correctamente."
          : "Información actualizada correctamente."
      );

      if (modo === "crear") {
        agregarNotificacion(
          "informacion",
          "Se registró nueva información en el sistema."
        );
      }

      await cargarInformacion();

      setTimeout(() => {
        cerrarModal();
      }, 600);
    } catch (err) {
      console.error("Error al guardar información:", err);
      setError(
        err.message ||
          "No fue posible conectar con el servidor."
      );
    }
  };

  const eliminarInformacion = async (registro) => {
    const debeConfirmar =
      localStorage.getItem(
        "softtech_confirmar_eliminaciones"
      ) !== "false";

    if (
      debeConfirmar &&
      !window.confirm(
        `¿Deseas eliminar "${registro.titulo}"?`
      )
    ) {
      return;
    }

    try {
      setMensaje("");
      setError("");

      const respuesta = await fetch(
        `http://localhost:3000/api/informacion/${registro.id_informacion}`,
        {
          method: "DELETE",
        }
      );

      const texto = await respuesta.text();
      let datos;

      try {
        datos = JSON.parse(texto);
      } catch {
        throw new Error(
          "El servidor no devolvió una respuesta JSON válida."
        );
      }

      if (!respuesta.ok) {
        throw new Error(
          datos.mensaje ||
            "No fue posible eliminar la información."
        );
      }

      setMensaje("Información eliminada correctamente.");
      await cargarInformacion();
    } catch (err) {
      console.error("Error al eliminar información:", err);
      setError(
        err.message ||
          "No fue posible conectar con el servidor."
      );
    }
  };

  const formatearFecha = (fecha) => {
    return formatearFechaSegunPreferencia(fecha);
  };

  return (
    <section className="dashboard-content information-page">
      <div className="information-heading">
        <div>
          <h1>Gestión de Información</h1>
          <p>
            Administra la información registrada en el sistema de manera organizada y segura.
          </p>
        </div>

        <button
          type="button"
          className="information-add-button"
          onClick={abrirCrear}
        >
          + Registrar Información
        </button>
      </div>

      {error && (
        <div className="reference-message error">
          {error}
        </div>
      )}

      {mensaje && (
        <div className="reference-message success">
          {mensaje}
        </div>
      )}

      <div className="information-filters">
        <div className="information-search">
          <span className="information-search-icon">⌕</span>
          <input
            type="text"
            placeholder="Buscar por título, descripción o categoría..."
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
          />
        </div>

        <select
          className="information-filter-select"
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
        >
          <option value="">Categoría</option>
          <option value="Documentación">Documentación</option>
          <option value="Políticas">Políticas</option>
          <option value="Reportes">Reportes</option>
          <option value="Procesos">Procesos</option>
          <option value="Clientes">Clientes</option>
          <option value="Conocimiento">Conocimiento</option>
          <option value="Planeación">Planeación</option>
          <option value="Proveedores">Proveedores</option>
          <option value="Inventario">Inventario</option>
          <option value="Proyectos">Proyectos</option>
        </select>

        <select
          className="information-filter-select"
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="">Estado</option>
          <option value="Activo">Activo</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Inactivo">Inactivo</option>
        </select>

        <button
          type="button"
          className="information-filter-button"
          onClick={() => {
            setBuscar("");
            setFiltroCategoria("");
            setFiltroEstado("");
          }}
        >
          <svg
            viewBox="0 0 24 24"
            className="filter-icon"
            aria-hidden="true"
          >
            <path d="M4 6h16L14 13v5l-4 2v-7L4 6z" />
          </svg>
          <span>Filtrar</span>
        </button>
      </div>

      <div className="information-table-card">
        {cargando ? (
          <div className="reference-loading">
            Cargando información...
          </div>
        ) : (
          <div className="information-table-wrapper">
            <table className="information-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Título</th>
                  <th>Descripción</th>
                  <th>Categoría</th>
                  <th>Fecha de registro</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {informacionPagina.length > 0 ? (
                  informacionPagina.map((registro, index) => (
                    <tr key={registro.id_informacion}>
                      <td>{inicio + index + 1}</td>
                      <td>{registro.titulo}</td>
                      <td>{registro.descripcion}</td>
                      <td>{registro.categoria}</td>
                      <td>
                        {formatearFecha(registro.fecha_registro)}
                      </td>
                      <td>
                        <span
                          className={`information-status ${String(
                            registro.estado || "Activo"
                          ).toLowerCase()}`}
                        >
                          {registro.estado || "Activo"}
                        </span>
                      </td>
                      <td>
                        <div className="information-actions">
                          <button
                            type="button"
                            className="information-edit-button"
                            title="Editar"
                            onClick={() => abrirEditar(registro)}
                          >
                            ✎
                          </button>

                          <button
                            type="button"
                            className="information-delete-button"
                            title="Eliminar"
                            onClick={() =>
                              eliminarInformacion(registro)
                            }
                          >
                            <svg
                              viewBox="0 0 24 24"
                              className="delete-icon"
                              aria-hidden="true"
                            >
                              <path d="M4 7h16" />
                              <path d="M9 7V4h6v3" />
                              <path d="M6 7l1 13h10l1-13" />
                              <path d="M10 11v5" />
                              <path d="M14 11v5" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="records-empty">
                      No hay información registrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="information-footer">
          <span>
            {informacionFiltrada.length > 0
              ? `Mostrando ${inicio + 1} a ${Math.min(
                  inicio + informacionPagina.length,
                  informacionFiltrada.length
                )} de ${informacionFiltrada.length} registros`
              : "Mostrando 0 registros"}
          </span>

          <div className="information-pagination">
            <button
              type="button"
              className="information-page-button"
              disabled={pagina === 1}
              onClick={() =>
                setPagina((actual) => Math.max(1, actual - 1))
              }
            >
              ‹
            </button>

            {Array.from(
              { length: totalPaginas },
              (_, index) => index + 1
            ).map((numero) => (
              <button
                type="button"
                key={numero}
                className={`information-page-button ${
                  pagina === numero ? "active" : ""
                }`}
                onClick={() => setPagina(numero)}
              >
                {numero}
              </button>
            ))}

            <button
              type="button"
              className="information-page-button"
              disabled={pagina === totalPaginas}
              onClick={() =>
                setPagina((actual) =>
                  Math.min(totalPaginas, actual + 1)
                )
              }
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {mostrarModal && (
        <div className="user-modal-overlay">
          <div className="user-modal">
            <div className="user-modal-header">
              <h2>
                {modo === "crear"
                  ? "Registrar información"
                  : "Editar información"}
              </h2>

              <button
                type="button"
                className="user-modal-close"
                onClick={cerrarModal}
              >
                ×
              </button>
            </div>

            <form onSubmit={guardarInformacion}>
              <div className="user-modal-body">
                {error && (
                  <div className="user-message error">
                    {error}
                  </div>
                )}

                {mensaje && (
                  <div className="user-message success">
                    {mensaje}
                  </div>
                )}

                <div className="user-form-grid">
                  <div className="user-form-group full">
                    <label>Título *</label>
                    <input
                      type="text"
                      value={formulario.titulo}
                      onChange={(e) =>
                        actualizarCampo("titulo", e.target.value)
                      }
                    />
                  </div>

                  <div className="user-form-group full">
                    <label>Descripción *</label>
                    <input
                      type="text"
                      value={formulario.descripcion}
                      onChange={(e) =>
                        actualizarCampo(
                          "descripcion",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="user-form-group">
                    <label>Categoría *</label>
                    <select
                      value={formulario.categoria}
                      onChange={(e) =>
                        actualizarCampo(
                          "categoria",
                          e.target.value
                        )
                      }
                    >
                      <option value="">
                        Selecciona una categoría
                      </option>
                      <option value="Documentación">
                        Documentación
                      </option>
                      <option value="Políticas">
                        Políticas
                      </option>
                      <option value="Reportes">
                        Reportes
                      </option>
                      <option value="Procesos">Procesos</option>
                      <option value="Clientes">Clientes</option>
                      <option value="Conocimiento">
                        Conocimiento
                      </option>
                      <option value="Planeación">
                        Planeación
                      </option>
                      <option value="Proveedores">
                        Proveedores
                      </option>
                      <option value="Inventario">
                        Inventario
                      </option>
                      <option value="Proyectos">
                        Proyectos
                      </option>
                    </select>
                  </div>

                  <div className="user-form-group">
                    <label>Fecha de registro *</label>
                    <input
                      type="date"
                      value={formulario.fecha_registro}
                      onChange={(e) =>
                        actualizarCampo(
                          "fecha_registro",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="user-form-group">
                    <label>Estado *</label>
                    <select
                      value={formulario.estado}
                      onChange={(e) =>
                        actualizarCampo("estado", e.target.value)
                      }
                    >
                      <option value="Activo">Activo</option>
                      <option value="Pendiente">Pendiente</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="user-modal-footer">
                <button
                  type="button"
                  className="user-cancel-button"
                  onClick={cerrarModal}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="user-save-button"
                >
                  {modo === "crear"
                    ? "Registrar información"
                    : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

/* ================================
   GESTIÓN DE REPORTES
================================ */
function GestionReportes({ usuarioActual }) {
  const [reportes, setReportes] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    usuarios: 0,
    informacion: 0,
    reportes: 0,
  });

  const [cargando, setCargando] = useState(false);
  const [cargandoEstadisticas, setCargandoEstadisticas] =
    useState(false);

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const [tipo, setTipo] = useState("Todos");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const [mostrarModal, setMostrarModal] =
    useState(false);

  const [mostrarDetalle, setMostrarDetalle] =
    useState(false);

  const [seleccionado, setSeleccionado] =
    useState(null);
  const [filasReporte, setFilasReporte] = useState([]);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [errorDetalle, setErrorDetalle] = useState("");

  const [formulario, setFormulario] = useState({
    nombre_reporte: "",
    tipo_reporte: "Usuarios",
    descripcion: "",
    estado: "Finalizado",
  });

  const tipos = [
    "Usuarios",
    "Información",
    "Actividades",
    "Proyectos",
    "Clientes",
  ];

  /* ================================
     CARGAR REPORTES
  ================================= */
  const cargarReportes = async () => {
    try {
      setCargando(true);
      setError("");

      const params = new URLSearchParams();

      if (tipo !== "Todos") {
        params.append("tipo", tipo);
      }

      if (fechaInicio) {
        params.append(
          "fecha_inicio",
          fechaInicio
        );
      }

      if (fechaFin) {
        params.append(
          "fecha_fin",
          fechaFin
        );
      }

      const url =
        `http://localhost:3000/api/reportes` +
        (params.toString()
          ? `?${params.toString()}`
          : "");

      const respuesta = await fetch(url);

      const texto = await respuesta.text();

      let datos;

      try {
        datos = JSON.parse(texto);
      } catch {
        throw new Error(
          "El servidor no está devolviendo JSON. Verifica que el backend esté ejecutándose y que exista /api/reportes."
        );
      }

      if (!respuesta.ok) {
        throw new Error(
          datos.mensaje ||
            "No fue posible consultar los reportes"
        );
      }

      setReportes(
        Array.isArray(datos)
          ? datos
          : []
      );
    } catch (e) {
      console.error(
        "Error al cargar reportes:",
        e
      );

      setError(
        e.message ||
          "No fue posible consultar los reportes"
      );

      setReportes([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarReportes();
  }, []);

  useEffect(() => {
    if (
      localStorage.getItem(
        "softtech_actualizacion_automatica"
      ) !== "true"
    ) {
      return;
    }

    const intervalo = setInterval(() => {
      cargarReportes();
    }, 30000);

    return () => clearInterval(intervalo);
  }, []);

  /* ================================
     CARGAR ESTADÍSTICAS
  ================================= */
  const cargarEstadisticas = async () => {
    try {
      setCargandoEstadisticas(true);

      const respuesta = await fetch(
        "http://localhost:3000/api/dashboard/estadisticas"
      );

      const texto =
        await respuesta.text();

      let datos;

      try {
        datos = JSON.parse(texto);
      } catch {
        throw new Error(
          "No fue posible leer las estadísticas del servidor."
        );
      }

      if (!respuesta.ok) {
        throw new Error(
          datos.mensaje ||
            "No fue posible cargar las estadísticas"
        );
      }

      setEstadisticas({
        usuarios:
          Number(datos.usuarios) || 0,

        informacion:
          Number(datos.informacion) || 0,

        reportes:
          Number(datos.reportes) || 0,
      });
    } catch (e) {
      console.error(
        "Error al cargar estadísticas:",
        e
      );

      setEstadisticas({
        usuarios: 0,
        informacion: 0,
        reportes: 0,
      });
    } finally {
      setCargandoEstadisticas(false);
    }
  };

  /* ================================
     CARGA INICIAL
  ================================= */
  useEffect(() => {
    cargarReportes();
    cargarEstadisticas();
  }, []);

  /* ================================
     FORMATEAR FECHA
  ================================= */
  const formatearFecha = (valor) => {
    return formatearFechaSegunPreferencia(
      valor
    );
  };

  /* ================================
     GENERAR REPORTE
  ================================= */
  const generarReporte = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setMensaje("");

      const respuesta = await fetch(
        "http://localhost:3000/api/reportes",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            ...formulario,

            id_usuario:
              usuarioActual?.id_usuario ||
              usuarioActual?.id ||
              null,
          }),
        }
      );

      const texto =
        await respuesta.text();

      let datos;

      try {
        datos = JSON.parse(texto);
      } catch {
        throw new Error(
          "El servidor no devolvió una respuesta JSON válida."
        );
      }

      if (!respuesta.ok) {
        throw new Error(
          datos.mensaje ||
            "No fue posible generar el reporte"
        );
      }

      setMostrarModal(false);

      setFormulario({
        nombre_reporte: "",
        tipo_reporte: "Usuarios",
        descripcion: "",
        estado: "Finalizado",
      });

      setMensaje(
        "Reporte generado correctamente."
      );

      agregarNotificacion(
        "reportes",
        "Se generó un nuevo reporte."
      );

      await cargarReportes();
      await cargarEstadisticas();
    } catch (e) {
      console.error(
        "Error al generar reporte:",
        e
      );

      setError(
        e.message ||
          "No fue posible generar el reporte"
      );
    }
  };

  /* ================================
     ELIMINAR REPORTE
  ================================= */
  const eliminarReporte = async (reporte) => {
    const debeConfirmar =
      localStorage.getItem(
        "softtech_confirmar_eliminaciones"
      ) !== "false";

    if (
      debeConfirmar &&
      !window.confirm(
        `¿Deseas eliminar el reporte "${reporte.nombre_reporte}"?`
      )
    ) {
      return;
    }

    try {
      setError("");
      setMensaje("");

      const respuesta = await fetch(
        `http://localhost:3000/api/reportes/${reporte.id_reporte}`,
        {
          method: "DELETE",
        }
      );

      const texto =
        await respuesta.text();

      let datos;

      try {
        datos = JSON.parse(texto);
      } catch {
        throw new Error(
          "El servidor no devolvió una respuesta JSON válida."
        );
      }

      if (!respuesta.ok) {
        throw new Error(
          datos.mensaje ||
            "No fue posible eliminar el reporte"
        );
      }

      setMensaje(
        "Reporte eliminado correctamente."
      );

      await cargarReportes();
      await cargarEstadisticas();
    } catch (e) {
      console.error(
        "Error al eliminar reporte:",
        e
      );

      setError(
        e.message ||
          "No fue posible eliminar el reporte"
      );
    }
  };

  /* ================================
     CONSULTAR DATOS REALES DEL REPORTE
  ================================= */
  const consultarReporte = async (reporte) => {
    setSeleccionado(reporte);
    setMostrarDetalle(true);
    setCargandoDetalle(true);
    setErrorDetalle("");
    setFilasReporte([]);

    const rutas = {
      "Usuarios": "/api/usuarios",
      "Información": "/api/informacion",
      "Clientes": "/api/clientes",
      "Productos": "/api/productos",
      "Pagos": "/api/pagos",
      "Facturas": "/api/facturas",
      "Proveedores": "/api/proveedores",
      "Empleados": "/api/empleados",
      "Servicios": "/api/servicios",
      "Actividades": "/api/actividades",
      "Proyectos": "/api/proyectos",
    };

    const ruta = rutas[reporte.tipo_reporte];
    if (!ruta) {
      setErrorDetalle(`Todavía no hay una fuente de datos configurada para el tipo "${reporte.tipo_reporte}".`);
      setCargandoDetalle(false);
      return;
    }

    try {
      const respuesta = await fetch(`http://localhost:3000${ruta}`);
      const texto = await respuesta.text();
      let datos;
      try { datos = JSON.parse(texto); }
      catch { throw new Error("El servidor no devolvió datos válidos. Verifica que el backend esté activo."); }
      if (!respuesta.ok) throw new Error(datos.mensaje || `No fue posible consultar ${reporte.tipo_reporte.toLowerCase()}.`);
      if (!Array.isArray(datos)) throw new Error("La respuesta del servidor no contiene una lista de registros.");
      setFilasReporte(datos);
    } catch (e) {
      setErrorDetalle(e.message || "No fue posible cargar los datos del reporte.");
    } finally {
      setCargandoDetalle(false);
    }
  };

  /* ================================
     DESCARGAR DATOS DEL REPORTE (CSV COMPATIBLE CON EXCEL)
  ================================= */
  const descargarReporte = async (reporte) => {
    let filas = filasReporte;
    if (!seleccionado || seleccionado.id_reporte !== reporte.id_reporte || filas.length === 0) {
      const rutas = { "Usuarios": "/api/usuarios", "Información": "/api/informacion", "Clientes": "/api/clientes", "Productos": "/api/productos", "Pagos": "/api/pagos", "Facturas": "/api/facturas", "Proveedores": "/api/proveedores", "Empleados": "/api/empleados", "Servicios": "/api/servicios", "Actividades": "/api/actividades", "Proyectos": "/api/proyectos" };
      const ruta = rutas[reporte.tipo_reporte];
      if (!ruta) { alert("No hay una fuente de datos configurada para este tipo de reporte."); return; }
      try {
        const respuesta = await fetch(`http://localhost:3000${ruta}`);
        const datos = await respuesta.json();
        if (!respuesta.ok || !Array.isArray(datos)) throw new Error(datos.mensaje || "No se pudieron consultar los datos.");
        filas = datos;
      } catch (e) { alert(e.message || "No fue posible descargar el reporte."); return; }
    }

    const columnas = filas.length ? [...new Set(filas.flatMap(fila => Object.keys(fila)))] : ["Mensaje"];
    const contenido = [columnas, ...(filas.length ? filas.map(fila => columnas.map(columna => fila[columna] ?? "")) : [["No hay registros para mostrar"]])];
    const csv = contenido.map(fila => fila.map(valor => `"${String(valor ?? "").replaceAll('"', '""')}"`).join(";")).join("\r\n");
    const archivo = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(archivo);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = `${reporte.nombre_reporte || "reporte"}`.replace(/[^a-z0-9áéíóúñü]+/gi, "_") + ".csv";
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    URL.revokeObjectURL(url);
  };

  const imprimirReporte = () => window.print();

  /* ================================
     ESTADÍSTICAS DE REPORTES
  ================================= */
  const totalReportes =
    reportes.length;

  const finalizados =
    reportes.filter(
      (reporte) =>
        String(
          reporte.estado ||
            "Finalizado"
        ).toLowerCase() ===
        "finalizado"
    ).length;

  const enProceso =
    reportes.filter(
      (reporte) =>
        String(
          reporte.estado || ""
        ).toLowerCase() ===
        "en proceso"
    ).length;

  const inactivos =
    reportes.filter(
      (reporte) =>
        String(
          reporte.estado || ""
        ).toLowerCase() ===
        "inactivo"
    ).length;

  const porcentaje = (cantidad) =>
    totalReportes > 0
      ? Math.round(
          (cantidad * 100) /
            totalReportes
        )
      : 0;

  const contarTipo = (nombre) =>
    reportes.filter(
      (reporte) =>
        String(
          reporte.tipo_reporte || ""
        ).toLowerCase() ===
        nombre.toLowerCase()
    ).length;

  const maximo = Math.max(
    1,
    ...tipos.map(contarTipo)
  );

  const categorias =
    new Set(
      reportes
        .map(
          (reporte) =>
            reporte.tipo_reporte
        )
        .filter(Boolean)
    ).size;

  /* ================================
     ABRIR MODAL NUEVO
  ================================= */
  const abrirModalGenerar = () => {
    setError("");
    setMensaje("");

    setFormulario({
      nombre_reporte: "",
      tipo_reporte: "Usuarios",
      descripcion: "",
      estado: "Finalizado",
    });

    setMostrarModal(true);
  };

  return (
    <section className="reports-page">

      {/* ================================
          ENCABEZADO
      ================================= */}
      <div className="reports-heading">

        <div>
          <h1>
            Módulo de Reportes
          </h1>

          <p>
            Consulta y genera reportes
            con la información registrada
            en el sistema.
          </p>
        </div>

        <button
          type="button"
          className="reports-generate-button"
          onClick={
            abrirModalGenerar
          }
        >
          <svg
            viewBox="0 0 24 24"
          >
            <path d="M6 3h9l4 4v14H6z" />
            <path d="M15 3v5h5" />
            <path d="M9 13h6" />
            <path d="M9 17h6" />
          </svg>

          Generar reporte
        </button>

      </div>

      {/* ================================
          FILTROS
      ================================= */}
      <div className="reports-filters-card">

        <div className="reports-filters">

          <div className="reports-filter-group">

            <label>
              Tipo de reporte
            </label>

            <select
              value={tipo}
              onChange={(e) =>
                setTipo(e.target.value)
              }
            >
              <option value="Todos">
                Todos
              </option>

              {tipos.map((nombre) => (
                <option
                  key={nombre}
                  value={nombre}
                >
                  {nombre}
                </option>
              ))}
            </select>

          </div>

          <div className="reports-filter-group">

            <label>
              Fecha inicio
            </label>

            <input
              type="date"
              value={fechaInicio}
              onChange={(e) =>
                setFechaInicio(
                  e.target.value
                )
              }
            />

          </div>

          <div className="reports-filter-group">

            <label>
              Fecha fin
            </label>

            <input
              type="date"
              value={fechaFin}
              onChange={(e) =>
                setFechaFin(
                  e.target.value
                )
              }
            />

          </div>

          <button
            type="button"
            className="reports-filter-button"
            onClick={cargarReportes}
          >
            <svg
              viewBox="0 0 24 24"
            >
              <path d="M4 6h16L14 13v5l-4 2v-7L4 6z" />
            </svg>

            Filtrar
          </button>

        </div>

      </div>

      {/* ================================
          MENSAJES
      ================================= */}
      {mensaje && (
        <div className="reports-message success">
          {mensaje}
        </div>
      )}

      {error && (
        <div className="reports-message error">
          {error}
        </div>
      )}

      {/* ================================
          TARJETAS
      ================================= */}
      <div className="reports-stats-grid">

        {/* USUARIOS */}
        <div className="reports-stat-card">

          <div className="reports-stat-icon blue">
            <svg viewBox="0 0 24 24">
              <circle
                cx="9"
                cy="8"
                r="3"
              />
              <path d="M3 20c0-4 2.5-6 6-6s6 2 6 6" />
              <circle
                cx="17"
                cy="9"
                r="2.5"
              />
            </svg>
          </div>

          <div className="reports-stat-info">

            <span>
              Total de usuarios
            </span>

            <strong>
              {cargandoEstadisticas
                ? "..."
                : estadisticas.usuarios}
            </strong>

            <small>
              Usuarios registrados
              en el sistema
            </small>

          </div>

        </div>

        {/* INFORMACIÓN */}
        <div className="reports-stat-card">

          <div className="reports-stat-icon green">

            <svg viewBox="0 0 24 24">
              <rect
                x="5"
                y="3"
                width="14"
                height="18"
                rx="2"
              />
              <path d="M8 8h8" />
              <path d="M8 12h8" />
              <path d="M8 16h5" />
            </svg>

          </div>

          <div className="reports-stat-info">

            <span>
              Registros de información
            </span>

            <strong>
              {cargandoEstadisticas
                ? "..."
                : estadisticas.informacion}
            </strong>

            <small>
              Registros del sistema
            </small>

          </div>

        </div>

        {/* REPORTES */}
        <div className="reports-stat-card">

          <div className="reports-stat-icon purple">

            <svg viewBox="0 0 24 24">
              <path d="M5 20V10" />
              <path d="M12 20V5" />
              <path d="M19 20v-8" />
            </svg>

          </div>

          <div className="reports-stat-info">

            <span>
              Reportes generados
            </span>

            <strong>
              {cargandoEstadisticas
                ? "..."
                : estadisticas.reportes}
            </strong>

            <small>
              Reportes almacenados
              en MySQL
            </small>

          </div>

        </div>

        {/* CATEGORÍAS */}
        <div className="reports-stat-card">

          <div className="reports-stat-icon orange">

            <svg viewBox="0 0 24 24">
              <circle
                cx="12"
                cy="12"
                r="8"
              />
              <path d="M12 8v4l3 2" />
            </svg>

          </div>

          <div className="reports-stat-info">

            <span>
              Categorías
            </span>

            <strong>
              {categorias}
            </strong>

            <small>
              Tipos registrados
            </small>

          </div>

        </div>

      </div>

      {/* ================================
          GRÁFICOS
      ================================= */}
      <div className="reports-charts-grid">

        {/* BARRAS */}
        <div className="reports-chart-card">

          <h2>
            Registros por categoría
          </h2>

          <div className="reports-chart-area">

            <div className="reports-bars">

              {tipos.map(
                (nombre) => {

                  const cantidad =
                    contarTipo(
                      nombre
                    );

                  const altura =
                    cantidad === 0
                      ? 4
                      : Math.max(
                          10,
                          (cantidad /
                            maximo) *
                            140
                        );

                  return (
                    <div
                      className="reports-bar-item"
                      key={nombre}
                    >

                      <span className="reports-bar-value">
                        {cantidad}
                      </span>

                      <div
                        className="reports-bar"
                        style={{
                          height:
                            `${altura}px`,
                        }}
                      ></div>

                      <span className="reports-bar-label">
                        {nombre}
                      </span>

                    </div>
                  );
                }
              )}

            </div>

          </div>

        </div>

        {/* DONA */}
        <div className="reports-chart-card">

          <h2>
            Estado de los registros
          </h2>

          <div className="reports-donut-container">

            <div
              className="reports-donut"
              style={{
                background:
                  totalReportes > 0
                    ? `conic-gradient(
                        #22a06b 0 ${porcentaje(finalizados)}%,
                        #f2b233 ${porcentaje(finalizados)}% ${porcentaje(finalizados + enProceso)}%,
                        #ef6268 ${porcentaje(finalizados + enProceso)}% 100%
                      )`
                    : "#e8edf4",
              }}
            ></div>

            <div className="reports-legend">

              <div className="reports-legend-item">
                <span className="reports-legend-dot finalizado"></span>

                <span>
                  Finalizado
                </span>

                <strong>
                  {porcentaje(
                    finalizados
                  )}%
                </strong>
              </div>

              <div className="reports-legend-item">
                <span className="reports-legend-dot proceso"></span>

                <span>
                  En proceso
                </span>

                <strong>
                  {porcentaje(
                    enProceso
                  )}%
                </strong>
              </div>

              <div className="reports-legend-item">
                <span className="reports-legend-dot inactivo"></span>

                <span>
                  Inactivo
                </span>

                <strong>
                  {porcentaje(
                    inactivos
                  )}%
                </strong>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ================================
          TABLA
      ================================= */}
      <div className="reports-table-card">

        <div className="reports-table-header">

          <h2>
            Últimos reportes generados
          </h2>

          <button
            type="button"
            onClick={cargarReportes}
          >
            Ver todos ›
          </button>

        </div>

        <div className="reports-table-wrapper">

          <table className="reports-table">

            <thead>

              <tr>
                <th>#</th>
                <th>Nombre del reporte</th>
                <th>Tipo de reporte</th>
                <th>Fecha de generación</th>
                <th>Generado por</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>

            </thead>

            <tbody>

              {cargando ? (

                <tr>
                  <td
                    colSpan="7"
                    className="reports-empty"
                  >
                    Cargando reportes...
                  </td>
                </tr>

              ) : reportes.length === 0 ? (

                <tr>
                  <td
                    colSpan="7"
                    className="reports-empty"
                  >
                    No hay reportes registrados.
                  </td>
                </tr>

              ) : (

                reportes.map(
                  (reporte, indice) => {

                    const estado =
                      String(
                        reporte.estado ||
                          "Finalizado"
                      );

                    let claseEstado =
                      "finalizado";

                    if (
                      estado.toLowerCase() ===
                      "en proceso"
                    ) {
                      claseEstado =
                        "en-proceso";
                    }

                    if (
                      estado.toLowerCase() ===
                      "inactivo"
                    ) {
                      claseEstado =
                        "inactivo";
                    }

                    return (
                      <tr
                        key={
                          reporte.id_reporte
                        }
                      >

                        <td>
                          {indice + 1}
                        </td>

                        <td>
                          {
                            reporte.nombre_reporte
                          }
                        </td>

                        <td>
                          {
                            reporte.tipo_reporte ||
                            "General"
                          }
                        </td>

                        <td>
                          {formatearFecha(
                            reporte.fecha_generacion
                          )}
                        </td>

                        <td>
                          {
                            reporte.generado_por ||
                            "—"
                          }
                        </td>

                        <td>

                          <span
                            className={`report-status ${claseEstado}`}
                          >
                            {estado}
                          </span>

                        </td>

                        <td>

                          <div className="reports-actions">

                            {/* VER */}
                            <button
                              type="button"
                              className="reports-action-button view"
                              title="Ver reporte"
                              onClick={() => consultarReporte(reporte)}
                            >
                              <svg
                                viewBox="0 0 24 24"
                              >
                                <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" />
                                <circle
                                  cx="12"
                                  cy="12"
                                  r="2.5"
                                />
                              </svg>
                            </button>

                            {/* DESCARGAR */}
                            <button
                              type="button"
                              className="reports-action-button download"
                              title="Descargar"
                              onClick={() =>
                                descargarReporte(
                                  reporte
                                )
                              }
                            >
                              <svg
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 3v12" />
                                <path d="m7 10 5 5 5-5" />
                                <path d="M5 20h14" />
                              </svg>
                            </button>

                            {/* ELIMINAR */}
                            <button
                              type="button"
                              className="reports-action-button delete"
                              title="Eliminar"
                              onClick={() =>
                                eliminarReporte(
                                  reporte
                                )
                              }
                            >
                              <svg
                                viewBox="0 0 24 24"
                              >
                                <path d="M4 7h16" />
                                <path d="M9 7V4h6v3" />
                                <path d="M6 7l1 13h10l1-13" />
                                <path d="M10 11v5M14 11v5" />
                              </svg>
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* ================================
          MODAL GENERAR REPORTE
      ================================= */}
      {mostrarModal && (

        <div
          className="report-modal-overlay"
          onMouseDown={() =>
            setMostrarModal(false)
          }
        >

          <div
            className="report-modal"
            onMouseDown={(e) =>
              e.stopPropagation()
            }
          >

            <div className="report-modal-header">

              <h2>
                Generar reporte
              </h2>

              <button
                type="button"
                className="report-modal-close"
                onClick={() =>
                  setMostrarModal(false)
                }
              >
                ×
              </button>

            </div>

            <form
              onSubmit={generarReporte}
            >

              <div className="report-modal-body">

                <div className="report-form-grid">

                  <div className="report-form-group full">

                    <label>
                      Nombre del reporte *
                    </label>

                    <input
                      type="text"
                      required
                      value={
                        formulario.nombre_reporte
                      }
                      onChange={(e) =>
                        setFormulario({
                          ...formulario,
                          nombre_reporte:
                            e.target.value,
                        })
                      }
                      placeholder="Ej. Reporte de usuarios"
                    />

                  </div>

                  <div className="report-form-group">

                    <label>
                      Tipo de reporte *
                    </label>

                    <select
                      value={
                        formulario.tipo_reporte
                      }
                      onChange={(e) =>
                        setFormulario({
                          ...formulario,
                          tipo_reporte:
                            e.target.value,
                        })
                      }
                    >

                      {tipos.map(
                        (nombre) => (
                          <option
                            key={nombre}
                            value={nombre}
                          >
                            {nombre}
                          </option>
                        )
                      )}

                    </select>

                  </div>

                  <div className="report-form-group">

                    <label>
                      Estado *
                    </label>

                    <select
                      value={
                        formulario.estado
                      }
                      onChange={(e) =>
                        setFormulario({
                          ...formulario,
                          estado:
                            e.target.value,
                        })
                      }
                    >
                      <option>
                        Finalizado
                      </option>

                      <option>
                        En proceso
                      </option>

                      <option>
                        Inactivo
                      </option>

                    </select>

                  </div>

                  <div className="report-form-group full">

                    <label>
                      Descripción
                    </label>

                    <textarea
                      value={
                        formulario.descripcion
                      }
                      onChange={(e) =>
                        setFormulario({
                          ...formulario,
                          descripcion:
                            e.target.value,
                        })
                      }
                      placeholder="Descripción del reporte..."
                    />

                  </div>

                </div>

              </div>

              <div className="report-modal-footer">

                <button
                  type="button"
                  className="report-cancel-button"
                  onClick={() =>
                    setMostrarModal(false)
                  }
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="report-save-button"
                >
                  Generar reporte
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* ================================
          MODAL VER DETALLE
      ================================= */}
      {mostrarDetalle &&
        seleccionado && (

          <div
            className="report-modal-overlay"
            onMouseDown={() =>
              setMostrarDetalle(false)
            }
          >

            <div
              className="report-modal"
              onMouseDown={(e) =>
                e.stopPropagation()
              }
            >

              <div className="report-modal-header">

                <h2>
                  Detalle del reporte
                </h2>

                <button
                  type="button"
                  className="report-modal-close"
                  onClick={() =>
                    setMostrarDetalle(false)
                  }
                >
                  ×
                </button>

              </div>

              <div className="report-modal-body">

                <div className="report-detail">

                  <div className="report-detail-row">
                    <span>
                      Nombre
                    </span>

                    <strong>
                      {
                        seleccionado.nombre_reporte
                      }
                    </strong>
                  </div>

                  <div className="report-detail-row">
                    <span>
                      Tipo
                    </span>

                    <strong>
                      {
                        seleccionado.tipo_reporte ||
                        "General"
                      }
                    </strong>
                  </div>

                  <div className="report-detail-row">
                    <span>
                      Fecha de generación
                    </span>

                    <strong>
                      {formatearFecha(
                        seleccionado.fecha_generacion
                      )}
                    </strong>
                  </div>

                  <div className="report-detail-row">
                    <span>
                      Generado por
                    </span>

                    <strong>
                      {
                        seleccionado.generado_por ||
                        "—"
                      }
                    </strong>
                  </div>

                  <div className="report-detail-row">
                    <span>
                      Estado
                    </span>

                    <strong>
                      {
                        seleccionado.estado ||
                        "Finalizado"
                      }
                    </strong>
                  </div>

                  <div className="report-detail-row">
                    <span>
                      Descripción
                    </span>

                    <strong>
                      {
                        seleccionado.descripcion ||
                        "Sin descripción."
                      }
                    </strong>
                  </div>

                </div>

                <div className="report-data-section" style={{ marginTop: 20 }}>
                  <h3>Datos del informe: {seleccionado.tipo_reporte}</h3>
                  {cargandoDetalle ? (
                    <p>Consultando registros reales...</p>
                  ) : errorDetalle ? (
                    <p role="alert" style={{ color: "#b42318" }}>{errorDetalle}</p>
                  ) : filasReporte.length === 0 ? (
                    <p>No hay registros para mostrar en esta categoría.</p>
                  ) : (
                    <div style={{ overflowX: "auto", maxHeight: 280 }}>
                      <table className="reports-table">
                        <thead><tr>{Object.keys(filasReporte[0]).map((columna) => <th key={columna}>{columna.replaceAll("_", " ")}</th>)}</tr></thead>
                        <tbody>{filasReporte.map((fila, indice) => <tr key={indice}>{Object.keys(filasReporte[0]).map((columna) => <td key={columna}>{fila[columna] == null ? "—" : typeof fila[columna] === "object" ? JSON.stringify(fila[columna]) : String(fila[columna])}</td>)}</tr>)}</tbody>
                      </table>
                      <p style={{ marginTop: 8 }}>Total de registros: <strong>{filasReporte.length}</strong></p>
                    </div>
                  )}
                </div>

              </div>

              <div className="report-modal-footer">

                <button
                  type="button"
                  className="report-cancel-button"
                  onClick={() =>
                    setMostrarDetalle(false)
                  }
                >
                  Cerrar
                </button>

                <button
                  type="button"
                  className="report-cancel-button"
                  onClick={imprimirReporte}
                >
                  Imprimir / Guardar PDF
                </button>

                <button
                  type="button"
                  className="report-save-button"
                  onClick={() => descargarReporte(seleccionado)}
                >
                  Descargar Excel (CSV)
                </button>

              </div>

            </div>

          </div>
        )}

    </section>
  );
}

/* ================================
   CONFIGURACIÓN
================================ */
function Configuracion({ usuario, actualizarUsuario }) {
  const [pestana, setPestana] = useState("perfil");

  const [nombreCompleto, setNombreCompleto] = useState(
    `${usuario?.nombre || ""} ${usuario?.apellidos || ""}`.trim()
  );
  const [correo, setCorreo] = useState(usuario?.correo || "");
  const [telefono, setTelefono] = useState(
    localStorage.getItem("softtech_telefono") || "3001234567"
  );
  const [cargo, setCargo] = useState(
    usuario?.rol === "Administrador" ? "Administrador" : "Usuario"
  );
  const [area, setArea] = useState(
    localStorage.getItem("softtech_area") || "Tecnología"
  );

  const [guardandoPerfil, setGuardandoPerfil] = useState(false);
  const [mensajePerfil, setMensajePerfil] = useState("");
  const [errorPerfil, setErrorPerfil] = useState("");
  const [fotoPerfil, setFotoPerfil] = useState(
  () => localStorage.getItem("softtech_foto_perfil") || ""
);

const inputFotoRef = useRef(null);

const cambiarFotoPerfil = (e) => {
  const archivo = e.target.files?.[0];

  if (!archivo) return;

  if (!archivo.type.startsWith("image/")) {
    alert("Selecciona una imagen válida.");
    return;
  }

  const lector = new FileReader();

  lector.onload = () => {
    const imagen = lector.result;

    setFotoPerfil(imagen);
    localStorage.setItem(
      "softtech_foto_perfil",
      imagen
    );
    window.dispatchEvent(new Event("softtech:foto-perfil-cambiada"));
  };

  lector.readAsDataURL(archivo);
};

const quitarFotoPerfil = () => {
  setFotoPerfil("");
  localStorage.removeItem("softtech_foto_perfil");

  if (inputFotoRef.current) {
    inputFotoRef.current.value = "";
  }

  window.dispatchEvent(
    new Event("softtech:foto-perfil-cambiada")
  );
};

  const [contrasenaActual, setContrasenaActual] = useState("");
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [mostrarActual, setMostrarActual] = useState(false);
  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [mensajeSeguridad, setMensajeSeguridad] = useState("");
  const [errorSeguridad, setErrorSeguridad] = useState("");
  const [actualizandoPassword, setActualizandoPassword] = useState(false);

  const [notificaciones, setNotificaciones] = useState(() => {
    try {
      const guardadas = localStorage.getItem("softtech_notificaciones");

      return guardadas
        ? JSON.parse(guardadas)
        : {
            usuarios: true,
            informacion: true,
            reportes: true,
            actualizaciones: false,
          };
    } catch {
      return {
        usuarios: true,
        informacion: true,
        reportes: true,
        actualizaciones: false,
      };
    }
  });

  const [tema, setTema] = useState(
    () => localStorage.getItem("softtech_tema") || "claro"
  );

  const [idioma, setIdioma] = useState(
    () => localStorage.getItem("softtech_idioma") || "Español"
  );

  useEffect(() => {
    iniciarIdiomaVisualSoftTech(idioma);
  }, [idioma]);

  const [formatoFecha, setFormatoFecha] = useState(
    () =>
      localStorage.getItem("softtech_formato_fecha") ||
      "dd/mm/aaaa"
  );

  const [registrosPorPaginaPreferencia, setRegistrosPorPaginaPreferencia] =
    useState(
      () =>
        localStorage.getItem(
          "softtech_registros_por_pagina"
        ) || "10"
    );

  const [confirmarEliminaciones, setConfirmarEliminaciones] =
    useState(() => {
      const valor = localStorage.getItem(
        "softtech_confirmar_eliminaciones"
      );
      return valor === null
        ? true
        : valor === "true";
    });

  const [actualizacionAutomatica, setActualizacionAutomatica] =
    useState(() => {
      const valor = localStorage.getItem(
        "softtech_actualizacion_automatica"
      );
      return valor === null
        ? true
        : valor === "true";
    });

  const [guardadoAutomatico, setGuardadoAutomatico] =
    useState(() => {
      const valor = localStorage.getItem(
        "softtech_guardado_automatico"
      );
      return valor === null
        ? true
        : valor === "true";
    });

  useEffect(() => {
    localStorage.setItem(
      "softtech_tema",
      tema
    );

    aplicarTemaVisual(tema);

    window.dispatchEvent(
      new CustomEvent("softtech:tema-cambiado", {
        detail: tema,
      })
    );

    if (
      tema === "sistema" &&
      window.matchMedia
    ) {
      const media = window.matchMedia(
        "(prefers-color-scheme: dark)"
      );

      const cambiarTemaSistema = () => {
        aplicarTemaVisual(tema);
      };

      media.addEventListener?.(
        "change",
        cambiarTemaSistema
      );

      return () => {
        media.removeEventListener?.(
          "change",
          cambiarTemaSistema
        );
      };
    }
  }, [tema]);

  const guardarPreferencia = (clave, valor) => {
    const guardar =
      localStorage.getItem(
        "softtech_guardado_automatico"
      ) !== "false";

    if (guardar) {
      localStorage.setItem(
        clave,
        String(valor)
      );
    }
  };

  const cambiarNotificacion = (campo) => {
    setNotificaciones((anterior) => {
      const nuevas = {
        ...anterior,
        [campo]: !anterior[campo],
      };

      localStorage.setItem(
        "softtech_notificaciones",
        JSON.stringify(nuevas)
      );

      return nuevas;
    });
  };

  const guardarPerfil = async (e) => {
    e.preventDefault();

    setMensajePerfil("");
    setErrorPerfil("");

    if (!nombreCompleto.trim()) {
      setErrorPerfil(
        "El nombre completo es obligatorio."
      );
      return;
    }

    if (!correo.trim()) {
      setErrorPerfil(
        "El correo electrónico es obligatorio."
      );
      return;
    }

    try {
      setGuardandoPerfil(true);

      const partes =
        nombreCompleto.trim().split(/\s+/);

      const nombre =
        partes.shift() || "";

      const apellidos =
        partes.join(" ") ||
        usuario?.apellidos ||
        "";

      const respuesta = await fetch(
        `http://localhost:3000/api/usuarios/${usuario.id_usuario}/perfil`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombre,
            apellidos,
            cedula: usuario?.cedula || "",
            fecha_nacimiento:
              usuario?.fecha_nacimiento ||
              "2000-01-01",
            correo: correo.trim(),
            rol:
              usuario?.rol ||
              cargo ||
              "Usuario",
            estado:
              usuario?.estado ||
              "Activo",
          }),
        }
      );

      const texto =
        await respuesta.text();

      let datos;

      try {
        datos = JSON.parse(texto);
      } catch {
        throw new Error(
          "El servidor no devolvió una respuesta válida."
        );
      }

      if (!respuesta.ok) {
        throw new Error(
          datos.mensaje ||
            "No fue posible actualizar el perfil."
        );
      }

      localStorage.setItem(
        "softtech_telefono",
        telefono
      );

      localStorage.setItem(
        "softtech_area",
        area
      );

      const usuarioActualizado = {
        ...usuario,
        nombre,
        apellidos,
        correo: correo.trim(),
      };

      actualizarUsuario?.(
        usuarioActualizado
      );

      setMensajePerfil(
        "Los cambios se guardaron correctamente."
      );
    } catch (error) {
      console.error(
        "Error al guardar perfil:",
        error
      );

      setErrorPerfil(
        error.message ||
          "No fue posible guardar los cambios."
      );
    } finally {
      setGuardandoPerfil(false);
    }
  };

  const cambiarContrasena = async (e) => {
    e.preventDefault();

    setMensajeSeguridad("");
    setErrorSeguridad("");

    if (!contrasenaActual) {
      setErrorSeguridad(
        "Ingresa tu contraseña actual."
      );
      return;
    }

    if (!nuevaContrasena) {
      setErrorSeguridad(
        "Ingresa una nueva contraseña."
      );
      return;
    }

    if (nuevaContrasena.length < 8) {
      setErrorSeguridad(
        "La nueva contraseña debe tener al menos 8 caracteres."
      );
      return;
    }

    if (
      nuevaContrasena !==
      confirmarContrasena
    ) {
      setErrorSeguridad(
        "Las nuevas contraseñas no coinciden."
      );
      return;
    }

    if (
      !/[A-Za-z]/.test(nuevaContrasena) ||
      !/[0-9]/.test(nuevaContrasena) ||
      !/[^A-Za-z0-9]/.test(nuevaContrasena)
    ) {
      setErrorSeguridad(
        "La contraseña debe incluir letras, números y un carácter especial."
      );
      return;
    }

    try {
      setActualizandoPassword(true);

      const respuesta = await fetch(
        `http://localhost:3000/api/usuarios/${usuario.id_usuario}/cambiar-contrasena`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contrasenaActual,
            nuevaContrasena,
          }),
        }
      );

      const texto =
        await respuesta.text();

      let datos;

      try {
        datos = JSON.parse(texto);
      } catch {
        throw new Error(
          "El servidor no devolvió una respuesta válida."
        );
      }

      if (!respuesta.ok) {
        throw new Error(
          datos.mensaje ||
            "No fue posible actualizar la contraseña."
        );
      }

      setContrasenaActual("");
      setNuevaContrasena("");
      setConfirmarContrasena("");

      setMensajeSeguridad(
        "Contraseña actualizada correctamente."
      );
    } catch (error) {
      console.error(
        "Error al cambiar contraseña:",
        error
      );

      setErrorSeguridad(
        error.message ||
          "No fue posible actualizar la contraseña."
      );
    } finally {
      setActualizandoPassword(false);
    }
  };

  const cambiarPestana = (nombre) => {
    setPestana(nombre);

    const secciones = {
      perfil: "config-perfil",
      seguridad: "config-seguridad",
      notificaciones: "config-notificaciones",
      apariencia: "config-apariencia",
      preferencias: "config-preferencias",
    };

    const id = secciones[nombre];
    if (!id) return;

    // Espera al siguiente repintado para desplazar a la sección elegida.
    window.requestAnimationFrame(() => {
      const destino = document.getElementById(id);
      if (!destino) return;

      destino.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    });
  };

  return (
    <section className="dashboard-content configuration-page" data-active={pestana}>

      {/* ================================
          ENCABEZADO
      ================================= */}
      <div className="configuration-heading">
        <div>
          <h1>Configuración</h1>

          <p>
            Administra las opciones del sistema y
            personaliza su funcionamiento.
          </p>
        </div>
      </div>

      {/* ================================
          PESTAÑAS
      ================================= */}
      <div className="configuration-tabs">

        <button
          type="button"
          className={
            pestana === "perfil"
              ? "configuration-tab active"
              : "configuration-tab"
          }
          onClick={() =>
            cambiarPestana("perfil")
          }
        >
          <UserIcon />
          <span>Perfil de usuario</span>
        </button>

        <button
          type="button"
          className={
            pestana === "seguridad"
              ? "configuration-tab active"
              : "configuration-tab"
          }
          onClick={() =>
            cambiarPestana("seguridad")
          }
        >
          <LockIcon />
          <span>Seguridad</span>
        </button>

        <button
          type="button"
          className={
            pestana === "notificaciones"
              ? "configuration-tab active"
              : "configuration-tab"
          }
          onClick={() =>
            cambiarPestana("notificaciones")
          }
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
            <path d="M10 21h4" />
          </svg>

          <span>Notificaciones</span>
        </button>

        <button
          type="button"
          className={
            pestana === "apariencia"
              ? "configuration-tab active"
              : "configuration-tab"
          }
          onClick={() =>
            cambiarPestana("apariencia")
          }
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 3a9 9 0 1 0 9 9c0-.7-.1-1.3-.2-2H17a3 3 0 0 1-3-3V3.2c-.7-.1-1.3-.2-2-.2Z" />
            <circle cx="7.5" cy="10" r="1" />
            <circle cx="10" cy="6.5" r="1" />
            <circle cx="6.5" cy="14" r="1" />
          </svg>

          <span>Apariencia</span>
        </button>

        <button
          type="button"
          className={
            pestana === "preferencias"
              ? "configuration-tab active"
              : "configuration-tab"
          }
          onClick={() =>
            cambiarPestana("preferencias")
          }
        >
        <svg viewBox="0 0 24 24" aria-hidden="true">
  <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
  <path d="M19.4 13.5a7.7 7.7 0 0 0 0-3l2-1.2-2-3.4-2.2 1a8 8 0 0 0-2.6-1.5L14.3 3h-4.6l-.3 2.4a8 8 0 0 0-2.6 1.5l-2.2-1-2 3.4 2 1.2a7.7 7.7 0 0 0 0 3l-2 1.2 2 3.4 2.2-1a8 8 0 0 0 2.6 1.5l.3 2.4h4.6l.3-2.4a8 8 0 0 0 2.6-1.5l2.2 1 2-3.4-2-1.2Z" />
</svg>

          <span>Preferencias del sistema</span>
        </button>

      </div>

      {mensajePerfil && (
        <div className="configuration-message success">
          {mensajePerfil}
        </div>
      )}

      {errorPerfil && (
        <div className="configuration-message error">
          {errorPerfil}
        </div>
      )}

      {/* ================================
          PERFIL + SEGURIDAD
      ================================= */}
      <div className="configuration-main-grid">

        {/* PERFIL */}
        <form
          id="config-perfil"
          className="configuration-card"
          onSubmit={guardarPerfil}
        >
          <div className="configuration-card-title">
            <div>
              <h2>Información del perfil</h2>
              <p>
                Actualiza tu información personal.
              </p>
            </div>

            <div className="configuration-avatar" style={{ position: "relative" }}>
  {fotoPerfil ? (
    <img
      src={fotoPerfil}
      alt="Foto de perfil"
      className="configuration-profile-photo"
    />
  ) : (
    <span>
      {(
        usuario?.nombre?.charAt(0) ||
        "J"
      ).toUpperCase()}
    </span>
  )}

  <input
    ref={inputFotoRef}
    type="file"
    accept="image/*"
    onChange={cambiarFotoPerfil}
    style={{ display: "none" }}
  />

  <button
    type="button"
    title="Cambiar foto"
    aria-label="Cambiar foto"
    onClick={() =>
      inputFotoRef.current?.click()
    }
  >
    <svg viewBox="0 0 24 24">
      <path d="M4 7h4l1.5-2h5L16 7h4v12H4z" />
      <circle
        cx="12"
        cy="13"
        r="3"
      />
    </svg>
  </button>

  {fotoPerfil && (
    <button
      type="button"
      title="Quitar foto"
      aria-label="Quitar foto de perfil"
      onClick={quitarFotoPerfil}
      style={{
        position: "absolute",
        top: "-5px",
        right: "-5px",
        width: "22px",
        height: "22px",
        border: "2px solid #ffffff",
        borderRadius: "50%",
        background: "#dc2626",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "16px",
        lineHeight: 1,
        fontWeight: 700,
        padding: 0,
        cursor: "pointer",
        zIndex: 3,
      }}
    >
      ×
    </button>
  )}
</div>
          </div>

          <div className="configuration-field">
            <label>Nombre completo</label>

            <input
              type="text"
              value={nombreCompleto}
              onChange={(e) =>
                setNombreCompleto(
                  e.target.value
                )
              }
            />
          </div>

          <div className="configuration-field">
            <label>Correo electrónico</label>

            <input
              type="email"
              value={correo}
              onChange={(e) =>
                setCorreo(e.target.value)
              }
            />
          </div>

          <div className="configuration-field">
            <label>Teléfono</label>

            <input
              type="text"
              value={telefono}
              onChange={(e) =>
                setTelefono(e.target.value)
              }
            />
          </div>

          <div className="configuration-two-fields">

            <div className="configuration-field">
              <label>Cargo</label>

              <select
                value={cargo}
                onChange={(e) =>
                  setCargo(e.target.value)
                }
              >
                <option>
                  Administrador
                </option>

                <option>Usuario</option>
              </select>
            </div>

            <div className="configuration-field">
              <label>Área</label>

              <select
                value={area}
                onChange={(e) =>
                  setArea(e.target.value)
                }
              >
                <option>Tecnología</option>
                <option>Administración</option>
                <option>
                  Recursos Humanos
                </option>
                <option>Finanzas</option>
                <option>Operaciones</option>
              </select>
            </div>

          </div>

          <div className="configuration-card-footer">
            <button
              type="submit"
              className="configuration-primary-button"
              disabled={guardandoPerfil}
            >
              <svg viewBox="0 0 24 24">
                <path d="M5 4h12l2 2v14H5z" />
                <path d="M8 4v5h8V4" />
                <path d="M8 16h8" />
              </svg>

              {guardandoPerfil
                ? "Guardando..."
                : "Guardar cambios"}
            </button>
          </div>
        </form>

        {/* SEGURIDAD */}
        <form
          id="config-seguridad"
          className="configuration-card"
          onSubmit={cambiarContrasena}
        >
          <div className="configuration-card-title">
            <div>
              <h2>Cambiar contraseña</h2>

              <p>
                Mantén tu cuenta segura.
              </p>
            </div>
          </div>

          <div className="configuration-field password-field">
            <label>Contraseña actual</label>

            <div>
              <input
                type={
                  mostrarActual
                    ? "text"
                    : "password"
                }
                placeholder="Ingresa tu contraseña actual"
                value={contrasenaActual}
                onChange={(e) =>
                  setContrasenaActual(
                    e.target.value
                  )
                }
              />

              <button
                type="button"
                onClick={() =>
                  setMostrarActual(
                    !mostrarActual
                  )
                }
              >
                <EyeIcon
                  visible={mostrarActual}
                />
              </button>
            </div>
          </div>

          <div className="configuration-field password-field">
            <label>Nueva contraseña</label>

            <div>
              <input
                type={
                  mostrarNueva
                    ? "text"
                    : "password"
                }
                placeholder="Ingresa tu nueva contraseña"
                value={nuevaContrasena}
                onChange={(e) =>
                  setNuevaContrasena(
                    e.target.value
                  )
                }
              />

              <button
                type="button"
                onClick={() =>
                  setMostrarNueva(
                    !mostrarNueva
                  )
                }
              >
                <EyeIcon
                  visible={mostrarNueva}
                />
              </button>
            </div>
          </div>

          <div className="configuration-field password-field">
            <label>
              Confirmar nueva contraseña
            </label>

            <div>
              <input
                type={
                  mostrarConfirmar
                    ? "text"
                    : "password"
                }
                placeholder="Confirma tu nueva contraseña"
                value={confirmarContrasena}
                onChange={(e) =>
                  setConfirmarContrasena(
                    e.target.value
                  )
                }
              />

              <button
                type="button"
                onClick={() =>
                  setMostrarConfirmar(
                    !mostrarConfirmar
                  )
                }
              >
                <EyeIcon
                  visible={mostrarConfirmar}
                />
              </button>
            </div>
          </div>


          {mensajeSeguridad && (
            <div className="configuration-message success">
              {mensajeSeguridad}
            </div>
          )}

          {errorSeguridad && (
            <div className="configuration-message error">
              {errorSeguridad}
            </div>
          )}

          <div className="configuration-card-footer right">
            <button
              type="submit"
              className="configuration-primary-button"
              disabled={actualizandoPassword}
            >
              <LockIcon />

              {actualizandoPassword
                ? "Actualizando..."
                : "Actualizar contraseña"}
            </button>
          </div>
        </form>

      </div>

      {/* ================================
          NOTIFICACIONES + APARIENCIA
      ================================= */}
      <div className="configuration-bottom-grid">

        {/* NOTIFICACIONES */}
        <div
          id="config-notificaciones"
          className="configuration-card"
        >
          <div className="configuration-card-title">
            <div>
              <h2>
                Preferencias de notificaciones
              </h2>

              <p>
                Selecciona los eventos sobre
                los que deseas recibir
                notificaciones.
              </p>
            </div>
          </div>

          <div className="configuration-switch-list">

            <label>
              <span>
                Nuevos usuarios registrados
              </span>

              <input
                type="checkbox"
                checked={
                  notificaciones.usuarios
                }
                onChange={() =>
                  cambiarNotificacion(
                    "usuarios"
                  )
                }
              />

              <i></i>
            </label>

            <label>
              <span>
                Nuevos registros de
                información
              </span>

              <input
                type="checkbox"
                checked={
                  notificaciones.informacion
                }
                onChange={() =>
                  cambiarNotificacion(
                    "informacion"
                  )
                }
              />

              <i></i>
            </label>

            <label>
              <span>
                Reportes generados
              </span>

              <input
                type="checkbox"
                checked={
                  notificaciones.reportes
                }
                onChange={() =>
                  cambiarNotificacion(
                    "reportes"
                  )
                }
              />

              <i></i>
            </label>

            <label>
              <span>
                Actualizaciones del sistema
              </span>

              <input
                type="checkbox"
                checked={
                  notificaciones.actualizaciones
                }
                onChange={() =>
                  cambiarNotificacion(
                    "actualizaciones"
                  )
                }
              />

              <i></i>
            </label>

          </div>
        </div>

        {/* APARIENCIA */}
        <div
          id="config-apariencia"
          className="configuration-card"
        >
          <div className="configuration-card-title">
            <div>
              <h2>
                Apariencia del sistema
              </h2>

              <p>
                Personaliza el aspecto visual
                de la aplicación.
              </p>
            </div>
          </div>

          <label className="configuration-label">
            Tema
          </label>

          <div className="configuration-theme-grid">

            <button
              type="button"
              className={
                tema === "claro"
                  ? "configuration-theme active"
                  : "configuration-theme"
              }
              onClick={() =>
                setTema("claro")
              }
            >
              <svg
                viewBox="0 0 24 24"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="4"
                />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="m4.93 4.93 1.41 1.41" />
                <path d="m17.66 17.66 1.41 1.41" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="m6.34 17.66-1.41 1.41" />
                <path d="m19.07 4.93-1.41 1.41" />
              </svg>

              <strong>Claro</strong>
            </button>

            <button
              type="button"
              className={
                tema === "oscuro"
                  ? "configuration-theme active"
                  : "configuration-theme"
              }
              onClick={() =>
                setTema("oscuro")
              }
            >
              <svg
                viewBox="0 0 24 24"
              >
                <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3 6.7 6.7 0 0 0 21 12.8Z" />
              </svg>

              <strong>Oscuro</strong>
            </button>

            <button
              type="button"
              className={
                tema === "sistema"
                  ? "configuration-theme active"
                  : "configuration-theme"
              }
              onClick={() =>
                setTema("sistema")
              }
            >
              <svg
                viewBox="0 0 24 24"
              >
                <rect
                  x="3"
                  y="4"
                  width="18"
                  height="13"
                  rx="2"
                />
                <path d="M8 21h8" />
                <path d="M12 17v4" />
              </svg>

              <strong>Sistema</strong>
            </button>

          </div>

          <div className="configuration-select-row">

            <div className="configuration-field">
              <label>Idioma</label>

              <select
                value={idioma}
                onChange={(e) => {
                  const valor =
                    e.target.value;

                  setIdioma(valor);

                  localStorage.setItem(
                    "softtech_idioma",
                    valor
                  );

                  iniciarIdiomaVisualSoftTech(
                    valor
                  );

                  emitirCambioPreferencias();
                }}
              >
                <option value="Español">
                  Español
                </option>

                <option value="English">
                  English
                </option>
              </select>
            </div>

            <div className="configuration-field">
              <label>
                Formato de fecha
              </label>

              <select
                value={formatoFecha}
                onChange={(e) => {
                  const valor =
                    e.target.value;

                  setFormatoFecha(valor);

                  localStorage.setItem(
                    "softtech_formato_fecha",
                    valor
                  );

                  emitirCambioPreferencias();
                }}
              >
                <option value="dd/mm/aaaa">
                  dd/mm/aaaa
                </option>

                <option value="mm/dd/aaaa">
                  mm/dd/aaaa
                </option>

                <option value="aaaa-mm-dd">
                  aaaa-mm-dd
                </option>
              </select>
            </div>

          </div>
        </div>

      </div>

      {/* ================================
          PREFERENCIAS DEL SISTEMA
      ================================= */}
      <div
        id="config-preferencias"
        className="configuration-preferences-card"
        style={{
          display: "block",
          padding: "22px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "18px",
          }}
        >
          <div className="configuration-preferences-icon">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M19.43 12.98c.04-.32.07-.65.07-.98s-.02-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.37-.31-.6-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98L14.5 2.42C14.47 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.5.42L9.12 5.07c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.08-.48 0-.6.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.08.65-.08.98s.03.66.08.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.37.31.6.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.38-2.65c.61-.25 1.17-.58 1.69-.98l2.49 1c.23.08.48 0 .6-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65ZM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5Z"
                fill="currentColor"
              />
            </svg>
          </div>

          <div>
            <h2>Preferencias del sistema</h2>
            <p>
              Configura el comportamiento general de la aplicación.
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "14px",
          }}
        >
          <div className="configuration-preference-row">
            <div>
              <strong>Registros por página</strong>
              <span>
                Define cuántos registros se muestran en las tablas.
              </span>
            </div>

            <select
              value={registrosPorPaginaPreferencia}
              onChange={(e) => {
                const valor = e.target.value;
                setRegistrosPorPaginaPreferencia(valor);
                guardarPreferencia(
                  "softtech_registros_por_pagina",
                  valor
                );
              }}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>

          <div className="configuration-preference-row">
            <div>
              <strong>Confirmar antes de eliminar</strong>
              <span>
                Solicita confirmación antes de borrar registros.
              </span>
            </div>

            <button
              type="button"
              className={`configuration-switch ${
                confirmarEliminaciones
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                const nuevoValor =
                  !confirmarEliminaciones;

                setConfirmarEliminaciones(
                  nuevoValor
                );

                guardarPreferencia(
                  "softtech_confirmar_eliminaciones",
                  nuevoValor
                );
              }}
              aria-pressed={confirmarEliminaciones}
            >
              <span></span>
            </button>
          </div>

          <div className="configuration-preference-row">
            <div>
              <strong>Actualización automática</strong>
              <span>
                Mantiene actualizados los datos del sistema.
              </span>
            </div>

            <button
              type="button"
              className={`configuration-switch ${
                actualizacionAutomatica
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                const nuevoValor =
                  !actualizacionAutomatica;

                setActualizacionAutomatica(
                  nuevoValor
                );

                guardarPreferencia(
                  "softtech_actualizacion_automatica",
                  nuevoValor
                );
              }}
              aria-pressed={actualizacionAutomatica}
            >
              <span></span>
            </button>
          </div>

          <div className="configuration-preference-row">
            <div>
              <strong>Guardar preferencias automáticamente</strong>
              <span>
                Conserva tus opciones en este dispositivo.
              </span>
            </div>

            <button
              type="button"
              className={`configuration-switch ${
                guardadoAutomatico
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                const nuevoValor =
                  !guardadoAutomatico;

                setGuardadoAutomatico(
                  nuevoValor
                );

                localStorage.setItem(
                  "softtech_guardado_automatico",
                  String(nuevoValor)
                );
              }}
              aria-pressed={guardadoAutomatico}
            >
              <span></span>
            </button>
          </div>
        </div>

        <div
          className="configuration-saved-text"
          style={{
            marginTop: "16px",
            fontSize: "12px",
            fontWeight: "600",
          }}
        >
          ✓ Preferencias guardadas automáticamente
        </div>
      </div>

    </section>
  );
}

/* ================================
   DASHBOARD
================================ */
function Dashboard({
  usuario,
  actualizarUsuario,
  cerrarSesion,
}) {
  const [seccion, setSeccion] =
    useState("inicio");
  const [gestionEmpresarialAbierta, setGestionEmpresarialAbierta] = useState(true);
  const [fotoPerfilDashboard, setFotoPerfilDashboard] = useState(
    () => localStorage.getItem("softtech_foto_perfil") || ""
  );

  useEffect(() => {
    const actualizarFotoPerfil = () => {
      setFotoPerfilDashboard(localStorage.getItem("softtech_foto_perfil") || "");
    };
    window.addEventListener("softtech:foto-perfil-cambiada", actualizarFotoPerfil);
    window.addEventListener("storage", actualizarFotoPerfil);
    return () => {
      window.removeEventListener("softtech:foto-perfil-cambiada", actualizarFotoPerfil);
      window.removeEventListener("storage", actualizarFotoPerfil);
    };
  }, []);

  const [
    preferenciasVersion,
    setPreferenciasVersion,
  ] = useState(0);

  useEffect(() => {
    const actualizarPreferencias = () => {
      setPreferenciasVersion(
        (valor) => valor + 1
      );

      iniciarIdiomaVisualSoftTech(
        localStorage.getItem(
          SOFTTECH_LANGUAGE_KEY
        ) || "Español"
      );
    };

    window.addEventListener(
      "softtech:preferencias-cambiadas",
      actualizarPreferencias
    );

    return () => {
      window.removeEventListener(
        "softtech:preferencias-cambiadas",
        actualizarPreferencias
      );
    };
  }, []);

  void preferenciasVersion;

  useEffect(() => {
    iniciarIdiomaVisualSoftTech(
      localStorage.getItem(
        SOFTTECH_LANGUAGE_KEY
      ) || "Español"
    );
  }, []);

  useEffect(() => {
    const temaGuardado =
      localStorage.getItem("softtech_tema") ||
      "claro";

    aplicarTemaVisual(temaGuardado);

    const actualizarTema = (evento) => {
      aplicarTemaVisual(
        evento.detail ||
          localStorage.getItem("softtech_tema") ||
          "claro"
      );
    };

    window.addEventListener(
      "softtech:tema-cambiado",
      actualizarTema
    );

    return () => {
      window.removeEventListener(
        "softtech:tema-cambiado",
        actualizarTema
      );
    };
  }, []);
  const [mostrarPerfil, setMostrarPerfil] =
    useState(false);
  const [mostrarNotificaciones, setMostrarNotificaciones] =
    useState(false);

  const [notificacionesReales, setNotificacionesReales] =
    useState(() => {
      try {
        return JSON.parse(
          localStorage.getItem(
            "softtech_notificaciones_reales"
          ) || "[]"
        );
      } catch {
        return [];
      }
    });

  useEffect(() => {
    const cargarNotificaciones = () => {
      try {
        const guardadas = JSON.parse(
          localStorage.getItem(
            "softtech_notificaciones_reales"
          ) || "[]"
        );

        setNotificacionesReales(
          Array.isArray(guardadas)
            ? guardadas
            : []
        );
      } catch {
        setNotificacionesReales([]);
      }
    };

    cargarNotificaciones();

    window.addEventListener(
      "softtech:nueva-notificacion",
      cargarNotificaciones
    );

    return () => {
      window.removeEventListener(
        "softtech:nueva-notificacion",
        cargarNotificaciones
      );
    };
  }, []);
  
  /* ================================
     ESTADÍSTICAS
  ================================= */
  const [estadisticas, setEstadisticas] =
    useState({
      usuarios: 0,
      informacion: 0,
      reportes: 0,
      clientes: 0,
      proveedores: 0,
      productos: 0,
      empleados: 0,
      facturas: 0,
      pagos: 0,
    });
  const [cargandoEstadisticas, setCargandoEstadisticas] =
    useState(true);
  const [ultimosRegistros, setUltimosRegistros] = useState([]);
  const formatearFechaRegistro = (fecha) => {
    return formatearFechaSegunPreferencia(fecha);
  };

  /* ================================
     CARGAR ESTADÍSTICAS DEL SISTEMA
  ================================= */
  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        setCargandoEstadisticas(true);
        const respuesta = await fetch(
          "http://localhost:3000/api/dashboard/estadisticas"
        );
        const datos = await respuesta.json();
        if (!respuesta.ok) {
          throw new Error(datos.mensaje || "Error al cargar estadísticas");
        }
        setEstadisticas({
          usuarios: Number(datos.usuarios) || 0,
          informacion: Number(datos.informacion) || 0,
          reportes: Number(datos.reportes) || 0,
          clientes: Number(datos.clientes) || 0,
          proveedores: Number(datos.proveedores) || 0,
          productos: Number(datos.productos) || 0,
          empleados: Number(datos.empleados) || 0,
          facturas: Number(datos.facturas) || 0,
          pagos: Number(datos.pagos) || 0,
        });
      } catch (error) {
        console.error("Error al cargar estadísticas:", error);
        setEstadisticas({ usuarios: 0, informacion: 0, reportes: 0, clientes: 0, proveedores: 0, productos: 0, empleados: 0, facturas: 0, pagos: 0 });
      } finally {
        setCargandoEstadisticas(false);
      }
    };
    cargarEstadisticas();
  }, [seccion]);

  /* ================================
     ÚLTIMOS REGISTROS
  ================================= */
  useEffect(() => {
    const cargarUltimosRegistros = async () => {
      const fuentes = [
        { endpoint: "usuarios", tipo: "Usuario", seccion: "usuarios" },
        { endpoint: "clientes", tipo: "Cliente", seccion: "clientes" },
        { endpoint: "proveedores", tipo: "Proveedor", seccion: "proveedores" },
        { endpoint: "productos", tipo: "Producto", seccion: "productos" },
        { endpoint: "empleados", tipo: "Empleado", seccion: "empleados" },
        { endpoint: "servicios", tipo: "Servicio", seccion: "servicios" },
        { endpoint: "facturas", tipo: "Factura", seccion: "facturas" },
        { endpoint: "pagos", tipo: "Pago", seccion: "pagos" },
      ];
      try {
        const resultados = await Promise.all(fuentes.map(async (fuente) => {
          try {
            const respuesta = await fetch(`http://localhost:3000/api/${fuente.endpoint}`);
            if (!respuesta.ok) return [];
            const datos = await respuesta.json();
            if (!Array.isArray(datos)) return [];
            return datos.map((registro, indice) => {
              const fecha = registro.fecha_registro || registro.fecha || registro.fecha_pago || registro.created_at || registro.fecha_creacion || "";
              const nombre = registro.nombre || registro.nombres || registro.razon_social || registro.cliente || registro.metodo_pago || fuente.tipo;
              const apellidos = registro.apellidos || "";
              const id = registro.id_usuario ?? registro.id_cliente ?? registro.id_proveedor ?? registro.id_producto ?? registro.id_empleado ?? registro.id_servicio ?? registro.id_factura ?? registro.id_pago ?? indice;
              return { id: `${fuente.endpoint}-${id}`, nombre: `${nombre} ${apellidos}`.trim(), fecha_registro: fecha, tipo: fuente.tipo, seccion: fuente.seccion, estado: registro.estado || "Registrado" };
            });
          } catch {
            return [];
          }
        }));
        const registros = resultados.flat().sort((a, b) => {
          const fechaA = a.fecha_registro ? new Date(a.fecha_registro).getTime() : 0;
          const fechaB = b.fecha_registro ? new Date(b.fecha_registro).getTime() : 0;
          return fechaB - fechaA;
        });
        setUltimosRegistros(registros.slice(0, 5));
      } catch (error) {
        console.error("Error al cargar últimos registros:", error);
        setUltimosRegistros([]);
      }
    };
    cargarUltimosRegistros();
  }, []);
  /* ================================
     MENÚ
  ================================= */
  const menu = [
    { id: "inicio", nombre: "Inicio", icono: (<svg viewBox="0 0 24 24"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9.5 20v-5h5v5"/></svg>) },
    { id: "usuarios", nombre: "Gestión de Usuarios", icono: (<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-4 2.8-6.5 6.5-6.5s6.5 2.5 6.5 6.5"/><circle cx="17.5" cy="9" r="2.5"/><path d="M17 13c2.8.2 4.5 2.2 4.5 5"/></svg>) },
    {
      id: "gestion-empresarial", nombre: "Gestión Empresarial", esGrupo: true,
      icono: (<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 21h18M5 21V6l7-3 7 3v15"/><path d="M9 9h2m2 0h2M9 13h2m2 0h2M10 21v-4h4v4"/></svg>),
      hijos: [
        { id: "proveedores", nombre: "Proveedores", icono: (<svg viewBox="0 0 24 24"><path d="M3 7h11v11H3z"/><path d="M14 11h4l3 3v4h-7z"/><circle cx="7" cy="19" r="2"/><circle cx="18" cy="19" r="2"/></svg>) },
        { id: "clientes", nombre: "Clientes", icono: (<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-4 3-6 7-6s7 2 7 6"/><path d="M16 5a3 3 0 0 1 0 6M18 14c2 .8 3 2.5 3 5"/></svg>) },
        { id: "productos", nombre: "Productos", icono: (<svg viewBox="0 0 24 24"><path d="m12 3 9 5-9 5-9-5z"/><path d="M3 8v9l9 5 9-5V8M12 13v9"/></svg>) },
        { id: "empleados", nombre: "Empleados y vendedores", icono: (<svg viewBox="0 0 24 24"><circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/></svg>) },
        { id: "servicios", nombre: "Servicios", icono: (<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.1-3.1a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z"/></svg>) },
        { id: "facturas", nombre: "Facturación", icono: (<svg viewBox="0 0 24 24"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6m-6 4h6m-6 4h4"/></svg>) },
        { id: "pagos", nombre: "Pagos", icono: (<svg viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20m-15 5h4"/></svg>) },
      ],
    },
    { id: "informacion", nombre: "Gestión de Información", icono: (<svg viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>) },
    { id: "reportes", nombre: "Reportes", icono: (<svg viewBox="0 0 24 24"><path d="M5 20V10"/><path d="M12 20V5"/><path d="M19 20v-8"/></svg>) },
    { id: "configuracion", nombre: "Configuración", icono: (<svg viewBox="0 0 24 24" className="configuration-gear-icon" aria-hidden="true"><path d="M12 8.7a3.3 3.3 0 1 0 0 6.6 3.3 3.3 0 0 0 0-6.6Z"/><path d="M19.4 13.4c.1-.45.1-.9.1-1.4s0-.95-.1-1.4l1.7-1.3-1.8-3.1-2 .8c-.7-.6-1.4-1-2.2-1.3L14.8 3.5h-3.6l-.3 2.2c-.8.3-1.5.7-2.2 1.3l-2-.8-1.8 3.1 1.7 1.3c-.1.45-.1.9-.1 1.4s0 .95.1 1.4l-1.7 1.3 1.8 3.1 2-.8c.7.6 1.4 1 2.2 1.3l.3 2.2h3.6l.3-2.2c.8-.3 1.5-.7 2.2-1.3l2 .8 1.8-3.1-1.7-1.3Z"/></svg>) },
  ];
  const cerrar = () => {
    cerrarSesion();
  };
  return (
    <div className="dashboard">

      {/* =========================
          SIDEBAR
      ========================= */}
      <aside className="dashboard-sidebar">
        <div className="dashboard-decoration top"></div>
        <div className="dashboard-decoration bottom"></div>
        <div className="sidebar-brand">
          <div className="dashboard-brand-content">
            <div className="dashboard-brand-diamond">
              <span>S</span>
            </div>
            <h2>SoftTech</h2>
            <div className="dashboard-brand-solutions">
              S O L U T I O N S
            </div>
            <div className="dashboard-brand-divider"></div>
            <p>
              Sistema de Gestión de Información
            </p>
          </div>
        </div>
        <nav className="sidebar-menu">
          {menu.map((item) => {
            if (item.esGrupo) {
              const grupoActivo = item.hijos.some((hijo) => hijo.id === seccion);
              return (
                <React.Fragment key={item.id}>
                  <button
                    type="button"
                    className={`sidebar-item ${grupoActivo ? "active" : ""}`}
                    onClick={() => setGestionEmpresarialAbierta((abierta) => !abierta)}
                    aria-expanded={gestionEmpresarialAbierta}
                  >
                    <span className="sidebar-icon">{item.icono}</span>
                    <span>{item.nombre}</span>
                    <svg className="submenu-arrow" viewBox="0 0 24 24" aria-hidden="true" style={{ width: 21, height: 21, marginLeft: "auto", flexShrink: 0, opacity: 1, transform: gestionEmpresarialAbierta ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .2s" }}>
                      <path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {gestionEmpresarialAbierta && item.hijos.map((hijo) => (
                    <button
                      key={hijo.id}
                      type="button"
                      className={`sidebar-item sidebar-subitem ${seccion === hijo.id ? "active" : ""}`}
                      onClick={() => setSeccion(hijo.id)}
                      style={{ paddingLeft: 28 }}
                    >
                      <span className="sidebar-icon">{hijo.icono}</span>
                      <span>{hijo.nombre}</span>
                    </button>
                  ))}
                </React.Fragment>
              );
            }
            return (
              <button key={item.id} type="button"
                className={`sidebar-item ${seccion === item.id ? "active" : ""}`}
                onClick={() => setSeccion(item.id)}>
                <span className="sidebar-icon">{item.icono}</span>
                <span>{item.nombre}</span>
              </button>
            );
          })}
        </nav>
        <button
          type="button"
          className="sidebar-logout"
          onClick={cerrar}
        >
          <span className="sidebar-icon">
            <svg viewBox="0 0 24 24">
              <path d="M10 17l5-5-5-5" />
              <path d="M15 12H3" />
              <path d="M13 5h6v14h-6" />
            </svg>
          </span>
          <span>
            Cerrar sesión
          </span>
        </button>
      </aside>
      
      {/* =========================
          CONTENIDO
      ========================= */}
      <main className="dashboard-main">
        {/* TOPBAR */}
        <header className="dashboard-topbar">
          <div></div>
          <div className="topbar-user">
            {/* NOTIFICACIONES */}
            <div className="topbar-notification-wrapper">
              <button
                type="button"
                className="notification-button"
                onClick={() => {
                  setMostrarNotificaciones(
                    !mostrarNotificaciones
                  );
                  setMostrarPerfil(false);
                }}
                aria-label="Notificaciones"
              >
                <svg viewBox="0 0 24 24">
                  <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                  <path d="M10 21h4" />
                </svg>
                {notificacionesReales.some(
                  (notificacion) => !notificacion.leida
                ) && (
                  <span className="notification-dot"></span>
                )}
              </button>
              {mostrarNotificaciones && (
                <div className="notification-dropdown">
                  <div className="dropdown-title">
                    Notificaciones
                  </div>

                  {notificacionesReales.length === 0 ? (
                    <div className="notification-empty">
                      No tienes notificaciones nuevas.
                    </div>
                  ) : (
                    <>
                      <div className="notification-list">
                        {notificacionesReales.map(
                          (notificacion) => (
                            <div
                              key={notificacion.id}
                              className={`notification-item ${
                                notificacion.leida
                                  ? "read"
                                  : "unread"
                              }`}
                              style={{
                                display: "flex",
                                gap: "10px",
                                padding: "12px",
                                borderBottom:
                                  "1px solid #e5e7eb",
                                background:
                                  notificacion.leida
                                    ? "#ffffff"
                                    : "#f5f9ff",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                eliminarNotificacion(
                                  notificacion.id
                                );

                                setNotificacionesReales(
                                  (anteriores) =>
                                    anteriores.filter(
                                      (item) =>
                                        item.id !==
                                        notificacion.id
                                    )
                                );
                              }}
                              title="Ver notificación"
                            >
                              <div
                                style={{
                                  width: "30px",
                                  height: "30px",
                                  minWidth: "30px",
                                  borderRadius: "50%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  background: "#eaf2ff",
                                }}
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  width="16"
                                  height="16"
                                >
                                  <path
                                    d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M10 21h4"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                  />
                                </svg>
                              </div>

                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "4px",
                                  minWidth: 0,
                                }}
                              >
                                <strong
                                  style={{
                                    fontSize: "12px",
                                    lineHeight: "1.35",
                                  }}
                                >
                                  {notificacion.mensaje}
                                </strong>

                                <span
                                  style={{
                                    fontSize: "10px",
                                    color: "#6b7280",
                                  }}
                                >
                                  {new Date(
                                    notificacion.fecha
                                  ).toLocaleString("es-CO")}
                                </span>
                              </div>
                            </div>
                          )
                        )}
                      </div>

                      <button
                        type="button"
                        className="notification-clear-button"
                        style={{
                          width: "100%",
                          border: "none",
                          background: "#ffffff",
                          color: "#1769e0",
                          padding: "10px",
                          cursor: "pointer",
                          fontWeight: "600",
                          fontSize: "11px",
                        }}
                        onClick={() => {
                          const leidas =
                            notificacionesReales.map(
                              (notificacion) => ({
                                ...notificacion,
                                leida: true,
                              })
                            );

                          localStorage.setItem(
                            "softtech_notificaciones_reales",
                            JSON.stringify(leidas)
                          );

                          setNotificacionesReales(leidas);
                        }}
                      >
                        Marcar como leídas
                      </button>

                      <button
                        type="button"
                        className="notification-clear-button"
                        style={{
                          width: "100%",
                          border: "none",
                          borderTop:
                            "1px solid #e5e7eb",
                          background: "#ffffff",
                          color: "#dc2626",
                          padding: "10px",
                          cursor: "pointer",
                          fontWeight: "600",
                          fontSize: "11px",
                        }}
                        onClick={() => {
                          localStorage.setItem(
                            NOTIFICACIONES_KEY,
                            "[]"
                          );

                          setNotificacionesReales([]);

                          window.dispatchEvent(
                            new Event(
                              "softtech:nueva-notificacion"
                            )
                          );
                        }}
                      >
                        Eliminar todas
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
            {/* SEPARADOR */}
            <div className="topbar-divider"></div>
            {/* PERFIL */}
            <div className="topbar-profile-wrapper">
              <button
                type="button"
                className="topbar-profile-button"
                onClick={() => {
                  setMostrarPerfil(
                    !mostrarPerfil
                  );
                  setMostrarNotificaciones(
                    false
                  );
                }}
                aria-label="Abrir perfil"
              >
                <div className="user-avatar" style={{ overflow: "hidden", padding: 0 }}>
                  {fotoPerfilDashboard ? (
                    <img
                      src={fotoPerfilDashboard}
                      alt="Foto de perfil"
                      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%", display: "block" }}
                    />
                  ) : (
                    usuario?.nombre?.charAt(0).toUpperCase() || "U"
                  )}
                </div>
                <div className="user-info">
                  <strong>
                    {usuario?.nombre ||
                      "Usuario"}
                  </strong>
                  <span>
                    {usuario?.rol ||
                      "Usuario"}
                  </span>
                </div>
                <span className="user-arrow">
                  ⌄
                </span>
              </button>
              {/* MENÚ DEL PERFIL */}
              {mostrarPerfil && (
                <div className="profile-dropdown">
                  <div className="profile-dropdown-header">
                    <div className="profile-dropdown-avatar" style={{ overflow: "hidden", padding: 0, flexShrink: 0 }}>
                      {fotoPerfilDashboard ? (
                        <img
                          src={fotoPerfilDashboard}
                          alt="Foto de perfil"
                          style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%", display: "block" }}
                        />
                      ) : (
                        usuario?.nombre?.charAt(0).toUpperCase() || "U"
                      )}
                    </div>
                    <div>
                      <strong>
                        {usuario?.nombre ||
                          "Usuario"}
                      </strong>
                      <span>
                        {usuario?.correo ||
                          ""}
                      </span>
                    </div>
                  </div>
                  {/* CONFIGURACIÓN */}
                  <button
                    type="button"
                    onClick={() => {
                      setSeccion(
                        "configuracion"
                      );
                      setMostrarPerfil(false);
                    }}
                  >
                    <span className="sidebar-icon" style={{ width: 22, height: 22, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "0 0 22px", marginRight: 2 }}>
  <svg
    viewBox="0 0 24 24"
    className="configuration-gear-icon"
    style={{
      width: 20,
      height: 20,
      display: "block",
      flexShrink: 0,
    }}
    aria-hidden="true"
  >
    <path d="M12 8.7a3.3 3.3 0 1 0 0 6.6 3.3 3.3 0 0 0 0-6.6Z" />
    <path d="M19.4 13.4c.1-.45.1-.9.1-1.4s0-.95-.1-1.4l1.7-1.3-1.8-3.1-2 .8c-.7-.6-1.4-1-2.2-1.3L14.8 3.5h-3.6l-.3 2.2c-.8.3-1.5.7-2.2 1.3l-2-.8-1.8 3.1 1.7 1.3c-.1.45-.1.9-.1 1.4s0 .95.1 1.4l-1.7 1.3 1.8 3.1 2-.8c.7.6 1.4 1 2.2 1.3l.3 2.2h3.6l.3-2.2c.8-.3 1.5-.7 2.2-1.3l2 .8 1.8-3.1-1.7-1.3Z" />
  </svg>
</span>
                    <span>
                      Configuración
                    </span>
                  </button>
                  {/* CERRAR SESIÓN */}
                  <button
                    type="button"
                    className="profile-logout"
                    onClick={() => {
                      setMostrarPerfil(false);
                      cerrarSesion();
                    }}
                  >
                    <span>⇥</span>
                    <span>
                      Cerrar sesión
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        {/* =========================
            INICIO
        ========================= */}
        {seccion === "inicio" && (
          <section className="dashboard-content">
            <div className="dashboard-heading">
              <h1>
                Sistema de Gestión de Información
              </h1>
              <p>
                Bienvenido al panel principal de
                SoftTech Solutions
              </p>
            </div>
            {/* ESTADÍSTICAS COMERCIALES */}
            <div className="stats-grid">
              {[
                { clave: "clientes", titulo: "Clientes registrados", detalle: "Clientes en el sistema", color: "blue", seccion: "clientes", icono: <><circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-4 3-6 7-6s7 2 7 6"/><path d="M16 5a3 3 0 0 1 0 6M18 14c2 .8 3 2.5 3 5"/></> },
                { clave: "proveedores", titulo: "Proveedores", detalle: "Proveedores registrados", color: "green", seccion: "proveedores", icono: <><path d="M3 7h11v11H3z"/><path d="M14 11h4l3 3v4h-7z"/><circle cx="7" cy="19" r="2"/><circle cx="18" cy="19" r="2"/></> },
                { clave: "productos", titulo: "Productos", detalle: "Referencias registradas", color: "purple", seccion: "productos", icono: <><path d="m12 3 9 5-9 5-9-5z"/><path d="M3 8v9l9 5 9-5V8M12 13v9"/></> },
                { clave: "empleados", titulo: "Empleados", detalle: "Empleados y vendedores", color: "orange", seccion: "empleados", icono: <><circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/></> },
                { clave: "facturas", titulo: "Facturas emitidas", detalle: "Operaciones registradas", color: "blue", seccion: "facturas", icono: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6m-6 4h6m-6 4h4"/></> },
                { clave: "pagos", titulo: "Pagos registrados", detalle: "Pagos asociados a facturas", color: "green", seccion: "pagos", icono: <><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20m-15 5h4"/></> },
              ].map((tarjeta) => (
                <button type="button" className="stat-card" key={tarjeta.clave} onClick={() => setSeccion(tarjeta.seccion)} style={{ textAlign: "left", cursor: "pointer", border: "none", width: "100%" }}>
                  <div className={`stat-icon ${tarjeta.color}`}><svg viewBox="0 0 24 24">{tarjeta.icono}</svg></div>
                  <div className="stat-info"><span>{tarjeta.titulo}</span><strong>{cargandoEstadisticas ? "…" : estadisticas[tarjeta.clave]}</strong><small>{tarjeta.detalle}</small></div>
                </button>
              ))}
            </div>
            {/* ACCESOS */}
            <h2 className="section-title">
              Accesos rápidos
            </h2>
            <div className="quick-grid">
              <button
                type="button"
                className="quick-card"
                onClick={() =>
                  setSeccion("usuarios")
                }
              >
                <div className="quick-icon blue">
                  <svg viewBox="0 0 24 24">
                    <circle
                      cx="9"
                      cy="8"
                      r="3.5"
                    />
                    <path d="M2.5 20c0-4 2.8-6.5 6.5-6.5s6.5 2.5 6.5 6.5" />
                    <path d="M19 14v7" />
                    <path d="M15.5 17.5h7" />
                  </svg>
                </div>
                <span>
                  Registrar usuario
                </span>
                <strong>›</strong>
              </button>
              <button
                type="button"
                className="quick-card"
                onClick={() =>
                  setSeccion("informacion")
                }
              >
                <div className="quick-icon purple">
                  <svg viewBox="0 0 24 24">
                    <rect
                      x="5"
                      y="3"
                      width="14"
                      height="18"
                      rx="2"
                    />
                    <path d="M8 8h8" />
                    <path d="M8 12h8" />
                    <path d="M8 16h5" />
                  </svg>
                </div>
                <span>
                  Consultar
                  <br />
                  información
                </span>
                <strong>›</strong>
              </button>
              <button
                type="button"
                className="quick-card"
                onClick={() =>
                  setSeccion("reportes")
                }
              >
                <div className="quick-icon green">
                  <svg viewBox="0 0 24 24">
                    <path d="M5 20V10" />
                    <path d="M12 20V5" />
                    <path d="M19 20v-8" />
                  </svg>
                </div>
                <span>
                  Generar reporte
                </span>
                <strong>›</strong>
              </button>
              <button
                type="button"
                className="quick-card"
                onClick={() =>
                  setSeccion("configuracion")
                }
              >
                <div className="quick-icon orange">
                  ⚙
                </div>
                <span>
                  Configuración
                </span>
                <strong>›</strong>
              </button>
            </div>
            {/* =========================
                ÚLTIMOS REGISTROS
            ========================= */}
            <div className="records-section">
              <div className="records-header">
                <h2>
                  Últimos registros
                </h2>
                <button
                  type="button"
                  onClick={() => setSeccion("usuarios")}
                >
                  Ver todos
                  <span>›</span>
                </button>
              </div>
              <div className="records-card">
                <div className="records-table-wrapper">
                  <table className="records-table">
                    <thead>
                      <tr>
                        <th>
                          Usuario
                        </th>
                        <th>
                          Fecha
                        </th>
                        <th>
                          Tipo de registro
                        </th>
                        <th>
                          Estado
                        </th>
                        <th>
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {ultimosRegistros.length === 0 ? (
                        <tr>
                          <td
                            colSpan="5"
                            className="records-empty"
                          >
                            No hay registros para mostrar.
                          </td>
                        </tr>
                      ) : (
                        ultimosRegistros.map((registro) => (
                          <tr key={registro.id}>

                            <td>
                              {registro.nombre}
                            </td>
                            <td>
                              {formatearFechaRegistro(
                                registro.fecha_registro
                              )}
                            </td>
                            <td>
                              {registro.tipo || "Registro"}
                            </td>
                            <td>
                              <span
                                className={`record-status ${
                                  registro.estado === "Activo" ? "active" : "inactive"
                                }`}
                              >
                                {registro.estado || "Registrado"}
                              </span>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="record-action-button"
                                onClick={() =>
                                  setSeccion(registro.seccion || "usuarios")
                                }
                                title="Abrir módulo"
                              >
                                •••
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        )}
        {/* =========================
            USUARIOS
        ========================= */}
        {seccion === "usuarios" && (
          <GestionUsuarios
            usuarioActual={usuario}
          />
        )}
        {/* =========================
           GESTIÓN DE INFORMACIÓN
        ========================= */}
        {seccion === "informacion" && (
          <GestionInformacion />
        )}
        {/* =========================
            MÓDULOS COMERCIALES
        ========================= */}
        {["proveedores", "clientes", "productos", "empleados", "servicios", "facturas", "pagos"].includes(seccion) && (
          <GestionEmpresarial modulo={seccion} />
        )}
        {/* =========================
            REPORTES
        ========================= */}
        {seccion === "reportes" && (
          <GestionReportes usuarioActual={usuario} />
        )}
        
        {/* =========================
            CONFIGURACIÓN
        ========================= */}
        {seccion === "configuracion" && (
          <Configuracion
            usuario={usuario}
            actualizarUsuario={actualizarUsuario}
          />
        )}
      </main>
    </div>
  );
}
/* ================================
   APP
================================ */
function App() {
  useEffect(() => {
    const temaGuardado =
      localStorage.getItem("softtech_tema") ||
      "claro";

    aplicarTemaVisual(temaGuardado);

    const actualizarTema = (evento) => {
      aplicarTemaVisual(
        evento.detail ||
          localStorage.getItem("softtech_tema") ||
          "claro"
      );
    };

    window.addEventListener(
      "softtech:tema-cambiado",
      actualizarTema
    );

    return () => {
      window.removeEventListener(
        "softtech:tema-cambiado",
        actualizarTema
      );
    };
  }, []);

  const [pantalla, setPantalla] =
    useState("login");
  const [usuarioAutenticado, setUsuarioAutenticado] =
    useState(null);
  if (usuarioAutenticado) {
    return (
      <Dashboard
        usuario={usuarioAutenticado}
        actualizarUsuario={setUsuarioAutenticado}
        cerrarSesion={() =>
          setUsuarioAutenticado(null)
        }
      />
    );
  }
  if (pantalla === "registro") {
    return (
      <Registro
        volverLogin={() =>
          setPantalla("login")
        }
      />
    );
  }
  return (
    <Login
      irRegistro={() =>
        setPantalla("registro")
      }
      iniciarSesion={(usuario) =>
        setUsuarioAutenticado(usuario)
      }
    />
  );
}
export default App;
