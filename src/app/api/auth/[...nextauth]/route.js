import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { pool } from "@/lib/db";

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email?.endsWith("@gmail.com") && !user.email?.endsWith("@whirlpool.com")) {
        return false;
      }

      try {
        const [rows] = await pool.query(
          'SELECT * FROM Usuarios WHERE email = ?',
          [user.email]
        );

        if (rows.length === 0) {
          await pool.query(
            'INSERT INTO Usuarios (nombre, email, rol_id, password_hash) VALUES (?, ?, ?, ?)',
            [user.name, user.email, 2, 'SSO_GOOGLE']
          );
        }

        return true;
      } catch (error) {
        console.error('Error al guardar usuario SSO:', error);
        return false;
      }
    },

    async session({ session }) {
      try {
        const [rows] = await pool.query(
          'SELECT usuario_id, rol_id FROM Usuarios WHERE email = ?',
          [session.user.email]
        );

        if (rows.length > 0) {
          session.user.usuario_id = rows[0].usuario_id;
          session.user.rol_id = rows[0].rol_id;
        }
      } catch (error) {
        console.error('Error al obtener sesión:', error);
      }

      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});

export { handler as GET, handler as POST };