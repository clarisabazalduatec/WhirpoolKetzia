import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT archivo_id, nombre_archivo, tipo_archivo, descripcion, url_archivo, fecha_subida
      FROM Archivos 
      ORDER BY fecha_subida DESC
    `);
    return NextResponse.json(rows || []);
  } catch (error) {
    console.error("Error SQL:", error);
    return NextResponse.json([], { status: 500 }); 
  }
}

export async function POST(request) {
  try {
    const { nombre_archivo, tipo_archivo, descripcion, url_archivo } = await request.json();

    if (!nombre_archivo || !url_archivo) {
      return NextResponse.json(
        { error: 'El nombre y la URL son obligatorios' }, 
        { status: 400 }
      );
    }

    const [result] = await pool.query(
      `INSERT INTO Archivos (nombre_archivo, tipo_archivo, descripcion, url_archivo) 
       VALUES (?, ?, ?, ?)`,
      [nombre_archivo, tipo_archivo, descripcion, url_archivo]
    );

    return NextResponse.json({ 
      success: true, 
      archivo_id: result.insertId 
    }, { status: 201 });

  } catch (error) {
    console.error("Error MySQL:", error);
    return NextResponse.json(
      { error: "Fallo al registrar en la base de datos" }, 
      { status: 500 }
    );
  }
}