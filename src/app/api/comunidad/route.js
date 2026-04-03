import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

// OBTENER POSTS (GET)
export async function GET() {
  try {
    // 1. Obtener Publicaciones
    const [posts] = await pool.query(`
      SELECT p.*, u.nombre, u.pfp 
      FROM Publicaciones p 
      JOIN Usuarios u ON p.usuario_id = u.usuario_id 
      ORDER BY p.fecha_publicacion DESC
    `);

    // 2. Obtener Comentarios
    const [comentarios] = await pool.query(`
      SELECT c.*, u.nombre, u.pfp 
      FROM Comentarios c
      JOIN Usuarios u ON c.usuario_id = u.usuario_id
      ORDER BY c.fecha_comentario ASC
    `);

    // 3. Agrupar
    const data = posts.map(post => ({
      ...post,
      comentarios: comentarios.filter(c => c.publicacion_id === post.publicacion_id)
    }));

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// CREAR POST (POST)
export async function POST(request) {
  try {
    const { usuario_id, titulo, contenido } = await request.json();
    
    // Usamos los campos de tu tabla: usuario_id, titulo, contenido
    await pool.query(
      'INSERT INTO Publicaciones (usuario_id, titulo, contenido) VALUES (?, ?, ?)',
      [usuario_id, titulo, contenido]
    );
    
    return NextResponse.json({ message: "Publicación creada con éxito" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}