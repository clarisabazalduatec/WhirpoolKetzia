import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { usuario_id, id, tipo } = await request.json();
    const tabla = tipo === 'post' ? 'LikesPublicacion' : 'LikesComentario';
    const columnaId = tipo === 'post' ? 'publicacion_id' : 'comentario_id';

    const [exist] = await pool.query(
      `SELECT * FROM ${tabla} WHERE usuario_id = ? AND ${columnaId} = ?`,
      [usuario_id, id]
    );

    if (exist.length > 0) {
      await pool.query(
        `DELETE FROM ${tabla} WHERE usuario_id = ? AND ${columnaId} = ?`,
        [usuario_id, id]
      );
      return NextResponse.json({ liked: false });
    } else {
      await pool.query(
        `INSERT INTO ${tabla} (usuario_id, ${columnaId}) VALUES (?, ?)`,
        [usuario_id, id]
      );
      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}