// ======================================
// FORMULARIO DE INICIO DE SESIÓN
// ======================================

const loginForm = document.getElementById("loginForm");
const usuario = document.getElementById("usuario");
const password = document.getElementById("password");
const loginMessage = document.getElementById("loginMessage");


// ======================================
// MOSTRAR / OCULTAR CONTRASEÑA
// ======================================

const togglePassword = document.getElementById("togglePassword");

togglePassword.addEventListener("click", () => {

    const icon = togglePassword.querySelector("i");

    if (password.type === "password") {

        password.type = "text";

        icon.classList.remove("bi-eye");
        icon.classList.add("bi-eye-slash");

    } else {

        password.type = "password";

        icon.classList.remove("bi-eye-slash");
        icon.classList.add("bi-eye");

    }

});


// ======================================
// VALIDACIÓN DEL FORMULARIO
// ======================================

loginForm.addEventListener("submit", (event) => {

    event.preventDefault();

    const usuarioValue = usuario.value.trim();
    const passwordValue = password.value.trim();

    // Limpiar mensaje
    loginMessage.textContent = "";
    loginMessage.style.color = "";


    // Validar usuario
    if (usuarioValue === "") {

        loginMessage.textContent =
            "Por favor, ingrese su usuario o correo electrónico.";

        loginMessage.style.color = "#E53935";

        usuario.focus();

        return;
    }


    // Validar contraseña
    if (passwordValue === "") {

        loginMessage.textContent =
            "Por favor, ingrese su contraseña.";

        loginMessage.style.color = "#E53935";

        password.focus();

        return;
    }


    // Simulación de autenticación
    if (
        usuarioValue === "admin" &&
        passwordValue === "123456"
    ) {

        loginMessage.textContent =
            "Inicio de sesión exitoso.";

        loginMessage.style.color = "#4CAF50";


        // Esperar un momento antes de mostrar el resultado
        setTimeout(() => {

            alert(
                "Bienvenido al Sistema de Gestión de Información de SoftTech Solutions."
            );

        }, 500);

    } else {

        loginMessage.textContent =
            "Las credenciales ingresadas son incorrectas.";

        loginMessage.style.color = "#E53935";

    }

});


// ======================================
// RECUPERAR CONTRASEÑA
// ======================================

const forgotPassword =
    document.getElementById("forgotPassword");

forgotPassword.addEventListener("click", (event) => {

    event.preventDefault();

    alert(
        "La recuperación de contraseña estará disponible próximamente."
    );

});


// ======================================
// REGISTRARSE
// ======================================

const registerButton =
    document.getElementById("registerButton");

registerButton.addEventListener("click", () => {

    alert(
        "La pantalla de registro será desarrollada en una siguiente etapa."
    );

});