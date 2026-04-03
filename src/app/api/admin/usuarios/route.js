import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // IMPORTANTE: Usa los alias 'value' y 'label'
    const [rows] = await pool.query(
      'SELECT DISTINCT s.usuario_id AS value, s.nombre AS label FROM Usuarios s JOIN Inscripciones I ON s.usuario_id = I.usuario_id ORDER BY s.nombre ASC;'
    );
    
    // Validamos que sea un array
    return NextResponse.json(rows || []);
  } catch (error) {
    console.error("ERROR API USUARIOS:", error);
    return NextResponse.json({ error: "Error en DB" }, { status: 500 });
  }
}