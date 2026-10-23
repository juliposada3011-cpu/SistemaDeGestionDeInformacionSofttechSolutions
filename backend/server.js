const express = require('express');

const cors = require('cors');

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const pool = require('./db');



const app = express();

const PORT = 3000;



// ========================================

// MIDDLEWARES

// ========================================



app.use(cors());

app.use(express.json());



// ========================================

// RUTA PRINCIPAL

// ========================================



app.get('/', (req, res) => {

    res.json({

        mensaje: 'API de SoftTech Solutions funcionando correctamente'

    });

});



// ========================================

// LOGIN

// ========================================



app.post('/api/auth/login', async (req, res) => {

    try {

        const { usuario, contrasena } = req.body;



        if (!usuario || !contrasena) {

            return res.status(400).json({

                mensaje: 'El usuario y la contraseña son obligatorios'

            });

        }



        
const sqlLogin = 'SELECT id_usuario, nombre, apellidos, cedula, fecha_nacimiento, correo, contrasena, rol, estado, fecha_registro FROM usuario WHERE nombre = ? OR correo = ? LIMIT 1';

const [usuarios] = await pool.query(
    sqlLogin,
    [usuario.trim(), usuario.trim()]
);




        if (usuarios.length === 0) {

            return res.status(401).json({

                mensaje: 'Usuario o contraseña incorrectos'

            });

        }



        const user = usuarios[0];



        if (user.estado === 'Inactivo') {

            return res.status(403).json({

                mensaje: 'El usuario se encuentra inactivo'

            });

        }



        const contraseñaCorrecta = await bcrypt.compare(

            contrasena,

            user.contrasena

        );



        if (!contraseñaCorrecta) {

            return res.status(401).json({

                mensaje: 'Usuario o contraseña incorrectos'

            });

        }



        res.json({

            mensaje: 'Inicio de sesión exitoso',

            usuario: {

                id_usuario: user.id_usuario,

                nombre: user.nombre,

                apellidos: user.apellidos,

                cedula: user.cedula,

                fecha_nacimiento: user.fecha_nacimiento,

                correo: user.correo,

                rol: user.rol,

                estado: user.estado,

                fecha_registro: user.fecha_registro

            }

        });



    } catch (error) {

        console.error('Error en el login:', error);



        res.status(500).json({

            mensaje: 'Error interno del servidor'

        });

    }

});



// ========================================

// REGISTRO PÚBLICO

// ========================================




