import { pool } from "@/lib/db";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { nombre, email, password, rol_id } = await req.json();

    // 1. Validaciones básicas
    if (!nombre || !email || !password) {
      return NextResponse.json({ error: "Todos los campos son obligatorios" }, { status: 400 });
    }

    // 2. Verificar si el usuario ya existe
    const [existing] = await pool.query("SELECT * FROM Usuarios WHERE email = ?", [email]);
    if (existing.length > 0) {
      return NextResponse.json({ error: "El correo ya está registrado" }, { status: 400 });
    }

    // 3. Hashear la contraseña
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // 4. Insertar en TiDB (rol_id por defecto 2 si no se envía)
    const finalRol = rol_id || 2; 
    await pool.query(
      "INSERT INTO Usuarios (nombre, email, password_hash, rol_id) VALUES (?, ?, ?, ?)",
      [nombre, email, password_hash, finalRol]
    );

    return NextResponse.json({ message: "Usuario registrado con éxito" }, { status: 201 });

  } catch (error) {
    console.error("Error en registro:", error);
    return NextResponse.json({ error: "Error al registrar usuario" }, { status: 500 });
  }
}