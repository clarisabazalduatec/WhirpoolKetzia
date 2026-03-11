import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const usuarioId = searchParams.get('usuario_id');

  if (!usuarioId) {
    return NextResponse.json({ message: 'No se detectó usuario' }, { status: 400 });
  }

  try {
    const [rows] = await pool.query(`
      SELECT 
        c.*, 
        IF(comp.completacion_id IS NOT NULL, 1, 0) as esCompletado
      FROM Cursos c
      INNER JOIN Inscripciones i ON c.curso_id = i.curso_id
      LEFT JOIN Completaciones comp ON i.inscripcion_id = comp.inscripcion_id 
        AND comp.usuario_id = i.usuario_id
      WHERE i.usuario_id = ?
    `, [usuarioId]);

    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error de base de datos' }, { status: 500 });
  }
}