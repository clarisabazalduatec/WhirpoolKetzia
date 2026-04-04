import bcrypt from 'bcrypt';
import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // 1. Buscar usuario
    const [rows] = await pool.query('SELECT * FROM Usuarios WHERE email = ?', [email]);
    const user = rows[0];

    if (!user) {
      return NextResponse.json({ error: "El correo no está registrado" }, { status: 401 });
    }

    // 2. Verificar contraseña hash
    // Nota: 'password_hash' debe ser el nombre de la columna en tu DB
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
    }

    // 3. Responder con datos necesarios para el localStorage
    return NextResponse.json({
      message: "Login exitoso",
      user: {
        id: user.usuario_id,
        nombre: user.nombre,
        rol: user.rol_id,
        pfp: user.pfp,
      }
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}