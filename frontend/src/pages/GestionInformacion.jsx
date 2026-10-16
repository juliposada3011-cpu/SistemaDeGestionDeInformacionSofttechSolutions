import { useState, useEffect } from "react";
import { agregarNotificacion, formatearFechaSegunPreferencia } from "../utils/softtechUtils.js";
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

export default GestionInformacion;
