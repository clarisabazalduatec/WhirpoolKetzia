import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Ejecutamos todas las consultas de métricas al mismo tiempo para mayor velocidad
    const [
      [alumnosCount],
      [cursosCount],
      [completacionesStats],
      [quizStats]
    ] = await Promise.all([
      //Total de alumnos
      pool.query('SELECT COUNT(DISTINCT usuario_id) as total FROM Inscripciones'),
      
      // 2. Total de cursos activos
      pool.query('SELECT COUNT(*) as total FROM Cursos'),

      // 3. Tasa de Finalización Global
      // Relación entre inscripciones totales vs cursos terminados
      pool.query(`
        SELECT 
          COUNT(i.inscripcion_id) as inscritos,
          COUNT(c.completacion_id) as terminados,
          ROUND((COUNT(c.completacion_id) / NULLIF(COUNT(i.inscripcion_id), 0)) * 100) as tasa
        FROM Inscripciones i
        LEFT JOIN Completaciones c ON i.inscripcion_id = c.inscripcion_id
      `),

      // 4. Promedio de calificaciones de Quizzes
      pool.query('SELECT ROUND(AVG(calificacion)) as promedio FROM Intentos_Quiz')
    ]);

    console.log("alumnos inscritos: ", alumnosCount[0].total);

    // Estructuramos la respuesta para el frontend
    return NextResponse.json({
      totalAlumnos: alumnosCount[0].total || 0,
      totalCursos: cursosCount[0].total || 0,
      tasaCompletado: completacionesStats[0].tasa || 0,
      promedioQuiz: quizStats[0].promedio || 0
    });

  } catch (error) {
    console.error("ERROR EN API STATS:", error);
    return NextResponse.json({ 
      error: "Error al calcular métricas",
      details: error.message 
    }, { status: 500 });
  }
}