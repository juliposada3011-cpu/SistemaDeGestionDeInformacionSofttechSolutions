import { useState } from "react";
import { UserIcon, LockIcon, EyeIcon, LoginIcon, RegisterIcon, BrandPanel } from "../components/AuthComponents";
function Login({ irRegistro, iniciarSesion }) {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mostrarContrasena, setMostrarContrasena] =
    useState(false);
  const [recordarme, setRecordarme] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
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

export default Login;