// ========================================
// RECUPERACIÓN SEGURA DE CONTRASEÑA
// ========================================
app.post('/api/auth/solicitar-recuperacion', async (req, res) => {
  try {
    const correo = String(req.body?.correo || '').trim().toLowerCase();
    if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      return res.status(400).json({ mensaje: 'Ingresa un correo electrónico válido.' });
    }
    const [usuarios] = await pool.query(
      'SELECT id_usuario, correo FROM usuario WHERE LOWER(correo) = ? LIMIT 1', [correo]
    );
    if (usuarios.length > 0) {
      if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        return res.status(503).json({ mensaje: 'La recuperación por correo aún no está configurada. Configura SMTP en el backend.' });
      }
      await pool.query('CREATE TABLE IF NOT EXISTS password_reset_tokens (id INT AUTO_INCREMENT PRIMARY KEY, id_usuario INT NOT NULL, token_hash CHAR(64) NOT NULL UNIQUE, expires_at DATETIME NOT NULL, used TINYINT(1) NOT NULL DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX (id_usuario))');
      const token = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const vence = new Date(Date.now() + 30 * 60 * 1000);
      await pool.query('UPDATE password_reset_tokens SET used = 1 WHERE id_usuario = ? AND used = 0', [usuarios[0].id_usuario]);
      await pool.query('INSERT INTO password_reset_tokens (id_usuario, token_hash, expires_at) VALUES (?, ?, ?)', [usuarios[0].id_usuario, tokenHash, vence]);
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587),
        secure: String(process.env.SMTP_SECURE || 'false') === 'true',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      });
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?restablecer=${encodeURIComponent(token)}`;
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER, to: usuarios[0].correo,
        subject: 'Recuperación de contraseña - SoftTech Solutions',
        text: `Abre este enlace en los próximos 30 minutos para crear una nueva contraseña: ${resetUrl}. Si no lo solicitaste, ignora este mensaje.`,
        html: `<p>Solicitaste restablecer tu contraseña de SoftTech Solutions.</p><p><a href="${resetUrl}">Crear nueva contraseña</a></p><p>El enlace vence en 30 minutos y solo se puede usar una vez.</p>`
      });
    }
    return res.json({ mensaje: 'Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña.' });
  } catch (error) {
    console.error('Error al solicitar recuperación:', error);
    return res.status(500).json({ mensaje: 'No fue posible procesar la solicitud de recuperación.' });
  }
});

app.post('/api/auth/restablecer-contrasena', async (req, res) => {
  try {
    const token = String(req.body?.token || '');
    const nueva = String(req.body?.nuevaContrasena || '');
    if (!token || nueva.length < 8 || !/[A-Za-z]/.test(nueva) || !/[0-9]/.test(nueva) || !/[^A-Za-z0-9]/.test(nueva)) {
      return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 8 caracteres, letras, números y un carácter especial.' });
    }
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const [tokens] = await pool.query('SELECT id, id_usuario FROM password_reset_tokens WHERE token_hash = ? AND used = 0 AND expires_at > NOW() LIMIT 1', [tokenHash]);
    if (!tokens.length) return res.status(400).json({ mensaje: 'El enlace venció o ya fue utilizado. Solicita uno nuevo.' });
    const hash = await bcrypt.hash(nueva, 10);
    await pool.query('UPDATE usuario SET contrasena = ? WHERE id_usuario = ?', [hash, tokens[0].id_usuario]);
    await pool.query('UPDATE password_reset_tokens SET used = 1 WHERE id = ?', [tokens[0].id]);
    return res.json({ mensaje: 'Contraseña restablecida correctamente. Ya puedes iniciar sesión.' });
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    return res.status(500).json({ mensaje: 'No fue posible restablecer la contraseña.' });
  }
});

app.post('/api/auth/registro', async (req, res) => {

    try {

        const {

            nombre,

            apellidos,

            cedula,

            fecha_nacimiento,

            correo,

            contrasena

        } = req.body;



        if (

            !nombre ||

            !apellidos ||

            !cedula ||

            !fecha_nacimiento ||

            !correo ||

            !contrasena

        ) {

            return res.status(400).json({

                mensaje: 'Todos los campos son obligatorios'

            });

        }



        // Verificar correo

        const [correoExistente] = await pool.query(

            `SELECT id_usuario

             FROM usuario

             WHERE correo = ?

             LIMIT 1`,

            [correo.trim()]

        );



        if (correoExistente.length > 0) {

            return res.status(409).json({

                mensaje: 'El correo electrónico ya está registrado'

            });

        }



        // Verificar cédula

        const [cedulaExistente] = await pool.query(

            `SELECT id_usuario

             FROM usuario

             WHERE cedula = ?

             LIMIT 1`,

            [cedula.trim()]

        );



        if (cedulaExistente.length > 0) {

            return res.status(409).json({

                mensaje: 'La cédula ya está registrada'

            });

        }



        // Encriptar contraseña

        const contrasenaHash = await bcrypt.hash(

            contrasena,

            10

        );



        // Crear usuario

        const [resultado] = await pool.query(

            `INSERT INTO usuario

            (

                nombre,

                apellidos,

                cedula,

                fecha_nacimiento,

                correo,

                contrasena,

                rol

            )

            VALUES (?, ?, ?, ?, ?, ?, ?)`,

            [

                nombre.trim(),

                apellidos.trim(),

                cedula.trim(),

                fecha_nacimiento,

                correo.trim(),

                contrasenaHash,

                'Usuario'

            ]

        );



        res.status(201).json({

            mensaje: 'Usuario registrado correctamente',

            usuario: {

                id_usuario: resultado.insertId,

                nombre: nombre.trim(),

                apellidos: apellidos.trim(),

                cedula: cedula.trim(),

                fecha_nacimiento,

                correo: correo.trim(),

                rol: 'Usuario',

                estado: 'Activo'

            }

        });



    } catch (error) {

        console.error('Error en el registro:', error);



        res.status(500).json({

            mensaje: 'Error interno del servidor'

        });

    }

});



// ========================================

// LISTAR USUARIOS

// ========================================



app.get('/api/usuarios', async (req, res) => {

    try {

        const [usuarios] = await pool.query(

            `SELECT

                id_usuario,

                nombre,

                apellidos,

                cedula,

                fecha_nacimiento,

                correo,

                rol,

                estado,

                fecha_registro

             FROM usuario

             ORDER BY id_usuario DESC`

        );



        res.json(usuarios);



    } catch (error) {

        console.error(

            'Error al listar usuarios:',

            error

        );



        res.status(500).json({

            mensaje:

                'No fue posible consultar los usuarios'

        });

    }

});



// ========================================

// CREAR USUARIO DESDE DASHBOARD

// ========================================



app.post('/api/usuarios', async (req, res) => {

    try {

        const {

            nombre,

            apellidos,

            cedula,

            fecha_nacimiento,

            correo,

            contrasena,

            rol,

            estado

        } = req.body;



        // Validar campos

        if (

            !nombre ||

            !apellidos ||

            !cedula ||

            !fecha_nacimiento ||

            !correo ||

            !contrasena ||

            !rol ||

            !estado

        ) {

            return res.status(400).json({

                mensaje:

                    'Todos los campos son obligatorios'

            });

        }



        // Verificar correo

        const [correoExistente] = await pool.query(

            `SELECT id_usuario

             FROM usuario

             WHERE correo = ?

             LIMIT 1`,

            [correo.trim()]

        );



        if (correoExistente.length > 0) {

            return res.status(409).json({

                mensaje:

                    'El correo electrónico ya está registrado'

            });

        }



        // Verificar cédula

        const [cedulaExistente] = await pool.query(

            `SELECT id_usuario

             FROM usuario

             WHERE cedula = ?

             LIMIT 1`,

            [cedula.trim()]

        );



        if (cedulaExistente.length > 0) {

            return res.status(409).json({

                mensaje:

                    'La cédula ya está registrada'

            });

        }



        // Encriptar contraseña

        const contrasenaHash =

            await bcrypt.hash(contrasena, 10);



        // Insertar

        const [resultado] = await pool.query(

            `INSERT INTO usuario

            (

                nombre,

                apellidos,

                cedula,

                fecha_nacimiento,

                correo,

                contrasena,

                rol,

                estado

            )

            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,

            [

                nombre.trim(),

                apellidos.trim(),

                cedula.trim(),

                fecha_nacimiento,

                correo.trim(),

                contrasenaHash,

                rol,

                estado

            ]

        );



        res.status(201).json({

            mensaje:

                'Usuario creado correctamente',

            usuario: {

                id_usuario: resultado.insertId,

                nombre: nombre.trim(),

                apellidos: apellidos.trim(),

                cedula: cedula.trim(),

                fecha_nacimiento,

                correo: correo.trim(),

                rol,

                estado

            }

        });



    } catch (error) {

        console.error(

            'Error al crear usuario:',

            error

        );



        res.status(500).json({

            mensaje:

                'No fue posible crear el usuario'

        });

    }

});



// ========================================

// ACTUALIZAR USUARIO

// ========================================



