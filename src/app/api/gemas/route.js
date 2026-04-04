import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

const LIMITE_GEMAS = 10;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const usuario_id = searchParams.get('usuario_id');

  if (!usuario_id) return NextResponse.json({ error: 'No ID' }, { status: 400 });

  try {
    const [rows] = await pool.query(
      'SELECT * FROM Gemas WHERE usuario_id = ? ORDER BY fecha_creacion DESC',
      [usuario_id]
    );
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { usuario_id, titulo, descripcion } = await request.json();

    if (!usuario_id || !titulo || !descripcion) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
    }

    // Verificar límite
    const [count] = await pool.query(
      'SELECT COUNT(*) as total FROM Gemas WHERE usuario_id = ?',
      [usuario_id]
    );
    if (count[0].total >= LIMITE_GEMAS) {
      return NextResponse.json({ error: `Límite de ${LIMITE_GEMAS} gemas alcanzado` }, { status: 400 });
    }

    const [result] = await pool.query(
      'INSERT INTO Gemas (usuario_id, titulo, descripcion) VALUES (?, ?, ?)',
      [usuario_id, titulo, descripcion]
    );

    return NextResponse.json({ success: true, gema_id: result.insertId });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { gema_id, usuario_id, titulo, descripcion } = await request.json();

    if (!gema_id || !usuario_id || !titulo || !descripcion) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
    }

    await pool.query(
      'UPDATE Gemas SET titulo = ?, descripcion = ? WHERE gema_id = ? AND usuario_id = ?',
      [titulo, descripcion, gema_id, usuario_id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const gema_id = searchParams.get('gema_id');
    const usuario_id = searchParams.get('usuario_id');

    await pool.query(
      'DELETE FROM Gemas WHERE gema_id = ? AND usuario_id = ?',
      [gema_id, usuario_id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}