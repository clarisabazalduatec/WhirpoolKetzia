import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const curso_id = searchParams.get('curso_id');
  const usuario_id = searchParams.get('usuario_id');

  try {
    const [cursoRows] = await pool.query('SELECT * FROM Cursos WHERE curso_id = ?', [curso_id]);
    const [archivos] = await pool.query(
      `SELECT a.*, (SELECT COUNT(*) FROM Archivos_Vistos av WHERE av.archivo_id = a.archivo_id AND av.usuario_id = ?) as fue_visto
       FROM Archivos_Curso a WHERE a.curso_id = ? ORDER BY orden ASC`, [usuario_id, curso_id]
    );
    const [completadoRows] = await pool.query(
      'SELECT * FROM Completaciones WHERE usuario_id = ? AND inscripcion_id IN (SELECT inscripcion_id FROM Inscripciones WHERE curso_id = ?)',
      [usuario_id, curso_id]
    );

    return NextResponse.json({
      curso: cursoRows[0],
      archivos,
      esCompletado: completadoRows.length > 0
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}