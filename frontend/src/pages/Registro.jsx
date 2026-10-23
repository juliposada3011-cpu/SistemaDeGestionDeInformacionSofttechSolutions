import { useState } from "react";
import { UserIcon, UserPlusIcon, LockIcon, CalendarIcon, CardIcon, MailIcon, EyeIcon, LoginIcon, RegisterIcon, BrandPanel } from "../components/AuthComponents";
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

export default Registro;
