import { UserIcon, LockIcon, EyeIcon } from "../components/AuthComponents";
import { useState, useEffect, useRef } from "react";
import { aplicarTemaVisual, iniciarIdiomaVisualSoftTech, emitirCambioPreferencias } from "../utils/softtechUtils.js";
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

    const id =
      nombre === "perfil"
        ? "config-perfil"
        : nombre === "seguridad"
        ? "config-seguridad"
        : nombre === "notificaciones"
        ? "config-notificaciones"
        : nombre === "apariencia"
        ? "config-apariencia"
        : "config-preferencias";

    setTimeout(() => {
      document
        .getElementById(id)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  };

  return (
    <section className="dashboard-content configuration-page">

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

export default Configuracion;