app.put('/api/usuarios/:id', async (req, res) => {

    try {

        const id = Number(req.params.id);



        const {

            nombre,

            apellidos,

            cedula,

            fecha_nacimiento,

            correo,

            contrasena,

            rol,

            estado

        } = req.body;



        if (!id) {

            return res.status(400).json({

                mensaje: 'ID de usuario inválido'

            });

        }



        if (

            !nombre ||

            !apellidos ||

            !cedula ||

            !fecha_nacimiento ||

            !correo ||

            !rol ||

            !estado

        ) {

            return res.status(400).json({

                mensaje:

                    'Todos los campos son obligatorios'

            });

        }



        // Verificar correo de otro usuario

        const [correoExistente] = await pool.query(

            `SELECT id_usuario

             FROM usuario

             WHERE correo = ?

             AND id_usuario <> ?

             LIMIT 1`,

            [

                correo.trim(),

                id

            ]

        );



        if (correoExistente.length > 0) {

            return res.status(409).json({

                mensaje:

                    'El correo electrónico ya está registrado'

            });

        }



        // Verificar cédula de otro usuario

        const [cedulaExistente] = await pool.query(

            `SELECT id_usuario

             FROM usuario

             WHERE cedula = ?

             AND id_usuario <> ?

             LIMIT 1`,

            [

                cedula.trim(),

                id

            ]

        );



        if (cedulaExistente.length > 0) {

            return res.status(409).json({

                mensaje:

                    'La cédula ya está registrada'

            });

        }



        // Actualizar con o sin contraseña

        if (contrasena && contrasena.trim()) {



            const contrasenaHash =

                await bcrypt.hash(

                    contrasena,

                    10

                );



            await pool.query(

                `UPDATE usuario

                 SET

                    nombre = ?,

                    apellidos = ?,

                    cedula = ?,

                    fecha_nacimiento = ?,

                    correo = ?,

                    contrasena = ?,

                    rol = ?,

                    estado = ?

                 WHERE id_usuario = ?`,

                [

                    nombre.trim(),

                    apellidos.trim(),

                    cedula.trim(),

                    fecha_nacimiento,

                    correo.trim(),

                    contrasenaHash,

                    rol,

                    estado,

                    id

                ]

            );



        } else {



            await pool.query(

                `UPDATE usuario

                 SET

                    nombre = ?,

                    apellidos = ?,

                    cedula = ?,

                    fecha_nacimiento = ?,

                    correo = ?,

                    rol = ?,

                    estado = ?

                 WHERE id_usuario = ?`,

                [

                    nombre.trim(),

                    apellidos.trim(),

                    cedula.trim(),

                    fecha_nacimiento,

                    correo.trim(),

                    rol,

                    estado,

                    id

                ]

            );

        }



        res.json({

            mensaje:

                'Usuario actualizado correctamente'

        });



    } catch (error) {

        console.error(

            'Error al actualizar usuario:',

            error

        );



        res.status(500).json({

            mensaje:

                'No fue posible actualizar el usuario'

        });

    }

});



// ========================================



// ACTUALIZAR PERFIL DESDE CONFIGURACIÓN



// ========================================



app.put('/api/usuarios/:id/perfil', async (req, res) => {

    try {

        const id = Number(req.params.id);



        const {

            nombre,

            apellidos,

            correo

        } = req.body;



        if (!Number.isInteger(id) || id <= 0) {

            return res.status(400).json({

                mensaje: 'Identificador de usuario inválido'

            });

        }



        if (!nombre || !nombre.trim()) {

            return res.status(400).json({

                mensaje: 'El nombre es obligatorio'

            });

        }



        if (!correo || !correo.trim()) {

            return res.status(400).json({

                mensaje: 'El correo electrónico es obligatorio'

            });

        }



        const [usuarios] = await pool.query(

            `SELECT id_usuario

             FROM usuario

             WHERE id_usuario = ?

             LIMIT 1`,

            [id]

        );



        if (usuarios.length === 0) {

            return res.status(404).json({

                mensaje: 'El usuario no existe'

            });

        }



        const [correoDuplicado] = await pool.query(

            `SELECT id_usuario

             FROM usuario

             WHERE correo = ?

             AND id_usuario <> ?

             LIMIT 1`,

            [

                correo.trim(),

                id

            ]

        );



        if (correoDuplicado.length > 0) {

            return res.status(409).json({

                mensaje: 'El correo electrónico ya está registrado por otro usuario'

            });

        }



        await pool.query(

            `UPDATE usuario

             SET nombre = ?,

                 apellidos = ?,

                 correo = ?

             WHERE id_usuario = ?`,

            [

                nombre.trim(),

                (apellidos || '').trim(),

                correo.trim(),

                id

            ]

        );



        res.json({

            mensaje: 'Perfil actualizado correctamente'

        });



    } catch (error) {



        console.error(

            'Error al actualizar perfil:',

            error

        );



        res.status(500).json({

            mensaje: 'No fue posible actualizar el perfil'

        });

    }

});



// ========================================

// CAMBIAR CONTRASEÑA

// ========================================



app.put('/api/usuarios/:id/cambiar-contrasena', async (req, res) => {

    try {

        const id = Number(req.params.id);



        const {

            contrasenaActual,

            nuevaContrasena

        } = req.body;



        // Validar ID

        if (!Number.isInteger(id) || id <= 0) {

            return res.status(400).json({

                mensaje: 'Identificador de usuario inválido'

            });

        }



        // Validar contraseñas

        if (!contrasenaActual || !nuevaContrasena) {

            return res.status(400).json({

                mensaje: 'La contraseña actual y la nueva contraseña son obligatorias'

            });

        }



        // Mínimo 8 caracteres

        if (nuevaContrasena.length < 8) {

            return res.status(400).json({

                mensaje: 'La nueva contraseña debe tener al menos 8 caracteres'

            });

        }



        // Debe contener una letra

        if (!/[A-Za-z]/.test(nuevaContrasena)) {

            return res.status(400).json({

                mensaje: 'La contraseña debe contener al menos una letra'

            });

        }



        // Debe contener un número

        if (!/[0-9]/.test(nuevaContrasena)) {

            return res.status(400).json({

                mensaje: 'La contraseña debe contener al menos un número'

            });

        }



        // Debe contener un carácter especial

        if (!/[^A-Za-z0-9]/.test(nuevaContrasena)) {

            return res.status(400).json({

                mensaje: 'La contraseña debe contener al menos un carácter especial'

            });

        }



        // Buscar usuario

        const [usuarios] = await pool.query(

            `SELECT id_usuario, contrasena

             FROM usuario

             WHERE id_usuario = ?

             LIMIT 1`,

            [id]

        );



        if (usuarios.length === 0) {

            return res.status(404).json({

                mensaje: 'El usuario no existe'

            });

        }



        const usuario = usuarios[0];



        // Comprobar contraseña actual

        const contraseñaCorrecta = await bcrypt.compare(

            contrasenaActual,

            usuario.contrasena

        );



        if (!contraseñaCorrecta) {

            return res.status(401).json({

                mensaje: 'La contraseña actual es incorrecta'

            });

        }



        // Encriptar nueva contraseña

        const nuevaContrasenaHash = await bcrypt.hash(

            nuevaContrasena,

            10

        );



        // Actualizar contraseña en MySQL

        await pool.query(

            `UPDATE usuario

             SET contrasena = ?

             WHERE id_usuario = ?`,

            [

                nuevaContrasenaHash,

                id

            ]

        );



        res.json({

            mensaje: 'Contraseña actualizada correctamente'

        });



    } catch (error) {



        console.error(

            'Error al cambiar contraseña:',

            error

        );



        res.status(500).json({

            mensaje: 'No fue posible actualizar la contraseña'

        });

    }

});



// ========================================

// ELIMINAR USUARIO

