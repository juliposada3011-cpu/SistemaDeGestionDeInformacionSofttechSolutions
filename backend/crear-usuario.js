
const bcrypt = require('bcrypt');
const pool = require('./db');

async function crearUsuario() {
    const nombre = process.env.ADMIN_NAME;
    const correo = process.env.ADMIN_EMAIL;
    const contrasena = process.env.ADMIN_PASSWORD;
    const rol = 'Administrador';

    if (!nombre || !correo || !contrasena) {
        console.error(
            'Debes configurar ADMIN_NAME, ADMIN_EMAIL y ADMIN_PASSWORD.'
        );
        process.exitCode = 1;
        return;
    }

    try {
        const [usuarios] = await pool.query(
            'SELECT correo FROM usuario WHERE correo = ? LIMIT 1',
            [correo]
        );

        if (usuarios.length > 0) {
            console.log('Ya existe un usuario con ese correo.');
            return;
        }

        const hash = await bcrypt.hash(contrasena, 10);

        const [resultado] = await pool.query(
            `INSERT INTO usuario (nombre, correo, contrasena, rol)
             VALUES (?, ?, ?, ?)`,
            [nombre, correo, hash, rol]
        );

        console.log('Usuario administrador creado correctamente.');
        console.log('ID:', resultado.insertId);
        console.log('Correo:', correo);
        console.log('Rol:', rol);
    } catch (error) {
        console.error('Error al crear usuario:', error.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

crearUsuario();
