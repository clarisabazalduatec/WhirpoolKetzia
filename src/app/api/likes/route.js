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

      // Buscar nombre del que dio like
      const [userRows] = await pool.query(
        'SELECT nombre FROM Usuarios WHERE usuario_id = ?',
        [usuario_id]
      );
      const nombreQueLikeo = userRows[0]?.nombre || 'Alguien';

      let duenio = null;
      let mensaje = '';

      if (tipo === 'post') {
        const [rows] = await pool.query(
          'SELECT usuario_id, titulo FROM Publicaciones WHERE publicacion_id = ?',
          [id]
        );
        if (rows.length > 0 && rows[0].usuario_id !== parseInt(usuario_id)) {
          duenio = rows[0].usuario_id;
          mensaje = `${nombreQueLikeo} dio like a tu publicación "${rows[0].titulo || 'sin título'}"`;
        }
      } else {
        const [rows] = await pool.query(
          'SELECT c.usuario_id, p.titulo FROM Comentarios c JOIN Publicaciones p ON c.publicacion_id = p.publicacion_id WHERE c.comentario_id = ?',
          [id]
        );
        if (rows.length > 0 && rows[0].usuario_id !== parseInt(usuario_id)) {
          duenio = rows[0].usuario_id;
          mensaje = `${nombreQueLikeo} dio like a tu comentario en "${rows[0].titulo || 'sin título'}"`;
        }
      }

      // Crear notificación solo si no es el mismo usuario
      if (duenio) {
        await pool.query(
          'INSERT INTO Notificaciones (usuario_id, tipo, mensaje) VALUES (?, ?, ?)',
          [duenio, `like_${tipo}`, mensaje]
        );
      }

      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}