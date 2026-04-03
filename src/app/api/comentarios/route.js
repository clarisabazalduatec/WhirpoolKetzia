import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { usuario_id, publicacion_id, contenido } = await request.json();

    if (!usuario_id || !publicacion_id || !contenido) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    }

    const [result] = await pool.query(
      'INSERT INTO Comentarios (publicacion_id, usuario_id, contenido) VALUES (?, ?, ?)',
      [publicacion_id, usuario_id, contenido]
    );

    return NextResponse.json({ 
      success: true, 
      comentario_id: result.insertId,
      message: "Comentario añadido correctamente" 
    }, { status: 200 });

  } catch (error) {
    console.error("Error en API Comentarios:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}