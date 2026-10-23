import { useState, useEffect } from "react";

import { NOTIFICACIONES_KEY, eliminarNotificacion, aplicarTemaVisual, SOFTTECH_LANGUAGE_KEY, iniciarIdiomaVisualSoftTech, formatearFechaSegunPreferencia } from "../utils/softtechUtils.js";

import GestionEmpresarial from "../components/GestionEmpresarial.jsx";

import GestionUsuarios from "./GestionUsuarios";

import GestionInformacion from "./GestionInformacion";

import GestionReportes from "./GestionReportes";

import Configuracion from "./Configuracion";

import { Settings, ChevronDown, ChevronRight, Wrench, Truck, CreditCard } from "lucide-react";

function Dashboard({

  usuario,

  actualizarUsuario,

  cerrarSesion,

}) {

  const [seccion, setSeccion] =

    useState("inicio");

  const [grupoEmpresarialAbierto, setGrupoEmpresarialAbierto] = useState(true);

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

          "http\://localhost:3000/api/dashboard/estadisticas"

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

            const respuesta = await fetch(`http\://localhost:3000/api/${fuente.endpoint}`);

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

    {

      id: "inicio",

      nombre: "Inicio",

      icono: (

        <svg viewBox="0 0 24 24">

          <path d="M3 11.5 12 4l9 7.5" />

          <path d="M5.5 10.5V20h13v-9.5" />

          <path d="M9.5 20v-5h5v5" />

        </svg>

      ),

    },

    {

      id: "usuarios",

      nombre: "Gestión de Usuarios",

      icono: (

        <svg viewBox="0 0 24 24">

          <circle cx="9" cy="8" r="3.5" />

          <path d="M2.5 20c0-4 2.8-6.5 6.5-6.5s6.5 2.5 6.5 6.5" />

          <circle cx="17.5" cy="9" r="2.5" />

          <path d="M17 13c2.8.2 4.5 2.2 4.5 5" />

        </svg>

      ),

    },

    

    {

      id: "reportes",

      nombre: "Reportes",

      icono: (

        <svg viewBox="0 0 24 24">

          <path d="M5 20V10" />

          <path d="M12 20V5" />

          <path d="M19 20v-8" />

        </svg>

      ),

    },

    {

      id: "configuracion",

      nombre: "Configuración",

      icono: (

        <svg viewBox="0 0 24 24" className="configuration-gear-icon" aria-hidden="true">

          <path d="M12 8.7a3.3 3.3 0 1 0 0 6.6 3.3 3.3 0 0 0 0-6.6Z" />

          <path d="M19.4 13.4c.1-.45.1-.9-.1-1.4s0-.95.1-1.4l1.7-1.3-1.8-3.1-2 .8c-.7-.6-1.4-1-2.2-1.3L14.8 3.5h-3.6l-.3 2.2c-.8.3-1.5.7-2.2 1.3l-2-.8-1.8 3.1 1.7 1.3c-.1.45-.1.9-.1 1.4s0 .95.1 1.4l-1.7 1.3 1.8 3.1 2-.8c.7.6 1.4 1 2.2 1.3l.3 2.2h3.6l.3-2.2c.8-.3 1.5-.7 2.2-1.3l2 .8 1.8-3.1-1.7-1.3Z" />

        </svg>

      ),

    },

  ];

  const modulosEmpresariales = [
    {

      id: "informacion",

      nombre: "Información general",

      icono: (

        <svg viewBox="0 0 24 24">

          <rect x="5" y="3" width="14" height="18" rx="2" />

          <path d="M8 8h8M8 12h8M8 16h5" />

        </svg>

      ),

    },

    {

      id: "proveedores",

      nombre: "Proveedores",

      icono: <Truck size={16} strokeWidth={2} aria-hidden="true" />,

    },
    {
      id: "clientes",
      nombre: "Clientes",
      icono: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="9" cy="8" r="3.5" />
          <path d="M2 20c0-4 3-6 7-6s7 2 7 6" />
          <path d="M16 5a3 3 0 0 1 0 6M18 14c2 .8 3 2.5 3 5" />
        </svg>
      ),
    },
    { id: "productos",
      nombre: "Productos",

      icono: (

        <svg viewBox="0 0 24 24" aria-hidden="true">

          <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />

          <path d="m4.5 7.7 7.5 4.4 7.5-4.4M12 12.1V21" />

        </svg>

      ),

    },

    {

      id: "empleados",

      nombre: "Empleados y vendedores",

      icono: (

        <svg viewBox="0 0 24 24" aria-hidden="true">

          <circle cx="9" cy="7.5" r="3" />

          <path d="M3.5 19c0-3.5 2.3-5.5 5.5-5.5 1.2 0 2.2.3 3 .8" />

          <circle cx="17" cy="16.5" r="3" />

          <path d="M17 12v1M17 20v1M12.5 16.5h1M20.5 16.5h1" />

        </svg>

      ),

    },

