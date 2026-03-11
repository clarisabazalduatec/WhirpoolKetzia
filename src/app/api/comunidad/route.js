import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

// OBTENER POSTS (GET)
export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, u.nombre 
      FROM Publicaciones p 
      JOIN Usuarios u ON p.usuario_id = u.usuario_id 
      ORDER BY p.fecha_publicacion DESC
    `);
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// CREAR POST (POST)
export async function POST(request) {
  try {
    const { usuario_id, titulo, contenido } = await request.json();
    
    // Usamos los campos de tu tabla: usuario_id, titulo, contenido
    await pool.query(
      'INSERT INTO Publicaciones (usuario_id, titulo, contenido) VALUES (?, ?, ?)',
      [usuario_id, titulo, contenido]
    );
    
    return NextResponse.json({ message: "Publicación creada con éxito" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}