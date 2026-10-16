import { useState, useEffect } from "react";
import { agregarNotificacion, formatearFechaSegunPreferencia } from "../utils/softtechUtils.js";
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
     DESCARGAR REPORTE
  ================================= */
  const descargarReporte = (reporte) => {
    const filas = [
      ["Campo", "Valor"],

      [
        "Nombre del reporte",
        reporte.nombre_reporte || "",
      ],

      [
        "Tipo de reporte",
        reporte.tipo_reporte || "",
      ],

      [
        "Fecha de generación",
        formatearFecha(
          reporte.fecha_generacion
        ),
      ],

      [
        "Generado por",
        reporte.generado_por || "",
      ],

      [
        "Estado",
        reporte.estado || "",
      ],

      [
        "Descripción",
        reporte.descripcion || "",
      ],
    ];

    const csv = filas
      .map((fila) =>
        fila
          .map(
            (valor) =>
              `"${String(valor).replaceAll(
                '"',
                '""'
              )}"`
          )
          .join(",")
      )
      .join("\n");

    const archivo = new Blob(
      ["\uFEFF" + csv],
      {
        type:
          "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(archivo);

    const enlace =
      document.createElement("a");

    enlace.href = url;

    enlace.download =
      `${
        reporte.nombre_reporte ||
        "reporte"
      }`.replace(
        /[^a-z0-9áéíóúñü]+/gi,
        "_"
      ) + ".csv";

    document.body.appendChild(
      enlace
    );

    enlace.click();

    enlace.remove();

    URL.revokeObjectURL(url);
  };

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
                              onClick={() => {
                                setSeleccionado(
                                  reporte
                                );

                                setMostrarDetalle(
                                  true
                                );
                              }}
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
                  className="report-save-button"
                  onClick={() =>
                    descargarReporte(
                      seleccionado
                    )
                  }
                >
                  Descargar
                </button>

              </div>

            </div>

          </div>
        )}

    </section>
  );
}

export default GestionReportes;