// ========================================



app.delete('/api/usuarios/:id', async (req, res) => {

    try {

        const id = Number(req.params.id);



        if (!id) {

            return res.status(400).json({

                mensaje: 'ID de usuario inválido'

            });

        }



        // Verificar que exista

        const [usuarios] = await pool.query(

            `SELECT id_usuario

             FROM usuario

             WHERE id_usuario = ?

             LIMIT 1`,

            [id]

        );



        if (usuarios.length === 0) {

            return res.status(404).json({

                mensaje:

                    'El usuario no existe'

            });

        }



        await pool.query(

            `DELETE FROM usuario

             WHERE id_usuario = ?`,

            [id]

        );



        res.json({

            mensaje:

                'Usuario eliminado correctamente'

        });



    } catch (error) {

        console.error(

            'Error al eliminar usuario:',

            error

        );



        // Error de clave foránea

        if (error.code === 'ER_ROW_IS_REFERENCED_2') {

            return res.status(409).json({

                mensaje:

                    'No se puede eliminar este usuario porque tiene información relacionada en el sistema.'

            });

        }



        res.status(500).json({

            mensaje:

                'No fue posible eliminar el usuario'

        });

    }

});



// ========================================

// GESTIÓN DE INFORMACIÓN

// ========================================



// CONSULTAR INFORMACIÓN

app.get('/api/informacion', async (req, res) => {

    try {

        const [informacion] = await pool.query(

            `SELECT

                id_informacion,

                titulo,

                descripcion,

                categoria,

                fecha_registro,

                estado

             FROM informacion

             ORDER BY id_informacion DESC`

        );



        res.json(informacion);



    } catch (error) {

        console.error(

            'Error al consultar información:',

            error

        );



        res.status(500).json({

            mensaje:

                'No fue posible consultar la información'

        });

    }

});





// REGISTRAR INFORMACIÓN

app.post('/api/informacion', async (req, res) => {

    try {

        const {

            titulo,

            descripcion,

            categoria,

            fecha_registro,

            estado

        } = req.body;



        if (

            !titulo ||

            !descripcion ||

            !categoria ||

            !fecha_registro ||

            !estado

        ) {

            return res.status(400).json({

                mensaje:

                    'Todos los campos son obligatorios'

            });

        }



        const [resultado] = await pool.query(

            `INSERT INTO informacion

            (

                titulo,

                descripcion,

                categoria,

                fecha_registro,

                estado

            )

            VALUES (?, ?, ?, ?, ?)`,

            [

                titulo.trim(),

                descripcion.trim(),

                categoria.trim(),

                fecha_registro,

                estado

            ]

        );



        res.status(201).json({

            mensaje:

                'Información registrada correctamente',

            informacion: {

                id_informacion: resultado.insertId,

                titulo: titulo.trim(),

                descripcion: descripcion.trim(),

                categoria: categoria.trim(),

                fecha_registro,

                estado

            }

        });



    } catch (error) {

        console.error(

            'Error al registrar información:',

            error

        );



        res.status(500).json({

            mensaje:

                'No fue posible registrar la información'

        });

    }

});





// ACTUALIZAR INFORMACIÓN

app.put('/api/informacion/:id', async (req, res) => {

    try {

        const id = Number(req.params.id);



        const {

            titulo,

            descripcion,

            categoria,

            fecha_registro,

            estado

        } = req.body;



        if (!id) {

            return res.status(400).json({

                mensaje:

                    'ID de información inválido'

            });

        }



        if (

            !titulo ||

            !descripcion ||

            !categoria ||

            !fecha_registro ||

            !estado

        ) {

            return res.status(400).json({

                mensaje:

                    'Todos los campos son obligatorios'

            });

        }



        const [resultado] = await pool.query(

            `UPDATE informacion

             SET

                titulo = ?,

                descripcion = ?,

                categoria = ?,

                fecha_registro = ?,

                estado = ?

             WHERE id_informacion = ?`,

            [

                titulo.trim(),

                descripcion.trim(),

                categoria.trim(),

                fecha_registro,

                estado,

                id

            ]

        );



        if (resultado.affectedRows === 0) {

            return res.status(404).json({

                mensaje:

                    'La información no existe'

            });

        }



        res.json({

            mensaje:

                'Información actualizada correctamente'

        });



    } catch (error) {

        console.error(

            'Error al actualizar información:',

            error

        );



        res.status(500).json({

            mensaje:

                'No fue posible actualizar la información'

        });

    }

});





// ELIMINAR INFORMACIÓN

app.delete('/api/informacion/:id', async (req, res) => {

    try {

        const id = Number(req.params.id);



        if (!id) {

            return res.status(400).json({

                mensaje:

                    'ID de información inválido'

            });

        }



        const [resultado] = await pool.query(

            `DELETE FROM informacion

             WHERE id_informacion = ?`,

            [id]

        );



        if (resultado.affectedRows === 0) {

            return res.status(404).json({

                mensaje:

                    'La información no existe'

            });

        }



        res.json({

            mensaje:

                'Información eliminada correctamente'

        });



    } catch (error) {

        console.error(

            'Error al eliminar información:',

            error

        );



        res.status(500).json({

            mensaje:

                'No fue posible eliminar la información'

        });

    }

});



// ========================================

// CONSULTAR REPORTES

// ========================================



app.get('/api/reportes', async (req, res) => {

    try {



        const {

            tipo,

            fecha_inicio,

            fecha_fin

        } = req.query;



        let consulta = `

            SELECT

                r.id_reporte,

                r.nombre_reporte,

                r.tipo_reporte,

                r.fecha_generacion,

                r.descripcion,

                r.estado,

                r.id_usuario,

                CONCAT(

                    COALESCE(u.nombre, ''),

                    CASE

                        WHEN COALESCE(u.apellidos, '') <> ''

                        THEN CONCAT(' ', u.apellidos)

                        ELSE ''

                    END

                ) AS generado_por



            FROM reporte r



            LEFT JOIN usuario u

                ON u.id_usuario = r.id_usuario



            WHERE 1 = 1

        `;



        const parametros = [];



        // FILTRO POR TIPO

        if (tipo && tipo !== 'Todos') {



            consulta += `

                AND r.tipo_reporte = ?

            `;



            parametros.push(tipo);

        }



        // FILTRO FECHA INICIO

        if (fecha_inicio) {



            consulta += `

                AND DATE(r.fecha_generacion) >= ?

            `;



            parametros.push(fecha_inicio);

        }



        // FILTRO FECHA FIN

        if (fecha_fin) {



            consulta += `

                AND DATE(r.fecha_generacion) <= ?

            `;



            parametros.push(fecha_fin);

        }



        consulta += `

            ORDER BY r.id_reporte DESC

        `;



        const [reportes] =

            await pool.query(

                consulta,

                parametros

            );



        res.json(reportes);



    } catch (error) {



        console.error(

            'Error al consultar reportes:',

            error

        );



        res.status(500).json({

            mensaje:

                'No fue posible consultar los reportes'

        });

    }

});





