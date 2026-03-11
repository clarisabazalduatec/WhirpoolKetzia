import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const usuario_id = searchParams.get('usuario_id');

  if (!usuario_id) {
    return NextResponse.json({ error: 'Usuario no identificado' }, { status: 400 });
  }

  try {
    // Buscamos todos los cursos y verificamos si existe un registro en Completaciones para este usuario
    const [rows] = await pool.query(`
      SELECT 
        c.*,
        IF(comp.completacion_id IS NOT NULL, 1, 0) as esCompletado
      FROM Cursos c
      LEFT JOIN Inscripciones i ON c.curso_id = i.curso_id AND i.usuario_id = ?
      LEFT JOIN Completaciones comp ON i.inscripcion_id = comp.inscripcion_id AND comp.usuario_id = ?
    `, [usuario_id, usuario_id]);

    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}