{

  id: "servicios",

  nombre: "Servicios",

  icono: <Wrench size={16} strokeWidth={2} />,

},

    {

      id: "facturas",

      nombre: "Facturación",

      icono: (

        <svg viewBox="0 0 24 24" aria-hidden="true">

          <path d="M6 3h12v18l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5-2 1.5V3Z" />

          <path d="M9 8h6M9 12h6M9 16h4" />

        </svg>

      ),

    },

    {

      id: "pagos",

      nombre: "Pagos",

      icono: <CreditCard size={16} strokeWidth={2} aria-hidden="true" />,

    },

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

          {menu.slice(0, 2).map((item) => (

            <button key={item.id} type="button" className={`sidebar-item ${seccion === item.id ? "active" : ""}`} onClick={() => setSeccion(item.id)}>

              <span className="sidebar-icon">{item.icono}</span>

              <span>{item.nombre}</span>

            </button>

          ))}

          <button type="button" className={`sidebar-item sidebar-group-trigger ${modulosEmpresariales.some((m) => m.id === seccion) ? "active" : ""}`} aria-expanded={grupoEmpresarialAbierto} onClick={() => setGrupoEmpresarialAbierto((abierto) => !abierto)}>

            <span className="sidebar-icon"><svg viewBox="0 0 24 24"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 10h1m4 0h1M9 14h1m4 0h1M10 21v-4h4v4" /></svg></span>

            <span style={{ flex: 1, textAlign: "left" }}>Gestión Empresarial</span>

<span

  aria-hidden="true"

  style={{

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    width: 24,

    height: 24,

    flexShrink: 0,

    color: "white",

    transition: "transform 0.2s ease",

  }}

>

  {grupoEmpresarialAbierto ? (

    <ChevronDown size={20} strokeWidth={2.5} />

  ) : (

    <ChevronRight size={20} strokeWidth={2.5} />

  )}

</span>

          </button>

          {grupoEmpresarialAbierto && (

            <div className="sidebar-submenu" style={{ paddingLeft: 12, margin: "2px 0 8px" }}>

              {modulosEmpresariales.map((item) => (

                <button key={item.id} type="button" className={`sidebar-item sidebar-subitem ${seccion === item.id ? "active" : ""}`} onClick={() => setSeccion(item.id)} style={{ paddingLeft: 18, minHeight: 36 }}>

                  <span className="sidebar-icon" aria-hidden="true">{item.icono}</span>

                  <span>{item.nombre}</span>

                </button>

              ))}

            </div>

          )}

          {menu.slice(2).map((item) => (

            <button key={item.id} type="button" className={`sidebar-item ${seccion === item.id ? "active" : ""}`} onClick={() => setSeccion(item.id)}>

              <span className="sidebar-icon">{item.icono}</span>

              <span>{item.nombre}</span>

            </button>

          ))}

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

                                onClick={() => {

                                  setSeccion(registro.seccion || "usuarios");

                                  if (["clientes", "proveedores", "productos", "empleados", "servicios", "facturas", "pagos"].includes(registro.seccion)) {

                                    setGrupoEmpresarialAbierto(true);

                                  }

                                }}

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

export default Dashboard;