// ========================================

// GENERAR REPORTE

// ========================================



app.post('/api/reportes', async (req, res) => {



    try {



        const {

            nombre_reporte,

            tipo_reporte,

            descripcion,

            estado,

            id_usuario

        } = req.body;





        // VALIDAR CAMPOS

        if (

            !nombre_reporte ||

            !tipo_reporte

        ) {



            return res.status(400).json({

                mensaje:

                    'El nombre y el tipo de reporte son obligatorios'

            });

        }





        // OBTENER USUARIO

        let usuarioId =

            Number(id_usuario);





        if (

            !Number.isInteger(usuarioId) ||

            usuarioId <= 0

        ) {



            const [usuarios] =

                await pool.query(`

                    SELECT id_usuario

                    FROM usuario

                    WHERE estado = 'Activo'

                    ORDER BY id_usuario ASC

                    LIMIT 1

                `);





            if (usuarios.length === 0) {



                return res.status(400).json({

                    mensaje:

                        'No existe un usuario activo para asociar el reporte'

                });

            }





            usuarioId =

                usuarios[0].id_usuario;

        }





        // ESTADOS PERMITIDOS

        const estadosPermitidos = [

            'Finalizado',

            'En proceso',

            'Inactivo'

        ];





        const estadoFinal =

            estadosPermitidos.includes(estado)

                ? estado

                : 'Finalizado';





        // INSERTAR REPORTE

        const [resultado] =

            await pool.query(

                `

                INSERT INTO reporte

                (

                    nombre_reporte,

                    tipo_reporte,

                    fecha_generacion,

                    descripcion,

                    estado,

                    id_usuario

                )



                VALUES (?, ?, NOW(), ?, ?, ?)

                `,

                [

                    nombre_reporte.trim(),

                    tipo_reporte.trim(),

                    descripcion

                        ? descripcion.trim()

                        : null,

                    estadoFinal,

                    usuarioId

                ]

            );





        res.status(201).json({



            mensaje:

                'Reporte generado correctamente',



            id_reporte:

                resultado.insertId



        });



    } catch (error) {



        console.error(

            'Error al generar reporte:',

            error

        );



        res.status(500).json({

            mensaje:

                'No fue posible generar el reporte'

        });

    }

});





// ========================================

// ELIMINAR REPORTE

// ========================================



app.delete('/api/reportes/:id', async (req, res) => {



    try {



        const id =

            Number(req.params.id);





        if (

            !Number.isInteger(id) ||

            id <= 0

        ) {



            return res.status(400).json({

                mensaje:

                    'Identificador de reporte inválido'

            });

        }





        const [resultado] =

            await pool.query(

                `

                DELETE FROM reporte

                WHERE id_reporte = ?

                `,

                [id]

            );





        if (

            resultado.affectedRows === 0

        ) {



            return res.status(404).json({

                mensaje:

                    'El reporte no existe'

            });

        }





        res.json({

            mensaje:

                'Reporte eliminado correctamente'

        });



    } catch (error) {



        console.error(

            'Error al eliminar reporte:',

            error

        );



        res.status(500).json({

            mensaje:

                'No fue posible eliminar el reporte'

        });

    }

});



// ========================================

// ESTADÍSTICAS DEL DASHBOARD

// ========================================



app.get('/api/dashboard/estadisticas', async (req, res) => {
    try {
        const contar = async (tabla) => {
            try {
                const [[fila]] = await pool.query(`SELECT COUNT(*) AS total FROM \`${tabla}\``);
                return Number(fila.total) || 0;
            } catch (error) {
                return 0;
            }
        };

        const [usuarios, informacion, reportes, clientes, proveedores, productos, empleados, facturas, pagos] = await Promise.all([
            contar('usuario'), contar('informacion'), contar('reporte'),
            contar('cliente'), contar('proveedor'), contar('producto'),
            contar('empleado'), contar('factura'), contar('pago')
        ]);

        res.json({ usuarios, informacion, reportes, clientes, proveedores, productos, empleados, facturas, pagos });
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        res.status(500).json({ mensaje: 'No fue posible cargar las estadísticas' });
    }
});


// ========================================

// MÓDULOS COMERCIALES: CRUD Y FACTURACIÓN

// ========================================

const entidadesComerciales = {

  clientes: { tabla: 'cliente', id: 'id_cliente', campos: ['documento','nombres','apellidos','telefono','correo','direccion'], obligatorios: ['documento','nombres','apellidos','telefono','correo','direccion'] },

  empleados: { tabla: 'empleado', id: 'id_empleado', campos: ['documento','nombres','apellidos','tipo_personal','cargo','telefono','correo'], obligatorios: ['documento','nombres','apellidos','tipo_personal','cargo','telefono','correo'] },

  productos: { tabla: 'producto', id: 'id_producto', campos: ['nombre','descripcion','precio','stock','id_proveedor','categoria'], obligatorios: ['nombre','precio','stock'] },

  servicios: { tabla: 'servicio', id: 'id_servicio', campos: ['nombre','descripcion','precio'], obligatorios: ['nombre','precio'] },

  proveedores: { tabla: 'proveedor', id: 'id_proveedor', campos: ['nit','nombre','contacto','telefono','correo','direccion'], obligatorios: ['nit','nombre','telefono','correo'] },

  pagos: { tabla: 'pago', id: 'id_pago', campos: ['fecha_pago','metodo_pago','valor_pagado','id_factura'], obligatorios: ['fecha_pago','metodo_pago','valor_pagado','id_factura'] }

};



// Crear tabla de proveedores y campos complementarios si la BD aún no los tiene.

