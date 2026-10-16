import { useState, useEffect } from "react";
import { agregarNotificacion, formatearFechaSegunPreferencia } from "../utils/softtechUtils.js";
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

export default GestionUsuarios;
