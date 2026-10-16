export const NOTIFICACIONES_KEY =
  "softtech_notificaciones_reales";


export const eliminarNotificacion = (id) => {
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

export const agregarNotificacion = (tipo, mensaje) => {
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
export const SOFTTECH_THEME_STYLE_ID = "softtech-theme-styles";

export const aplicarTemaVisual = (temaActual) => {
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

export const SOFTTECH_LANGUAGE_KEY = "softtech_idioma";

export const softtechTranslations = {
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
};

export const softtechTranslationsReverse = Object.fromEntries(
  Object.entries(softtechTranslations).map(
    ([es, en]) => [en, es]
  )
);

export const traducirValorSoftTech = (valor, idioma) => {
  if (!valor) return valor;
  return idioma === "English"
    ? (softtechTranslations[valor] || valor)
    : (softtechTranslationsReverse[valor] || valor);
};

export const aplicarIdiomaVisual = (idioma) => {
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

export const iniciarIdiomaVisualSoftTech = (idioma) => {
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

export const emitirCambioPreferencias = () => {
  window.dispatchEvent(
    new Event("softtech:preferencias-cambiadas")
  );
};

export const formatearFechaSegunPreferencia = (fecha) => {
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
