import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit')) || 5;
  const offset = parseInt(searchParams.get('offset')) || 0;

  try {
    // 1. Obtener publicaciones paginadas
    const [posts] = await pool.query(`
      SELECT p.*, u.nombre, u.pfp 
      FROM Publicaciones p 
      JOIN Usuarios u ON p.usuario_id = u.usuario_id 
      ORDER BY p.fecha_publicacion DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    if (!posts || posts.length === 0) {
      return NextResponse.json([]);
    }

    // 2. Obtener comentarios solo para los posts cargados
    const postIds = posts.map(p => p.publicacion_id);
    const [comentarios] = await pool.query(`
      SELECT c.*, u.nombre, u.pfp 
      FROM Comentarios c
      JOIN Usuarios u ON c.usuario_id = u.usuario_id
      WHERE c.publicacion_id IN (?)
      ORDER BY c.fecha_comentario DESC
    `, [postIds]);

    // 3. Agrupar comentarios dentro de cada post
    const data = posts.map(post => ({
      ...post,
      comentarios: comentarios.filter(c => c.publicacion_id === post.publicacion_id)
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error en API Comunidad:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { usuario_id, titulo, contenido } = await request.json();
    await pool.query(
      'INSERT INTO Publicaciones (usuario_id, titulo, contenido) VALUES (?, ?, ?)',
      [usuario_id, titulo, contenido]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}