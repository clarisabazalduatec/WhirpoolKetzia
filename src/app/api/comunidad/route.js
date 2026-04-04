import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit')) || 5;
  const offset = parseInt(searchParams.get('offset')) || 0;
  const myId = searchParams.get('myId') || 0;

  try {
    const [posts] = await pool.query(`
      SELECT p.*, u.nombre, u.pfp,
      (SELECT COUNT(*) FROM LikesPublicacion WHERE publicacion_id = p.publicacion_id) as totalLikes,
      (SELECT COUNT(*) FROM LikesPublicacion WHERE publicacion_id = p.publicacion_id AND usuario_id = ?) as iLiked
      FROM Publicaciones p 
      JOIN Usuarios u ON p.usuario_id = u.usuario_id 
      ORDER BY p.fecha_publicacion DESC
      LIMIT ? OFFSET ?
    `, [myId, limit, offset]);

    if (!posts || posts.length === 0) return NextResponse.json([]);

    const postIds = posts.map(p => p.publicacion_id);
    const [comentarios] = await pool.query(`
      SELECT c.*, u.nombre, u.pfp,
      (SELECT COUNT(*) FROM LikesComentario WHERE comentario_id = c.comentario_id) as totalLikes,
      (SELECT COUNT(*) FROM LikesComentario WHERE comentario_id = c.comentario_id AND usuario_id = ?) as iLiked
      FROM Comentarios c
      JOIN Usuarios u ON c.usuario_id = u.usuario_id
      WHERE c.publicacion_id IN (?)
      ORDER BY c.fecha_comentario DESC
    `, [myId, postIds]);

    const data = posts.map(post => ({
      ...post,
      comentarios: comentarios.filter(c => c.publicacion_id === post.publicacion_id)
    }));

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { usuario_id, titulo, contenido } = await request.json();
    await pool.query('INSERT INTO Publicaciones (usuario_id, titulo, contenido) VALUES (?, ?, ?)', [usuario_id, titulo, contenido]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}