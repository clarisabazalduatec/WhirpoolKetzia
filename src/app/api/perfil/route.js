import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const usuarioId = searchParams.get('id');

  if (!usuarioId) return NextResponse.json({ message: 'No ID' }, { status: 400 });

  try {
    // 1. Datos del usuario
    const [userRows] = await pool.query(`
      SELECT u.*, r.nombre as nombre_rol 
      FROM Usuarios u
      JOIN Roles r ON u.rol_id = r.rol_id
      WHERE u.usuario_id = ?`, [usuarioId]);

    // 2. Estadísticas
    const [statsRows] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM Inscripciones WHERE usuario_id = ?) as total_inscritos,
        (SELECT COUNT(*) FROM Completaciones c 
         JOIN Inscripciones i ON c.inscripcion_id = i.inscripcion_id 
         WHERE i.usuario_id = ?) as total_completados
    `, [usuarioId, usuarioId]);

    if (userRows.length === 0) return NextResponse.json({ message: 'No encontrado' }, { status: 404 });

    return NextResponse.json({
      usuario: userRows[0],
      stats: statsRows[0]
    });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}