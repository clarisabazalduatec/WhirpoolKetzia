import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const connection = await pool.getConnection();
  
  try {
    const { titulo, descripcion, descripcionCorta, imagenSrc, archivosSeleccionados, quizzesSeleccionados, creado_por } = await request.json();

    if (!titulo || !creado_por) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    await connection.beginTransaction();

    // 1. Insertar el curso incluyendo el nuevo campo descripcion_corta
    const [cursoResult] = await connection.query(
      `INSERT INTO Cursos (titulo, descripcion, descripcionCorta, imagenSrc, creado_por) VALUES (?, ?, ?, ?, ?)`,
      [titulo, descripcion, descripcionCorta, imagenSrc, creado_por]
    );
    const nuevoCursoId = cursoResult.insertId;

    // 2. Vincular ARCHIVOS (Optimizado con inserción masiva)
    if (archivosSeleccionados?.length > 0) {
      const valoresArchivos = archivosSeleccionados.map((id, index) => [nuevoCursoId, id, index + 1]);
      await connection.query(
        `INSERT INTO Archivos_Curso (curso_id, archivo_id, orden) VALUES ?`,
        [valoresArchivos]
      );
    }

    // 3. Vincular QUIZZES (Optimizado con inserción masiva)
    if (quizzesSeleccionados?.length > 0) {
      const offset = archivosSeleccionados?.length || 0;
      const valoresQuizzes = quizzesSeleccionados.map((id, index) => [nuevoCursoId, id, offset + index + 1]);
      await connection.query(
        `INSERT INTO Quiz_Curso (curso_id, quiz_id, orden) VALUES ?`,
        [valoresQuizzes]
      );
    }

    await connection.commit();
    return NextResponse.json({ success: true, curso_id: nuevoCursoId }, { status: 201 });

  } catch (error) {
    await connection.rollback();
    console.error("ERROR AL CREAR CURSO:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    connection.release();
  }
}