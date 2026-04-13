import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

// Obtener materiales de un curso
export async function GET(request, { params }) {
  const { id } = await params;
  try {
    const [rows] = await pool.query(`
      SELECT a.*, ac.orden, ac.relacion_id
      FROM Archivos_Curso ac
      JOIN Archivos a ON ac.archivo_id = a.archivo_id
      WHERE ac.curso_id = ?
      ORDER BY ac.orden ASC
    `, [id]);
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Agregar material a un curso
export async function POST(request, { params }) {
  const { id } = await params;
  try {
    const { archivo_id } = await request.json();

    // Obtener el orden máximo actual
    const [maxOrden] = await pool.query(
      'SELECT MAX(orden) as maxOrden FROM Archivos_Curso WHERE curso_id = ?',
      [id]
    );
    const orden = (maxOrden[0].maxOrden || 0) + 1;

    await pool.query(
      'INSERT INTO Archivos_Curso (curso_id, archivo_id, orden) VALUES (?, ?, ?)',
      [id, archivo_id, orden]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Eliminar material de un curso
export async function DELETE(request, { params }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const relacion_id = searchParams.get('relacion_id');

  try {
    await pool.query('DELETE FROM Archivos_Curso WHERE relacion_id = ? AND curso_id = ?', [relacion_id, id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Actualizar orden de materiales
export async function PUT(request, { params }) {
  const { id } = await params;
  try {
    const { materiales } = await request.json();
    for (const m of materiales) {
      await pool.query(
        'UPDATE Archivos_Curso SET orden = ? WHERE relacion_id = ? AND curso_id = ?',
        [m.orden, m.relacion_id, id]
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}