app.post('/api/sistema/preparar-esquema', async (_req, res) => {

  try {

    await pool.query(`CREATE TABLE IF NOT EXISTS proveedor (

      id_proveedor INT NOT NULL AUTO_INCREMENT PRIMARY KEY,

      nit VARCHAR(30) NOT NULL UNIQUE,

      nombre VARCHAR(150) NOT NULL,

      contacto VARCHAR(100) NULL,

      telefono VARCHAR(30) NOT NULL,

      correo VARCHAR(150) NOT NULL,

      direccion VARCHAR(200) NULL,

      fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP

    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    // Distinguir empleados y vendedores sin perder los registros existentes.
        // Los registros anteriores se consideran vendedores para conservar su uso en facturación.
        const [columnasEmpleado] = await pool.query('SHOW COLUMNS FROM empleado');
        const nombresColumnasEmpleado = columnasEmpleado.map(c => c.Field);
        if (!nombresColumnasEmpleado.includes('tipo_personal')) {
            await pool.query("ALTER TABLE empleado ADD COLUMN tipo_personal ENUM('Empleado','Vendedor') NOT NULL DEFAULT 'Vendedor'");
        }

        const [cols] = await pool.query("SHOW COLUMNS FROM producto");

    const names = cols.map(c => c.Field);

    if (!names.includes('id_proveedor')) await pool.query('ALTER TABLE producto ADD COLUMN id_proveedor INT NULL');

    if (!names.includes('categoria')) await pool.query('ALTER TABLE producto ADD COLUMN categoria VARCHAR(100) NULL');

    const [fk] = await pool.query("SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME='producto' AND COLUMN_NAME='id_proveedor' AND REFERENCED_TABLE_NAME='proveedor'");

    if (!fk.length) {

      try { await pool.query('ALTER TABLE producto ADD CONSTRAINT fk_producto_proveedor FOREIGN KEY (id_proveedor) REFERENCES proveedor(id_proveedor) ON DELETE SET NULL'); } catch (e) { if (e.code !== 'ER_DUP_KEYNAME') throw e; }

    }

    res.json({ mensaje: 'Esquema comercial preparado correctamente' });

  } catch (error) {

    console.error('Preparación de esquema:', error);

    res.status(500).json({ mensaje: 'No fue posible preparar el esquema comercial' });

  }

});



for (const [recurso, cfg] of Object.entries(entidadesComerciales)) {

  app.get(`/api/${recurso}`, async (_req, res) => {

    try {

      const [rows] = await pool.query(`SELECT * FROM ${cfg.tabla} ORDER BY ${cfg.id} DESC`);

      res.json(rows);

    } catch (error) {

      console.error(`GET ${recurso}:`, error);

      res.status(500).json({ mensaje: `No fue posible consultar ${recurso}. Si es la primera ejecución, reinicia el esquema desde el endpoint indicado en README.` });

    }

  });

  app.post(`/api/${recurso}`, async (req, res) => {

    try {

      const body = req.body || {};

      const faltantes = cfg.obligatorios.filter(c => body[c] === undefined || body[c] === null || String(body[c]).trim() === '');

      if (faltantes.length) return res.status(400).json({ mensaje: `Campos obligatorios: ${faltantes.join(', ')}` });

      if (['productos','servicios','pagos'].includes(recurso) && (!Number.isFinite(Number(body.precio ?? body.valor_pagado)) || Number(body.precio ?? body.valor_pagado) < 0)) return res.status(400).json({ mensaje: 'El valor debe ser un número igual o mayor que cero' });

      const fields = cfg.campos.filter(c => body[c] !== undefined);

      const values = fields.map(c => body[c] === '' ? null : body[c]);

      const [result] = await pool.query(`INSERT INTO ${cfg.tabla} (${fields.join(',')}) VALUES (${fields.map(()=>'?').join(',')})`, values);

      const [rows] = await pool.query(`SELECT * FROM ${cfg.tabla} WHERE ${cfg.id}=?`, [result.insertId]);

      res.status(201).json(rows[0]);

    } catch (error) {

      console.error(`POST ${recurso}:`, error);

      res.status(error.code === 'ER_DUP_ENTRY' ? 409 : 500).json({ mensaje: error.code === 'ER_DUP_ENTRY' ? 'Ya existe un registro con ese identificador.' : `No fue posible crear el registro de ${recurso}.` });

    }

  });

  app.put(`/api/${recurso}/:id`, async (req, res) => {

    try {

      const body = req.body || {};

      const fields = cfg.campos.filter(c => body[c] !== undefined);

      if (!fields.length) return res.status(400).json({ mensaje: 'No hay campos para actualizar' });

      const [result] = await pool.query(`UPDATE ${cfg.tabla} SET ${fields.map(c=>`${c}=?`).join(',')} WHERE ${cfg.id}=?`, [...fields.map(c=>body[c] === '' ? null : body[c]), req.params.id]);

      if (!result.affectedRows) return res.status(404).json({ mensaje: 'Registro no encontrado' });

      const [rows] = await pool.query(`SELECT * FROM ${cfg.tabla} WHERE ${cfg.id}=?`, [req.params.id]);

      res.json(rows[0]);

    } catch (error) {

      console.error(`PUT ${recurso}:`, error);

      res.status(error.code === 'ER_DUP_ENTRY' ? 409 : 500).json({ mensaje: error.code === 'ER_DUP_ENTRY' ? 'El identificador ya está registrado.' : 'No fue posible actualizar el registro.' });

    }

  });

  app.delete(`/api/${recurso}/:id`, async (req, res) => {

    try {

      const [result] = await pool.query(`DELETE FROM ${cfg.tabla} WHERE ${cfg.id}=?`, [req.params.id]);

      if (!result.affectedRows) return res.status(404).json({ mensaje: 'Registro no encontrado' });

      res.json({ mensaje: 'Registro eliminado correctamente' });

    } catch (error) {

      console.error(`DELETE ${recurso}:`, error);

      res.status(error.code === 'ER_ROW_IS_REFERENCED_2' ? 409 : 500).json({ mensaje: error.code === 'ER_ROW_IS_REFERENCED_2' ? 'No se puede eliminar: el registro está relacionado con facturas u otros datos.' : 'No fue posible eliminar el registro.' });

    }

  });

}



app.get('/api/facturas', async (_req, res) => {
  try {
    const sql = `
      SELECT
        f.*,
        CONCAT(c.nombres, ' ', c.apellidos) AS cliente,
        CONCAT(e.nombres, ' ', e.apellidos) AS empleado,
        COALESCE(di.cantidad_items, 0) AS cantidad_items
      FROM factura AS f
      INNER JOIN cliente AS c ON c.id_cliente = f.id_cliente
      INNER JOIN empleado AS e ON e.id_empleado = f.id_empleado
      LEFT JOIN (
        SELECT id_factura, COUNT(*) AS cantidad_items
        FROM detalle_factura
        GROUP BY id_factura
      ) AS di ON di.id_factura = f.id_factura
      ORDER BY f.id_factura DESC
    `;

    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (error) {
    console.error('GET facturas:', error);
    res.status(500).json({ mensaje: 'No fue posible consultar facturas' });
  }
});

app.get('/api/facturas/:id', async (req, res) => {

  try {

    const [facturas] = await pool.query(`SELECT f.*, CONCAT(c.nombres,' ',c.apellidos) AS cliente, CONCAT(e.nombres,' ',e.apellidos) AS empleado FROM factura f JOIN cliente c ON c.id_cliente=f.id_cliente JOIN empleado e ON e.id_empleado=f.id_empleado WHERE f.id_factura=?`, [req.params.id]);

    if (!facturas.length) return res.status(404).json({ mensaje: 'Factura no encontrada' });

    const [detalles] = await pool.query(`SELECT d.*, p.nombre AS producto, s.nombre AS servicio FROM detalle_factura d LEFT JOIN producto p ON p.id_producto=d.id_producto LEFT JOIN servicio s ON s.id_servicio=d.id_servicio WHERE d.id_factura=?`, [req.params.id]);

    res.json({ ...facturas[0], detalles });

  } catch (error) { console.error('GET factura:', error); res.status(500).json({ mensaje: 'No fue posible consultar la factura' }); }

});

app.post('/api/facturas', async (req, res) => {

  const conn = await pool.getConnection();

  try {

    const { fecha, id_cliente, id_empleado, impuesto = 0, items = [] } = req.body || {};

    if (!fecha || !id_cliente || !id_empleado || !Array.isArray(items) || !items.length) return res.status(400).json({ mensaje: 'Selecciona fecha, cliente, vendedor y al menos un producto o servicio.' });

    await conn.beginTransaction();

    const [vendedoresValidos] = await conn.query(
      "SELECT id_empleado FROM empleado WHERE id_empleado = ? AND tipo_personal = 'Vendedor' LIMIT 1",
      [id_empleado]
    );
    if (!vendedoresValidos.length) throw new Error('Selecciona un registro identificado como vendedor para la factura.');

    let subtotal = 0;

    const lineas = [];

    for (const item of items) {

      const cantidad = Number(item.cantidad);

      if (!Number.isInteger(cantidad) || cantidad < 1) throw new Error('La cantidad debe ser un entero mayor que cero.');

      let precio, id_producto = null, id_servicio = null;

      if (item.tipo === 'servicio') {

        const [rows] = await conn.query('SELECT precio FROM servicio WHERE id_servicio=?', [item.id]);

        if (!rows.length) throw new Error('Uno de los servicios seleccionados no existe.');

        precio = Number(rows[0].precio); id_servicio = Number(item.id);

      } else {

        const [rows] = await conn.query('SELECT precio, stock FROM producto WHERE id_producto=? FOR UPDATE', [item.id]);

        if (!rows.length) throw new Error('Uno de los productos seleccionados no existe.');

        if (Number(rows[0].stock) < cantidad) throw new Error('Existencias insuficientes para uno de los productos.');

        precio = Number(rows[0].precio); id_producto = Number(item.id);

        await conn.query('UPDATE producto SET stock=stock-? WHERE id_producto=?', [cantidad, item.id]);

      }

      const parcial = Math.round(precio * cantidad * 100) / 100;

      subtotal += parcial; lineas.push({ cantidad, precio, parcial, id_producto, id_servicio });

    }

    subtotal = Math.round(subtotal * 100) / 100;

    const valorImpuesto = Number(impuesto);

    if (!Number.isFinite(valorImpuesto) || valorImpuesto < 0) throw new Error('El impuesto debe ser cero o mayor.');

    const total = Math.round((subtotal + valorImpuesto) * 100) / 100;

    const [result] = await conn.query('INSERT INTO factura (fecha, subtotal, impuesto, total, id_cliente, id_empleado) VALUES (?,?,?,?,?,?)', [fecha, subtotal, valorImpuesto, total, id_cliente, id_empleado]);

    for (const l of lineas) await conn.query('INSERT INTO detalle_factura (cantidad, precio_unitario, subtotal, id_factura, id_producto, id_servicio) VALUES (?,?,?,?,?,?)', [l.cantidad, l.precio, l.parcial, result.insertId, l.id_producto, l.id_servicio]);

    await conn.commit();

    res.status(201).json({ mensaje: 'Factura creada correctamente', id_factura: result.insertId, subtotal, impuesto: valorImpuesto, total });

  } catch (error) {

    await conn.rollback(); console.error('POST factura:', error);

    res.status(400).json({ mensaje: error.message || 'No fue posible crear la factura.' });

  } finally { conn.release(); }

});

app.put('/api/facturas/:id', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const idFactura = Number(req.params.id);
    const { fecha, id_cliente, id_empleado, impuesto = 0, items = [] } = req.body || {};
    if (!Number.isInteger(idFactura) || idFactura <= 0) return res.status(400).json({ mensaje: 'Identificador de factura inválido.' });
    if (!fecha || !id_cliente || !id_empleado || !Array.isArray(items) || !items.length) return res.status(400).json({ mensaje: 'Selecciona fecha, cliente, vendedor y al menos un producto o servicio.' });
    const valorImpuesto = Number(impuesto);
    if (!Number.isFinite(valorImpuesto) || valorImpuesto < 0) return res.status(400).json({ mensaje: 'El impuesto debe ser cero o mayor.' });

    await conn.beginTransaction();
    const [facturasExistentes] = await conn.query('SELECT id_factura FROM factura WHERE id_factura=? FOR UPDATE', [idFactura]);
    if (!facturasExistentes.length) { await conn.rollback(); return res.status(404).json({ mensaje: 'Factura no encontrada.' }); }
    const [vendedoresValidos] = await conn.query("SELECT id_empleado FROM empleado WHERE id_empleado=? AND tipo_personal='Vendedor' LIMIT 1", [id_empleado]);
    if (!vendedoresValidos.length) throw new Error('Selecciona un registro identificado como vendedor para la factura.');

    // Restaurar temporalmente las existencias consumidas por la versión anterior de la factura.
    const [detallesAnteriores] = await conn.query('SELECT id_producto, cantidad FROM detalle_factura WHERE id_factura=? AND id_producto IS NOT NULL', [idFactura]);
    for (const detalle of detallesAnteriores) await conn.query('UPDATE producto SET stock=stock+? WHERE id_producto=?', [detalle.cantidad, detalle.id_producto]);

    let subtotal = 0;
    const lineas = [];
    for (const item of items) {
      const cantidad = Number(item.cantidad);
      const idItem = Number(item.id);
      if (!Number.isInteger(cantidad) || cantidad < 1 || !Number.isInteger(idItem) || idItem <= 0) throw new Error('Cada artículo debe tener un elemento válido y una cantidad entera mayor que cero.');
      let precio, id_producto = null, id_servicio = null;
      if (item.tipo === 'servicio') {
        const [rows] = await conn.query('SELECT precio FROM servicio WHERE id_servicio=?', [idItem]);
        if (!rows.length) throw new Error('Uno de los servicios seleccionados no existe.');
        precio = Number(rows[0].precio); id_servicio = idItem;
      } else if (item.tipo === 'producto') {
        const [rows] = await conn.query('SELECT precio, stock FROM producto WHERE id_producto=? FOR UPDATE', [idItem]);
        if (!rows.length) throw new Error('Uno de los productos seleccionados no existe.');
        if (Number(rows[0].stock) < cantidad) throw new Error('Existencias insuficientes para uno de los productos.');
        precio = Number(rows[0].precio); id_producto = idItem;
        await conn.query('UPDATE producto SET stock=stock-? WHERE id_producto=?', [cantidad, idItem]);
      } else {
        throw new Error('Tipo de artículo no válido.');
      }
      const parcial = Math.round(precio * cantidad * 100) / 100;
      subtotal += parcial;
      lineas.push({ cantidad, precio, parcial, id_producto, id_servicio });
    }
    subtotal = Math.round(subtotal * 100) / 100;
    const total = Math.round((subtotal + valorImpuesto) * 100) / 100;
    await conn.query('UPDATE factura SET fecha=?, subtotal=?, impuesto=?, total=?, id_cliente=?, id_empleado=? WHERE id_factura=?', [fecha, subtotal, valorImpuesto, total, id_cliente, id_empleado, idFactura]);
    await conn.query('DELETE FROM detalle_factura WHERE id_factura=?', [idFactura]);
    for (const linea of lineas) await conn.query('INSERT INTO detalle_factura (cantidad, precio_unitario, subtotal, id_factura, id_producto, id_servicio) VALUES (?,?,?,?,?,?)', [linea.cantidad, linea.precio, linea.parcial, idFactura, linea.id_producto, linea.id_servicio]);
    await conn.commit();
    res.json({ mensaje: 'Factura actualizada correctamente', id_factura: idFactura, subtotal, impuesto: valorImpuesto, total });
  } catch (error) {
    await conn.rollback();
    console.error('PUT factura:', error);
    res.status(400).json({ mensaje: error.message || 'No fue posible actualizar la factura.' });
  } finally {
    conn.release();
  }
});

app.delete('/api/facturas/:id', async (req, res) => {

  const conn = await pool.getConnection();

  try {

    await conn.beginTransaction();

    const [items] = await conn.query('SELECT id_producto, cantidad FROM detalle_factura WHERE id_factura=? AND id_producto IS NOT NULL', [req.params.id]);

    for (const item of items) await conn.query('UPDATE producto SET stock=stock+? WHERE id_producto=?', [item.cantidad, item.id_producto]);

    await conn.query('DELETE FROM pago WHERE id_factura=?', [req.params.id]);

    await conn.query('DELETE FROM detalle_factura WHERE id_factura=?', [req.params.id]);

    const [result] = await conn.query('DELETE FROM factura WHERE id_factura=?', [req.params.id]);

    if (!result.affectedRows) { await conn.rollback(); return res.status(404).json({ mensaje: 'Factura no encontrada' }); }

    await conn.commit(); res.json({ mensaje: 'Factura eliminada y existencias restauradas' });

  } catch (error) { await conn.rollback(); console.error('DELETE factura:', error); res.status(500).json({ mensaje: 'No fue posible eliminar la factura' }); }

  finally { conn.release(); }

});



// ========================================

// INICIAR SERVIDOR

// ========================================



async function prepararEsquemaComercialAlIniciar() {

    try {

        await pool.query(`
  CREATE TABLE IF NOT EXISTS proveedor (
    id_proveedor INT NOT NULL AUTO_INCREMENT,
    nit VARCHAR(30) NOT NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    contacto VARCHAR(100) NULL,
    telefono VARCHAR(30) NOT NULL,
    correo VARCHAR(150) NOT NULL,
    direccion VARCHAR(200) NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_proveedor)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
`);
        // Añadir tipo_personal si falta, conservando los registros existentes.
        const [columnasEmpleado] = await pool.query('SHOW COLUMNS FROM empleado');
        const nombresColumnasEmpleado = columnasEmpleado.map(c => c.Field);
        if (!nombresColumnasEmpleado.includes('tipo_personal')) {
            await pool.query("ALTER TABLE empleado ADD COLUMN tipo_personal ENUM('Empleado','Vendedor') NOT NULL DEFAULT 'Vendedor'");
        }

        const [columnas] = await pool.query('SHOW COLUMNS FROM producto');
        const existentes = columnas.map(c => c.Field);
        if (!existentes.includes('id_proveedor')) await pool.query('ALTER TABLE producto ADD COLUMN id_proveedor INT NULL');

        if (!existentes.includes('categoria')) await pool.query('ALTER TABLE producto ADD COLUMN categoria VARCHAR(100) NULL');

        const [relacion] = await pool.query("SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME='producto' AND COLUMN_NAME='id_proveedor' AND REFERENCED_TABLE_NAME='proveedor'");

        if (!relacion.length) {

            try { await pool.query('ALTER TABLE producto ADD CONSTRAINT fk_producto_proveedor FOREIGN KEY (id_proveedor) REFERENCES proveedor(id_proveedor) ON DELETE SET NULL'); }

            catch (e) { if (e.code !== 'ER_DUP_KEYNAME') throw e; }

        }

        console.log('✓ Esquema comercial verificado');

    } catch (error) {

        console.error('No se pudo preparar el esquema comercial:', error.message);

        console.error('Verifica que MySQL esté iniciado y que la base configurada exista.');

    }

}



prepararEsquemaComercialAlIniciar().finally(() => {

    app.listen(PORT, () => {

        console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);

    });

});