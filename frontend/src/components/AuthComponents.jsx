// Iconos SVG reutilizables para autenticación y marca.
export function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon">
      <circle cx="12" cy="7.5" r="3.5" />
      <path d="M4.5 20c0-4.2 3.2-7 7.5-7s7.5 2.8 7.5 7" />
    </svg>
  );
}
export function UserPlusIcon() {
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
export function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon">
      <rect x="5" y="10" width="14" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
export function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  );
}
export function CardIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M7 10h10M7 14h6" />
    </svg>
  );
}
export function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}
export function EyeIcon({ visible }) {
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
export function LoginIcon() {
  return (
    <svg viewBox="0 0 24 24" className="button-icon">
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M13 5h6v14h-6" />
    </svg>
  );
}
export function RegisterIcon() {
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
export function BrandPanel() {
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
