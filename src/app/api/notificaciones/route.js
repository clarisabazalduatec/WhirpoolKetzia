import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

// Obtener notificaciones del usuario
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const usuario_id = searchParams.get('usuario_id');

  try {
    const [rows] = await pool.query(
      'SELECT * FROM Notificaciones WHERE usuario_id = ? ORDER BY fecha DESC LIMIT 20',
      [usuario_id]
    );
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Marcar notificaciones como leídas
export async function PUT(request) {
  const { usuario_id } = await request.json();

  try {
    await pool.query(
      'UPDATE Notificaciones SET leida = TRUE WHERE usuario_id = ?',
      [usuario_id]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}