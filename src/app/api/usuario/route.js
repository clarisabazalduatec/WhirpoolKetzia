import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const usuarioId = searchParams.get('id');

  if (!usuarioId) return NextResponse.json({ message: 'No ID' }, { status: 400 });

  try {
    const [rows] = await pool.query('SELECT nombre FROM Usuarios WHERE usuario_id = ?', [usuarioId]);
    if (rows.length > 0) {
      return NextResponse.json(rows[0]);
    }
    return NextResponse.json({ message: 'No encontrado' }, { status: 404 });
  }catch (error) {
  console.error("ERROR DETECTADO:", error.message); // <--- ESTO aparecerá en tu terminal
  return NextResponse.json({ error: error.message }, { status: 500 });
}
}