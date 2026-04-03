import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT 
        q.quiz_id, 
        q.titulo, 
        q.descripcion,
        (SELECT COUNT(*) FROM Preguntas p WHERE p.quiz_id = q.quiz_id) as total_preguntas
      FROM Quizzes q
      ORDER BY q.quiz_id DESC
    `);
    return NextResponse.json(rows || []);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const connection = await pool.getConnection();
  try {
    const { titulo, descripcion, preguntas } = await request.json();

    if (!titulo || !preguntas?.length) {
      return NextResponse.json({ error: 'Título y preguntas son obligatorios' }, { status: 400 });
    }

    await connection.beginTransaction();

    // 1. Insertar el Quiz
    const [quizResult] = await connection.query(
      'INSERT INTO Quizzes (titulo, descripcion) VALUES (?, ?)',
      [titulo, descripcion]
    );
    const quizId = quizResult.insertId;

    // 2. Insertar cada Pregunta y sus Opciones
    for (const p of preguntas) {
      // Insertamos en la tabla Preguntas (usando texto_pregunta como definiste)
      const [pregResult] = await connection.query(
        'INSERT INTO Preguntas (quiz_id, texto_pregunta) VALUES (?, ?)',
        [quizId, p.texto]
      );
      const preguntaId = pregResult.insertId;

      // 3. Insertar las Opciones de esta pregunta
      for (let i = 0; i < p.opciones.length; i++) {
        const esCorrecta = (i === p.respuestaCorrecta);
        
        await connection.query(
          'INSERT INTO Opciones (pregunta_id, texto_opcion, es_correcta) VALUES (?, ?, ?)',
          [preguntaId, p.opciones[i], esCorrecta]
        );
      }
    }

    await connection.commit();
    return NextResponse.json({ success: true, quiz_id: quizId }, { status: 201 });

  } catch (error) {
    await connection.rollback();
    console.error("Error creando examen:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    connection.release();
  }
}